from courses.models import Course, Topic


def save_scraped(course_slug, topics):
    # Try to find the course by slug, or by title (case insensitive)
    try:
        course = Course.objects.get(title__iexact=course_slug)
    except Course.DoesNotExist:
        # Fallback: try to find by checking if slug is in the title
        course = Course.objects.filter(title__icontains=course_slug).first()

    if not course:
        print(f"❌ Course not found for slug: {course_slug}")
        return False

    print(f"Saving to Course: {course.title} (ID: {course.id})")

    # ⭐ FIX: Do NOT delete all topics. Update them if they exist.
    # Topic.objects.filter(course=course).delete() <--- REMOVED THIS

    for i, t in enumerate(topics):
        # We use the Title as the unique identifier for a topic within a course
        Topic.objects.update_or_create(
            course=course,
            title=t["title"],
            defaults={
                "content": t["content"],
                "order": i,  # Update order if it changed
                # "duration_minutes": 15 # Optional: Set a default
            }
        )
        print(f"   -> Saved: {t['title']}")

    return True