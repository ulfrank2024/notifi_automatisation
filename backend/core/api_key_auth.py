"""
Authentification par API Key pour les endpoints partenaires.
La clé est passée dans le header : X-API-Key: nf_live_xxxx...
"""
import hashlib
import secrets
from fastapi import HTTPException, Security, status
from fastapi.security import APIKeyHeader
from core.database import get_supabase

API_KEY_HEADER = APIKeyHeader(name="X-API-Key", auto_error=True)
KEY_PREFIX     = "nf_live_"


def generate_api_key() -> tuple[str, str, str]:
    """
    Génère une nouvelle clé API.
    Retourne : (clé_complète, préfixe_affichable, hash_sha256)
    La clé complète n'est retournée qu'une seule fois.
    """
    raw    = KEY_PREFIX + secrets.token_urlsafe(32)
    prefix = raw[:16] + "…"
    hashed = _hash_key(raw)
    return raw, prefix, hashed


def _hash_key(key: str) -> str:
    return hashlib.sha256(key.encode()).hexdigest()


def require_api_key(api_key: str = Security(API_KEY_HEADER)) -> dict:
    """Dépendance FastAPI — vérifie la clé et retourne l'enregistrement."""
    db     = get_supabase()
    hashed = _hash_key(api_key)
    res    = db.table("api_keys").select("*").eq("key_hash", hashed).eq("is_active", True).execute()

    if not res.data:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Clé API invalide ou révoquée.",
            headers={"WWW-Authenticate": "ApiKey"},
        )

    key_record = res.data[0]
    # Mettre à jour last_used_at
    db.table("api_keys").update({"last_used_at": "now()"}).eq("id", key_record["id"]).execute()
    return key_record
