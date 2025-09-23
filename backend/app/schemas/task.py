from pydantic import BaseModel
from typing import Optional, List
from datetime import datetime

class TaskBase(BaseModel):
    title: str
    description: Optional[str] = "No description provided"
    status: Optional[str] = "To Do"
    priority: Optional[str] = "Medium"
    due_date: Optional[datetime] = None
    

class TaskCreate(TaskBase):
    pass

class TaskUpdate(BaseModel):
    title: Optional[str] = None
    description: Optional[str] = None
    status: Optional[str] = None
    priority: Optional[str] = None
    due_date: Optional[datetime] = None

class TaskOut(TaskBase):
    id: int
    created_at: datetime
    board_id: int

    class Config:
        from_attributes = True

class TaskList(BaseModel):
    tasks: List[TaskOut] = []
    total: int

    class Config:
        from_attributes = True
