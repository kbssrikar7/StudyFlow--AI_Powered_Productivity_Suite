"""Data access helpers for snippets."""

from __future__ import annotations

from typing import Any

from sqlalchemy import Select, func, select
from sqlalchemy.orm import Session

from ..models.snippet import Snippet


class SnippetRepository:
    """Encapsulates snippet database operations."""

    def __init__(self, db: Session) -> None:
        self.db = db

    def create(self, snippet: Snippet) -> Snippet:
        self.db.add(snippet)
        self.db.flush()
        self.db.refresh(snippet)
        return snippet

    def find_all(self, user_id: int) -> list[Snippet]:
        stmt: Select[tuple[Snippet]] = (
            select(Snippet)
            .where(Snippet.user_id == user_id)
            .order_by(Snippet.created_at.desc())
        )
        return list(self.db.scalars(stmt).all())

    def find_by_id(self, snippet_id: int, user_id: int) -> Snippet | None:
        stmt = select(Snippet).where(Snippet.id == snippet_id, Snippet.user_id == user_id)
        return self.db.scalars(stmt).first()

    def update(self, snippet: Snippet, data: dict[str, Any]) -> Snippet:
        for field, value in data.items():
            if value is not None:
                setattr(snippet, field, value)
        self.db.add(snippet)
        self.db.flush()
        self.db.refresh(snippet)
        return snippet

    def delete(self, snippet: Snippet) -> None:
        self.db.delete(snippet)
        self.db.flush()

    def count_all(self, user_id: int) -> int:
        stmt = select(func.count(Snippet.id)).where(Snippet.user_id == user_id)
        return int(self.db.execute(stmt).scalar() or 0)

    def find_by_tag(self, tag: str, user_id: int) -> list[Snippet]:
        pattern = f"%{tag}%"
        stmt = select(Snippet).where(Snippet.tags.ilike(pattern), Snippet.user_id == user_id)
        return list(self.db.scalars(stmt).all())
