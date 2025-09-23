from pydantic import BaseModel                            
from datetime import datetime
from typing import List 
from .task import TaskOut    



class BoardBase(BaseModel):
    title : str
    description : str
    
class BoardCreate(BoardBase):
    pass

class BoardUpdate(BoardBase):
    pass
class BoardOut(BoardBase):
    id : int
    created_at : datetime
    owner_id :int
    tasks : List[TaskOut] = []

    class Config:
        from_attributes = True
        

