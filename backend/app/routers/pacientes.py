from fastapi import APIRouter, Depends, HTTPException, Query
from sqlalchemy.orm import Session, joinedload
from sqlalchemy import func
from typing import List, Optional
from datetime import date
from app.database import get_db
from app.schemas import PacienteCreate, PacienteUpdate, PacienteOut, PacienteListItem
from app.utils.auth import get_usuario_atual, admin_ou_enfermagem
import app.models as models

router = APIRouter(prefix="/api/pacientes", tags=["pacientes"])


@router.get("/", response_model=List[PacienteListItem])
def listar(
    busca: Optional[str] = Query(None),
    data_inicio: Optional[date] = Query(None),
    data_fim: Optional[date] = Query(None),
    limite: int = Query(10, ge=1, le=100),
    offset: int = Query(0, ge=0),
    db: Session = Depends(get_db),
    _=Depends(get_usuario_atual)
):
    q = db.query(
        models.Paciente,
        func.count(models.Exame.id).label("total_exames")
    ).outerjoin(models.Exame)

    if busca:
        q = q.filter(models.Paciente.nome_completo.ilike(f"%{busca}%"))

    if data_inicio:
        q = q.filter(func.date(models.Paciente.criado_em) >= data_inicio)

    if data_fim:
        q = q.filter(func.date(models.Paciente.criado_em) <= data_fim)

    q = q.group_by(models.Paciente.id)
    q = q.order_by(models.Paciente.criado_em.desc())

    resultados = q.offset(offset).limit(limite).all()

    saida = []
    for paciente, total_exames in resultados:
        item = PacienteListItem(
            id=paciente.id,
            nome_completo=paciente.nome_completo,
            data_nascimento=paciente.data_nascimento,
            telefone=paciente.telefone,
            criado_em=paciente.criado_em,
            total_exames=total_exames,
        )
        saida.append(item)
    return saida


@router.get("/total")
def total(
    busca: Optional[str] = Query(None),
    data_inicio: Optional[date] = Query(None),
    data_fim: Optional[date] = Query(None),
    db: Session = Depends(get_db),
    _=Depends(get_usuario_atual)
):
    q = db.query(func.count(models.Paciente.id))
    if busca:
        q = q.filter(models.Paciente.nome_completo.ilike(f"%{busca}%"))
    if data_inicio:
        q = q.filter(func.date(models.Paciente.criado_em) >= data_inicio)
    if data_fim:
        q = q.filter(func.date(models.Paciente.criado_em) <= data_fim)
    return {"total": q.scalar()}


@router.get("/{paciente_id}", response_model=PacienteOut)
def detalhe(paciente_id: int, db: Session = Depends(get_db), _=Depends(get_usuario_atual)):
    paciente = db.query(models.Paciente).options(
        joinedload(models.Paciente.exames).joinedload(models.Exame.tipo_exame)
    ).filter(models.Paciente.id == paciente_id).first()

    if not paciente:
        raise HTTPException(status_code=404, detail="Paciente não encontrado")
    return paciente


@router.post("/", response_model=PacienteOut, status_code=201)
def criar(dados: PacienteCreate, db: Session = Depends(get_db), _=Depends(admin_ou_enfermagem)):
    paciente = models.Paciente(**dados.model_dump())
    db.add(paciente)
    db.commit()
    db.refresh(paciente)
    return paciente


@router.put("/{paciente_id}", response_model=PacienteOut)
def atualizar(paciente_id: int, dados: PacienteUpdate, db: Session = Depends(get_db), _=Depends(admin_ou_enfermagem)):
    paciente = db.query(models.Paciente).filter(models.Paciente.id == paciente_id).first()
    if not paciente:
        raise HTTPException(status_code=404, detail="Paciente não encontrado")

    for campo, valor in dados.model_dump(exclude_none=True).items():
        setattr(paciente, campo, valor)

    db.commit()
    db.refresh(paciente)
    return paciente
