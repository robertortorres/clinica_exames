from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from app.database import engine, SessionLocal
from app.models import Base, Usuario, PerfilEnum
from app.utils.auth import hash_senha
from app.routers import auth, usuarios, pacientes, exames, dashboard
import logging

logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

app = FastAPI(
    title="Clínica - Sistema de Exames",
    description="Sistema de gerenciamento de pacientes e exames médicos",
    version="1.0.0"
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(auth.router)
app.include_router(usuarios.router)
app.include_router(pacientes.router)
app.include_router(exames.router)
app.include_router(dashboard.router)


@app.on_event("startup")
def startup():
    # Criar tabelas
    Base.metadata.create_all(bind=engine)
    logger.info("Tabelas criadas/verificadas")

    # Criar admin padrão se não existir
    db = SessionLocal()
    try:
        admin = db.query(Usuario).filter(Usuario.email == "admin@clinica.local").first()
        if not admin:
            admin = Usuario(
                nome="Administrador",
                email="admin@clinica.local",
                senha_hash=hash_senha("Admin@123"),
                perfil=PerfilEnum.admin,
            )
            db.add(admin)
            db.commit()
            logger.info("Usuário admin criado: admin@clinica.local / Admin@123")
    finally:
        db.close()


@app.get("/api/health")
def health():
    return {"status": "ok"}
