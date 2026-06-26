# Learnify,  12345
import os
from pathlib import Path
from decouple import config

BASE_DIR = Path(__file__).resolve().parent.parent

# 🔒 SECURED: Pulling from .env
SECRET_KEY = config('SECRET_KEY', default='django-insecure-your-secret-key-here')
DEBUG = config('DEBUG', default=True, cast=bool)

ALLOWED_HOSTS = [
    "127.0.0.1",
    "localhost",
    "learnfromlearnify.pythonanywhere.com",
]

INSTALLED_APPS = [
    # Admin interface (third party)
    'admin_interface',  # must be BEFORE django.contrib.admin
    'colorfield',       # dependency for admin_interface

    # Django default apps
    'django.contrib.admin',
    'django.contrib.auth',
    'django.contrib.contenttypes',
    'django.contrib.sessions',
    'django.contrib.messages',
    'django.contrib.staticfiles',

    # Third party apps
    'rest_framework',
    'rest_framework.authtoken',
    'corsheaders',
    'django_filters',
    'django_crontab',
    'ckeditor',
    'ckeditor_uploader',

    # Local apps
    'courses',
]

MIDDLEWARE = [
    'django.middleware.security.SecurityMiddleware',
    'whitenoise.middleware.WhiteNoiseMiddleware',

    'corsheaders.middleware.CorsMiddleware',

    'django.contrib.sessions.middleware.SessionMiddleware',
    'django.middleware.common.CommonMiddleware',
    'django.middleware.csrf.CsrfViewMiddleware',
    'django.contrib.auth.middleware.AuthenticationMiddleware',
    'django.contrib.messages.middleware.MessageMiddleware',
    'django.middleware.clickjacking.XFrameOptionsMiddleware',
]

ROOT_URLCONF = 'backend.urls'

TEMPLATES = [
    {
        'BACKEND': 'django.template.backends.django.DjangoTemplates',
        'DIRS': [],
        'APP_DIRS': True,
        'OPTIONS': {
            'context_processors': [
                'django.template.context_processors.debug',
                'django.template.context_processors.request',
                'django.contrib.auth.context_processors.auth',
                'django.contrib.messages.context_processors.messages',
            ],
        },
    },
]

WSGI_APPLICATION = 'backend.wsgi.application'

DATABASES = {
    'default': {
        'ENGINE': 'django.db.backends.sqlite3',
        'NAME': BASE_DIR / 'db.sqlite3',
    }
}

AUTH_PASSWORD_VALIDATORS = [
    {
        'NAME': 'django.contrib.auth.password_validation.UserAttributeSimilarityValidator',
    },
    {
        'NAME': 'django.contrib.auth.password_validation.MinimumLengthValidator',
    },
    {
        'NAME': 'django.contrib.auth.password_validation.CommonPasswordValidator',
    },
    {
        'NAME': 'django.contrib.auth.password_validation.NumericPasswordValidator',
    },
]

LANGUAGE_CODE = 'en-us'
TIME_ZONE = 'UTC'
USE_I18N = True
USE_TZ = True

STATIC_URL = 'static/'
STATIC_ROOT = BASE_DIR / 'staticfiles'

MEDIA_URL = '/media/'
MEDIA_ROOT = BASE_DIR / 'media'
CKEDITOR_UPLOAD_PATH = "uploads/"

DEFAULT_AUTO_FIELD = 'django.db.models.BigAutoField'

# Custom User Model
AUTH_USER_MODEL = 'courses.User'

# --------------------------------------------------------
# REST FRAMEWORK CONFIGURATION
# --------------------------------------------------------
REST_FRAMEWORK = {
    'DEFAULT_AUTHENTICATION_CLASSES': [
        'rest_framework.authentication.TokenAuthentication',
        'rest_framework.authentication.SessionAuthentication',
        'rest_framework.authentication.BasicAuthentication',
    ],
    'DEFAULT_PERMISSION_CLASSES': [
        'rest_framework.permissions.AllowAny',
    ],
    'DEFAULT_FILTER_BACKENDS': [
        'django_filters.rest_framework.DjangoFilterBackend',
        'rest_framework.filters.SearchFilter',
        'rest_framework.filters.OrderingFilter',
    ],
    'DEFAULT_PAGINATION_CLASS': 'rest_framework.pagination.PageNumberPagination',
    'PAGE_SIZE': 20
}

# --------------------------------------------------------
# CORS Configuration
# --------------------------------------------------------
CORS_ALLOWED_ORIGINS = [
    "http://localhost:5173",
    "http://localhost:3000",
    "http://127.0.0.1:8000",
    "https://learnwithlearnify.vercel.app",
]

CORS_ALLOW_CREDENTIALS = True
CORS_ALLOW_ALL_ORIGINS = False

# --------------------------------------------------------
# Cron Jobs
# --------------------------------------------------------
CRONJOBS = [
    ('0 */12 * * *', 'courses.cron.auto_scrape_all'),
]

# --------------------------------------------------------
# CKEditor Configuration
# --------------------------------------------------------
CKEDITOR_CONFIGS = {
    'default': {
        'toolbar': 'Custom',
        'height': 450,
        'width': '100%',
        'toolbar_Custom': [
            ['Bold', 'Italic', 'Underline', 'Strike'],
            ['TextColor', 'BGColor'],
            ['NumberedList', 'BulletedList'],
            ['Blockquote', 'CodeSnippet'],
            ['Link', 'Unlink'],
            ['Image', 'Table'],
            ['Format', 'RemoveFormat'],
            ['Source']
        ],
        'extraPlugins': ','.join([
            'codesnippet',
            'colorbutton',
            'colordialog',
        ]),
        'codeSnippet_theme': 'monokai_sublime',
    }
}

# --------------------------------------------------------
# Email Settings for OTP
# --------------------------------------------------------
EMAIL_BACKEND = 'django.core.mail.backends.smtp.EmailBackend'
EMAIL_HOST = 'smtp.gmail.com'
EMAIL_PORT = 587
EMAIL_USE_TLS = True

# 🔒 SECURED: Pulling from .env
EMAIL_HOST_USER = config('EMAIL_USER', default='rkgarsani2001@gmail.com')
EMAIL_HOST_PASSWORD = config('EMAIL_PASS', default='')

# 🔒 SECURED: Gemini API Key Fallback configuration
#GEMINI_API_KEY = config('GEMINI_API_KEY', default='')
OPENROUTER_API_KEY = config('OPENROUTER_API_KEY', default='')
