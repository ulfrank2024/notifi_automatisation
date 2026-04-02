"""
Service d'envoi SMS via Twilio.
Ajoute automatiquement l'instruction STOP (obligation légale anti-spam).
"""
from twilio.rest import Client
from twilio.base.exceptions import TwilioRestException
from jinja2 import Template
from core.config import settings

MAX_SMS_CHARS = 160


def get_client() -> Client:
    if not settings.twilio_account_sid or not settings.twilio_auth_token:
        raise ValueError("TWILIO_ACCOUNT_SID / TWILIO_AUTH_TOKEN non configurés dans .env")
    return Client(settings.twilio_account_sid, settings.twilio_auth_token)


def render_template(template_str: str, variables: dict) -> str:
    try:
        return Template(template_str).render(**variables)
    except Exception:
        return template_str


def send_sms(to_phone: str, body_template: str, variables: dict) -> dict:
    """
    Envoie un SMS avec :
    - Rendu des variables
    - Mention STOP obligatoire
    - Troncature propre si > 160 chars
    """
    if not settings.twilio_from_number:
        raise ValueError("TWILIO_FROM_NUMBER non configuré dans .env")

    rendered = render_template(body_template, variables)

    # Mention STOP obligatoire (anti-spam / légal)
    stop_mention = " Répondez STOP pour vous désinscrire."
    max_body     = MAX_SMS_CHARS - len(stop_mention)

    if len(rendered) > max_body:
        rendered = rendered[:max_body - 1] + "…"

    full_body = rendered + stop_mention

    client = get_client()
    try:
        message = client.messages.create(
            body=full_body,
            from_=settings.twilio_from_number,
            to=to_phone,
        )
        return {"sid": message.sid, "status": message.status}
    except TwilioRestException as e:
        raise ValueError(f"Twilio error: {e.msg}")
