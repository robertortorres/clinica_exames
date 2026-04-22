from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session
from sqlalchemy import func
from datetime import date, timedelta
from app.database import get_db
from app.utils.auth import get_usuario_atual
import app.models as models

router = APIRouter(prefix="/api/dashboard", tags=["dashboard"])


@router.get("/")
def dashboard(db: Session = Depends(get_db), _=Depends(get_usuario_atual)):
    hoje = date.today()

    # Total de pacientes
    total_pacientes = db.query(func.count(models.Paciente.id)).scalar()

    # Exames cadastrados hoje
    exames_hoje = db.query(func.count(models.Exame.id)).filter(
        func.date(models.Exame.criado_em) == hoje
    ).scalar()

    # Pacientes cadastrados hoje
    pacientes_hoje = db.query(func.count(models.Paciente.id)).filter(
        func.date(models.Paciente.criado_em) == hoje
    ).scalar()

    # Total de exames
    total_exames = db.query(func.count(models.Exame.id)).scalar()

    # Últimos 10 pacientes cadastrados
    ultimos_pacientes = db.query(
        models.Paciente,
        func.count(models.Exame.id).label("total_exames")
    ).outerjoin(models.Exame).group_by(models.Paciente.id)\
     .order_by(models.Paciente.criado_em.desc()).limit(10).all()

    pacientes_lista = [
        {
            "id": p.id,
            "nome_completo": p.nome_completo,
            "data_nascimento": str(p.data_nascimento),
            "telefone": p.telefone,
            "criado_em": p.criado_em.isoformat(),
            "total_exames": total,
        }
        for p, total in ultimos_pacientes
    ]

    return {
        "total_pacientes": total_pacientes,
        "total_exames": total_exames,
        "exames_hoje": exames_hoje,
        "pacientes_hoje": pacientes_hoje,
        "ultimos_pacientes": pacientes_lista,
    }
