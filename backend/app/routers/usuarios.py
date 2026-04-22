from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from typing import List
from app.database import get_db
from app.schemas import UsuarioCreate, UsuarioUpdate, UsuarioOut
from app.utils.auth import hash_senha, admin_only, get_usuario_atual
import app.models as models

router = APIRouter(prefix="/api/usuarios", tags=["usuarios"])


@router.get("/", response_model=List[UsuarioOut])
def listar(db: Session = Depends(get_db), _=Depends(admin_only)):
    return db.query(models.Usuario).order_by(models.Usuario.nome).all()


@router.post("/", response_model=UsuarioOut, status_code=201)
def criar(dados: UsuarioCreate, db: Session = Depends(get_db), _=Depends(admin_only)):
    existente = db.query(models.Usuario).filter(models.Usuario.email == dados.email).first()
    if existente:
        raise HTTPException(status_code=400, detail="Email já cadastrado")

    usuario = models.Usuario(
        nome=dados.nome,
        email=dados.email,
        senha_hash=hash_senha(dados.senha),
        perfil=dados.perfil,
    )
    db.add(usuario)
    db.commit()
    db.refresh(usuario)
    return usuario


@router.put("/{usuario_id}", response_model=UsuarioOut)
def atualizar(usuario_id: int, dados: UsuarioUpdate, db: Session = Depends(get_db), _=Depends(admin_only)):
    usuario = db.query(models.Usuario).filter(models.Usuario.id == usuario_id).first()
    if not usuario:
        raise HTTPException(status_code=404, detail="Usuário não encontrado")

    if dados.nome:
        usuario.nome = dados.nome
    if dados.perfil:
        usuario.perfil = dados.perfil
    if dados.ativo is not None:
        usuario.ativo = dados.ativo
    if dados.senha:
        usuario.senha_hash = hash_senha(dados.senha)

    db.commit()
    db.refresh(usuario)
    return usuario


@router.delete("/{usuario_id}", status_code=204)
def desativar(usuario_id: int, db: Session = Depends(get_db), atual=Depends(admin_only)):
    if atual.id == usuario_id:
        raise HTTPException(status_code=400, detail="Não é possível desativar seu próprio usuário")
    usuario = db.query(models.Usuario).filter(models.Usuario.id == usuario_id).first()
    if not usuario:
        raise HTTPException(status_code=404, detail="Usuário não encontrado")
    usuario.ativo = 0
    db.commit()
