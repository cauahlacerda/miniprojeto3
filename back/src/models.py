from sqlmodel import SQLModel, Field, Relationship
from typing import Optional, List
from enum import Enum

class InteractionType(str, Enum):
    like = "like"
    dislike = "dislike"

class User(SQLModel, table=True):
    id: Optional[int] = Field(default=None, primary_key=True)
    username: str = Field(index=True, unique=True)
    password_hash: str

    posts: List["Post"] = Relationship(back_populates="author")
    interactions: List["Interaction"] = Relationship(back_populates="user")

class Post(SQLModel, table=True):
    id: Optional[int] = Field(default=None, primary_key=True)
    content: str
    image_path: Optional[str] = Field(default=None, nullable=True)  
    author_id: int = Field(foreign_key="user.id")

    author: Optional[User] = Relationship(back_populates="posts")
    interactions: List["Interaction"] = Relationship(back_populates="post")

class Interaction(SQLModel, table=True):
    id: Optional[int] = Field(default=None, primary_key=True)
    type: InteractionType
    user_id: int = Field(foreign_key="user.id")
    post_id: int = Field(foreign_key="post.id")

    user: Optional[User] = Relationship(back_populates="interactions")
    post: Optional[Post] = Relationship(back_populates="interactions")
