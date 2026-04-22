from pydantic_settings import BaseSettings


class Settings(BaseSettings):
    DATABASE_URL: str = "postgresql://clinica:clinica_senha@db:5432/clinica"
    SECRET_KEY: str = "troque-esta-chave-secreta-em-producao"
    ALGORITHM: str = "HS256"
    ACCESS_TOKEN_EXPIRE_MINUTES: int = 60
    UPLOAD_DIR: str = "/app/uploads"
    MAX_FILE_SIZE_MB: int = 5

    class Config:
        env_file = ".env"


settings = Settings()
