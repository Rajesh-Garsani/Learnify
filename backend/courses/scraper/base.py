import requests
from bs4 import BeautifulSoup
from urllib.parse import urljoin
import time


class BaseScraper:
    """Standard generic scraper with fetch utilities"""
    HEADERS = {
        "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/115.0.0.0 Safari/537.36"
    }

    def fetch(self, url):
        try:
            time.sleep(0.5)  # Be polite
            response = requests.get(url, headers=self.HEADERS)
            response.raise_for_status()
            return response.text
        except Exception as e:
            print(f"Error fetching {url}: {e}")
            return None


class W3BaseScraper(BaseScraper):
    """
    Master Class for all W3Schools tutorials.
    """
    BASE_URL = ""
    START_PAGE = ""
    TUTORIAL_NAME = ""  # The header to look for to START capturing
    STOP_KEYWORDS = []
    CODE_CLASS = "language-python"

    def get_course_links(self, soup):
        # 1. Try multiple common Sidebar IDs used by W3Schools
        menu = soup.find("div", id="leftmenuinner") or \
               soup.find("div", id="leftmenuinnerinner") or \
               soup.find("div", id="sidenav") or \
               soup.find("nav", id="leftmenu")

        if not menu:
            print("❌ Sidebar menu not found (checked: leftmenuinner, sidenav, etc).")
            # Fallback: Try finding the first large vertical menu
            menu = soup.find("div", class_="w3-sidebar")
            if not menu:
                return []

        links = []
        is_capturing = False

        # If no specific tutorial name is defined, capture everything (fallback)
        if not self.TUTORIAL_NAME:
            is_capturing = True

        # Find all relevant elements (Headers and Links)
        elements = menu.find_all(['a', 'h2', 'h3', 'h4', 'h5', 'div'])

        print(f"--- Debug: Scanning Sidebar for '{self.TUTORIAL_NAME}' ---")

        for element in elements:
            text = element.get_text(strip=True)
            text_lower = text.lower()

            # Logic to toggle capturing ON/OFF based on Headers
            if element.name in ["h2", "h3", "h4", "h5"] or (
                    element.name == "a" and "header" in element.get("class", [])):
                print(f"   Sidebar Header found: {text}")  # Debugging

                # Start capturing if we hit the Tutorial Header
                if self.TUTORIAL_NAME and self.TUTORIAL_NAME.lower() in text_lower:
                    is_capturing = True
                    print("   >>> CAPTURE STARTED")

                # Stop capturing if we hit a Stop Keyword
                elif any(k in text_lower for k in self.STOP_KEYWORDS) and is_capturing:
                    is_capturing = False
                    print(f"   <<< CAPTURE STOPPED (Hit keyword: {text})")

            # Collect Links if capturing is active
            if element.name == "a" and is_capturing:
                href = element.get("href")

                # Filter out bad links
                if not href or href.startswith("javascript") or href == "#":
                    continue

                full_url = urljoin(self.BASE_URL, href)

                # Avoid duplicates
                if full_url not in links:
                    links.append(full_url)

        return links

    def scrape(self):
        print(f"🚀 Starting Scrape: {self.TUTORIAL_NAME}...")
        start_url = urljoin(self.BASE_URL, self.START_PAGE)
        start_html = self.fetch(start_url)

        if not start_html:
            print("❌ Failed to fetch start page.")
            return []

        soup = BeautifulSoup(start_html, "html.parser")
        links = self.get_course_links(soup)
        print(f"Found {len(links)} lessons.")

        all_topics = []
        for i, link in enumerate(links):
            html = self.fetch(link)
            if not html: continue

            page_soup = BeautifulSoup(html, "html.parser")

            # W3Schools main content container
            main = page_soup.find("div", id="main") or page_soup.find("div", class_="w3-main")

            if main:
                # 1. Get Title
                title_tag = main.find("h1") or main.find("h2")
                title = title_tag.get_text(strip=True) if title_tag else f"Lesson {i}"

                # ⭐ FIX DOUBLE HEADING: Remove the H1 from content
                # (because your frontend already displays the title at the top)
                if main.find("h1"):
                    main.find("h1").decompose()

                # 2. Clean Content
                clean_soup = self.purify_content(main, link, page_soup)

                all_topics.append({
                    "title": title,
                    "content": clean_soup.prettify()
                })
                print(f"  [+] Scraped: {title}")

            else:
                print(f"  [-] Skipped {link} (No main content found)")

        return all_topics

    def purify_content(self, div_content, base_url, page_soup):
        # 1. Remove Ads, Buttons, Navigation, and Specific Sections
        selectors = [
            ".w3-clear.nextprev",  # Next/Prev buttons
            "#mid_content_ad",  # Ads
            ".w3-btn",  # Buttons
            "a[target='_blank']",  # External links
            "#google_translate_element",
            "#mainLeaderboard",  # Top Ad
            ".top10",
            ".nextprev",

            # ⭐ FIX: PROGRESS BARS & TIPS
            ".w3-panel.w3-note",  # The "Tip: track progress" bar
            ".w3-info",  # Yellow info boxes

            # ⭐ FIX: REFERENCES & BUTTON LISTS
            ".w3-container.w3-light-grey",  # Often holds the "Reference" lists
            ".w3-row.w3-center",  # Row of buttons

            # ⭐ FIX: "TRACK PROGRESS" & PROMOS
            "#getdiploma",  # "Get Certified"
            "#mypagediv2",  # "Create Server" promo
            "#mypagediv",  # The Star/Bookmark widget
            ".w3-right.w3-hide-small",  # Top right icons
            "form[target='_blank']",  # Search forms/Tracking forms

            # ⭐ FIX: BOTTOM FOOTERS
            ".w3-center.w3-padding-32",  # Bottom container with profile icon
            "footer",  # Actual footer tags
        ]

        for sel in selectors:
            for el in div_content.select(sel):
                el.decompose()

        # 2. ⭐ AGGRESSIVE TEXT REMOVAL (Remove sections by Header Text)
        # This removes "Python Quiz", "Python Exercises", "Download Python", etc.
        headers_to_remove = [
            "Quiz", "Exercises", "Track your progress",
            "Download", "Reference", "File Handling", "Database Handling",
            "Examples", "Get Started", "Kickstart"
        ]

        for header in div_content.find_all(['h2', 'h3', 'h4']):
            text = header.get_text()
            # If the header contains unwanted words
            if any(x in text for x in headers_to_remove):
                # Remove the header AND the next siblings until the next header
                # This logic tries to kill the section content following the header
                current = header
                while True:
                    sibling = current.find_next_sibling()
                    if sibling and sibling.name not in ['h2', 'h1', 'hr']:
                        sibling.decompose()
                    else:
                        break
                header.decompose()

        # 3. Normalize Code Blocks (Keep newlines)
        for code_div in div_content.select(".w3-code, .w3-example"):
            if code_div.parent is None: continue

            if "w3-example" in code_div.get("class", []) and code_div.find("div", class_="w3-code"):
                continue

            text_content = code_div.get_text(separator="\n", strip=True)

            pre = page_soup.new_tag("pre")
            code = page_soup.new_tag("code")
            code["class"] = self.CODE_CLASS
            code.string = text_content
            pre.append(code)
            code_div.replace_with(pre)

        # 4. Remove Images & SVGs
        for img in div_content.find_all("img"): img.decompose()
        for svg in div_content.find_all("svg"): svg.decompose()

        # 5. Fix Links
        for a_tag in div_content.find_all("a"):
            if a_tag.get("href"):
                a_tag["href"] = urljoin(base_url, a_tag["href"])

        return div_content