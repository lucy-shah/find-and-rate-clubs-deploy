from fastapi import APIRouter, HTTPException, Query
from app.supabase_client import supabase

router = APIRouter(prefix="/api/clubs", tags=["clubs"])


@router.get("/")
def get_all_clubs():
    """Get all clubs from Supabase"""
    response = supabase.table("clubs").select("*").execute()
    return response.data


@router.get("/search")
def search_clubs(q: str = Query(..., min_length=1)):
    """Search clubs by name, org_type, or mission"""
    response = (
        supabase.table("clubs")
        .select("*")
        .or_(f"name.ilike.%{q}%,org_type.ilike.%{q}%,mission.ilike.%{q}%")
        .execute()
    )
    return response.data


@router.get("/{club_id}")
def get_club(club_id: int):
    """Get a specific club by ID"""
    response = (
        supabase.table("clubs")
        .select("*")
        .eq("club_id", club_id)
        .execute()
    )
    if not response.data:
        raise HTTPException(status_code=404, detail="Club not found")
    return response.data[0]