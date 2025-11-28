from pydantic import BaseModel, Field, field_validator
from datetime import datetime
from typing import Optional

class SessionBase(BaseModel):
    title: str = Field(..., min_length=1, max_length=100)
    description: Optional[str] = Field(None, max_length=500)
    duration: int = Field(..., gt=0, le=14400)  # Max 4 hours in seconds
    
    @field_validator('title')
    @classmethod
    def title_must_not_be_empty(cls, v):
        if not v or not v.strip():
            raise ValueError('Title cannot be empty')
        return v.strip()

class SessionCreate(SessionBase):
    pass

class SessionUpdate(BaseModel):
    title: Optional[str] = Field(None, min_length=1, max_length=100)
    description: Optional[str] = Field(None, max_length=500)
    duration: Optional[int] = Field(None, gt=0, le=14400)
    completed: Optional[bool] = None
    end_time: Optional[datetime] = None
    
    @field_validator('title')
    @classmethod
    def title_must_not_be_empty(cls, v):
        if v is not None and (not v or not v.strip()):
            raise ValueError('Title cannot be empty')
        return v.strip() if v else v

class SessionResponse(SessionBase):
    id: int
    created_at: datetime
    completed: bool
    end_time: Optional[datetime]
    
    class Config:
        from_attributes = True
