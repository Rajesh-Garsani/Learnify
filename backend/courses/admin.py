from django.contrib import admin
from django.contrib.auth.admin import UserAdmin
from django import forms
from django.utils.html import format_html
from django.urls import path, reverse
from django.shortcuts import redirect, get_object_or_404
from django.contrib import messages
from ckeditor_uploader.widgets import CKEditorUploadingWidget
from .models import DynamicPage, SiteSetting
from .models import FooterCategory, FooterLink
from .models import User, Category, SubCategory, Course, Topic, UserProgress
from .scraper.dynamic_scraper import DynamicW3Scraper
from .scraper.utils import save_scraped

class CategoryAdminForm(forms.ModelForm):
    description = forms.CharField(widget=CKEditorUploadingWidget())
    class Meta: model = Category; fields = '__all__'

class SubCategoryAdminForm(forms.ModelForm):
    description = forms.CharField(widget=CKEditorUploadingWidget())
    class Meta: model = SubCategory; fields = '__all__'

class CourseAdminForm(forms.ModelForm):
    description = forms.CharField(widget=CKEditorUploadingWidget())
    class Meta: model = Course; fields = '__all__'

class TopicAdminForm(forms.ModelForm):
    content = forms.CharField(widget=CKEditorUploadingWidget())
    class Meta: model = Topic; fields = '__all__'

@admin.register(User)
class CustomUserAdmin(UserAdmin):
    list_display = ('username', 'email', 'first_name', 'last_name', 'is_staff')
    fieldsets = UserAdmin.fieldsets + (('Additional Info', {'fields': ('gender', 'age', 'address', 'profile_picture')}),)

@admin.register(Category)
class CategoryAdmin(admin.ModelAdmin):
    form = CategoryAdminForm
    list_display = ('name', 'created_at')

@admin.register(SubCategory)
class SubCategoryAdmin(admin.ModelAdmin):
    form = SubCategoryAdminForm
    list_display = ('name', 'category', 'created_at')
    list_filter = ('category',)

class TopicInline(admin.StackedInline):
    model = Topic
    form = TopicAdminForm
    extra = 1

@admin.register(Course)
class CourseAdmin(admin.ModelAdmin):
    form = CourseAdminForm
    list_display = ('title', 'subcategory', 'instructor', 'difficulty', 'scrape_button', 'created_at')
    list_filter = ('subcategory', 'difficulty', 'is_free')
    inlines = [TopicInline]

    def get_urls(self):
        urls = super().get_urls()
        custom_urls = [
            path('scrape-course/<int:course_id>/', self.admin_site.admin_view(self.process_scraping), name='course-scrape'),
        ]
        return custom_urls + urls

    def scrape_button(self, obj):
        return format_html(
            '<a class="button" href="{}" style="background-color: #28a745; color: white; padding: 5px 10px; border-radius: 4px;">Scrape Now</a>',
            reverse('admin:course-scrape', args=[obj.pk])
        )
    scrape_button.short_description = 'Scraper Action'
    scrape_button.allow_tags = True

    def process_scraping(self, request, course_id):
        course = get_object_or_404(Course, pk=course_id)

        if course.source_url and course.sidebar_start_key:
            try:
                scraper = DynamicW3Scraper(course)
                data = scraper.scrape()

                if data:
                    save_scraped(course.title, data)
                    self.message_user(request, f"Success! Scraped {len(data)} topics for '{course.title}'.", messages.SUCCESS)
                else:
                    self.message_user(request, f"Scraper ran but found 0 topics. Check 'Start Key': {course.sidebar_start_key}", messages.WARNING)
            except Exception as e:
                self.message_user(request, f"Error scraping: {str(e)}", messages.ERROR)
        else:
            self.message_user(request, "Please set 'Source URL' and 'Sidebar Start Key' in the course settings first.", messages.ERROR)

        return redirect('admin:courses_course_changelist')

@admin.register(Topic)
class TopicAdmin(admin.ModelAdmin):
    form = TopicAdminForm
    list_display = ('title', 'course', 'order', 'duration_minutes')
    list_filter = ('course',)

@admin.register(UserProgress)
class UserProgressAdmin(admin.ModelAdmin):
    list_display = ('user', 'topic', 'completed', 'completed_at')
    list_filter = ('completed',)




@admin.register(DynamicPage)
class DynamicPageAdmin(admin.ModelAdmin):
    list_display = ('title', 'slug', 'last_updated')
    search_fields = ('title', 'slug')

@admin.register(SiteSetting)
class SiteSettingAdmin(admin.ModelAdmin):
    list_display = ('brand_name', 'contact_email')


# ... your other imports ...

# Add this to the bottom of admin.py
class FooterLinkInline(admin.TabularInline):
    model = FooterLink
    extra = 1

@admin.register(FooterCategory)
class FooterCategoryAdmin(admin.ModelAdmin):
    list_display = ('title', 'order')
    inlines = [FooterLinkInline]