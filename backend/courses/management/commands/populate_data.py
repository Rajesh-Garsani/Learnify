from django.core.management.base import BaseCommand
from courses.models import User, Category, SubCategory, Course, Topic

class Command(BaseCommand):
    help = 'Populate database with initial data'
    
    def handle(self, *args, **options):
        # Create admin user
        admin_user, created = User.objects.get_or_create(
            username='admin',
            defaults={
                'email': 'admin@learnai.com',
                'is_staff': True,
                'is_superuser': True
            }
        )
        if created:
            admin_user.set_password('admin123')
            admin_user.save()
            self.stdout.write(self.style.SUCCESS('Admin user created'))
        
        # Create categories
        programming = Category.objects.create(name='Programming', description='Learn programming languages')
        ai_ml = Category.objects.create(name='AI & Machine Learning', description='AI and ML courses')
        data_science = Category.objects.create(name='Data Science', description='Data science courses')
        
        # Create subcategories
        python_sub = SubCategory.objects.create(category=programming, name='Python', description='Python programming')
        javascript_sub = SubCategory.objects.create(category=programming, name='JavaScript', description='JavaScript programming')
        ml_sub = SubCategory.objects.create(category=ai_ml, name='Machine Learning', description='ML algorithms')
        
        # Create courses
        python_course = Course.objects.create(
            title='Python for Beginners',
            short_description='Learn Python from scratch',
            description='Complete Python course for beginners',
            subcategory=python_sub,
            instructor=admin_user,
            difficulty='beginner',
            is_free=True
        )
        
        # Create topics
        Topic.objects.create(
            course=python_course,
            title='Introduction to Python',
            content='<h2>Welcome to Python</h2><p>Learn Python basics</p>',
            order=1,
            duration_minutes=30
        )
        
        self.stdout.write(self.style.SUCCESS('Successfully populated initial data'))