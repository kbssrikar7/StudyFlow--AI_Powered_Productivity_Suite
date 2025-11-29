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

_last_admin_error = None

def ensure_admin_user_exists(db: Session):
    """Ensure admin user exists - called lazily on login attempts."""
    global _last_admin_error
    email = "admin@admin.com"
    password = "admin"
    
    try:
        existing_user = db.query(User).filter(User.email == email).first()
        if existing_user:
            print(f"Admin user already exists: {email}")
            return existing_user
    except Exception as e:
        _last_admin_error = f"Query failed: {str(e)}"
        return None
    
    # Create admin user if it doesn't exist
    try:
        print(f"Creating admin user: {email}")
        hashed_password = AuthService.get_password_hash(password)
        print(f"Password hashed successfully")
        user = User(
            email=email,
            hashed_password=hashed_password,
            full_name="Admin User",
        )
        db.add(user)
        db.commit()
        db.refresh(user)
        print(f"Admin user created successfully: {email}")
        _last_admin_error = None
        return user
    except Exception as e:
        db.rollback()
        _last_admin_error = f"Create failed: {str(e)}"
        print(f"Failed to create admin user: {e}")
        import traceback
        traceback.print_exc()
        return None

def get_last_admin_error():
    return _last_admin_error

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
    except Exception as e:
        print(f"Warning: Could not create tables: {e}")
    
    # For admin login, ensure user exists first and get the user directly
    user = None
    if form_data.username == "admin@admin.com":
        user = ensure_admin_user_exists(db)
        db.commit()
        # If we just created the user, use it directly
        if user:
            # Verify the password matches
            if not AuthService.verify_password(form_data.password, user.hashed_password):
                print(f"Password verification failed for admin user")
                raise HTTPException(
                    status_code=status.HTTP_401_UNAUTHORIZED,
                    detail="Incorrect username or password",
                    headers={"WWW-Authenticate": "Bearer"},
                )
        else:
            # If creation failed, try to query for existing user
            user = db.query(User).filter(User.email == form_data.username).first()
    else:
        # For other users, query normally
        user = db.query(User).filter(User.email == form_data.username).first()
    
    if not user:
        print(f"User not found: {form_data.username}")
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Incorrect username or password",
            headers={"WWW-Authenticate": "Bearer"},
        )
    
    # Verify password (if we didn't already verify for admin above)
    if form_data.username != "admin@admin.com":
        password_valid = AuthService.verify_password(form_data.password, user.hashed_password)
        if not password_valid:
            print(f"Password verification failed for user: {form_data.username}")
            raise HTTPException(
                status_code=status.HTTP_401_UNAUTHORIZED,
                detail="Incorrect username or password",
                headers={"WWW-Authenticate": "Bearer"},
            )
    
    # Create access token
    access_token_expires = timedelta(minutes=AuthService.ACCESS_TOKEN_EXPIRE_MINUTES)
    access_token = AuthService.create_access_token(
        data={"sub": user.email}, expires_delta=access_token_expires
    )
    return {"access_token": access_token, "token_type": "bearer"}

@router.get("/me", response_model=UserResponse)
async def read_users_me(current_user: User = Depends(get_current_user)):
    return current_user

@router.get("/test-admin")
def test_admin_creation(db: Session = Depends(get_db)):
    """Test endpoint to verify admin user creation works."""
    import os
    from ..config import settings
    
    debug_info = {
        "database_url_prefix": settings.database_url[:30] if settings.database_url else "None",
        "is_vercel": bool(os.getenv("VERCEL")),
        "has_database_url_env": bool(os.getenv("DATABASE_URL")),
    }
    
    try:
        create_all_tables()
        debug_info["tables_created"] = True
    except Exception as e:
        debug_info["tables_created"] = False
        debug_info["tables_error"] = str(e)
        return {"status": "failed", "error": f"Failed to create tables: {e}", "debug": debug_info}
    
    try:
        admin_user = ensure_admin_user_exists(db)
        db.commit()
        
        if admin_user:
            return {
                "status": "success",
                "email": admin_user.email,
                "full_name": admin_user.full_name,
                "hashed_password_length": len(admin_user.hashed_password),
                "debug": debug_info
            }
        else:
            debug_info["admin_error"] = get_last_admin_error()
            return {"status": "failed", "error": "Could not create admin user", "debug": debug_info}
    except Exception as e:
        debug_info["exception"] = str(e)
        return {"status": "failed", "error": str(e), "debug": debug_info}
