"""
Templates d'emails et SMS pré-définis — FR et EN.
Variables disponibles : {{ prenom }}, {{ nom }}, {{ num_commande }}, {{ email }}, {{ telephone }}
"""

TEMPLATES = [
    {
        "id":       "order_confirm_fr",
        "name":     "Confirmation de commande",
        "lang":     "fr",
        "subject":  "Votre commande {{ num_commande }} est confirmée ✅",
        "sms":      "Bonjour {{ prenom }}, votre commande {{ num_commande }} est confirmée. Merci pour votre achat !",
        "email":    """\
<!DOCTYPE html>
<html lang="fr">
<head><meta charset="UTF-8"><meta name="viewport" content="width=device-width, initial-scale=1.0"></head>
<body style="margin:0;padding:0;background-color:#f0f0f0;font-family:Arial,Helvetica,sans-serif;">
<table width="100%" cellpadding="0" cellspacing="0" bgcolor="#f0f0f0">
  <tr><td align="center" style="padding:32px 16px;">

    <table width="600" cellpadding="0" cellspacing="0" style="max-width:600px;width:100%;border-radius:12px;overflow:hidden;box-shadow:0 4px 24px rgba(0,0,0,0.12);">

      <!-- HEADER -->
      <tr>
        <td align="center" bgcolor="#0a0a0a" style="padding:32px 24px;">
          <p style="margin:0;font-size:11px;color:#888;letter-spacing:2px;text-transform:uppercase;">Notification officielle</p>
          <h1 style="margin:8px 0 0;font-size:26px;font-weight:900;color:#d4a017;letter-spacing:1px;">NOTIF-FLOW</h1>
        </td>
      </tr>

      <!-- BADGE STATUT -->
      <tr>
        <td align="center" bgcolor="#0d1a0a" style="padding:20px 24px 16px;">
          <table cellpadding="0" cellspacing="0">
            <tr>
              <td align="center" bgcolor="#166534" style="border-radius:30px;padding:8px 24px;">
                <span style="color:#4ade80;font-size:14px;font-weight:700;">✅ &nbsp;Commande confirmée</span>
              </td>
            </tr>
          </table>
        </td>
      </tr>

      <!-- CORPS -->
      <tr>
        <td bgcolor="#ffffff" style="padding:32px 40px;">
          <p style="margin:0 0 16px;font-size:18px;font-weight:700;color:#1a1a1a;">
            Bonjour {% if prenom %}{{ prenom }}{% if nom %} {{ nom }}{% endif %}{% else %}{% endif %},
          </p>
          <p style="margin:0 0 24px;font-size:15px;color:#444;line-height:1.7;">
            Nous avons bien reçu votre commande et elle est en cours de traitement. Voici le récapitulatif :
          </p>

          <!-- BLOC COMMANDE -->
          <table width="100%" cellpadding="0" cellspacing="0" style="background:#f8f8f8;border-radius:8px;border:1px solid #e5e5e5;">
            <tr>
              <td style="padding:20px 24px;">
                <table width="100%" cellpadding="0" cellspacing="0">
                  <tr>
                    <td style="padding:6px 0;font-size:13px;color:#888;">Numéro de commande</td>
                    <td align="right" style="padding:6px 0;font-size:14px;font-weight:700;color:#1a1a1a;">{{ num_commande }}</td>
                  </tr>
                  <tr><td colspan="2" style="border-top:1px solid #e5e5e5;padding:0;"></td></tr>
                  <tr>
                    <td style="padding:6px 0;font-size:13px;color:#888;">Client</td>
                    <td align="right" style="padding:6px 0;font-size:14px;color:#1a1a1a;">{{ prenom }} {{ nom }}</td>
                  </tr>
                  <tr><td colspan="2" style="border-top:1px solid #e5e5e5;padding:0;"></td></tr>
                  <tr>
                    <td style="padding:6px 0;font-size:13px;color:#888;">Email</td>
                    <td align="right" style="padding:6px 0;font-size:13px;color:#666;">{{ email }}</td>
                  </tr>
                </table>
              </td>
            </tr>
          </table>

          <p style="margin:28px 0 0;font-size:14px;color:#555;line-height:1.7;">
            Notre équipe traite votre commande dans les meilleurs délais. Vous recevrez une notification dès qu'elle sera expédiée.
          </p>
          <p style="margin:16px 0 0;font-size:14px;color:#555;">
            Merci pour votre confiance,<br>
            <strong style="color:#1a1a1a;">L'équipe</strong>
          </p>
        </td>
      </tr>

      <!-- FOOTER -->
      <tr>
        <td align="center" bgcolor="#0a0a0a" style="padding:20px 24px;">
          <p style="margin:0;font-size:12px;color:#555;line-height:1.8;">
            Vous recevez cet email car vous avez passé une commande.<br>
            <a href="#" style="color:#d4a017;text-decoration:none;">Se désinscrire</a>
          </p>
        </td>
      </tr>

    </table>
  </td></tr>
</table>
</body>
</html>""",
    },

    {
        "id":       "order_confirm_en",
        "name":     "Order Confirmation",
        "lang":     "en",
        "subject":  "Your order {{ num_commande }} is confirmed ✅",
        "sms":      "Hi {{ prenom }}, your order {{ num_commande }} is confirmed. Thank you for your purchase!",
        "email":    """\
<!DOCTYPE html>
<html lang="en">
<head><meta charset="UTF-8"><meta name="viewport" content="width=device-width, initial-scale=1.0"></head>
<body style="margin:0;padding:0;background-color:#f0f0f0;font-family:Arial,Helvetica,sans-serif;">
<table width="100%" cellpadding="0" cellspacing="0" bgcolor="#f0f0f0">
  <tr><td align="center" style="padding:32px 16px;">

    <table width="600" cellpadding="0" cellspacing="0" style="max-width:600px;width:100%;border-radius:12px;overflow:hidden;box-shadow:0 4px 24px rgba(0,0,0,0.12);">

      <!-- HEADER -->
      <tr>
        <td align="center" bgcolor="#0a0a0a" style="padding:32px 24px;">
          <p style="margin:0;font-size:11px;color:#888;letter-spacing:2px;text-transform:uppercase;">Official Notification</p>
          <h1 style="margin:8px 0 0;font-size:26px;font-weight:900;color:#d4a017;letter-spacing:1px;">NOTIF-FLOW</h1>
        </td>
      </tr>

      <!-- STATUS BADGE -->
      <tr>
        <td align="center" bgcolor="#0d1a0a" style="padding:20px 24px 16px;">
          <table cellpadding="0" cellspacing="0">
            <tr>
              <td align="center" bgcolor="#166534" style="border-radius:30px;padding:8px 24px;">
                <span style="color:#4ade80;font-size:14px;font-weight:700;">✅ &nbsp;Order Confirmed</span>
              </td>
            </tr>
          </table>
        </td>
      </tr>

      <!-- BODY -->
      <tr>
        <td bgcolor="#ffffff" style="padding:32px 40px;">
          <p style="margin:0 0 16px;font-size:18px;font-weight:700;color:#1a1a1a;">
            Hello {% if prenom %}{{ prenom }}{% if nom %} {{ nom }}{% endif %}{% endif %},
          </p>
          <p style="margin:0 0 24px;font-size:15px;color:#444;line-height:1.7;">
            We have received your order and it is currently being processed. Here is your summary:
          </p>

          <!-- ORDER BLOCK -->
          <table width="100%" cellpadding="0" cellspacing="0" style="background:#f8f8f8;border-radius:8px;border:1px solid #e5e5e5;">
            <tr>
              <td style="padding:20px 24px;">
                <table width="100%" cellpadding="0" cellspacing="0">
                  <tr>
                    <td style="padding:6px 0;font-size:13px;color:#888;">Order Number</td>
                    <td align="right" style="padding:6px 0;font-size:14px;font-weight:700;color:#1a1a1a;">{{ num_commande }}</td>
                  </tr>
                  <tr><td colspan="2" style="border-top:1px solid #e5e5e5;padding:0;"></td></tr>
                  <tr>
                    <td style="padding:6px 0;font-size:13px;color:#888;">Customer</td>
                    <td align="right" style="padding:6px 0;font-size:14px;color:#1a1a1a;">{{ prenom }} {{ nom }}</td>
                  </tr>
                  <tr><td colspan="2" style="border-top:1px solid #e5e5e5;padding:0;"></td></tr>
                  <tr>
                    <td style="padding:6px 0;font-size:13px;color:#888;">Email</td>
                    <td align="right" style="padding:6px 0;font-size:13px;color:#666;">{{ email }}</td>
                  </tr>
                </table>
              </td>
            </tr>
          </table>

          <p style="margin:28px 0 0;font-size:14px;color:#555;line-height:1.7;">
            Our team is processing your order as quickly as possible. You will receive a notification once it has been shipped.
          </p>
          <p style="margin:16px 0 0;font-size:14px;color:#555;">
            Thank you for your trust,<br>
            <strong style="color:#1a1a1a;">The Team</strong>
          </p>
        </td>
      </tr>

      <!-- FOOTER -->
      <tr>
        <td align="center" bgcolor="#0a0a0a" style="padding:20px 24px;">
          <p style="margin:0;font-size:12px;color:#555;line-height:1.8;">
            You received this email because you placed an order.<br>
            <a href="#" style="color:#d4a017;text-decoration:none;">Unsubscribe</a>
          </p>
        </td>
      </tr>

    </table>
  </td></tr>
</table>
</body>
</html>""",
    },

    {
        "id":       "shipping_fr",
        "name":     "Avis d'expédition",
        "lang":     "fr",
        "subject":  "Votre commande {{ num_commande }} a été expédiée 🚚",
        "sms":      "Bonjour {{ prenom }}, votre commande {{ num_commande }} a été expédiée ! Vous la recevrez sous 2-5 jours ouvrés.",
        "email":    """\
<!DOCTYPE html>
<html lang="fr">
<head><meta charset="UTF-8"></head>
<body style="margin:0;padding:0;background:#f0f0f0;font-family:Arial,sans-serif;">
<table width="100%" cellpadding="0" cellspacing="0" bgcolor="#f0f0f0">
  <tr><td align="center" style="padding:32px 16px;">
    <table width="600" cellpadding="0" cellspacing="0" style="max-width:600px;width:100%;border-radius:12px;overflow:hidden;box-shadow:0 4px 24px rgba(0,0,0,.12);">
      <tr><td align="center" bgcolor="#0a0a0a" style="padding:32px 24px;">
        <p style="margin:0;font-size:11px;color:#888;letter-spacing:2px;text-transform:uppercase;">Notification de livraison</p>
        <h1 style="margin:8px 0 0;font-size:26px;font-weight:900;color:#d4a017;">NOTIF-FLOW</h1>
      </td></tr>
      <tr><td align="center" style="background:#0a1a2a;padding:20px 24px 16px;">
        <table cellpadding="0" cellspacing="0"><tr>
          <td align="center" style="background:#1e40af;border-radius:30px;padding:8px 24px;">
            <span style="color:#93c5fd;font-size:14px;font-weight:700;">🚚 &nbsp;Commande expédiée</span>
          </td>
        </tr></table>
      </td></tr>
      <tr><td bgcolor="#ffffff" style="padding:32px 40px;">
        <p style="margin:0 0 16px;font-size:18px;font-weight:700;color:#1a1a1a;">Bonjour {{ prenom }} {{ nom }},</p>
        <p style="margin:0 0 24px;font-size:15px;color:#444;line-height:1.7;">
          Bonne nouvelle ! Votre commande <strong>{{ num_commande }}</strong> vient d'être expédiée et est en route vers vous.
        </p>
        <p style="margin:0 0 24px;font-size:14px;color:#555;line-height:1.7;">
          Délai de livraison estimé : <strong>2 à 5 jours ouvrés</strong>.
        </p>
        <p style="margin:0;font-size:14px;color:#555;">Merci pour votre confiance,<br><strong style="color:#1a1a1a;">L'équipe</strong></p>
      </td></tr>
      <tr><td align="center" bgcolor="#0a0a0a" style="padding:20px 24px;">
        <p style="margin:0;font-size:12px;color:#555;">
          <a href="#" style="color:#d4a017;text-decoration:none;">Se désinscrire</a>
        </p>
      </td></tr>
    </table>
  </td></tr>
</table>
</body></html>""",
    },

    {
        "id":       "shipping_en",
        "name":     "Shipping Notice",
        "lang":     "en",
        "subject":  "Your order {{ num_commande }} has been shipped 🚚",
        "sms":      "Hi {{ prenom }}, your order {{ num_commande }} has been shipped! Expected delivery: 2-5 business days.",
        "email":    """\
<!DOCTYPE html>
<html lang="en">
<head><meta charset="UTF-8"></head>
<body style="margin:0;padding:0;background:#f0f0f0;font-family:Arial,sans-serif;">
<table width="100%" cellpadding="0" cellspacing="0" bgcolor="#f0f0f0">
  <tr><td align="center" style="padding:32px 16px;">
    <table width="600" cellpadding="0" cellspacing="0" style="max-width:600px;width:100%;border-radius:12px;overflow:hidden;box-shadow:0 4px 24px rgba(0,0,0,.12);">
      <tr><td align="center" bgcolor="#0a0a0a" style="padding:32px 24px;">
        <p style="margin:0;font-size:11px;color:#888;letter-spacing:2px;text-transform:uppercase;">Delivery Notification</p>
        <h1 style="margin:8px 0 0;font-size:26px;font-weight:900;color:#d4a017;">NOTIF-FLOW</h1>
      </td></tr>
      <tr><td align="center" style="background:#0a1a2a;padding:20px 24px 16px;">
        <table cellpadding="0" cellspacing="0"><tr>
          <td align="center" style="background:#1e40af;border-radius:30px;padding:8px 24px;">
            <span style="color:#93c5fd;font-size:14px;font-weight:700;">🚚 &nbsp;Order Shipped</span>
          </td>
        </tr></table>
      </td></tr>
      <tr><td bgcolor="#ffffff" style="padding:32px 40px;">
        <p style="margin:0 0 16px;font-size:18px;font-weight:700;color:#1a1a1a;">Hello {{ prenom }} {{ nom }},</p>
        <p style="margin:0 0 24px;font-size:15px;color:#444;line-height:1.7;">
          Great news! Your order <strong>{{ num_commande }}</strong> has just been shipped and is on its way to you.
        </p>
        <p style="margin:0 0 24px;font-size:14px;color:#555;line-height:1.7;">
          Estimated delivery: <strong>2 to 5 business days</strong>.
        </p>
        <p style="margin:0;font-size:14px;color:#555;">Thank you for your trust,<br><strong style="color:#1a1a1a;">The Team</strong></p>
      </td></tr>
      <tr><td align="center" bgcolor="#0a0a0a" style="padding:20px 24px;">
        <p style="margin:0;font-size:12px;color:#555;">
          <a href="#" style="color:#d4a017;text-decoration:none;">Unsubscribe</a>
        </p>
      </td></tr>
    </table>
  </td></tr>
</table>
</body></html>""",
    },
]


def get_template(template_id: str) -> dict | None:
    return next((t for t in TEMPLATES if t["id"] == template_id), None)


def get_all_templates() -> list[dict]:
    """Retourne tous les templates avec le HTML complet (utilisé par le frontend pour l'aperçu)."""
    return TEMPLATES
