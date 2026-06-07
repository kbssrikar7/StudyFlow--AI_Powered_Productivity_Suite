import os
from datetime import timedelta
from fastapi import APIRouter, Depends, HTTPException, status, Response
from sqlalchemy.orm import Session
from google.oauth2 import id_token
from google.auth.transport import requests

from ..database import get_db, create_all_tables
from ..models.user import User
from ..schemas.auth import GoogleAuthRequest, UserResponse
from ..services.auth_service import AuthService
from ..dependencies import get_current_user

router = APIRouter(
    prefix="/auth",
    tags=["auth"],
)

GOOGLE_CLIENT_ID = os.getenv("VITE_GOOGLE_CLIENT_ID", os.getenv("GOOGLE_CLIENT_ID", ""))

@router.post("/google")
def google_auth(request: GoogleAuthRequest, response: Response, db: Session = Depends(get_db)):
    try:
        # Verify Google Token
        idinfo = id_token.verify_oauth2_token(
            request.credential, requests.Request(), GOOGLE_CLIENT_ID
        )

        email = idinfo.get("email")
        google_sub = idinfo.get("sub")
        full_name = idinfo.get("name")
        picture = idinfo.get("picture")

        if not email:
            raise HTTPException(status_code=400, detail="Email not provided by Google")

        try:
            create_all_tables()
        except Exception as e:
            print(f"Warning: Could not create tables: {e}")

        # Check if user exists
        user = db.query(User).filter(User.email == email).first()

        if not user:
            # Create new user
            user = User(
                email=email,
                google_sub=google_sub,
                full_name=full_name,
                picture=picture
            )
            db.add(user)
            db.commit()
            db.refresh(user)
        else:
            # Update existing user's google info if missing
            if not user.google_sub:
                user.google_sub = google_sub
            if not user.picture and picture:
                user.picture = picture
            db.commit()
            db.refresh(user)

        # Create access token
        access_token_expires = timedelta(minutes=AuthService.ACCESS_TOKEN_EXPIRE_MINUTES)
        access_token = AuthService.create_access_token(
            data={"sub": user.email}, expires_delta=access_token_expires
        )

        # Determine if we are in production
        is_prod = os.getenv("VERCEL") or os.getenv("RENDER") or os.getenv("FLY_APP_NAME")

        # Set HttpOnly Cookie
        response.set_cookie(
            key="access_token",
            value=access_token,
            httponly=True,
            secure=bool(is_prod),
            samesite="lax",
            max_age=AuthService.ACCESS_TOKEN_EXPIRE_MINUTES * 60
        )

        return {"status": "success", "user": user}

    except ValueError as e:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail=f"Invalid token: {str(e)}",
            headers={"WWW-Authenticate": "Bearer"},
        )

@router.post("/logout")
def logout(response: Response):
    response.delete_cookie(
        key="access_token",
        httponly=True,
        samesite="lax"
    )
    return {"status": "success"}

@router.get("/me", response_model=UserResponse)
async def read_users_me(current_user: User = Depends(get_current_user)):
    return current_user
