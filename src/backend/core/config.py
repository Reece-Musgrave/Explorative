from pydantic_settings import BaseSettings

class Settings(BaseSettings):
    SECRET_KEY: str
    ALGORITHM: str = "HS256"
    ACCESS_TOKEN_EXPIRE_MINUTES: int = 30
    DATABASE_URL: str
    ANTHROPIC_API_KEY: str
    S3_BUCKET_NAME: str
    AWS_REGION: str = "us-north-1"

    class Config:
        env_file = ".env"
        extra = "ignore"


settings = Settings()