"""
Orchestrateur d'envoi — gère les batches, les délais et la mise à jour des statuts.
Stratégie anti-spam : envoi par lots de N avec pause entre chaque lot.
"""
import asyncio
import logging
from core.config import settings
from core.database import get_supabase
from .email_service import send_email
from .sms_service import send_sms

logger = logging.getLogger("sender")


async def send_campaign(
    campaign_id: str,
    channel: str,          # "email" | "sms" | "both"
    subject: str,          # Sujet email (ignoré pour SMS)
    email_template: str,   # Template HTML email
    sms_template: str,     # Template SMS
):
    """
    Lance l'envoi de tous les contacts d'une campagne.
    Met à jour les statuts en temps réel dans Supabase.
    """
    db = get_supabase()

    # Récupérer tous les contacts en attente
    res = (
        db.table("notif_orders")
        .select("id, first_name, last_name, email, phone, order_number")
        .eq("campaign_id", campaign_id)
        .eq("status", "pending")
        .execute()
    )
    contacts = res.data or []

    if not contacts:
        logger.info(f"Campagne {campaign_id} : aucun contact en attente.")
        return {"sent": 0, "error": 0}

    sent_count  = 0
    error_count = 0

    # Découper en batches
    for batch_start in range(0, len(contacts), settings.batch_size):
        batch = contacts[batch_start: batch_start + settings.batch_size]

        for contact in batch:
            contact_id = contact["id"]
            variables  = {
                "prenom":       contact.get("first_name") or "",
                "nom":          contact.get("last_name")  or "",
                "email":        contact.get("email")      or "",
                "telephone":    contact.get("phone")      or "",
                "num_commande": contact.get("order_number") or "",
            }

            # Marquer "en cours"
            _update_status(db, contact_id, "in_progress")

            success = True
            error_msg = ""

            # Email
            if channel in ("email", "both") and contact.get("email"):
                try:
                    send_email(contact["email"], subject, email_template, variables)
                except Exception as e:
                    success = False
                    error_msg += f"Email: {e} "
                    logger.warning(f"Email failed for {contact_id}: {e}")
            elif channel in ("email", "both") and not contact.get("email"):
                logger.info(f"Contact {contact_id} ignoré (email) : adresse manquante.")

            # SMS (uniquement si Twilio est configuré)
            if channel in ("sms", "both") and contact.get("phone"):
                if not settings.twilio_account_sid or not settings.twilio_auth_token:
                    logger.info(f"SMS ignoré pour {contact_id} : Twilio non configuré.")
                else:
                    try:
                        send_sms(contact["phone"], sms_template, variables)
                    except Exception as e:
                        success = False
                        error_msg += f"SMS: {e}"
                        logger.warning(f"SMS failed for {contact_id}: {e}")

            if success:
                _update_status(db, contact_id, "sent")
                sent_count += 1
            else:
                _update_status(db, contact_id, "error", error_msg.strip())
                error_count += 1

        # Pause anti-spam entre les batches
        if batch_start + settings.batch_size < len(contacts):
            await asyncio.sleep(settings.batch_delay_seconds)

    logger.info(f"Campagne {campaign_id} terminée : {sent_count} envoyés, {error_count} erreurs.")
    return {"sent": sent_count, "error": error_count}


def _update_status(db, contact_id: str, status: str, error_msg: str = ""):
    update = {"status": status}
    if error_msg:
        update["error_message"] = error_msg
    db.table("notif_orders").update(update).eq("id", contact_id).execute()
