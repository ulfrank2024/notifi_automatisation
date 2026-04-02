from fastapi import APIRouter, HTTPException, status
from pydantic import BaseModel
from core.config import settings
from core.security import verify_password, create_token

router = APIRouter(prefix="/auth", tags=["auth"])


class LoginPayload(BaseModel):
    email:    str
    password: str


@router.post("/login")
def login(payload: LoginPayload):
    if payload.email.lower() != settings.admin_email.lower():
        raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail="Identifiants invalides.")

    if not settings.admin_password_hash:
        raise HTTPException(status_code=500, detail="ADMIN_PASSWORD_HASH non configuré dans .env")

    if not verify_password(payload.password, settings.admin_password_hash):
        raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail="Identifiants invalides.")

    token = create_token(payload.email)
    return {
        "access_token": token,
        "token_type":   "bearer",
        "email":        payload.email,
    }


@router.get("/me")
def me(email: str = None):
    """Vérification légère que le token est valide (appelée au démarrage du frontend)."""
    return {"email": email}
