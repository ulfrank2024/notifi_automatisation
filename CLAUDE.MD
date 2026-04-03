> **RÈGLE ABSOLUE** : Toute nouvelle fonctionnalité ou modification importante développée
> doit être enregistrée dans ce fichier avant de passer à la suite.
> Toujours déployer sur GitHub l'avance avec une bonne description de déploiement.

---

# NOTIF-FLOW — Plateforme d'Automatisation de Notifications

## VISION
Éliminer la saisie manuelle et l'envoi individuel de messages de suivi. La plateforme importe des fichiers bruts et déclenche des campagnes de notification massives et personnalisées (Email/SMS) en quelques secondes.

---

## STACK TECHNIQUE

| Couche | Technologie |
|--------|-------------|
| Traitement de données | Python (Pandas) — parsing Excel/CSV/TXT |
| Base de données | Supabase (PostgreSQL) |
| Interface Utilisateur | React.js (Dashboard) |
| API | FastAPI |

---

## DESIGN SYSTEM

- **Fond** : Noir et Gris sombre
- **Accents** : Or clair, Or brun, Argent, Blanc
- **Approche UX** : "Effet Wahou" — transitions fluides, bannières animées, notifications dynamiques
- **Responsive** : Mobile First (Stack vertical) / Desktop Split-Screen
- **Spinners** : Systématiques sur tous les appels API
- **Modales** : Obligatoires pour confirmations, erreurs et succès API

---

## ARCHITECTURE BACKEND

Le backend est découpé en **micro-services indépendants** exposés via un **API Gateway** unique.

---

## FEUILLE DE ROUTE

### JALON 1 — Moteur d'Analyse et Gestion des Données (500 $)
**Objectif : Mise en place de l'intelligence de traitement et du stockage.**

- [x] **Moteur Python multi-format** : `backend/services/parser.py` — lecture et nettoyage `.xlsx`, `.csv`, `.txt`
- [x] **Infrastructure Supabase** : `supabase/schema.sql` — tables `campaigns` + `orders` avec statuts et triggers
- [x] **Dashboard V1** : `frontend/src/pages/Dashboard.jsx` — upload + visualisation 3 étapes (Import → Mapping → Données)
- [x] **Mapping Intelligent** : `frontend/src/components/ColumnMapper.jsx` — liaison colonnes ↔ champs application

---

### JALON 2 — Expédition, Notifications et Connectivité (500 $)
**Objectif : Activation des communications et automatisation externe.**

- [x] **Passerelle Email** : `services/email_service.py` — Resend, multipart HTML+texte, SPF/DKIM, List-Unsubscribe, webhook bounces
- [x] **Passerelle SMS** : `services/sms_service.py` — Twilio, mention STOP auto, troncature 120 chars
- [x] **Envoi par batch** : `services/sender.py` — lots de 20, délai 2s, anti-spam
- [x] **Console de Suivi en Temps Réel** : polling 2s, statuts 🔵→🟡→🟢/🔴, barre de progression + logs
- [x] **Templates FR/EN** : 4 templates (confirmation commande + expédition × 2 langues), aperçu visuel
- [x] **Module de Notification Générale** : `POST /notifications/general` — envoi groupé
- [ ] **Architecture API "Compagnie"** : endpoint sécurisé pour automatisation future avec la compagnie partenaire

---

## FONCTIONNALITÉS DÉTAILLÉES

### Module d'Importation Multi-Format
- Support natif : `.xlsx`, `.csv`, `.txt`
- Mapping de colonnes sans modifier le fichier source (Email, Téléphone, Numéro de commande)

### Gestionnaire de Statuts
- Visualisation temps réel du flux de notifications
- Correction manuelle des erreurs (ex: email mal orthographié) directement depuis le Dashboard

---

## GIT & DÉPLOIEMENT

**Dépôt :** `https://github.com/ulfrank2024/notifi_automatisation.git`

```bash
# Initialisation (déjà effectuée)
git init
git branch -M main
git remote add origin https://github.com/ulfrank2024/notifi_automatisation.git
git push -u origin main
```

**Convention de commit :**
- `feat:` nouvelle fonctionnalité
- `fix:` correction de bug
- `chore:` infrastructure / config
- `docs:` documentation

---

## JOURNAL DES DÉVELOPPEMENTS

| Date | Fonctionnalité | Jalon | Statut |
|------|---------------|-------|--------|
| 2026-03-31 | Moteur Python multi-format (parser.py) | J1 | ✅ |
| 2026-03-31 | Schéma Supabase (campaigns + orders) | J1 | ✅ |
| 2026-03-31 | Dashboard V1 React — 3 étapes | J1 | ✅ |
| 2026-03-31 | Mapping Intelligent (ColumnMapper) | J1 | ✅ |
| 2026-03-31 | API FastAPI (upload preview + campaigns) | J1 | ✅ |
| 2026-04-01 | Dashboard stats + historique campagnes | J1+ | ✅ |
| 2026-04-01 | CRUD contacts (modifier, supprimer, historique) | J1+ | ✅ |
| 2026-04-01 | Sélection multiple + suppression en masse | J1+ | ✅ |
| 2026-04-01 | Authentification JWT + page login | J1+ | ✅ |
| 2026-04-02 | Responsive mobile (bottom nav, modals, tables) | J1+ | ✅ |
| 2026-04-02 | Passerelle Email Resend (anti-spam, multipart) | J2 | ✅ |
| 2026-04-02 | Passerelle SMS Twilio (STOP auto) | J2 | ✅ |
| 2026-04-02 | Console temps réel (polling 2s) | J2 | ✅ |
| 2026-04-03 | Templates FR/EN (confirmation + expédition) | J2 | ✅ |
| 2026-04-03 | Aperçu visuel des templates dans l'interface | J2 | ✅ |
| 2026-03-31 | Dashboard V1 React — 3 étapes | J1 | ✅ |
| 2026-03-31 | Mapping Intelligent (ColumnMapper) | J1 | ✅ |
| 2026-03-31 | API FastAPI (upload preview + campaigns) | J1 | ✅ |

> Ajouter chaque fonctionnalité livrée dans ce tableau avant de passer à la suivante.
