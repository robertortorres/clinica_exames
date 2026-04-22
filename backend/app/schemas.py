from pydantic import BaseModel, EmailStr
from typing import Optional, List
from datetime import date, datetime
from app.models import PerfilEnum


# ── Auth ──────────────────────────────────────────────────
class LoginSchema(BaseModel):
    email: str
    senha: str


class TokenSchema(BaseModel):
    access_token: str
    token_type: str
    usuario: "UsuarioOut"


# ── Usuário ───────────────────────────────────────────────
class UsuarioCreate(BaseModel):
    nome: str
    email: EmailStr
    senha: str
    perfil: PerfilEnum = PerfilEnum.atendimento


class UsuarioUpdate(BaseModel):
    nome: Optional[str] = None
    perfil: Optional[PerfilEnum] = None
    ativo: Optional[int] = None
    senha: Optional[str] = None


class UsuarioOut(BaseModel):
    id: int
    nome: str
    email: str
    perfil: PerfilEnum
    ativo: int
    criado_em: datetime

    class Config:
        from_attributes = True


# ── Paciente ──────────────────────────────────────────────
class PacienteCreate(BaseModel):
    nome_completo: str
    data_nascimento: date
    cpf: Optional[str] = None
    telefone: Optional[str] = None
    email: Optional[str] = None
    endereco: Optional[str] = None
    observacoes: Optional[str] = None


class PacienteUpdate(BaseModel):
    nome_completo: Optional[str] = None
    data_nascimento: Optional[date] = None
    cpf: Optional[str] = None
    telefone: Optional[str] = None
    email: Optional[str] = None
    endereco: Optional[str] = None
    observacoes: Optional[str] = None


class ExameResumo(BaseModel):
    id: int
    data_realizacao: date
    arquivo_nome: str
    arquivo_tipo: str
    criado_em: datetime
    tipo_exame: "TipoExameOut"

    class Config:
        from_attributes = True


class PacienteOut(BaseModel):
    id: int
    nome_completo: str
    data_nascimento: date
    cpf: Optional[str] = None
    telefone: Optional[str]
    email: Optional[str]
    endereco: Optional[str]
    observacoes: Optional[str]
    criado_em: datetime
    exames: List[ExameResumo] = []

    class Config:
        from_attributes = True


class PacienteListItem(BaseModel):
    id: int
    nome_completo: str
    data_nascimento: date
    cpf: Optional[str] = None
    telefone: Optional[str]
    criado_em: datetime
    total_exames: int = 0

    class Config:
        from_attributes = True


# ── Tipo de Exame ─────────────────────────────────────────
class TipoExameCreate(BaseModel):
    nome: str
    descricao: Optional[str] = None


class TipoExameOut(BaseModel):
    id: int
    nome: str
    descricao: Optional[str]

    class Config:
        from_attributes = True


# ── Exame ─────────────────────────────────────────────────
class ExameOut(BaseModel):
    id: int
    paciente_id: int
    data_realizacao: date
    observacoes: Optional[str]
    arquivo_nome: str
    arquivo_tipo: str
    arquivo_tamanho: int
    criado_em: datetime
    tipo_exame: TipoExameOut
    cadastrado_por_usuario: Optional[UsuarioOut]

    class Config:
        from_attributes = True


TokenSchema.model_rebuild()
ExameResumo.model_rebuild()
