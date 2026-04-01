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

- [ ] **Passerelle de Communication** : intégration des API d'envoi Email & SMS + modèles de messages personnalisés
- [ ] **Console de Suivi en Temps Réel** : statuts dynamiques — 🔵 En attente | 🟡 En cours | 🟢 Envoyé | 🔴 Erreur
- [ ] **Module de Notification Générale** : envoi groupé pour annonces exceptionnelles
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

> Ajouter chaque fonctionnalité livrée dans ce tableau avant de passer à la suivante.
