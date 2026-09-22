from pydantic import BaseModel
from typing import Optional
from datetime import datetime

class RatingBase(BaseModel):
    club_id: int
    user_id: int
    rating_score: int  # 1-10
    review_text: Optional[str] = None

class RatingCreate(RatingBase):
    pass

class Rating(RatingBase):
    rating_id: int
    created_at: datetime
    updated_at: datetime
    
    class Config:
        from_attributes = True
        
class RatingResponse(BaseModel):
    rating_id: int
    club_id: int
    user_id: int
    rating_score: int
    review_text: Optional[str]
    created_at: datetime
    updated_at: datetime
