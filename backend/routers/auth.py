import os
from pathlib import Path
from fastapi import APIRouter, HTTPException, status, Depends
from pydantic import BaseModel
from core.config import settings
from core.security import verify_password, hash_password, create_token, require_auth

router = APIRouter(prefix="/auth", tags=["auth"])

ENV_FILE = Path(__file__).parent.parent / ".env"


class LoginPayload(BaseModel):
    email:    str
    password: str


class ChangePasswordPayload(BaseModel):
    current_password: str
    new_password:     str


@router.post("/login")
def login(payload: LoginPayload):
    if payload.email.lower() != settings.admin_email.lower():
        raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail="Identifiants invalides.")
    if not settings.admin_password_hash:
        raise HTTPException(status_code=500, detail="ADMIN_PASSWORD_HASH non configuré dans .env")
    if not verify_password(payload.password, settings.admin_password_hash):
        raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail="Identifiants invalides.")
    token = create_token(payload.email)
    return {"access_token": token, "token_type": "bearer", "email": payload.email}


@router.get("/me")
def me(email: str = Depends(require_auth)):
    return {"email": email}


@router.post("/change-password")
def change_password(payload: ChangePasswordPayload, email: str = Depends(require_auth)):
    """Change le mot de passe admin — met à jour le .env automatiquement."""
    if not verify_password(payload.current_password, settings.admin_password_hash):
        raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail="Mot de passe actuel incorrect.")
    if len(payload.new_password) < 8:
        raise HTTPException(status_code=400, detail="Le mot de passe doit contenir au moins 8 caractères.")

    new_hash = hash_password(payload.new_password)
    _update_env("ADMIN_PASSWORD_HASH", new_hash)
    # Recharger en mémoire
    settings.admin_password_hash = new_hash
    return {"message": "Mot de passe mis à jour avec succès."}


def _update_env(key: str, value: str):
    """Met à jour ou ajoute une clé dans le fichier .env."""
    if not ENV_FILE.exists():
        ENV_FILE.write_text(f"{key}={value}\n")
        return
    lines = ENV_FILE.read_text().splitlines()
    found = False
    new_lines = []
    for line in lines:
        if line.startswith(f"{key}=") or line.startswith(f"{key} ="):
            new_lines.append(f"{key}={value}")
            found = True
        else:
            new_lines.append(line)
    if not found:
        new_lines.append(f"{key}={value}")
    ENV_FILE.write_text("\n".join(new_lines) + "\n")
