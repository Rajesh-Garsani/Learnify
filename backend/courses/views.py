import threading
import random
from rest_framework import generics, status, permissions
from rest_framework.response import Response
from rest_framework.views import APIView
from django_filters.rest_framework import DjangoFilterBackend
from .serializers import *
from rest_framework.pagination import PageNumberPagination
from django.db.models import Q
from rest_framework import serializers
from .models import Topic, UserProgress, Course, Category, SubCategory
from rest_framework.authtoken.models import Token
from django.contrib.auth import authenticate
from decouple import config
from django.core.cache import cache

# ⭐ GOOGLE GEMINI AI
import google.generativeai as genai
from django.conf import settings

# Scraper Imports
from .scraper.dynamic_scraper import DynamicW3Scraper
from .scraper.utils import save_scraped


class CategoryList(generics.ListAPIView):
    queryset = Category.objects.all()
    serializer_class = CategorySerializer


class SubCategoryList(generics.ListAPIView):
    queryset = SubCategory.objects.all()
    serializer_class = SubCategorySerializer
    filter_backends = [DjangoFilterBackend]
    filterset_fields = ['category']


class SubCategoryDetail(generics.RetrieveAPIView):
    queryset = SubCategory.objects.all()
    serializer_class = SubCategorySerializer


class CourseList(generics.ListAPIView):
    queryset = Course.objects.all()
    serializer_class = CourseSerializer
    filter_backends = [DjangoFilterBackend]
    filterset_fields = ['subcategory', 'difficulty', 'is_free']


class CourseDetail(generics.RetrieveAPIView):
    queryset = Course.objects.all()
    serializer_class = CourseSerializer


class TopicList(generics.ListAPIView):
    queryset = Topic.objects.all()
    serializer_class = TopicSerializer
    filter_backends = [DjangoFilterBackend]
    filterset_fields = ['course']
    # Disable pagination so Sidebar gets ALL topics (100+), not just 20
    pagination_class = None


class TopicDetail(generics.RetrieveAPIView):
    queryset = Topic.objects.all()
    serializer_class = TopicSerializer

    def retrieve(self, request, *args, **kwargs):
        topic = self.get_object()
        if request.user.is_authenticated:
            UserProgress.objects.get_or_create(
                user=request.user,
                topic=topic,
                defaults={"completed": True}
            )
        return super().retrieve(request, *args, **kwargs)


class RandomCourses(APIView):
    def get(self, request):
        # FIX: Avoid expensive order_by('?') and use Cache + Python random
        courses_data = cache.get('random_courses')

        if not courses_data:
            course_ids = list(Course.objects.values_list('id', flat=True))
            if len(course_ids) > 8:
                random_ids = random.sample(course_ids, 8)
                courses = Course.objects.filter(id__in=random_ids)
            else:
                courses = Course.objects.all()

            serializer = CourseSerializer(courses, many=True)
            courses_data = serializer.data
            cache.set('random_courses', courses_data, 60 * 15)  # Cache for 15 minutes

        return Response(courses_data)


# Recommendation Logic
class CourseRecommendationView(APIView):
    permission_classes = [permissions.AllowAny]

    def _get_fallback_courses(self):
        # Helper to avoid repetitive fallback code and expensive order_by('?')
        course_ids = list(Course.objects.values_list('id', flat=True))
        if len(course_ids) > 6:
            random_ids = random.sample(course_ids, 6)
            courses = Course.objects.filter(id__in=random_ids)
        else:
            courses = Course.objects.all()
        return CourseSerializer(courses, many=True).data

    def get(self, request):
        if not request.user.is_authenticated:
            return Response({"title": "Featured Courses", "results": self._get_fallback_courses()})

        user = request.user
        interacted_subcats = UserProgress.objects.filter(user=user) \
            .values_list('topic__course__subcategory', flat=True).distinct()

        if not interacted_subcats:
            return Response({"title": "Featured Courses", "results": self._get_fallback_courses()})

        # Fetch recommended courses based on subcategory
        recommended_courses = Course.objects.filter(
            subcategory__id__in=interacted_subcats
        )

        if recommended_courses.exists():
            # Optimize random selection here too
            rec_ids = list(recommended_courses.values_list('id', flat=True))
            if len(rec_ids) > 6:
                selected_ids = random.sample(rec_ids, 6)
                recommended_courses = Course.objects.filter(id__in=selected_ids)

            serializer = CourseSerializer(recommended_courses, many=True)
            return Response({"title": "Recommended For You", "results": serializer.data})

        return Response({"title": "Featured Courses", "results": self._get_fallback_courses()})


# ⭐ AI Chatbot Endpoint (Using Google Gemini)
# FIX: Merged the two AIExplainView classes into one robust class.
class AIExplainView(APIView):
    permission_classes = [permissions.AllowAny]

    def post(self, request):
        user_input = request.data.get('text', '')
        history_data = request.data.get('history', [])

        if not user_input:
            return Response({"explanation": "Please select some text first."}, status=400)

        # Fallback logic: check settings.py first, then .env config
        api_key = getattr(settings, 'GEMINI_API_KEY', None) or config('GEMINI_API_KEY', default=None)

        if not api_key:
            print("❌ DEBUG: GEMINI_API_KEY not found in settings or .env")
            return Response({"explanation": "⚠️ Server Error: API Key missing configuration."}, status=500)

        try:
            genai.configure(api_key=api_key)

            all_models = [m.name for m in genai.list_models() if 'generateContent' in m.supported_generation_methods]
            chosen_model = None

            if 'models/gemini-2.0-flash' in all_models:
                chosen_model = 'models/gemini-2.0-flash'
            elif 'models/gemini-flash-latest' in all_models:
                chosen_model = 'models/gemini-flash-latest'
            elif 'models/gemini-pro' in all_models:
                chosen_model = 'models/gemini-pro'
            elif all_models:
                chosen_model = all_models[0]
            else:
                return Response({"explanation": "❌ No available AI models found for this key."}, status=503)

            model = genai.GenerativeModel(
                chosen_model,
                system_instruction="You are an expert coding tutor for 'Learnify'. Explain concepts clearly with code examples if needed. If the user asks follow-up questions like 'explain more', elaborate on the previous topic."
            )

            gemini_history = []
            for msg in history_data:
                if msg.get('text'):
                    role = 'user' if msg.get('role') == 'user' else 'model'
                    gemini_history.append({'role': role, 'parts': [msg['text']]})

            chat = model.start_chat(history=gemini_history)
            response = chat.send_message(user_input)

            return Response({"explanation": response.text})

        except Exception as e:
            if "system_instruction" in str(e):
                try:
                    model = genai.GenerativeModel(chosen_model)
                    chat = model.start_chat(history=gemini_history)
                    response = chat.send_message(f"As a coding tutor, please answer this: {user_input}")
                    return Response({"explanation": response.text})
                except:
                    pass

            print(f"AI Error: {e}")
            return Response({
                "explanation": "🤖 I am currently overloaded. Please try again."
            }, status=503)


class UserRegistrationView(APIView):
    def post(self, request):
        serializer = UserRegistrationSerializer(data=request.data)
        if serializer.is_valid():
            user = serializer.save()
            return Response({
                'message': 'User registered successfully',
                'user_id': user.id,
                'username': user.username
            }, status=status.HTTP_201_CREATED)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)


class UserLoginView(APIView):
    def post(self, request):
        username = request.data.get("username")
        password = request.data.get("password")

        if not username or not password:
            return Response({"error": "username and password are required."}, status=status.HTTP_400_BAD_REQUEST)

        user = authenticate(username=username, password=password)
        if user is None:
            return Response({"error": "Invalid credentials"}, status=status.HTTP_400_BAD_REQUEST)

        token, created = Token.objects.get_or_create(user=user)

        return Response({
            "message": "Login successful",
            "token": token.key,
            "user_id": user.id,
            "username": user.username,
            "email": user.email
        }, status=status.HTTP_200_OK)


class UserProfileView(APIView):
    permission_classes = [permissions.IsAuthenticated]

    def get(self, request):
        serializer = UserProfileSerializer(request.user)
        return Response(serializer.data)


###########################################
class StandardResultsSetPagination(PageNumberPagination):
    page_size = 12
    page_size_query_param = 'page_size'
    max_page_size = 100


class SearchResultSerializer(serializers.Serializer):
    type = serializers.CharField()
    id = serializers.IntegerField()
    title = serializers.CharField()
    subtitle = serializers.CharField(allow_blank=True, required=False)
    snippet = serializers.CharField(allow_blank=True, required=False)
    extra = serializers.DictField(child=serializers.CharField(), required=False)


class SearchAPIView(APIView):
    permission_classes = []
    pagination_class = StandardResultsSetPagination

    def get(self, request):
        q = request.query_params.get('q', '').strip()
        if not q:
            return Response({'results': [], 'count': 0})

        # FIX: Appended [:50] to prevent the server from loading thousands of records
        # into RAM causing a severe memory leak crash.
        courses_qs = Course.objects.filter(
            Q(title__icontains=q) |
            Q(short_description__icontains=q) |
            Q(description__icontains=q) |
            Q(subcategory__name__icontains=q) |
            Q(subcategory__category__name__icontains=q)
        ).select_related('subcategory', 'instructor').distinct()[:50]

        topics_qs = Topic.objects.filter(
            Q(title__icontains=q) |
            Q(content__icontains=q) |
            Q(course__title__icontains=q)
        ).select_related('course').distinct()[:50]

        categories_qs = Category.objects.filter(
            Q(name__icontains=q) | Q(description__icontains=q)
        ).distinct()[:50]

        subcategories_qs = SubCategory.objects.filter(
            Q(name__icontains=q) | Q(description__icontains=q) |
            Q(category__name__icontains=q)
        ).select_related('category').distinct()[:50]

        results = []

        for c in courses_qs:
            results.append({
                "type": "course",
                "id": c.id,
                "title": c.title,
                "subtitle": getattr(c, "short_description", "") or "",
                "snippet": (c.description[:240] + "...") if c.description and len(c.description) > 240 else (
                            c.description or ""),
                "extra": {
                    "subcategory": c.subcategory.name if c.subcategory else "",
                    "category": c.subcategory.category.name if c.subcategory and c.subcategory.category else "",
                    "is_free": str(c.is_free),
                    "price": str(c.price),
                }
            })

        for t in topics_qs:
            results.append({
                "type": "topic",
                "id": t.id,
                "title": t.title,
                "subtitle": t.course.title if t.course else "",
                "snippet": (t.content[:240] + "...") if t.content and len(t.content) > 240 else (t.content or ""),
                "extra": {"course_id": str(t.course.id) if t.course else ""}
            })

        for cat in categories_qs:
            results.append({
                "type": "category",
                "id": cat.id,
                "title": cat.name,
                "subtitle": "",
                "snippet": (cat.description[:240] + "...") if cat.description and len(cat.description) > 240 else (
                            cat.description or ""),
                "extra": {}
            })

        for sc in subcategories_qs:
            results.append({
                "type": "subcategory",
                "id": sc.id,
                "title": sc.name,
                "subtitle": sc.category.name if sc.category else "",
                "snippet": (sc.description[:240] + "...") if sc.description and len(sc.description) > 240 else (
                            sc.description or ""),
                "extra": {"category_id": str(sc.category.id) if sc.category else ""}
            })

        results_sorted = sorted(results,
                                key=lambda r: 0 if r['type'] == 'course' else (1 if r['type'] == 'topic' else 2))

        paginator = self.pagination_class()
        page = paginator.paginate_queryset(results_sorted, request)
        serializer = SearchResultSerializer(page, many=True)
        return paginator.get_paginated_response(serializer.data)


# Web Scraping (Dynamic)
def background_scrape_task(course_id):
    """Background thread function to prevent frontend blocking/timeouts."""
    try:
        course = Course.objects.get(id=course_id)
        scraper = DynamicW3Scraper(course)
        data = scraper.scrape()
        if data:
            save_scraped(course.title, data)
    except Exception as e:
        print(f"Background scraping error for course {course_id}: {e}")


class ScrapeCourseAPI(APIView):
    def post(self, request, course_id):
        try:
            course = Course.objects.get(id=course_id)
        except Course.DoesNotExist:
            return Response({"ok": False, "message": "Course not found"}, status=404)

        if course.source_url and course.sidebar_start_key:
            # FIX: Offloaded the scraping to a background thread to prevent HTTP blocking
            thread = threading.Thread(target=background_scrape_task, args=(course.id,))
            thread.start()

            return Response({
                "ok": True,
                "message": "Scraping started in the background. Topics will be populated shortly.",
            }, status=202)  # 202 Accepted
        else:
            return Response({
                "ok": False,
                "message": "Source URL or Start Key missing in Course settings."
            }, status=400)


# Progress
class UserProgressView(APIView):
    permission_classes = [permissions.IsAuthenticated]

    def post(self, request):
        topic_id = request.data.get('topic_id')
        if not topic_id:
            return Response({'error': 'topic_id is required'}, status=status.HTTP_400_BAD_REQUEST)

        try:
            topic = Topic.objects.get(id=topic_id)

            # FIX: Cleaned up progress logic. defaults={'completed': True} handles new entries natively
            progress, created = UserProgress.objects.get_or_create(
                user=request.user,
                topic=topic,
                defaults={'completed': True}
            )

            if not created and not progress.completed:
                progress.completed = True
                progress.save(update_fields=['completed'])

            return Response({'status': 'marked completed', 'topic_id': topic_id})

        except Topic.DoesNotExist:
            return Response({'error': 'Topic not found'}, status=status.HTTP_404_NOT_FOUND)
        except Exception as e:
            return Response({'error': str(e)}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)


class UserCourseProgressView(APIView):
    permission_classes = [permissions.IsAuthenticated]

    def get(self, request):
        user = request.user
        interacted_course_ids = UserProgress.objects.filter(user=user).values_list('topic__course_id',
                                                                                   flat=True).distinct()
        courses = Course.objects.filter(id__in=interacted_course_ids)
        response_data = []

        for course in courses:
            total_topics = Topic.objects.filter(course=course).count()
            completed_topics = UserProgress.objects.filter(
                user=user,
                topic__course=course,
                completed=True
            ).count()

            percent = (completed_topics / total_topics) * 100 if total_topics > 0 else 0

            response_data.append({
                "course_id": course.id,
                "title": course.title,
                "progress": round(percent, 1),
                "total": total_topics,
                "completed": completed_topics
            })

        return Response(response_data)


class CourseProgressView(APIView):
    permission_classes = [permissions.IsAuthenticated]

    def get(self, request, course_id):
        try:
            total = Topic.objects.filter(course_id=course_id).count()
            completed_ids_qs = UserProgress.objects.filter(
                user=request.user,
                topic__course_id=course_id,
                completed=True
            ).values_list('topic_id', flat=True)

            completed_ids = list(completed_ids_qs)
            completed_count = len(completed_ids)
            percent = (completed_count / total * 100) if total > 0 else 0

            return Response({
                "total_topics": total,
                "completed_topics": completed_count,
                "progress_percent": round(percent, 1),
                "completed_topic_ids": completed_ids
            })
        except Exception as e:
            return Response({"error": str(e)}, status=500)