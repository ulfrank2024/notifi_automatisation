"""
Service d'envoi Email via Resend.
Envoie un email multipart (HTML + texte brut) avec headers anti-spam.
"""
import resend
from jinja2 import Template
from core.config import settings


def init_resend():
    resend.api_key = settings.resend_api_key


def render_template(template_str: str, variables: dict) -> str:
    """Remplace les variables {{ var }} dans le template."""
    try:
        return Template(template_str).render(**variables)
    except Exception:
        return template_str


def build_plain_text(html_body: str) -> str:
    """Version texte brut simplifiée pour le multipart."""
    import re
    text = re.sub(r'<br\s*/?>', '\n', html_body, flags=re.IGNORECASE)
    text = re.sub(r'<[^>]+>', '', text)
    text = re.sub(r'\n{3,}', '\n\n', text)
    return text.strip()


def send_email(
    to_email: str,
    subject: str,
    html_body: str,
    variables: dict,
) -> dict:
    """
    Envoie un email avec :
    - Rendu Jinja2 des variables
    - Multipart HTML + texte brut
    - Headers anti-spam (List-Unsubscribe, Precedence)
    """
    init_resend()

    if not settings.resend_api_key:
        raise ValueError("RESEND_API_KEY non configuré dans .env")
    if not settings.email_from_address:
        raise ValueError("EMAIL_FROM_ADDRESS non configuré dans .env")

    rendered_html    = render_template(html_body, variables)
    rendered_subject = render_template(subject, variables)
    plain_text       = build_plain_text(rendered_html)

    # Ajouter le bloc de désinscription en bas de l'email
    if settings.unsubscribe_url:
        unsub_block = (
            f'\n\n<p style="color:#999;font-size:12px;text-align:center;margin-top:32px;">'
            f'Vous recevez cet email car vous avez passé une commande.<br>'
            f'<a href="{settings.unsubscribe_url}?email={to_email}" style="color:#999;">Se désinscrire</a>'
            f'</p>'
        )
        rendered_html += unsub_block
        plain_text    += f"\n\n---\nPour vous désinscrire : {settings.unsubscribe_url}?email={to_email}"

    headers = {
        "Precedence":         "bulk",
        "X-Auto-Response-Suppress": "OOF, AutoReply",
    }
    if settings.unsubscribe_url:
        headers["List-Unsubscribe"] = (
            f"<{settings.unsubscribe_url}?email={to_email}>, "
            f"<mailto:{settings.email_reply_to or settings.email_from_address}?subject=unsubscribe>"
        )
        headers["List-Unsubscribe-Post"] = "List-Unsubscribe=One-Click"

    params: resend.Emails.SendParams = {
        "from":    f"{settings.email_from_name} <{settings.email_from_address}>",
        "to":      [to_email],
        "subject": rendered_subject,
        "html":    rendered_html,
        "text":    plain_text,
        "headers": headers,
    }
    if settings.email_reply_to:
        params["reply_to"] = settings.email_reply_to

    response = resend.Emails.send(params)
    return {"id": response.get("id"), "status": "sent"}
