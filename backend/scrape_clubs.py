import json
import time
import re
from selenium import webdriver
from selenium.webdriver.chrome.service import Service
from selenium.webdriver.common.by import By
from selenium.webdriver.support.ui import WebDriverWait
from selenium.webdriver.support import expected_conditions as EC
from webdriver_manager.chrome import ChromeDriverManager

def scrape_clubs() -> list[dict]:
    print("Starting browser...")

    options = webdriver.ChromeOptions()
    options.add_argument("--headless")
    options.add_argument("--no-sandbox")
    options.add_argument("--disable-dev-shm-usage")
    options.add_argument("--window-size=1920,1080")

    driver = webdriver.Chrome(
        service=Service(ChromeDriverManager().install()),
        options=options
    )

    try:
        print("Fetching club page...")
        driver.get("https://engage.northeastern.edu/club_signup?view=all")

        print("Waiting for clubs to load...")
        WebDriverWait(driver, 30).until(
            EC.presence_of_element_located((By.CSS_SELECTOR, "li.list-group-item"))
        )

        time.sleep(5)

        club_items = driver.find_elements(By.CSS_SELECTOR, "li.list-group-item")
        print(f"Found {len(club_items)} clubs")

        clubs: list[dict] = []

        for item in club_items:
            try:
                # Club ID from checkbox input id like "cb_club_35820"
                try:
                    checkbox = item.find_element(By.CSS_SELECTOR, "input[id^='cb_club_']")
                    cb_id = checkbox.get_attribute("id")
                    club_id_match = re.search(r"cb_club_(\d+)", cb_id)
                    club_id = int(club_id_match.group(1)) if club_id_match else None
                except Exception:
                    club_id = None

                # Name
                try:
                    name = item.find_element(By.TAG_NAME, "h2").text.strip()
                except Exception:
                    name = None

                # Profile URL
                try:
                    profile_link = item.find_element(By.CSS_SELECTOR, "a[href*='student_community']")
                    href = profile_link.get_attribute("href")
                    profile_url = href if href.startswith("http") else f"https://engage.northeastern.edu{href}"
                except Exception:
                    profile_url = None

                # Logo URL
                try:
                    img = item.find_element(By.TAG_NAME, "img")
                    src = img.get_attribute("src")
                    logo_url = src if src.startswith("http") else f"https://engage.northeastern.edu{src}"
                except Exception:
                    logo_url = None

                full_text = item.text

                # Parse campus, org_type, categories
                type_line = ""
                for line in full_text.split("\n"):
                    line = line.strip()
                    if any(x in line for x in ["Boston -", "Oakland -", "School of Law"]):
                        type_line = line
                        break

                parts = [p.strip() for p in type_line.split(" - ")]
                campus = parts[0] if len(parts) > 0 else None
                org_type = parts[1] if len(parts) > 1 else None
                categories = parts[2:] if len(parts) > 2 else []

                # Mission - extract and clean up
                mission = None
                mission_match = re.search(
                    r"Mission\s*\n(.+?)(?:\nMembership Benefits|\Z)",
                    full_text,
                    re.DOTALL
                )
                if mission_match:
                    mission = mission_match.group(1).strip()
                    mission = re.sub(r"Contact:.*?\n", "", mission, flags=re.IGNORECASE)
                    mission = re.sub(r"Group Not Registered Yet\n?", "", mission, flags=re.IGNORECASE)
                    mission = re.sub(r"Lifetime membership.*", "", mission, flags=re.IGNORECASE | re.DOTALL)
                    mission = re.sub(r"Group password:.*?\n?", "", mission, flags=re.IGNORECASE)
                    mission = re.sub(r"Will end at Graduation.*?\n?", "", mission, flags=re.IGNORECASE)
                    mission = re.sub(r"\n{2,}", "\n", mission).strip()
                    if not mission or len(mission) < 10:
                        mission = None
                    elif len(mission) > 2000:
                        mission = mission[:2000]

                clubs.append({
                    "club_id": club_id,
                    "name": name,
                    "campus": campus,
                    "org_type": org_type,
                    "categories": categories,
                    "mission": mission,
                    "logo_url": logo_url,
                    "profile_url": profile_url,
                })

            except Exception as e:
                print(f"Error parsing club: {e}")
                continue

        return clubs

    finally:
        driver.quit()


if __name__ == "__main__":
    clubs = scrape_clubs()

    with open("clubs_data.json", "w") as f:
        json.dump(clubs, f, indent=2)

    print(f"\nSuccessfully scraped {len(clubs)} clubs")
    print("Saved to clubs_data.json")

    if clubs:
        print("\nSample club:")
        print(json.dumps(clubs[0], indent=2))