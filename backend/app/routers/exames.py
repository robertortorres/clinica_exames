from fastapi import APIRouter, Depends, HTTPException, UploadFile, File, Form
from fastapi.responses import FileResponse
from sqlalchemy.orm import Session
from typing import List, Optional
from datetime import date
import os
from app.database import get_db
from app.schemas import ExameOut, TipoExameCreate, TipoExameOut
from app.utils.auth import get_usuario_atual, admin_ou_enfermagem, admin_only
from app.utils.files import salvar_arquivo, deletar_arquivo
from app.config import settings
import app.models as models

router = APIRouter(tags=["exames"])


# ── Tipos de Exame ─────────────────────────────────────────
@router.get("/api/tipos-exame", response_model=List[TipoExameOut])
def listar_tipos(db: Session = Depends(get_db), _=Depends(get_usuario_atual)):
    return db.query(models.TipoExame).order_by(models.TipoExame.nome).all()


@router.post("/api/tipos-exame", response_model=TipoExameOut, status_code=201)
def criar_tipo(dados: TipoExameCreate, db: Session = Depends(get_db), _=Depends(admin_only)):
    existente = db.query(models.TipoExame).filter(models.TipoExame.nome == dados.nome).first()
    if existente:
        raise HTTPException(status_code=400, detail="Tipo de exame já cadastrado")
    tipo = models.TipoExame(**dados.model_dump())
    db.add(tipo)
    db.commit()
    db.refresh(tipo)
    return tipo


@router.delete("/api/tipos-exame/{tipo_id}", status_code=204)
def deletar_tipo(tipo_id: int, db: Session = Depends(get_db), _=Depends(admin_only)):
    tipo = db.query(models.TipoExame).filter(models.TipoExame.id == tipo_id).first()
    if not tipo:
        raise HTTPException(status_code=404, detail="Tipo não encontrado")
    db.delete(tipo)
    db.commit()


# ── Exames ─────────────────────────────────────────────────
@router.post("/api/pacientes/{paciente_id}/exames", response_model=ExameOut, status_code=201)
async def adicionar_exame(
    paciente_id: int,
    tipo_exame_id: int = Form(...),
    data_realizacao: date = Form(...),
    observacoes: Optional[str] = Form(None),
    arquivo: UploadFile = File(...),
    db: Session = Depends(get_db),
    usuario=Depends(admin_ou_enfermagem)
):
    paciente = db.query(models.Paciente).filter(models.Paciente.id == paciente_id).first()
    if not paciente:
        raise HTTPException(status_code=404, detail="Paciente não encontrado")

    tipo = db.query(models.TipoExame).filter(models.TipoExame.id == tipo_exame_id).first()
    if not tipo:
        raise HTTPException(status_code=404, detail="Tipo de exame não encontrado")

    info_arquivo = await salvar_arquivo(arquivo)

    exame = models.Exame(
        paciente_id=paciente_id,
        tipo_exame_id=tipo_exame_id,
        data_realizacao=data_realizacao,
        observacoes=observacoes,
        cadastrado_por=usuario.id,
        **info_arquivo
    )
    db.add(exame)
    db.commit()
    db.refresh(exame)
    return exame


@router.get("/api/exames/{exame_id}/arquivo")
def baixar_arquivo(exame_id: int, db: Session = Depends(get_db), _=Depends(get_usuario_atual)):
    exame = db.query(models.Exame).filter(models.Exame.id == exame_id).first()
    if not exame:
        raise HTTPException(status_code=404, detail="Exame não encontrado")

    caminho = os.path.join(settings.UPLOAD_DIR, exame.arquivo_path)
    if not os.path.exists(caminho):
        raise HTTPException(status_code=404, detail="Arquivo não encontrado no servidor")

    return FileResponse(
        path=caminho,
        media_type=exame.arquivo_tipo,
        filename=exame.arquivo_nome
    )


@router.delete("/api/exames/{exame_id}", status_code=204)
def deletar_exame(exame_id: int, db: Session = Depends(get_db), _=Depends(admin_only)):
    exame = db.query(models.Exame).filter(models.Exame.id == exame_id).first()
    if not exame:
        raise HTTPException(status_code=404, detail="Exame não encontrado")
    deletar_arquivo(exame.arquivo_path)
    db.delete(exame)
    db.commit()
