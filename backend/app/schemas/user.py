from pydantic import BaseModel
from datetime import datetime 
from pydantic import EmailStr
from typing import Optional 


class UserBase(BaseModel):
    name: str
    email: EmailStr

class UserCreate(UserBase):
    password: str
    class Config:
        from_attributes = True

class UserOut(UserBase):
    id: int
    created_at: datetime

    class Config:
        from_attributes = True

class UserLogin(BaseModel):
    email :EmailStr
    password :str

    class Config:
        from_attributes = True


class Token(BaseModel):
    access_token :str
    token_type :str

class TokenData(BaseModel):
    id :Optional[str] = None            