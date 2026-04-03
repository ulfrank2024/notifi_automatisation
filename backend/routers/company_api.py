"""
API Compagnie — endpoints sécurisés par clé API.
Destinés aux programmeurs de la compagnie partenaire.

Authentification : header  X-API-Key: nf_live_xxxx...

Endpoints disponibles :
  GET  /company/campaigns              — liste des campagnes
  GET  /company/campaigns/{id}/status  — statuts d'une campagne
  POST /company/campaigns/{id}/send    — déclencher un envoi
  POST /company/contacts/import        — importer des contacts
"""
from fastapi import APIRouter, HTTPException, BackgroundTasks, Depends
from pydantic import BaseModel
from collections import defaultdict
from core.database import get_supabase
from core.api_key_auth import require_api_key
from services.sender import send_campaign
from services.templates import get_template

router = APIRouter(prefix="/company", tags=["company-api"])

auth = Depends(require_api_key)


# ─── Campagnes ───────────────────────────────────────────────────────────────

@router.get("/campaigns")
def list_campaigns(_key=auth):
    db  = get_supabase()
    res = db.table("campaigns").select("*").order("created_at", desc=True).execute()
    orders_res = db.table("notif_orders").select("campaign_id, status").execute()

    counts = defaultdict(lambda: {"total": 0, "pending": 0, "sent": 0, "error": 0})
    for o in (orders_res.data or []):
        cid = o["campaign_id"]
        counts[cid]["total"] += 1
        if o["status"] in counts[cid]:
            counts[cid][o["status"]] += 1

    return [
        {**c, **counts[c["id"]]}
        for c in (res.data or [])
    ]


@router.get("/campaigns/{campaign_id}/status")
def campaign_status(campaign_id: str, _key=auth):
    db  = get_supabase()
    res = db.table("notif_orders").select("status").eq("campaign_id", campaign_id).execute()
    orders = res.data or []
    total  = len(orders)
    if total == 0:
        raise HTTPException(status_code=404, detail="Campagne introuvable ou vide.")
    sent    = sum(1 for o in orders if o["status"] == "sent")
    pending = sum(1 for o in orders if o["status"] == "pending")
    error   = sum(1 for o in orders if o["status"] == "error")
    return {
        "total":      total,
        "pending":    pending,
        "sent":       sent,
        "error":      error,
        "send_rate":  round(sent / total * 100, 1),
        "done":       all(o["status"] in ("sent", "error") for o in orders),
    }


# ─── Déclenchement d'envoi ───────────────────────────────────────────────────

class CompanySendPayload(BaseModel):
    channel:     str = "email"          # "email" | "sms" | "both"
    template_id: str = "order_confirm_fr"
    subject:     str | None = None
    email_body:  str | None = None
    sms_body:    str | None = None


@router.post("/campaigns/{campaign_id}/send")
async def trigger_send(
    campaign_id: str,
    payload: CompanySendPayload,
    background_tasks: BackgroundTasks,
    _key=auth,
):
    db   = get_supabase()
    camp = db.table("campaigns").select("id,name").eq("id", campaign_id).execute()
    if not camp.data:
        raise HTTPException(status_code=404, detail="Campagne introuvable.")

    # Résoudre le template
    tpl = get_template(payload.template_id)
    subject      = payload.subject      or (tpl["subject"] if tpl else "Notification")
    email_body   = payload.email_body   or (tpl["email"]   if tpl else "")
    sms_body     = payload.sms_body     or (tpl["sms"]     if tpl else "")

    pending = (
        db.table("notif_orders")
        .select("id", count="exact")
        .eq("campaign_id", campaign_id)
        .eq("status", "pending")
        .execute()
    )
    count = pending.count or 0
    if count == 0:
        raise HTTPException(status_code=400, detail="Aucun contact en attente.")

    background_tasks.add_task(send_campaign, campaign_id, payload.channel, subject, email_body, sms_body)

    return {
        "message":   f"Envoi lancé pour {count} contact(s).",
        "campaign":  camp.data[0]["name"],
        "pending":   count,
        "channel":   payload.channel,
        "template":  payload.template_id,
    }


# ─── Import de contacts ──────────────────────────────────────────────────────

class ContactImport(BaseModel):
    campaign_id:  str
    contacts: list[dict]   # [{"email":"...", "phone":"...", "first_name":"...", "last_name":"...", "order_number":"..."}]


@router.post("/contacts/import")
def import_contacts(payload: ContactImport, _key=auth):
    db = get_supabase()

    camp = db.table("campaigns").select("id").eq("id", payload.campaign_id).execute()
    if not camp.data:
        raise HTTPException(status_code=404, detail="Campagne introuvable.")

    rows = [
        {
            "campaign_id":  payload.campaign_id,
            "first_name":   c.get("first_name", ""),
            "last_name":    c.get("last_name",  ""),
            "email":        c.get("email",      ""),
            "phone":        c.get("phone",      ""),
            "order_number": c.get("order_number",""),
            "status":       "pending",
            "raw_data":     c,
        }
        for c in payload.contacts
    ]

    for i in range(0, len(rows), 500):
        db.table("notif_orders").insert(rows[i:i+500]).execute()

    # Mettre à jour total_rows
    total = db.table("notif_orders").select("id", count="exact").eq("campaign_id", payload.campaign_id).execute()
    db.table("campaigns").update({"total_rows": total.count or 0}).eq("id", payload.campaign_id).execute()

    return {"imported": len(rows)}
