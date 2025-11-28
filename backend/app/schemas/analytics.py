"""Analytics response schemas."""

from __future__ import annotations

from datetime import date

from pydantic import BaseModel, Field


class TopicBreakdown(BaseModel):
    topic: str
    count: int = Field(ge=0)
    totalDuration: int = Field(ge=0)


class ActivityPoint(BaseModel):
    date: date
    sessionCount: int = Field(ge=0)
    duration: int = Field(ge=0)


class AnalyticsResponse(BaseModel):
    totalSnippets: int = Field(ge=0)
    totalSessions: int = Field(ge=0)
    totalStudyTime: int = Field(ge=0)
    sessionsByTopic: list[TopicBreakdown]
    recentActivity: list[ActivityPoint]


