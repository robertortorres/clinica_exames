from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from datetime import timedelta
from app.database import get_db
from app.schemas import LoginSchema, TokenSchema, UsuarioOut
from app.utils.auth import verificar_senha, criar_token, get_usuario_atual
from app.config import settings
import app.models as models

router = APIRouter(prefix="/api/auth", tags=["auth"])


@router.post("/login", response_model=TokenSchema)
def login(dados: LoginSchema, db: Session = Depends(get_db)):
    usuario = db.query(models.Usuario).filter(
        models.Usuario.email == dados.email,
        models.Usuario.ativo == 1
    ).first()

    if not usuario or not verificar_senha(dados.senha, usuario.senha_hash):
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Email ou senha incorretos"
        )

    token = criar_token(
        data={"sub": str(usuario.id)},
        expires_delta=timedelta(minutes=settings.ACCESS_TOKEN_EXPIRE_MINUTES)
    )

    return {
        "access_token": token,
        "token_type": "bearer",
        "usuario": usuario
    }


@router.get("/me", response_model=UsuarioOut)
def me(usuario: models.Usuario = Depends(get_usuario_atual)):
    return usuario
