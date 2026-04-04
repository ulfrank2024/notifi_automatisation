"""
Service d'envoi Email.
Priorité : SMTP (Gmail ou autre) si smtp_user est configuré, sinon Resend.
Envoie un email multipart (HTML + texte brut) avec headers anti-spam.
"""
import smtplib
import ssl
from email.mime.multipart import MIMEMultipart
from email.mime.text import MIMEText
from jinja2 import Template
from core.config import settings


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


def _add_unsub_block(rendered_html: str, plain_text: str, to_email: str):
    """Ajoute le bloc de désinscription si l'URL est configurée."""
    if not settings.unsubscribe_url:
        return rendered_html, plain_text
    unsub_block = (
        f'\n\n<p style="color:#999;font-size:12px;text-align:center;margin-top:32px;">'
        f'Vous recevez cet email car vous avez passé une commande.<br>'
        f'<a href="{settings.unsubscribe_url}?email={to_email}" style="color:#999;">Se désinscrire</a>'
        f'</p>'
    )
    return rendered_html + unsub_block, plain_text + f"\n\n---\nPour vous désinscrire : {settings.unsubscribe_url}?email={to_email}"


def _smtp_context() -> ssl.SSLContext:
    """Contexte SSL avec certifi (résout le problème macOS)."""
    import certifi
    ctx = ssl.create_default_context(cafile=certifi.where())
    return ctx


def _send_via_smtp(to_email: str, subject: str, html_body: str, plain_text: str) -> dict:
    """Envoi via SMTP (Gmail SSL port 465 ou STARTTLS port 587)."""
    from_addr = settings.smtp_user
    from_label = f"{settings.email_from_name} <{from_addr}>"

    msg = MIMEMultipart("alternative")
    msg["Subject"] = subject
    msg["From"]    = from_label
    msg["To"]      = to_email
    msg["Precedence"] = "bulk"
    msg["X-Auto-Response-Suppress"] = "OOF, AutoReply"

    if settings.email_reply_to:
        msg["Reply-To"] = settings.email_reply_to

    if settings.unsubscribe_url:
        msg["List-Unsubscribe"] = (
            f"<{settings.unsubscribe_url}?email={to_email}>, "
            f"<mailto:{settings.email_reply_to or from_addr}?subject=unsubscribe>"
        )
        msg["List-Unsubscribe-Post"] = "List-Unsubscribe=One-Click"

    msg.attach(MIMEText(plain_text, "plain", "utf-8"))
    msg.attach(MIMEText(html_body,  "html",  "utf-8"))

    context = _smtp_context()

    if settings.smtp_secure:
        with smtplib.SMTP_SSL(settings.smtp_host, settings.smtp_port, context=context) as server:
            server.login(settings.smtp_user, settings.smtp_pass)
            server.sendmail(from_addr, to_email, msg.as_string())
    else:
        with smtplib.SMTP(settings.smtp_host, settings.smtp_port) as server:
            server.ehlo()
            server.starttls(context=context)
            server.login(settings.smtp_user, settings.smtp_pass)
            server.sendmail(from_addr, to_email, msg.as_string())

    return {"status": "sent"}


def _send_via_resend(to_email: str, subject: str, html_body: str, plain_text: str) -> dict:
    """Envoi via API Resend."""
    import resend
    resend.api_key = settings.resend_api_key

    headers = {
        "Precedence": "bulk",
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
        "subject": subject,
        "html":    html_body,
        "text":    plain_text,
        "headers": headers,
    }
    if settings.email_reply_to:
        params["reply_to"] = settings.email_reply_to

    response = resend.Emails.send(params)
    return {"id": response.get("id"), "status": "sent"}


def send_email(
    to_email: str,
    subject: str,
    html_body: str,
    variables: dict,
) -> dict:
    """
    Envoie un email avec rendu Jinja2 + multipart HTML/texte + headers anti-spam.
    Utilise SMTP si smtp_user est configuré, sinon Resend.
    """
    rendered_html    = render_template(html_body, variables)
    rendered_subject = render_template(subject, variables)
    plain_text       = build_plain_text(rendered_html)
    rendered_html, plain_text = _add_unsub_block(rendered_html, plain_text, to_email)

    if settings.smtp_user and settings.smtp_pass:
        return _send_via_smtp(to_email, rendered_subject, rendered_html, plain_text)

    if not settings.resend_api_key:
        raise ValueError("Configurez SMTP_USER/SMTP_PASS ou RESEND_API_KEY dans .env")
    if not settings.email_from_address:
        raise ValueError("EMAIL_FROM_ADDRESS non configuré dans .env")

    return _send_via_resend(to_email, rendered_subject, rendered_html, plain_text)
