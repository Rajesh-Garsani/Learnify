from .models import Course
from .scraper.dynamic_scraper import DynamicW3Scraper
from .scraper.utils import save_scraped


def auto_scrape_all():
    print("⏰ Starting Auto-Scrape Cron Job...")

    # Find all courses that have a Source URL configured
    courses_to_scrape = Course.objects.exclude(source_url="").exclude(source_url__isnull=True)

    if not courses_to_scrape.exists():
        print("   No courses configured for scraping.")
        return

    for course in courses_to_scrape:
        print(f"   ⟳ Scraping: {course.title}...")
        try:
            scraper = DynamicW3Scraper(course)
            data = scraper.scrape()

            if data:
                save_scraped(course.title, data)
                print(f"     ✅ Success: Updated {len(data)} topics.")
            else:
                print(f"     ⚠️ Warning: No data found (Check keys).")

        except Exception as e:
            print(f"     ❌ Error: {e}")

    print("⏰ Auto-Scrape Finished.")