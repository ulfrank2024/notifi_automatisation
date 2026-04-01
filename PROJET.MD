DOSSIER TECHNIQUE : PLATEFORME D'AUTOMATISATION "NOTIF-FLOW"
SECTION 1 : INTRODUCTION
1. VISION DU PROJET
L'objectif principal est l'élimination de la saisie manuelle et de l'envoi individuel de messages de suivi. La plateforme permettra d'importer des fichiers bruts et de déclencher des campagnes de notification massives et personnalisées (Email/SMS) en quelques secondes.

2. ARCHITECTURE TECHNIQUE
La solution repose sur une stack technologique robuste et évolutive :

Traitement de données : Python (Pandas) pour un parsing précis des fichiers Excel, CSV et TXT.

Base de données : Supabase (PostgreSQL) pour un stockage sécurisé et performant.

Interface Utilisateur : React.js pour un tableau de bord (Dashboard) fluide et réactif.

API : FastAPI pour l'interconnexion future avec les systèmes de la compagnie partenaire.

SECTION 2 : FONCTIONNALITÉS DU DASHBOARD
Module d'Importation Multi-Format :

Support natif des fichiers Excel (.xlsx), CSV et TXT.

Mapping Intelligent : Interface permettant de lier les colonnes du fichier (Email, Téléphone, Numéro de commande) aux champs de l'application sans modifier le fichier source.

Gestionnaire de Statuts en Temps Réel :

Visualisation claire du flux : 🔵 En attente | 🟡 En cours | 🟢 Envoyé | 🔴 Erreur.

Possibilité de corriger manuellement une erreur (ex: email mal orthographié) directement depuis l'interface.

Module de Notification Générale :
JALON 1 : Moteur d'Analyse et Gestion des Données (500 $)
Objectif : Mise en place de l'intelligence de traitement et du stockage.

Moteur Python (Multi-format) : Développement de l'algorithme capable de lire et nettoyer les fichiers Excel (.xlsx), CSV et TXT.

Infrastructure Supabase : Création de la base de données sécurisée et de la logique de stockage des commandes.

Interface Dashboard (V1) : Module de téléchargement de fichiers et tableau de visualisation des données importées.

Mapping Intelligent : Interface permettant au client de lier les colonnes du fichier aux champs de l'application.

JALON 2 : Expédition, Notifications et Connectivité (500 $)
Objectif : Activation des communications et automatisation externe.

Passerelle de Communication : Intégration des API d'envoi (Email & SMS) avec gestion des modèles de messages personnalisés.

Console de Suivi en Temps Réel : Système de statuts dynamiques (En attente, Envoyé, Erreur).

Module de Notification Générale : Fonctionnalité d'envoi groupé pour les annonces exceptionnelles.

Architecture API "Compagnie" : Mise en place du point d'entrée (Endpoint) sécurisé pour l'automatisation future avec les programmeurs de la compagnie partenaire.