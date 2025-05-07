from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session

from .. import models, schemas, database, auth

router = APIRouter(prefix="/interactions", tags=["interactions"])

@router.post("/posts/{post_id}", response_model=schemas.InteractionRead)
def create_or_update_interaction(post_id: int, interaction_create: schemas.InteractionCreate, db: Session = Depends(database.get_session), current_user: models.User = Depends(auth.get_current_user)):
    post = db.query(models.Post).filter(models.Post.id == post_id).first()
    if not post:
        raise HTTPException(status_code=404, detail="Postagem não encontrada")
    if post.author_id == current_user.id:
        raise HTTPException(status_code=400, detail="Você não pode interagir com sua própria postagem")

    # Verifica se já existe interação do usuário nessa postagem
    interaction = db.query(models.Interaction).filter(
        models.Interaction.post_id == post_id,
        models.Interaction.user_id == current_user.id
    ).first()

    if interaction:
        # Atualiza a interação
        interaction.type = interaction_create.type
    else:
        # Cria nova interação
        interaction = models.Interaction(
            type=interaction_create.type,
            post_id=post_id,
            user_id=current_user.id
        )
        db.add(interaction)

    db.commit()
    db.refresh(interaction)
    return interaction
    