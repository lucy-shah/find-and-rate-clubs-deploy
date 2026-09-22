import json
import os
from supabase import create_client
from dotenv import load_dotenv

load_dotenv()

SUPABASE_URL = os.getenv("SUPABASE_URL")
SUPABASE_KEY = os.getenv("SUPABASE_KEY")

if not SUPABASE_URL or not SUPABASE_KEY:
    raise ValueError("Missing SUPABASE_URL or SUPABASE_KEY in .env file")

supabase = create_client(SUPABASE_URL, SUPABASE_KEY)

with open("clubs_data.json") as f:
    clubs = json.load(f)

print(f"Uploading {len(clubs)} clubs to Supabase...")

# Upload in batches of 50 to avoid hitting limits
batch_size = 50
success_count = 0

for i in range(0, len(clubs), batch_size):
    batch = clubs[i:i + batch_size]
    try:
        response = supabase.table("clubs").upsert(batch).execute()
        success_count += len(batch)
        print(f"Uploaded {success_count}/{len(clubs)} clubs...")
    except Exception as e:
        print(f"Error uploading batch {i}-{i+batch_size}: {e}")

print(f"\nDone! Successfully uploaded {success_count} clubs to Supabase.")