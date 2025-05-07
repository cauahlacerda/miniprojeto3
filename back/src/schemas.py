from pydantic import BaseModel
from typing import Optional, List
from enum import Enum

class InteractionType(str, Enum):
    like = "like"
    dislike = "dislike"

class UserCreate(BaseModel):
    username: str
    password: str

class UserRead(BaseModel):
    id: int
    username: str

    class Config:
        orm_mode = True

class PostCreate(BaseModel):
    content: str

class PostRead(BaseModel):
    id: int
    content: str
    image_path: Optional[str] = None  
    author: UserRead
    interactions: List["InteractionRead"]

    class Config:
        orm_mode = True
    
class InteractionCreate(BaseModel):
    type: InteractionType

class InteractionRead(BaseModel):
    id: int
    type: InteractionType
    user: UserRead

    class Config:
        orm_mode = True

PostRead.update_forward_refs()
