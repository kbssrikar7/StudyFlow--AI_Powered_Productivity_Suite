from datetime import timedelta
from fastapi import APIRouter, Depends, HTTPException, status
from fastapi.security import OAuth2PasswordRequestForm
from sqlalchemy.orm import Session
from ..database import get_db, create_all_tables
from ..models.user import User
from ..schemas.auth import Token, UserCreate, UserResponse
from ..services.auth_service import AuthService
from ..dependencies import get_current_user

router = APIRouter(
    prefix="/auth",
    tags=["auth"],
)

def ensure_admin_user_exists(db: Session):
    """Ensure admin user exists - called lazily on login attempts."""
    email = "admin@admin.com"
    password = "admin"
    
    existing_user = db.query(User).filter(User.email == email).first()
    if existing_user:
        return existing_user
    
    # Create admin user if it doesn't exist
    try:
        hashed_password = AuthService.get_password_hash(password)
        user = User(
            email=email,
            hashed_password=hashed_password,
            full_name="Admin User",
        )
        db.add(user)
        db.commit()
        db.refresh(user)
        return user
    except Exception as e:
        db.rollback()
        print(f"Failed to create admin user: {e}")
        return None

@router.post("/register", response_model=UserResponse, status_code=status.HTTP_201_CREATED)
def register(user: UserCreate, db: Session = Depends(get_db)):
    # Ensure tables exist
    try:
        create_all_tables()
    except:
        pass
    
    db_user = db.query(User).filter(User.email == user.email).first()
    if db_user:
        raise HTTPException(status_code=400, detail="Email already registered")
    
    hashed_password = AuthService.get_password_hash(user.password)
    new_user = User(email=user.email, hashed_password=hashed_password, full_name=user.full_name)
    db.add(new_user)
    db.commit()
    db.refresh(new_user)
    return new_user

@router.post("/login", response_model=Token)
def login_for_access_token(form_data: OAuth2PasswordRequestForm = Depends(), db: Session = Depends(get_db)):
    # Ensure tables exist (important for serverless)
    try:
        create_all_tables()
    except:
        pass
    
    # Ensure admin user exists (lazy creation for serverless)
    ensure_admin_user_exists(db)
    
    user = db.query(User).filter(User.email == form_data.username).first()
    if not user or not AuthService.verify_password(form_data.password, user.hashed_password):
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Incorrect username or password",
            headers={"WWW-Authenticate": "Bearer"},
        )
    
    access_token_expires = timedelta(minutes=AuthService.ACCESS_TOKEN_EXPIRE_MINUTES)
    access_token = AuthService.create_access_token(
        data={"sub": user.email}, expires_delta=access_token_expires
    )
    return {"access_token": access_token, "token_type": "bearer"}

@router.get("/me", response_model=UserResponse)
async def read_users_me(current_user: User = Depends(get_current_user)):
    return current_user
