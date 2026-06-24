from django.db import models
from django.contrib.auth.models import AbstractUser
from ckeditor_uploader.fields import RichTextUploadingField


# --------------------------
# Custom User Model
# --------------------------
class User(AbstractUser):
    GENDER_CHOICES = [
        ('M', 'Male'),
        ('F', 'Female'),
        ('O', 'Other'),
    ]

    gender = models.CharField(max_length=1, choices=GENDER_CHOICES, blank=True)
    age = models.IntegerField(null=True, blank=True)
    address = models.TextField(blank=True)
    profile_picture = models.ImageField(upload_to='profiles/', null=True, blank=True)

    def __str__(self):
        return self.username


# --------------------------
# Category
# --------------------------
class Category(models.Model):
    name = models.CharField(max_length=100)
    description = RichTextUploadingField(blank=True)  # CKEditor added
    icon = models.CharField(max_length=50, blank=True)
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        verbose_name_plural = "Categories"

    def __str__(self):
        return self.name


# --------------------------
# SubCategory
# --------------------------
class SubCategory(models.Model):
    category = models.ForeignKey(Category, on_delete=models.CASCADE, related_name='subcategories')
    name = models.CharField(max_length=100)
    description = RichTextUploadingField(blank=True)  # CKEditor added
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        verbose_name_plural = "Sub Categories"

    def __str__(self):
        return f"{self.category.name} - {self.name}"


# --------------------------
# Course
# --------------------------
class Course(models.Model):
    DIFFICULTY_CHOICES = [
        ('beginner', 'Beginner'),
        ('intermediate', 'Intermediate'),
        ('advanced', 'Advanced'),
    ]

    title = models.CharField(max_length=200)
    description = RichTextUploadingField()  # CKEditor added
    short_description = models.CharField(max_length=300)
    subcategory = models.ForeignKey(SubCategory, on_delete=models.CASCADE, related_name='courses')
    instructor = models.ForeignKey(User, on_delete=models.CASCADE, related_name='courses_created')
    difficulty = models.CharField(max_length=20, choices=DIFFICULTY_CHOICES, default='beginner')
    thumbnail = models.ImageField(upload_to='course_thumbnails/', null=True, blank=True)
    price = models.DecimalField(max_digits=10, decimal_places=2, default=0.00)
    is_free = models.BooleanField(default=True)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    source_url = models.URLField(blank=True, help_text="e.g. https://www.w3schools.com/cpp/")
    sidebar_start_key = models.CharField(max_length=100, blank=True,
                                         help_text="Exact text in sidebar to START (e.g. 'C++ Tutorial')")
    sidebar_stop_keys = models.CharField(max_length=300, blank=True,
                                         help_text="Comma separated text to STOP (e.g. 'File Handling, Reference')")

    def __str__(self):
        return self.title


# --------------------------
# Topic
# --------------------------
class Topic(models.Model):
    course = models.ForeignKey(Course, on_delete=models.CASCADE, related_name='topics')
    title = models.CharField(max_length=200)
    content = RichTextUploadingField()  # CKEditor added for topics
    order = models.IntegerField(default=0)
    duration_minutes = models.IntegerField(default=0)
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        ordering = ['order']

    def __str__(self):
        return f"{self.course.title} - {self.title}"


# --------------------------
# Progress
# --------------------------
class UserProgress(models.Model):
    user = models.ForeignKey(User, on_delete=models.CASCADE, related_name='progress')
    topic = models.ForeignKey(Topic, on_delete=models.CASCADE)
    completed = models.BooleanField(default=False)
    completed_at = models.DateTimeField(null=True, blank=True)

    class Meta:
        unique_together = ['user', 'topic']

    def __str__(self):
        return f"{self.user.username} - {self.topic.title}"
