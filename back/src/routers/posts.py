from fastapi import APIRouter, Depends, HTTPException, status, UploadFile, File, Form
from sqlalchemy.orm import Session
from typing import List, Optional
import os
import shutil

from .. import models, schemas, database, auth


router = APIRouter(prefix="/posts", tags=["posts"])

@router.post("/", response_model=schemas.PostRead)
async def create_post(
    content: str = Form(...),
    image: Optional[UploadFile] = File(None),
    db: Session = Depends(database.get_session),
    current_user: models.User = Depends(auth.get_current_user)
):
    image_path = None
    if image:
        ext = os.path.splitext(image.filename)[1].lower()
        if ext not in [".jpg", ".jpeg", ".png", ".gif"]:
            raise HTTPException(status_code=400, detail="Formato de imagem não suportado.")

        images_dir = "src/static/images"
        os.makedirs(images_dir, exist_ok=True)

        image_filename = f"{current_user.id}_{image.filename}"
        image_path = f"static/images/{image_filename}"

        with open(os.path.join("src", image_path), "wb") as buffer:
            shutil.copyfileobj(image.file, buffer)

    post = models.Post(content=content, author_id=current_user.id, image_path=image_path)
    db.add(post)
    db.commit()
    db.refresh(post)
    return post


@router.get("/", response_model=List[schemas.PostRead])
def list_posts(db: Session = Depends(database.get_session)):
    posts = db.query(models.Post).all()
    return posts

@router.put("/{post_id}", response_model=schemas.PostRead)
async def update_post(
    post_id: int,
    content: str = Form(...),
    image: UploadFile = File(None),
    db: Session = Depends(database.get_session),
    current_user: models.User = Depends(auth.get_current_user)
):
    post = db.query(models.Post).filter(models.Post.id == post_id).first()
    if not post:
        raise HTTPException(status_code=404, detail="Postagem não encontrada")
    if post.author_id != current_user.id:
        raise HTTPException(status_code=403, detail="Você não pode editar esta postagem")

    post.content = content

    if image:
        ext = os.path.splitext(image.filename)[1].lower()
        if ext not in [".jpg", ".jpeg", ".png", ".gif"]:
            raise HTTPException(status_code=400, detail="Formato de imagem não suportado.")

        images_dir = "src/static/images"
        os.makedirs(images_dir, exist_ok=True)

        image_filename = f"{current_user.id}_{image.filename}"
        image_path = f"static/images/{image_filename}"

        with open(os.path.join("src", image_path), "wb") as buffer:
            shutil.copyfileobj(image.file, buffer)

        post.image_path = image_path

    db.commit()
    db.refresh(post)
    return post

@router.delete("/{post_id}", status_code=status.HTTP_204_NO_CONTENT)
def delete_post(post_id: int, db: Session = Depends(database.get_session), current_user: models.User = Depends(auth.get_current_user)):
    post = db.query(models.Post).filter(models.Post.id == post_id).first()
    if not post:
        raise HTTPException(status_code=404, detail="Postagem não encontrada")
    if post.author_id != current_user.id:
        raise HTTPException(status_code=403, detail="Você não pode deletar esta postagem")
    db.delete(post)
    db.commit()
    return
