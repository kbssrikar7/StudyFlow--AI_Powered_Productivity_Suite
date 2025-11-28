"""
Database configuration and session management.

The backend uses SQLite via SQLAlchemy with a declarative Base and a scoped
session factory. Tables are created automatically on startup so the
application can run without manual migration steps during early iterations.
"""

from __future__ import annotations

from pathlib import Path
from typing import Iterator

from sqlalchemy import create_engine
from sqlalchemy import create_engine, event
from sqlalchemy.orm import sessionmaker, declarative_base, Session
from sqlalchemy.pool import StaticPool
from .config import settings


# Configure engine based on database type
if settings.database_url.startswith("sqlite"):
    engine = create_engine(
        settings.database_url,
        connect_args={"check_same_thread": False},
        poolclass=StaticPool,
    )
    # Enable foreign keys for SQLite
    @event.listens_for(engine, "connect")
    def set_sqlite_pragma(dbapi_conn, connection_record):
        cursor = dbapi_conn.cursor()
        cursor.execute("PRAGMA foreign_keys=ON")
        cursor.close()
else:
    # PostgreSQL configuration
    engine = create_engine(settings.database_url)

SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)

Base = declarative_base()


def create_all_tables() -> None:
    """Create database tables if they do not exist."""
    # Ensure database directory exists for SQLite
    if settings.database_url.startswith("sqlite:///"):
        path_str = settings.database_url.replace("sqlite:///", "")
        # Handle potential relative path starting with ./
        if path_str.startswith("./"):
            path_str = path_str[2:]
            
        path = Path(path_str)
        # Create parent directory if it doesn't exist
        try:
            path.parent.mkdir(parents=True, exist_ok=True)
        except Exception as e:
            print(f"Warning: Could not create database directory: {e}")

    # Import models inside the function to avoid circular dependencies.
    from .models import snippet, session, user  # noqa: F401  # pylint: disable=unused-import

    Base.metadata.create_all(bind=engine)


def get_db() -> Iterator[Session]:
    """
    Provide a transactional database session.

    Usage (FastAPI dependency):
    ```
    def route(db: Session = Depends(get_db)):
        ...
    ```
    """

    db: Session = SessionLocal()
    try:
        yield db
        db.commit()
    except Exception:
        db.rollback()
        raise
    finally:
        db.close()

