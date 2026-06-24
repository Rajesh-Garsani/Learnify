from .base import W3BaseScraper


class DynamicW3Scraper(W3BaseScraper):
    """
    A Universal Scraper that configures itself based on Database fields.
    """

    def __init__(self, course_model):
        self.course = course_model

        # Load config from the Database
        self.BASE_URL = course_model.source_url
        self.TUTORIAL_NAME = course_model.sidebar_start_key

        # Convert comma-separated string to list
        if course_model.sidebar_stop_keys:
            self.STOP_KEYWORDS = [k.strip().lower() for k in course_model.sidebar_stop_keys.split(',')]
        else:
            self.STOP_KEYWORDS = []

        self.START_PAGE = "default.asp"

        # Auto-detect code class based on title (Optional smart logic)
        title = course_model.title.lower()
        if "java" in title and "script" not in title:
            self.CODE_CLASS = "language-java"
        elif "html" in title:
            self.CODE_CLASS = "language-markup"
        elif "css" in title:
            self.CODE_CLASS = "language-css"
        elif "c++" in title or "cpp" in title:
            self.CODE_CLASS = "language-cpp"
        elif "c#" in title or "csharp" in title:
            self.CODE_CLASS = "language-csharp"
        elif "sql" in title:
            self.CODE_CLASS = "language-sql"
        else:
            self.CODE_CLASS = "language-python"  # Default

    def scrape(self):
        # Validation
        if not self.BASE_URL or not self.TUTORIAL_NAME:
            print("❌ Missing Source URL or Start Key in Course Settings.")
            return []

        return super().scrape()