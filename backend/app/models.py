from sqlalchemy import Column, Integer, String, Date, DateTime, ForeignKey, Enum, Text
from sqlalchemy.orm import relationship
from sqlalchemy.sql import func
import enum
from app.database import Base


class PerfilEnum(str, enum.Enum):
    admin = "admin"
    enfermagem = "enfermagem"
    atendimento = "atendimento"


class Usuario(Base):
    __tablename__ = "usuarios"

    id = Column(Integer, primary_key=True, index=True)
    nome = Column(String(100), nullable=False)
    email = Column(String(150), unique=True, index=True, nullable=False)
    senha_hash = Column(String(200), nullable=False)
    perfil = Column(Enum(PerfilEnum), nullable=False, default=PerfilEnum.atendimento)
    ativo = Column(Integer, default=1)
    criado_em = Column(DateTime(timezone=True), server_default=func.now())

    exames_cadastrados = relationship("Exame", back_populates="cadastrado_por_usuario")


class Paciente(Base):
    __tablename__ = "pacientes"

    id = Column(Integer, primary_key=True, index=True)
    nome_completo = Column(String(200), nullable=False, index=True)
    data_nascimento = Column(Date, nullable=False)
    cpf = Column(String(14), nullable=True, index=True)
    telefone = Column(String(20), nullable=True)
    email = Column(String(150), nullable=True)
    endereco = Column(Text, nullable=True)
    observacoes = Column(Text, nullable=True)
    criado_em = Column(DateTime(timezone=True), server_default=func.now())
    atualizado_em = Column(DateTime(timezone=True), onupdate=func.now())

    exames = relationship("Exame", back_populates="paciente", order_by="Exame.data_realizacao.desc()")


class TipoExame(Base):
    __tablename__ = "tipos_exame"

    id = Column(Integer, primary_key=True, index=True)
    nome = Column(String(100), nullable=False, unique=True)
    descricao = Column(Text, nullable=True)

    exames = relationship("Exame", back_populates="tipo_exame")


class Exame(Base):
    __tablename__ = "exames"

    id = Column(Integer, primary_key=True, index=True)
    paciente_id = Column(Integer, ForeignKey("pacientes.id", ondelete="CASCADE"), nullable=False)
    tipo_exame_id = Column(Integer, ForeignKey("tipos_exame.id"), nullable=False)
    data_realizacao = Column(Date, nullable=False)
    observacoes = Column(Text, nullable=True)  # já existia
    arquivo_nome = Column(String(255), nullable=False)
    arquivo_path = Column(String(500), nullable=False)
    arquivo_tipo = Column(String(50), nullable=False)
    arquivo_tamanho = Column(Integer, nullable=False)
    cadastrado_por = Column(Integer, ForeignKey("usuarios.id"), nullable=True)
    criado_em = Column(DateTime(timezone=True), server_default=func.now())

    paciente = relationship("Paciente", back_populates="exames")
    tipo_exame = relationship("TipoExame", back_populates="exames")
    cadastrado_por_usuario = relationship("Usuario", back_populates="exames_cadastrados")
