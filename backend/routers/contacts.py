from fastapi import APIRouter, HTTPException
from pydantic import BaseModel
from core.database import get_supabase

router = APIRouter(prefix="/contacts", tags=["contacts"])


class ContactUpdate(BaseModel):
    first_name:   str | None = None
    last_name:    str | None = None
    email:        str | None = None
    phone:        str | None = None
    order_number: str | None = None
    status:       str | None = None


@router.patch("/{contact_id}")
async def update_contact(contact_id: str, payload: ContactUpdate):
    db = get_supabase()
    data = {k: v for k, v in payload.model_dump().items() if v is not None}
    if not data:
        raise HTTPException(status_code=400, detail="Aucun champ à mettre à jour.")
    if "status" in data and data["status"] not in ("pending", "in_progress", "sent", "error"):
        raise HTTPException(status_code=400, detail="Statut invalide.")
    res = db.table("notif_orders").update(data).eq("id", contact_id).execute()
    if not res.data:
        raise HTTPException(status_code=404, detail="Contact introuvable.")
    return res.data[0]


@router.delete("/{contact_id}")
async def delete_contact(contact_id: str):
    db = get_supabase()
    res = db.table("notif_orders").delete().eq("id", contact_id).execute()
    return {"deleted": True}


@router.get("/{contact_id}/history")
async def contact_history(contact_id: str):
    """Toutes les commandes liées au même email (historique client)."""
    db = get_supabase()
    # Récupérer l'email du contact
    ref = db.table("notif_orders").select("email").eq("id", contact_id).execute()
    if not ref.data:
        raise HTTPException(status_code=404, detail="Contact introuvable.")
    email = ref.data[0]["email"]
    if not email:
        return []
    # Toutes les commandes de ce même email
    orders = (
        db.table("notif_orders")
        .select("id, campaign_id, first_name, last_name, email, phone, order_number, status, created_at, updated_at")
        .eq("email", email)
        .order("created_at", desc=True)
        .execute()
    )
    # Enrichir avec le nom de campagne
    campaign_ids = list({o["campaign_id"] for o in orders.data})
    campaigns_res = db.table("campaigns").select("id, name").in_("id", campaign_ids).execute()
    campaign_map = {c["id"]: c["name"] for c in campaigns_res.data}
    for o in orders.data:
        o["campaign_name"] = campaign_map.get(o["campaign_id"], "—")
    return orders.data
