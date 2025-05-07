from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from fastapi.security import OAuth2PasswordRequestForm
from datetime import timedelta

from .. import models, schemas, database, auth

router = APIRouter(prefix="/users", tags=["users"])

@router.post("/register", response_model=schemas.UserRead)
def register(user_create: schemas.UserCreate, db: Session = Depends(database.get_session)):
    user = db.query(models.User).filter(models.User.username == user_create.username).first()
    if user:
        raise HTTPException(status_code=400, detail="Nome de usuário já existe")
    user_obj = models.User(
        username=user_create.username,
        password_hash=auth.get_password_hash(user_create.password)
    )
    db.add(user_obj)
    db.commit()
    db.refresh(user_obj)
    return user_obj

@router.post("/token")
def login(form_data: OAuth2PasswordRequestForm = Depends(), db: Session = Depends(database.get_session)):
    user = auth.authenticate_user(db, form_data.username, form_data.password)
    if not user:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Usuário ou senha incorretos",
            headers={"WWW-Authenticate": "Bearer"},
        )
    access_token_expires = timedelta(minutes=auth.ACCESS_TOKEN_EXPIRE_MINUTES)
    access_token = auth.create_access_token(
        data={"sub": user.username}, expires_delta=access_token_expires
    )
    return {"access_token": access_token, "token_type": "bearer"}
