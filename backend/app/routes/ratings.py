from fastapi import APIRouter, HTTPException
from app.supabase_client import supabase
from app.models import RatingCreate

router = APIRouter(prefix="/api/ratings", tags=["ratings"])

@router.post("/")
def create_rating(rating: RatingCreate):
    # Check club exists
    club = supabase.table("clubs").select("club_id").eq("club_id", rating.club_id).execute()
    if not club.data:
        raise HTTPException(status_code=404, detail="Club not found")
    
    # Upsert rating
    existing = supabase.table("ratings").select("*").eq("club_id", rating.club_id).eq("user_id", rating.user_id).execute()
    
    if existing.data:
        result = supabase.table("ratings").update({
            "rating_score": rating.rating_score,
            "review_text": rating.review_text
        }).eq("club_id", rating.club_id).eq("user_id", rating.user_id).execute()
    else:
        result = supabase.table("ratings").insert({
            "club_id": rating.club_id,
            "user_id": rating.user_id,
            "rating_score": rating.rating_score,
            "review_text": rating.review_text
        }).execute()
    
    if not result.data:
        raise HTTPException(status_code=500, detail="Failed to save rating")

    # Recalculate average and count
    all_ratings = supabase.table("ratings").select("rating_score").eq("club_id", rating.club_id).execute()
    scores = [r["rating_score"] for r in all_ratings.data]
    new_count = len(scores)
    new_average = sum(scores) / new_count if new_count > 0 else 0.0

    print(f"Updating club {rating.club_id}: avg={new_average}, count={new_count}")

    update_result = supabase.table("clubs").update({
        "average_rating": new_average,
        "number_of_ratings": new_count
    }).eq("club_id", rating.club_id).execute()

    print(f"Update result: {update_result.data}")
    
    return result.data[0]

@router.get("/club/{club_id}")
def get_club_ratings(club_id: int):
    result = supabase.table("ratings").select("*").eq("club_id", club_id).execute()
    return result.data

@router.get("/{rating_id}")
def get_rating(rating_id: int):
    result = supabase.table("ratings").select("*").eq("rating_id", rating_id).execute()
    if not result.data:
        raise HTTPException(status_code=404, detail="Rating not found")
    return result.data[0]
