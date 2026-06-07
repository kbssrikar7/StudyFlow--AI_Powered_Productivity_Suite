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


@app.on_event("startup")
def on_startup():
    # Ensure database schema exists
    create_all_tables()

# Configure CORS
import os
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
