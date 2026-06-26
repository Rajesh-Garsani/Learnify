from django.conf.urls.static import static
from django.urls import path, include
from . import views
from .views import SearchAPIView, ScrapeCourseAPI, UserCourseProgressView, CourseProgressView, CourseRecommendationView
from django.conf import settings

urlpatterns = [
    # --------------------------
    # Categories & Courses
    # --------------------------
    path('categories/', views.CategoryList.as_view(), name='category-list'),
    path('subcategories/', views.SubCategoryList.as_view(), name='subcategory-list'),
    path('subcategories/<int:pk>/', views.SubCategoryDetail.as_view(), name='subcategory-detail'),
    path('courses/', views.CourseList.as_view(), name='course-list'),
    path('courses/random/', views.RandomCourses.as_view(), name='random-courses'),
    path('courses/recommendations/', CourseRecommendationView.as_view(), name='course-recommendations'),
    path('courses/<int:pk>/', views.CourseDetail.as_view(), name='course-detail'),

    # --------------------------
    # Topics & AI
    # --------------------------
    path('topics/', views.TopicList.as_view(), name='topic-list'),
    path('topics/<int:pk>/', views.TopicDetail.as_view(), name='topic-detail'),
    path('ai/explain/', views.AIExplainView.as_view(), name='ai-explain'),
    path('search/', SearchAPIView.as_view(), name='api-search'),

    # --------------------------
    # Authentication & OTP (UPDATED)
    # --------------------------
    path('auth/send-register-otp/', views.SendRegistrationOTPView.as_view(), name='send-register-otp'),
    path('auth/register/', views.UserRegistrationView.as_view(), name='user-register'),
    path('auth/login/', views.UserLoginView.as_view(), name='user-login'),
    path('auth/forgot-password-otp/', views.ForgotPasswordOTPView.as_view(), name='forgot-password-otp'),
    path('auth/reset-password/', views.ResetPasswordView.as_view(), name='reset-password'),
    path('auth/profile/', views.UserProfileView.as_view(), name='user-profile'),

    # --------------------------
    # Progress Tracking
    # --------------------------
    path('progress/', views.UserProgressView.as_view(), name='user-progress'),
    path("progress/course/<int:course_id>/", CourseProgressView.as_view(), name='course-progress'),
    path("progress/my-courses/", UserCourseProgressView.as_view(), name='my-courses'),

    # --------------------------
    # Scraping & Utilities
    # --------------------------
    path("scrape/<int:course_id>/", ScrapeCourseAPI.as_view(), name='scrape-course'),
    path("ckeditor/", include("ckeditor_uploader.urls")),

    path('site-settings/', views.SiteSettingView.as_view(), name='site-settings'),
    path('pages/<slug:slug>/', views.DynamicPageView.as_view(), name='dynamic-page'),
# Add this line to your urlpatterns
    path('footer-data/', views.FooterDataView.as_view(), name='footer-data'),
]

if settings.DEBUG:
    urlpatterns += static(settings.MEDIA_URL, document_root=settings.MEDIA_ROOT)