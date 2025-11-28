"""Business logic for study sessions."""

from __future__ import annotations
from typing import Any

from ..models.session import Session
from ..repositories.session_repository import SessionRepository
from ..schemas.session import SessionCreate, SessionUpdate


class SessionService:
    """Coordinates session validation and repository interactions."""

    def __init__(self, repository: SessionRepository) -> None:
        self.repository = repository

    def create_session(self, data: SessionCreate) -> Session:
        session = Session(**data.model_dump())
        return self.repository.create(session)

    def get_all_sessions(self) -> list[Session]:
        return self.repository.find_all()

    def get_session_by_id(self, session_id: int) -> Session:
        session = self.repository.find_by_id(session_id)
        if session is None:
            raise ValueError("Session not found")
        return session

    def update_session(self, session_id: int, data: SessionUpdate) -> Session:
        session = self.get_session_by_id(session_id)
        update_data = data.model_dump(exclude_unset=True)
        if not update_data:
            return session
        return self.repository.update(session, update_data)

    def delete_session(self, session_id: int) -> None:
        session = self.get_session_by_id(session_id)
        self.repository.delete(session)

    def get_stats(self) -> dict[str, Any]:
        total_duration = self.repository.get_total_duration()
        daily_activity = self.repository.get_daily_activity()
        
        # Calculate streak
        current_streak = 0
        if daily_activity:
            from datetime import datetime, timedelta
            
            today = datetime.now().date()
            sorted_dates = sorted([datetime.strptime(d["date"], "%Y-%m-%d").date() for d in daily_activity], reverse=True)
            
            if sorted_dates:
                # Check if practiced today or yesterday to keep streak alive
                last_practice = sorted_dates[0]
                if last_practice == today or last_practice == today - timedelta(days=1):
                    current_streak = 1
                    previous_date = last_practice
                    
                    for i in range(1, len(sorted_dates)):
                        if sorted_dates[i] == previous_date - timedelta(days=1):
                            current_streak += 1
                            previous_date = sorted_dates[i]
                        else:
                            break
                else:
                    current_streak = 0

        return {
            "total_duration": total_duration,
            "current_streak": current_streak,
            "daily_activity": daily_activity
        }
