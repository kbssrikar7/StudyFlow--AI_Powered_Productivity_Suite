"""
Database configuration and session management.

The backend uses SQLite via SQLAlchemy with a declarative Base and a scoped
session factory. Tables are created automatically on startup so the
application can run without manual migration steps during early iterations.
"""

from __future__ import annotations

from pathlib import Path
from typing import Iterator

from sqlalchemy import create_engine, text
from sqlalchemy import create_engine, event
from sqlalchemy.orm import sessionmaker, declarative_base, Session
from sqlalchemy.pool import StaticPool
from .config import settings


# Configure engine based on database type
print(f"[database] Initializing with database_url: {settings.database_url[:50]}...")

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
    # PostgreSQL configuration (Neon, etc.)
    # Use pool_pre_ping to handle connection drops in serverless
    engine = create_engine(
        settings.database_url,
        pool_pre_ping=True,
        pool_recycle=300,
    )
    print(f"[database] PostgreSQL engine created")

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
    from .models import snippet, session, user, task  # noqa: F401  # pylint: disable=unused-import

    Base.metadata.create_all(bind=engine)


_is_sqlite = settings.database_url.startswith("sqlite")


def add_missing_columns() -> None:
    """Idempotently add new columns to existing tables without Alembic."""
    migrations = [
        # User auth fields
        ("users", "username", "VARCHAR"),
        ("users", "hashed_password", "VARCHAR"),
        ("users", "is_verified", "BOOLEAN DEFAULT FALSE"),
        ("users", "verification_token", "VARCHAR"),
        ("users", "verification_token_expires", "TIMESTAMP WITH TIME ZONE" if not _is_sqlite else "DATETIME"),
        # Data isolation fields
        ("sessions", "user_id", "INTEGER REFERENCES users(id)"),
        ("snippets", "user_id", "INTEGER REFERENCES users(id)"),
        ("tasks", "user_id", "INTEGER REFERENCES users(id)"),
    ]
    with engine.connect() as conn:
        for table, column, col_type in migrations:
            if _is_sqlite:
                try:
                    conn.execute(text(f"ALTER TABLE {table} ADD COLUMN {column} {col_type}"))
                    conn.commit()
                except Exception:
                    pass  # column already exists
            else:
                try:
                    conn.execute(text(f"ALTER TABLE {table} ADD COLUMN IF NOT EXISTS {column} {col_type}"))
                    conn.commit()
                except Exception as e:
                    print(f"[migration] Warning for {table}.{column}: {e}")


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

