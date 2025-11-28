"""Pydantic models for snippet entities."""

from __future__ import annotations

from datetime import datetime

from pydantic import BaseModel, Field


class SnippetBase(BaseModel):
    title: str = Field(min_length=1, max_length=200)
    content: str = Field(min_length=1, max_length=50_000)
    tags: str | None = Field(default="", max_length=500)


class SnippetCreate(SnippetBase):
    pass


class SnippetUpdate(BaseModel):
    title: str | None = Field(default=None, min_length=1, max_length=200)
    content: str | None = Field(default=None, min_length=1, max_length=50_000)
    tags: str | None = Field(default=None, max_length=500)
    last_practiced_at: datetime | None = None
    next_review_at: datetime | None = None
    repetition_level: int | None = None


class SnippetResponse(SnippetBase):
    id: int
    created_at: datetime
    updated_at: datetime
    last_practiced_at: datetime | None
    next_review_at: datetime | None
    repetition_level: int

    model_config = {"from_attributes": True}


