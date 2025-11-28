import os
from pathlib import Path
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from fastapi.staticfiles import StaticFiles

from .config import settings
from .database import create_all_tables, SessionLocal
from .models.user import User
from .routers import sessions, snippets, tasks, analytics, ai, auth
from .services.auth_service import AuthService


app = FastAPI(title="Code & Study Dashboard")


def ensure_default_admin() -> None:
    """
    Ensure there is at least one admin-like user in the system.

    This is primarily to make fresh deployments usable out-of-the-box where
    no registration has taken place yet (e.g. serverless / demo deployments).
    The credentials are intentionally simple and should be changed or the user
    deleted in real production environments.
    """
    db = SessionLocal()
    try:
        email = "admin@admin.com"
        password = "admin"

        existing_user = db.query(User).filter(User.email == email).first()
        if existing_user:
            return

        hashed_password = AuthService.get_password_hash(password)
        user = User(
            email=email,
            hashed_password=hashed_password,
            full_name="Admin User",
        )
        db.add(user)
        db.commit()
        print(f"[startup] Created default admin user: {email} / {password}")
    except Exception as exc:  # pragma: no cover - best-effort startup hook
        print(f"[startup] Failed to create default admin user: {exc}")
    finally:
        db.close()


@app.on_event("startup")
def on_startup():
    # Ensure database schema exists
    create_all_tables()
    # Ensure there is at least one user so login works on fresh deployments
    ensure_default_admin()

# Configure CORS - allow all origins in production (Vercel/Render/Fly.io)
import os
if os.getenv("VERCEL") or os.getenv("VERCEL_ENV") or os.getenv("RENDER") or os.getenv("FLY_APP_NAME"):
    app.add_middleware(
        CORSMiddleware,
        allow_origins=["*"],
        allow_credentials=False,  # Must be False when allow_origins=["*"]
        allow_methods=["*"],
        allow_headers=["*"],
    )
else:
    app.add_middleware(
        CORSMiddleware,
        allow_origins=settings.cors_origins,
        allow_credentials=True,
        allow_methods=["*"],
        allow_headers=["*"],
    )

app.include_router(sessions.router, prefix="/api/sessions", tags=["sessions"])
app.include_router(snippets.router, prefix="/api/snippets", tags=["snippets"])
app.include_router(tasks.router, prefix="/api/tasks", tags=["tasks"])
app.include_router(analytics.router, prefix="/api/analytics", tags=["analytics"])
app.include_router(ai.router, prefix="/api/ai", tags=["ai"])
app.include_router(auth.router, prefix="/api")

@app.get("/api")
def read_root():
    return {"message": "Welcome to Code & Study Dashboard API"}

@app.get("/api/health")
async def health_check():
    return {"status": "healthy"}

# Serve static frontend files in production (Replit deployment)
frontend_dist = Path(__file__).parent.parent.parent / "frontend" / "dist"
if frontend_dist.exists() and os.getenv("REPL_ID"):
    app.mount("/", StaticFiles(directory=str(frontend_dist), html=True), name="static")
