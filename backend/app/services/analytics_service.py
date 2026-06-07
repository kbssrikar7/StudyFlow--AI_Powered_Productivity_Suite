"""Analytics aggregation service."""

from __future__ import annotations

from collections import defaultdict
from datetime import date, datetime
from typing import Any

from ..repositories.session_repository import SessionRepository
from ..repositories.snippet_repository import SnippetRepository


class AnalyticsService:
    """Computes dashboard statistics from repositories."""

    def __init__(self, snippet_repo: SnippetRepository, session_repo: SessionRepository) -> None:
        self.snippet_repo = snippet_repo
        self.session_repo = session_repo

    def get_dashboard_stats(self) -> dict[str, Any]:
        sessions = self.session_repo.find_all()
        total_snippets = self.snippet_repo.count_all()
        total_sessions = len(sessions)
        total_study_time = sum(session.duration for session in sessions)
        recent_activity = self._build_recent_activity(sessions)
        return {
            "total_snippets": total_snippets,
            "total_sessions": total_sessions,
            "total_study_time": total_study_time,
            "sessions_by_topic": [],
            "recent_activity": recent_activity,
        }

    def _build_recent_activity(self, sessions) -> list[dict[str, Any]]:
        activity = defaultdict(lambda: {"session_count": 0, "duration": 0})
        for session in sessions:
            # Use created_at instead of date, and ensure it's a date object
            if hasattr(session, 'created_at') and session.created_at:
                activity_date = session.created_at.date()
            elif hasattr(session, 'date'): # Fallback if date exists (unlikely based on model)
                 activity_date = self._parse_date(session.date)
            else:
                continue

            activity[activity_date]["session_count"] += 1
            activity[activity_date]["duration"] += session.duration
        return [
            {"date": activity_date, **metrics}
            for activity_date, metrics in sorted(activity.items(), reverse=True)
        ]

    @staticmethod
    def _parse_date(date_str: str) -> date:
        try:
            return datetime.fromisoformat(date_str).date()
        except ValueError:
            # Fallback to today's date if parsing fails.
            return date.today()


