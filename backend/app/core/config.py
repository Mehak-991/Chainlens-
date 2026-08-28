from pydantic_settings import BaseSettings

class Settings(BaseSettings):
    APP_ENV: str = "development"
    COGNODB_URI: str = "bolt://localhost:7687"
    COGNODB_USER: str = "neo4j"
    COGNODB_PASSWORD: str = "password"

    class Config:
        env_file = ".env"
        env_file_encoding = "utf-8"

settings = Settings()
