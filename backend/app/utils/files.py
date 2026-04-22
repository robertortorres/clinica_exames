import os
import uuid
from fastapi import UploadFile, HTTPException
from app.config import settings

ALLOWED_TYPES = {
    "application/pdf": "pdf",
    "image/jpeg": "jpg",
    "image/png": "png",
    "image/gif": "gif",
    "image/webp": "webp",
}

MAX_SIZE = settings.MAX_FILE_SIZE_MB * 1024 * 1024  # em bytes


async def salvar_arquivo(arquivo: UploadFile) -> dict:
    # Verificar tipo
    if arquivo.content_type not in ALLOWED_TYPES:
        raise HTTPException(
            status_code=400,
            detail=f"Tipo de arquivo não permitido. Use PDF ou imagens (JPG, PNG, GIF, WEBP)."
        )

    # Ler conteúdo
    conteudo = await arquivo.read()

    # Verificar tamanho
    if len(conteudo) > MAX_SIZE:
        raise HTTPException(
            status_code=400,
            detail=f"Arquivo muito grande. Máximo permitido: {settings.MAX_FILE_SIZE_MB}MB"
        )

    # Gerar nome único
    ext = ALLOWED_TYPES[arquivo.content_type]
    nome_unico = f"{uuid.uuid4().hex}.{ext}"
    caminho = os.path.join(settings.UPLOAD_DIR, nome_unico)

    # Garantir que o diretório existe
    os.makedirs(settings.UPLOAD_DIR, exist_ok=True)

    # Salvar arquivo
    with open(caminho, "wb") as f:
        f.write(conteudo)

    return {
        "arquivo_nome": arquivo.filename,
        "arquivo_path": nome_unico,
        "arquivo_tipo": arquivo.content_type,
        "arquivo_tamanho": len(conteudo),
    }


def deletar_arquivo(arquivo_path: str):
    caminho_completo = os.path.join(settings.UPLOAD_DIR, arquivo_path)
    if os.path.exists(caminho_completo):
        os.remove(caminho_completo)
