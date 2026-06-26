import re
from rest_framework import serializers
from django.contrib.auth import authenticate
from .models import User, Category, SubCategory, Course, Topic, UserProgress, OTPVerification, DynamicPage, SiteSetting, \
    FooterLink, FooterCategory


# Helper for strong password validation
def validate_strong_password(value):
    if len(value) < 8:
        raise serializers.ValidationError("Password must be at least 8 characters.")
    if not re.search(r'[A-Z]', value):
        raise serializers.ValidationError("Password must contain at least one uppercase letter.")
    if not re.search(r'\d', value):
        raise serializers.ValidationError("Password must contain at least one digit.")
    if not re.search(r'[!@#$%^&*(),.?":{}|<>]', value):
        raise serializers.ValidationError("Password must contain at least one special character.")
    return value


class UserRegistrationSerializer(serializers.ModelSerializer):
    password = serializers.CharField(write_only=True, validators=[validate_strong_password])
    password2 = serializers.CharField(write_only=True)
    otp = serializers.CharField(write_only=True, max_length=6)
    first_name = serializers.CharField(required=True)
    last_name = serializers.CharField(required=True)

    class Meta:
        model = User
        fields = ['first_name', 'last_name', 'email', 'password', 'password2', 'otp']

    def validate_email(self, value):
        if User.objects.filter(email__iexact=value).exists():
            raise serializers.ValidationError("A user with this email already exists.")
        return value

    def validate(self, attrs):
        if attrs.get('password') != attrs.get('password2'):
            raise serializers.ValidationError({"password": "Password fields didn't match."})

        # Verify OTP
        email = attrs.get('email')
        otp_code = attrs.get('otp')
        try:
            otp_record = OTPVerification.objects.get(email=email, otp=otp_code)
            if not otp_record.is_valid():
                raise serializers.ValidationError({"otp": "OTP has expired. Please request a new one."})
        except OTPVerification.DoesNotExist:
            raise serializers.ValidationError({"otp": "Invalid OTP."})

        return attrs

    def create(self, validated_data):
        validated_data.pop('password2')
        validated_data.pop('otp')

        # Auto-generate username from email to satisfy Django logic securely
        email = validated_data.get('email')
        base_username = email.split('@')[0]
        username = base_username
        counter = 1
        while User.objects.filter(username=username).exists():
            username = f"{base_username}{counter}"
            counter += 1

        validated_data['username'] = username
        user = User.objects.create_user(**validated_data)

        OTPVerification.objects.filter(email=email).delete()
        return user


class UserLoginSerializer(serializers.Serializer):
    email = serializers.EmailField()
    password = serializers.CharField()


class UserProfileSerializer(serializers.ModelSerializer):
    class Meta:
        model = User
        fields = ['id', 'username', 'email', 'first_name', 'last_name', 'gender', 'age', 'address']


class CategorySerializer(serializers.ModelSerializer):
    class Meta:
        model = Category
        fields = '__all__'


class SubCategorySerializer(serializers.ModelSerializer):
    category_name = serializers.CharField(source='category.name', read_only=True)

    class Meta:
        model = SubCategory
        fields = '__all__'


class CourseSerializer(serializers.ModelSerializer):
    subcategory_name = serializers.CharField(source='subcategory.name', read_only=True)
    category_name = serializers.CharField(source='subcategory.category.name', read_only=True)
    instructor_name = serializers.CharField(source='instructor.get_full_name', read_only=True)

    class Meta:
        model = Course
        fields = '__all__'


class TopicSerializer(serializers.ModelSerializer):
    course_title = serializers.CharField(source='course.title', read_only=True)

    class Meta:
        model = Topic
        fields = '__all__'


class UserProgressSerializer(serializers.ModelSerializer):
    topic_title = serializers.CharField(source='topic.title', read_only=True)
    course_title = serializers.CharField(source='topic.course.title', read_only=True)

    class Meta:
        model = UserProgress
        fields = '__all__'


class DynamicPageSerializer(serializers.ModelSerializer):
    class Meta:
        model = DynamicPage
        fields = ['title', 'slug', 'content', 'last_updated']

class SiteSettingSerializer(serializers.ModelSerializer):
    class Meta:
        model = SiteSetting
        fields = '__all__'


# Add these at the bottom of the file
class FooterLinkSerializer(serializers.ModelSerializer):
    class Meta:
        model = FooterLink
        fields = ['id', 'title', 'url', 'order']

class FooterCategorySerializer(serializers.ModelSerializer):
    links = FooterLinkSerializer(many=True, read_only=True)

    class Meta:
        model = FooterCategory
        fields = ['id', 'title', 'order', 'links']