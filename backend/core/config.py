from pydantic_settings import BaseSettings


class Settings(BaseSettings):
    supabase_url: str
    supabase_key: str
    allowed_origins: str = "http://localhost:5174"

    # Auth
    admin_email:         str = "admin@notifflow.com"
    admin_password_hash: str = ""          # généré via: python -c "from passlib.hash import bcrypt; print(bcrypt.hash('motdepasse'))"
    jwt_secret:          str = "change-this-secret-in-production"
    jwt_expire_minutes:  int = 480         # 8h

    @property
    def origins(self) -> list[str]:
        return [o.strip() for o in self.allowed_origins.split(",")]

    class Config:
        env_file = ".env"


settings = Settings()
