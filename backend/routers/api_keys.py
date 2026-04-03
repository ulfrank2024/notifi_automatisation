"""
Gestion des clés API — endpoints admin (protégés par JWT).
Permet de générer, lister et révoquer les clés API partenaires.
"""
from fastapi import APIRouter, HTTPException
from pydantic import BaseModel
from core.database import get_supabase
from core.api_key_auth import generate_api_key

router = APIRouter(prefix="/api-keys", tags=["api-keys"])


@router.get("/")
def list_keys():
    db  = get_supabase()
    res = db.table("api_keys").select("id,name,key_prefix,is_active,last_used_at,created_at").order("created_at", desc=True).execute()
    return res.data or []


class CreateKeyPayload(BaseModel):
    name: str


@router.post("/")
def create_key(payload: CreateKeyPayload):
    raw, prefix, hashed = generate_api_key()
    db = get_supabase()
    db.table("api_keys").insert({
        "name":       payload.name,
        "key_prefix": prefix,
        "key_hash":   hashed,
        "is_active":  True,
    }).execute()
    # La clé complète n'est retournée qu'une seule fois
    return {"key": raw, "prefix": prefix, "name": payload.name}


@router.delete("/{key_id}")
def revoke_key(key_id: str):
    db  = get_supabase()
    res = db.table("api_keys").select("id").eq("id", key_id).execute()
    if not res.data:
        raise HTTPException(status_code=404, detail="Clé introuvable.")
    db.table("api_keys").update({"is_active": False}).eq("id", key_id).execute()
    return {"revoked": True}
