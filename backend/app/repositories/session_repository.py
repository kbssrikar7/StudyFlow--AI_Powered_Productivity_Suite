"""Data access helpers for study sessions."""

from __future__ import annotations

from typing import Any

from sqlalchemy import Select, func, select
from sqlalchemy.orm import Session

from ..models.session import Session as SessionModel


class SessionRepository:
    """Encapsulates database operations for study sessions."""

    def __init__(self, db: Session) -> None:
        self.db = db

    def create(self, session: SessionModel) -> SessionModel:
        self.db.add(session)
        self.db.flush()
        self.db.refresh(session)
        return session

    def find_all(self) -> list[SessionModel]:
        stmt: Select[tuple[SessionModel]] = select(SessionModel).order_by(SessionModel.created_at.desc())
        return list(self.db.scalars(stmt).all())

    def find_by_id(self, session_id: int) -> SessionModel | None:
        stmt = select(SessionModel).where(SessionModel.id == session_id)
        return self.db.scalars(stmt).first()

    def update(self, session: SessionModel, data: dict[str, Any]) -> SessionModel:
        for field, value in data.items():
            if value is not None:
                setattr(session, field, value)
        self.db.add(session)
        self.db.flush()
        self.db.refresh(session)
        return session

    def delete(self, session: SessionModel) -> None:
        self.db.delete(session)
        self.db.flush()

    def count_all(self) -> int:
        stmt = select(func.count(SessionModel.id))
        return int(self.db.execute(stmt).scalar() or 0)

    def get_total_duration(self) -> int:
        stmt = select(func.coalesce(func.sum(SessionModel.duration), 0))
        return int(self.db.execute(stmt).scalar() or 0)

    def get_daily_activity(self) -> list[dict[str, Any]]:
        stmt = (
            select(
                func.date(SessionModel.created_at).label("date"),
                func.count(SessionModel.id).label("count"),
                func.sum(SessionModel.duration).label("totalDuration"),
            )
            .group_by(func.date(SessionModel.created_at))
            .order_by(func.date(SessionModel.created_at).asc())
        )
        results = self.db.execute(stmt).all()
        return [
            {"date": row.date, "count": int(row.count), "totalDuration": int(row.totalDuration)}
            for row in results
        ]


