from django.conf.urls.static import static
from django.urls import path, include
from . import views
from .views import SearchAPIView, ScrapeCourseAPI, UserCourseProgressView, CourseProgressView, CourseRecommendationView
from django.conf import settings



urlpatterns = [
    path('categories/', views.CategoryList.as_view(), name='category-list'),
    path('subcategories/', views.SubCategoryList.as_view(), name='subcategory-list'),
    path('subcategories/<int:pk>/', views.SubCategoryDetail.as_view(), name='subcategory-detail'),
    path('courses/', views.CourseList.as_view(), name='course-list'),
    path('courses/random/', views.RandomCourses.as_view(), name='random-courses'),
    path('courses/recommendations/', CourseRecommendationView.as_view(), name='course-recommendations'),
    path('courses/<int:pk>/', views.CourseDetail.as_view(), name='course-detail'),
    path('topics/', views.TopicList.as_view(), name='topic-list'),
    path('topics/<int:pk>/', views.TopicDetail.as_view(), name='topic-detail'),
    path('auth/register/', views.UserRegistrationView.as_view(), name='user-register'),
    path('auth/login/', views.UserLoginView.as_view(), name='user-login'),
    path('auth/profile/', views.UserProfileView.as_view(), name='user-profile'),
    path('progress/', views.UserProgressView.as_view(), name='user-progress'),
    path('search/', SearchAPIView.as_view(), name='api-search'),
    path("scrape/<int:course_id>/", ScrapeCourseAPI.as_view()),
    path("ckeditor/", include("ckeditor_uploader.urls")),
    path("progress/course/<int:course_id>/", CourseProgressView.as_view()),
    path("progress/my-courses/", UserCourseProgressView.as_view()),
    path('ai/explain/', views.AIExplainView.as_view(), name='ai-explain'),



]

if settings.DEBUG:
    urlpatterns += static(settings.MEDIA_URL, document_root=settings.MEDIA_ROOT)


    
