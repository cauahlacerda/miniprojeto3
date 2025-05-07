from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from fastapi.staticfiles import StaticFiles
import os

from .database import create_db_and_tables
from .routers import users, posts, interactions

app = FastAPI()

app.add_middleware(
    CORSMiddleware,
    allow_origins=[
        "http://localhost:3000"
    ],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

os.makedirs("src/static/images", exist_ok=True)

app.mount("/static", StaticFiles(directory="src/static"), name="static")

app.include_router(users.router)
app.include_router(posts.router)
app.include_router(interactions.router)

@app.on_event("startup")
def on_startup():
    create_db_and_tables()
