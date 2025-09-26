# schemas/task.py - Updated schemas
from pydantic import BaseModel, Field
from datetime import datetime
from typing import Optional

class TaskBase(BaseModel):
    title: str = Field(..., min_length=1, max_length=255)
    description: Optional[str] = Field(default="", max_length=1000)
    status: str = Field(default="To Do", regex="^(To Do|In Progress|Done)$")
    priority: Optional[str] = Field(default="Medium", regex="^(High|Medium|Low)?$")
    due_date: Optional[datetime] = None

class TaskCreate(TaskBase):
    pass

class TaskUpdate(BaseModel):
    title: Optional[str] = Field(None, min_length=1, max_length=255)
    description: Optional[str] = Field(None, max_length=1000)
    status: Optional[str] = Field(None, regex="^(To Do|In Progress|Done)$")
    priority: Optional[str] = Field(None, regex="^(High|Medium|Low)?$")
    due_date: Optional[datetime] = None

class TaskOut(TaskBase):
    id: int
    board_id: int
    created_at: datetime
    
    class Config:
        from_attributes = True