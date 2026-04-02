"""
Routes de notification — lancement d'envoi + webhook bounces Resend.
"""
import asyncio
from fastapi import APIRouter, HTTPException, BackgroundTasks, Request, Depends
from pydantic import BaseModel
from core.database import get_supabase
from core.security import require_auth
from services.sender import send_campaign

router = APIRouter(prefix="/notifications", tags=["notifications"])


# ─── Modèles ────────────────────────────────────────────────────────────────

class SendPayload(BaseModel):
    campaign_id:    str
    channel:        str = "email"           # "email" | "sms" | "both"
    subject:        str = "Votre commande"
    email_template: str = (
        "<p>Bonjour {{ prenom }} {{ nom }},</p>"
        "<p>Votre commande <strong>{{ num_commande }}</strong> a bien été prise en compte.</p>"
        "<p>Merci de votre confiance.</p>"
    )
    sms_template: str = (
        "Bonjour {{ prenom }}, votre commande {{ num_commande }} est confirmée."
    )


class GeneralNotifPayload(BaseModel):
    """Notification générale — envoi groupé hors campagne."""
    channel:        str = "email"
    subject:        str = "Information importante"
    email_template: str
    sms_template:   str = ""
    campaign_id:    str | None = None       # None = tous les contacts


# ─── Envoi campagne ──────────────────────────────────────────────────────────

@router.post("/send")
async def launch_send(
    payload: SendPayload,
    background_tasks: BackgroundTasks,
    _: str = Depends(require_auth),
):
    """Lance l'envoi en arrière-plan et retourne immédiatement."""
    db = get_supabase()

    # Vérifier que la campagne existe
    camp = db.table("campaigns").select("id, name").eq("id", payload.campaign_id).execute()
    if not camp.data:
        raise HTTPException(status_code=404, detail="Campagne introuvable.")

    # Compter les contacts en attente
    pending = (
        db.table("notif_orders")
        .select("id", count="exact")
        .eq("campaign_id", payload.campaign_id)
        .eq("status", "pending")
        .execute()
    )
    count = pending.count or 0
    if count == 0:
        raise HTTPException(status_code=400, detail="Aucun contact en attente dans cette campagne.")

    background_tasks.add_task(
        send_campaign,
        payload.campaign_id,
        payload.channel,
        payload.subject,
        payload.email_template,
        payload.sms_template,
    )

    return {
        "message": f"Envoi lancé pour {count} contact(s) en arrière-plan.",
        "campaign": camp.data[0]["name"],
        "pending":  count,
    }


@router.get("/status/{campaign_id}")
def campaign_send_status(campaign_id: str, _: str = Depends(require_auth)):
    """Statuts en temps réel d'une campagne (polling frontend)."""
    db = get_supabase()
    res = db.table("notif_orders").select("status").eq("campaign_id", campaign_id).execute()
    orders = res.data or []
    total = len(orders)
    return {
        "total":       total,
        "pending":     sum(1 for o in orders if o["status"] == "pending"),
        "in_progress": sum(1 for o in orders if o["status"] == "in_progress"),
        "sent":        sum(1 for o in orders if o["status"] == "sent"),
        "error":       sum(1 for o in orders if o["status"] == "error"),
        "done":        total > 0 and all(o["status"] in ("sent", "error") for o in orders),
    }


# ─── Notification Générale ───────────────────────────────────────────────────

@router.post("/general")
async def general_notification(
    payload: GeneralNotifPayload,
    background_tasks: BackgroundTasks,
    _: str = Depends(require_auth),
):
    """Envoi groupé à tous les contacts (ou d'une campagne spécifique)."""
    db = get_supabase()

    # Réinitialiser les contacts ciblés à "pending" pour permettre le renvoi
    query = db.table("notif_orders").update({"status": "pending", "error_message": ""})
    if payload.campaign_id:
        query = query.eq("campaign_id", payload.campaign_id)
    query.execute()

    # Récupérer un campaign_id générique ou utiliser le premier disponible
    campaign_id = payload.campaign_id
    if not campaign_id:
        camp = db.table("campaigns").select("id").limit(1).execute()
        if not camp.data:
            raise HTTPException(status_code=400, detail="Aucune campagne disponible.")
        campaign_id = camp.data[0]["id"]

    background_tasks.add_task(
        send_campaign,
        campaign_id,
        payload.channel,
        payload.subject,
        payload.email_template,
        payload.sms_template,
    )

    return {"message": "Notification générale lancée en arrière-plan."}


# ─── Webhook Bounces Resend ──────────────────────────────────────────────────

@router.post("/webhook/resend")
async def resend_webhook(request: Request):
    """
    Reçoit les événements Resend (bounce, spam complaint…)
    et met à jour le statut du contact.
    À configurer dans le dashboard Resend → Webhooks.
    """
    payload = await request.json()
    event_type = payload.get("type", "")

    if event_type in ("email.bounced", "email.complained"):
        email_addr = payload.get("data", {}).get("to", [None])[0]
        if email_addr:
            db = get_supabase()
            db.table("notif_orders").update({
                "status": "error",
                "error_message": f"Bounce/Complaint Resend: {event_type}",
            }).eq("email", email_addr).execute()

    return {"received": True}
