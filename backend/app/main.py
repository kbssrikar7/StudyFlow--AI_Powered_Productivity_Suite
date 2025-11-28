from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from .config import settings
from .database import create_all_tables
from .routers import sessions, snippets, tasks, analytics, ai, auth

app = FastAPI(title="Code & Study Dashboard")

@app.on_event("startup")
def on_startup():
    create_all_tables()

app.add_middleware(
    CORSMiddleware,
    allow_origins=settings.cors_origins,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(sessions.router, prefix="/sessions", tags=["sessions"])
app.include_router(snippets.router, prefix="/snippets", tags=["snippets"])
app.include_router(tasks.router, prefix="/tasks", tags=["tasks"])
app.include_router(analytics.router, prefix="/analytics", tags=["analytics"])
app.include_router(ai.router, prefix="/ai", tags=["ai"])
app.include_router(auth.router)

@app.get("/")
def read_root():
    return {"message": "Welcome to Code & Study Dashboard API"}

@app.get("/health")
async def health_check():
    return {"status": "healthy"}
