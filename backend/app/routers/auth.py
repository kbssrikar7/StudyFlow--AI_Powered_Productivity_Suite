import os
import secrets
import httpx
from datetime import datetime, timedelta, timezone
from fastapi import APIRouter, Depends, HTTPException, Request, status, Response
from fastapi.responses import RedirectResponse
from sqlalchemy.orm import Session
from ..database import get_db, create_all_tables
from ..models.user import User
from ..schemas.auth import GoogleAuthRequest, LoginRequest, RegisterRequest, UserResponse
from ..services.auth_service import AuthService
from ..dependencies import get_current_user
from ..utils.password import hash_password, verify_password
from ..utils.email import send_verification_email

router = APIRouter(prefix="/auth", tags=["auth"])

GOOGLE_CLIENT_ID = os.getenv("GOOGLE_CLIENT_ID", os.getenv("VITE_GOOGLE_CLIENT_ID", ""))
FRONTEND_URL = os.getenv("FRONTEND_URL", "https://studyflow-app-kbssrikar7s-projects.vercel.app")


def _set_auth_cookie(response: Response, user_email: str):
    access_token_expires = timedelta(minutes=AuthService.ACCESS_TOKEN_EXPIRE_MINUTES)
    access_token = AuthService.create_access_token(
        data={"sub": user_email}, expires_delta=access_token_expires
    )
    is_prod = os.getenv("VERCEL") or os.getenv("RENDER") or os.getenv("RAILWAY_ENVIRONMENT")
    response.set_cookie(
        key="access_token",
        value=access_token,
        httponly=True,
        secure=bool(is_prod),
        samesite="lax",
        max_age=AuthService.ACCESS_TOKEN_EXPIRE_MINUTES * 60,
    )
    return access_token


def _upsert_user(db: Session, email: str, google_sub: str, full_name: str, picture: str):
    try:
        create_all_tables()
    except Exception as e:
        print(f"Warning: Could not create tables: {e}")

    user = db.query(User).filter(User.email == email).first()
    if not user:
        user = User(email=email, google_sub=google_sub, full_name=full_name, picture=picture, is_verified=True)
        db.add(user)
        db.commit()
        db.refresh(user)
    else:
        if not user.google_sub:
            user.google_sub = google_sub
        if not user.picture and picture:
            user.picture = picture
        if not user.full_name and full_name:
            user.full_name = full_name
        # Google-authenticated users are always considered verified
        if not user.is_verified:
            user.is_verified = True
        db.commit()
        db.refresh(user)
    return user


@router.post("/google")
async def google_auth(request: GoogleAuthRequest, response: Response, db: Session = Depends(get_db)):
    if request.credential:
        try:
            from google.oauth2 import id_token
            from google.auth.transport import requests as grequests
            idinfo = id_token.verify_oauth2_token(
                request.credential, grequests.Request(), GOOGLE_CLIENT_ID
            )
            email = idinfo.get("email")
            google_sub = idinfo.get("sub")
            full_name = idinfo.get("name")
            picture = idinfo.get("picture")
        except ValueError as e:
            raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail=f"Invalid Google token: {str(e)}")

    elif request.access_token:
        async with httpx.AsyncClient() as client:
            resp = await client.get(
                "https://www.googleapis.com/oauth2/v3/userinfo",
                headers={"Authorization": f"Bearer {request.access_token}"}
            )
        if resp.status_code != 200:
            raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail="Invalid Google access token")
        info = resp.json()
        email = info.get("email")
        google_sub = info.get("sub")
        full_name = info.get("name")
        picture = info.get("picture")

    else:
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="No Google credential provided")

    if not email:
        raise HTTPException(status_code=400, detail="Email not provided by Google")

    user = _upsert_user(db, email, google_sub, full_name, picture)
    _set_auth_cookie(response, user.email)

    return {"status": "success", "user": UserResponse.model_validate(user)}


@router.post("/register")
async def register(request: Request, payload: RegisterRequest, db: Session = Depends(get_db)):
    # Check for duplicate email or username
    if db.query(User).filter(User.email == payload.email).first():
        raise HTTPException(status_code=status.HTTP_409_CONFLICT, detail="Email already registered")
    if db.query(User).filter(User.username == payload.username).first():
        raise HTTPException(status_code=status.HTTP_409_CONFLICT, detail="Username already taken")

    token = secrets.token_urlsafe(32)
    expires = datetime.now(timezone.utc) + timedelta(hours=24)

    user = User(
        email=payload.email,
        username=payload.username,
        hashed_password=hash_password(payload.password),
        is_verified=False,
        verification_token=token,
        verification_token_expires=expires,
    )
    db.add(user)
    db.commit()

    base_url = str(request.base_url).rstrip("/")
    await send_verification_email(payload.email, token, base_url)

    return {"message": "Account created! Check your email for a verification link.", "email": payload.email}


@router.get("/verify-email")
async def verify_email(token: str, response: Response, db: Session = Depends(get_db)):
    user = db.query(User).filter(User.verification_token == token).first()
    if not user:
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="Invalid verification token")

    now = datetime.now(timezone.utc)
    expires = user.verification_token_expires
    if expires and expires.tzinfo is None:
        expires = expires.replace(tzinfo=timezone.utc)
    if not expires or now > expires:
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="Verification token has expired")

    user.is_verified = True
    user.verification_token = None
    user.verification_token_expires = None
    db.commit()

    _set_auth_cookie(response, user.email)
    return RedirectResponse(url=f"{FRONTEND_URL}/login?verified=1", status_code=302)


@router.post("/login")
async def email_login(payload: LoginRequest, response: Response, db: Session = Depends(get_db)):
    user = db.query(User).filter(User.email == payload.email).first()
    if not user or not user.hashed_password or not verify_password(payload.password, user.hashed_password):
        raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail="Invalid email or password")
    if not user.is_verified:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Please verify your email before logging in"
        )

    _set_auth_cookie(response, user.email)
    return {"status": "success", "user": UserResponse.model_validate(user)}


@router.post("/logout")
def logout(response: Response):
    response.delete_cookie(key="access_token", httponly=True, samesite="lax")
    return {"status": "success"}


@router.get("/me", response_model=UserResponse)
async def read_users_me(current_user: User = Depends(get_current_user)):
    return current_user
