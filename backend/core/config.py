from pydantic_settings import BaseSettings


class Settings(BaseSettings):
    supabase_url: str
    supabase_key: str
    allowed_origins: str = "http://localhost:5174"

    # Auth
    admin_email:         str = "admin@notifflow.com"
    admin_password_hash: str = ""
    jwt_secret:          str = "change-this-secret-in-production"
    jwt_expire_minutes:  int = 480

    # Email — Resend
    resend_api_key:      str = ""
    email_from_name:     str = "Notif-Flow"
    email_from_address:  str = ""        # ex: notifications@votredomaine.com
    email_reply_to:      str = ""        # ex: support@votredomaine.com
    unsubscribe_url:     str = ""        # ex: https://votredomaine.com/unsubscribe

    # SMS — Twilio
    twilio_account_sid:  str = ""
    twilio_auth_token:   str = ""
    twilio_from_number:  str = ""        # ex: +33XXXXXXXXX ou alpha sender

    # Envoi par batch
    batch_size:          int = 20        # emails par lot
    batch_delay_seconds: float = 2.0    # délai entre lots (anti-spam)

    @property
    def origins(self) -> list[str]:
        return [o.strip() for o in self.allowed_origins.split(",")]

    class Config:
        env_file = ".env"


settings = Settings()
