from fastapi import APIRouter, Depends, HTTPException, status
from pydantic import BaseModel
from sqlalchemy.orm import Session
from app.database import get_db, UserDB
from app.models import UserCreate, UserResponse
import hashlib

router = APIRouter(prefix="/api/auth", tags=["auth"])

def hash_password(password: str) -> str:
    """Simple password hashing - use bcrypt in production"""
    return hashlib.sha256(password.encode()).hexdigest()

def validate_password_strength(password: str) -> bool:
    import re
    # At least one uppercase, one lowercase, one digit, one symbol, and at least 10 characters
    pattern = r'^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[^A-Za-z0-9]).{10,}$'
    return re.match(pattern, password) is not None

@router.post("/register", response_model=UserResponse)
def register_user(user: UserCreate, db: Session = Depends(get_db)) -> UserResponse:
    """Register a new user"""
    
    # Check if user already exists
    existing_user = db.query(UserDB).filter(
        (UserDB.email == user.email) | (UserDB.username == user.username)
    ).first()
    
    if existing_user:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="User already exists"
        )
    
    # Validate password strength
    if not validate_password_strength(user.password):
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Password must be at least 10 characters long, include at least one uppercase letter, one lowercase letter, one digit, and one symbol."
        )
    # Create new user
    db_user = UserDB(
        email=user.email,
        username=user.username,
        password=hash_password(user.password),
        is_northeastern_student=user.is_northeastern_student
    )
    db.add(db_user)
    db.commit()
    db.refresh(db_user)
    
    return db_user


# Pydantic model for login request
class LoginRequest(BaseModel):
    username: str
    password: str

from fastapi import Body, Query

@router.post("/login")
def login_user(
    request: LoginRequest = Body(None),
    username: str = Query(None),
    password: str = Query(None),
    db: Session = Depends(get_db)
) -> dict:
    """Login user - returns user data and session token. Accepts JSON body or query params."""
    # Prefer JSON body if provided
    if request and request.username and request.password:
        username = request.username
        password = request.password
    if not username or not password:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Username and password required."
        )
    user = db.query(UserDB).filter(UserDB.username == username).first()
    if not user or user.password != hash_password(password):
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid credentials"
        )
    return {
        "user_id": user.user_id,
        "username": user.username,
        "email": user.email,
        "is_northeastern_student": user.is_northeastern_student,
        "token": f"token_{user.user_id}"  # Placeholder - use JWT in production
    }

@router.get("/user/{user_id}", response_model=UserResponse)
def get_user(user_id: int, db: Session = Depends(get_db)) -> UserResponse:
    """Get user info by ID"""
    user = db.query(UserDB).filter(UserDB.user_id == user_id).first()
    if not user:
        raise HTTPException(status_code=404, detail="User not found")
    return user
