from selenium import webdriver
from selenium.webdriver.chrome.service import Service
from webdriver_manager.chrome import ChromeDriverManager
import time

options = webdriver.ChromeOptions()
options.add_argument("--headless")
options.add_argument("--no-sandbox")
options.add_argument("--disable-dev-shm-usage")
options.add_argument("--window-size=1920,1080")

driver = webdriver.Chrome(
    service=Service(ChromeDriverManager().install()),
    options=options
)

driver.get("https://engage.northeastern.edu/club_signup?view=all")
print("Page loaded, waiting 10 seconds for JS to render...")
time.sleep(10)

# Save full page source
with open("page_source.html", "w") as f:
    f.write(driver.page_source)

print("Saved page_source.html")
print(f"Page title: {driver.title}")
print(f"Page source length: {len(driver.page_source)} chars")

# Print first 3000 chars to get a sense of the structure
print("\n--- First 3000 chars of page source ---")
print(driver.page_source[:3000])

driver.quit()