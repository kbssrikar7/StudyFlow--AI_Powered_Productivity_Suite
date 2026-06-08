"""Analytics response schemas."""

from __future__ import annotations

from datetime import date

from pydantic import BaseModel, Field


class TopicBreakdown(BaseModel):
    topic: str
    count: int = Field(ge=0)
    total_duration: int = Field(ge=0)


class ActivityPoint(BaseModel):
    date: date
    session_count: int = Field(ge=0)
    duration: int = Field(ge=0)


class AnalyticsResponse(BaseModel):
    total_snippets: int = Field(ge=0)
    total_sessions: int = Field(ge=0)
    total_study_time: int = Field(ge=0)
    sessions_by_topic: list[TopicBreakdown]
    recent_activity: list[ActivityPoint]
