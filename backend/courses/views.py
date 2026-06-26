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
from .models import Topic, UserProgress, Course, Category, SubCategory, User, OTPVerification
from rest_framework.authtoken.models import Token
from django.contrib.auth import authenticate
from decouple import config
from django.core.cache import cache
from openai import OpenAI
# Email Auth Imports
from django.core.mail import send_mail
from django.conf import settings
from django.utils import timezone

# ⭐ GOOGLE GEMINI AI
import google.generativeai as genai

# ORIGINAL Scraper Imports Restored
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
            cache.set('random_courses', courses_data, 60 * 15)

        return Response(courses_data)


class CourseRecommendationView(APIView):
    permission_classes = [permissions.AllowAny]

    def _get_fallback_courses(self):
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

        recommended_courses = Course.objects.filter(
            subcategory__id__in=interacted_subcats
        )

        if recommended_courses.exists():
            rec_ids = list(recommended_courses.values_list('id', flat=True))
            if len(rec_ids) > 6:
                selected_ids = random.sample(rec_ids, 6)
                recommended_courses = Course.objects.filter(id__in=selected_ids)

            serializer = CourseSerializer(recommended_courses, many=True)
            return Response({"title": "Recommended For You", "results": serializer.data})

        return Response({"title": "Featured Courses", "results": self._get_fallback_courses()})

"""
class AIExplainView(APIView):
    permission_classes = [permissions.AllowAny]

    def post(self, request):
        user_input = request.data.get('text', '')
        history_data = request.data.get('history', [])

        if not user_input:
            return Response({"explanation": "Please select some text first."}, status=400)

        api_key = getattr(settings, 'GEMINI_API_KEY', None) or config('GEMINI_API_KEY', default=None)

        if not api_key:
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
            return Response({"explanation": "🤖 I am currently overloaded. Please try again."}, status=503)
"""



class AIExplainView(APIView):
    permission_classes = [permissions.AllowAny]

    def post(self, request):
        user_input = request.data.get('text', '')
        history_data = request.data.get('history', [])

        if not user_input:
            return Response({"explanation": "Please select some text first."}, status=400)

        try:
            api_key = config('OPENROUTER_API_KEY')
        except Exception as e:
            return Response({"explanation": "Server Error: OPENROUTER_API_KEY missing from .env"}, status=500)

        try:
            # 1. Initialize the client to point to OpenRouter instead of OpenAI
            client = OpenAI(
                base_url="https://openrouter.ai/api/v1",
                api_key=api_key,
            )

            # 2. Build the conversation history
            messages = [
                {"role": "system",
                 "content": "You are an expert coding tutor for 'Learnify'. Explain concepts clearly with code examples if needed."}
            ]

            # Add past messages so the AI remembers the chat
            for msg in history_data:
                if msg.get('text'):
                    role = 'user' if msg.get('role') == 'user' else 'assistant'
                    messages.append({"role": role, "content": msg['text']})

            # Add the current question
            messages.append({"role": "user", "content": user_input})

            # 3. Call the Free Models endpoint
            completion = client.chat.completions.create(
                model="openrouter/free",
                messages=messages,
            )

            # 4. Extract and return the answer
            ai_response = completion.choices[0].message.content
            return Response({"explanation": ai_response})

        except Exception as e:
            print(f"------------ OPENROUTER CRASH ------------")
            print(str(e))
            print(f"------------------------------------------")
            return Response({"explanation": f"API Error: {str(e)}"}, status=503)

# --------------------------
# AUTHENTICATION & OTP
# --------------------------
class SendRegistrationOTPView(APIView):
    permission_classes = [permissions.AllowAny]

    def post(self, request):
        email = request.data.get('email')
        if not email:
            return Response({'error': 'Email is required'}, status=400)
        if User.objects.filter(email=email).exists():
            return Response({'error': 'Email is already registered'}, status=400)

        otp = str(random.randint(100000, 999999))
        OTPVerification.objects.update_or_create(email=email, defaults={'otp': otp, 'created_at': timezone.now()})

        try:
            send_mail(
                'Welcome to Learnify - Your Registration OTP',
                f'Your verification code is: {otp}\nThis code will expire in 10 minutes.',
                settings.EMAIL_HOST_USER,
                [email],
                fail_silently=False,
            )
            return Response({'message': 'OTP sent successfully.'})
        except Exception as e:
            return Response({'error': 'Failed to send email. Check SMTP settings.'}, status=500)


class UserRegistrationView(APIView):
    permission_classes = [permissions.AllowAny]

    def post(self, request):
        serializer = UserRegistrationSerializer(data=request.data)
        if serializer.is_valid():
            user = serializer.save()
            return Response({
                'message': 'User registered successfully',
                'user_id': user.id,
                'email': user.email
            }, status=status.HTTP_201_CREATED)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)


class UserLoginView(APIView):
    permission_classes = [permissions.AllowAny]

    def post(self, request):
        email = request.data.get("email")
        password = request.data.get("password")

        if not email or not password:
            return Response({"error": "Email and password are required."}, status=status.HTTP_400_BAD_REQUEST)

        try:
            user = User.objects.get(email=email)
        except User.DoesNotExist:
            return Response({"error": "Invalid email or password"}, status=status.HTTP_400_BAD_REQUEST)

        if not user.check_password(password):
            return Response({"error": "Invalid email or password"}, status=status.HTTP_400_BAD_REQUEST)

        token, created = Token.objects.get_or_create(user=user)

        return Response({
            "message": "Login successful",
            "token": token.key,
            "user_id": user.id,
            "username": user.username,
            "email": user.email
        }, status=status.HTTP_200_OK)


class ForgotPasswordOTPView(APIView):
    permission_classes = [permissions.AllowAny]

    def post(self, request):
        email = request.data.get('email')
        try:
            user = User.objects.get(email=email)
            otp = str(random.randint(100000, 999999))
            OTPVerification.objects.update_or_create(email=email, defaults={'otp': otp, 'created_at': timezone.now()})

            send_mail(
                'Learnify Password Reset',
                f'Your OTP to reset your password is: {otp}',
                settings.EMAIL_HOST_USER,
                [email],
                fail_silently=False
            )
            return Response({'message': 'OTP sent to your email.'})
        except User.DoesNotExist:
            return Response({'message': 'If the email exists, an OTP was sent.'})
        except Exception as e:
            return Response({'error': 'Failed to send email.'}, status=500)


class ResetPasswordView(APIView):
    permission_classes = [permissions.AllowAny]

    def post(self, request):
        email = request.data.get('email')
        otp_code = request.data.get('otp')
        new_password = request.data.get('new_password')

        try:
            otp_record = OTPVerification.objects.get(email=email, otp=otp_code)
            if not otp_record.is_valid():
                return Response({"error": "OTP has expired."}, status=400)

            user = User.objects.get(email=email)
            from .serializers import validate_strong_password
            from rest_framework.exceptions import ValidationError
            try:
                validate_strong_password(new_password)
            except ValidationError as e:
                return Response({"error": str(e.detail[0])}, status=400)

            user.set_password(new_password)
            user.save()
            otp_record.delete()
            return Response({'message': 'Password has been reset successfully.'})

        except OTPVerification.DoesNotExist:
            return Response({"error": "Invalid OTP."}, status=400)
        except User.DoesNotExist:
            return Response({"error": "User not found."}, status=404)


class UserProfileView(APIView):
    permission_classes = [permissions.IsAuthenticated]

    def get(self, request):
        serializer = UserProfileSerializer(request.user)
        return Response(serializer.data)


# --------------------------
# SEARCH API
# --------------------------
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

        courses_qs = Course.objects.filter(
            Q(title__icontains=q) | Q(short_description__icontains=q) |
            Q(description__icontains=q) | Q(subcategory__name__icontains=q) |
            Q(subcategory__category__name__icontains=q)
        ).select_related('subcategory', 'instructor').distinct()[:50]

        topics_qs = Topic.objects.filter(
            Q(title__icontains=q) | Q(content__icontains=q) | Q(course__title__icontains=q)
        ).select_related('course').distinct()[:50]

        categories_qs = Category.objects.filter(Q(name__icontains=q) | Q(description__icontains=q)).distinct()[:50]
        subcategories_qs = SubCategory.objects.filter(
            Q(name__icontains=q) | Q(description__icontains=q) | Q(category__name__icontains=q)
        ).select_related('category').distinct()[:50]

        results = []

        for c in courses_qs:
            results.append({
                "type": "course", "id": c.id, "title": c.title,
                "subtitle": getattr(c, "short_description", "") or "",
                "snippet": (c.description[:240] + "...") if c.description and len(c.description) > 240 else (
                            c.description or ""),
                "extra": {"subcategory": c.subcategory.name if c.subcategory else "", "price": str(c.price)}
            })
        for t in topics_qs:
            results.append({
                "type": "topic", "id": t.id, "title": t.title,
                "subtitle": t.course.title if t.course else "",
                "snippet": (t.content[:240] + "...") if t.content and len(t.content) > 240 else (t.content or ""),
                "extra": {"course_id": str(t.course.id) if t.course else ""}
            })
        for cat in categories_qs:
            results.append({
                "type": "category", "id": cat.id, "title": cat.name,
                "subtitle": "",
                "snippet": (cat.description[:240] + "...") if cat.description and len(cat.description) > 240 else (
                            cat.description or ""),
                "extra": {}
            })
        for sc in subcategories_qs:
            results.append({
                "type": "subcategory", "id": sc.id, "title": sc.name,
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


# --------------------------
# ORIGINAL WEB SCRAPING RESTORED
# --------------------------
def background_scrape_task(course_id):
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
            thread = threading.Thread(target=background_scrape_task, args=(course.id,))
            thread.start()
            return Response({
                "ok": True,
                "message": "Scraping started in the background. Topics will be populated shortly.",
            }, status=202)
        else:
            return Response({
                "ok": False,
                "message": "Source URL or Start Key missing in Course settings."
            }, status=400)


# --------------------------
# PROGRESS VIEWS
# --------------------------
class UserProgressView(APIView):
    permission_classes = [permissions.IsAuthenticated]

    def post(self, request):
        topic_id = request.data.get('topic_id')
        if not topic_id: return Response({'error': 'topic_id is required'}, status=400)
        try:
            topic = Topic.objects.get(id=topic_id)
            progress, created = UserProgress.objects.get_or_create(user=request.user, topic=topic,
                                                                   defaults={'completed': True})
            if not created and not progress.completed:
                progress.completed = True
                progress.save(update_fields=['completed'])
            return Response({'status': 'marked completed', 'topic_id': topic_id})
        except Topic.DoesNotExist:
            return Response({'error': 'Topic not found'}, status=404)


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
            completed_topics = UserProgress.objects.filter(user=user, topic__course=course, completed=True).count()
            percent = (completed_topics / total_topics) * 100 if total_topics > 0 else 0
            response_data.append(
                {"course_id": course.id, "title": course.title, "progress": round(percent, 1), "total": total_topics,
                 "completed": completed_topics})
        return Response(response_data)


class CourseProgressView(APIView):
    permission_classes = [permissions.IsAuthenticated]

    def get(self, request, course_id):
        try:
            total = Topic.objects.filter(course_id=course_id).count()
            completed_ids_qs = UserProgress.objects.filter(user=request.user, topic__course_id=course_id,
                                                           completed=True).values_list('topic_id', flat=True)
            completed_ids = list(completed_ids_qs)
            percent = (len(completed_ids) / total * 100) if total > 0 else 0
            return Response(
                {"total_topics": total, "completed_topics": len(completed_ids), "progress_percent": round(percent, 1),
                 "completed_topic_ids": completed_ids})
        except Exception as e:
            return Response({"error": str(e)}, status=500)



class DynamicPageView(APIView):
    permission_classes = [permissions.AllowAny]
    def get(self, request, slug):
        try:
            page = DynamicPage.objects.get(slug=slug)
            serializer = DynamicPageSerializer(page)
            return Response(serializer.data)
        except DynamicPage.DoesNotExist:
            return Response({"error": "Page not found"}, status=404)

class SiteSettingView(APIView):
    permission_classes = [permissions.AllowAny]
    def get(self, request):
        settings = SiteSetting.objects.first()
        if not settings:
            # Create a default if none exists
            settings = SiteSetting.objects.create()
        serializer = SiteSettingSerializer(settings)
        return Response(serializer.data)


# Add this endpoint to fetch the categories and their links
class FooterDataView(APIView):
    permission_classes = [permissions.AllowAny]
    def get(self, request):
        categories = FooterCategory.objects.all()
        serializer = FooterCategorySerializer(categories, many=True)
        return Response(serializer.data)