# Système Multi-Dashboard NTouks

## Vue d'ensemble

Le système a été mis à jour pour supporter plusieurs types de tableaux de bord selon les rôles des utilisateurs, avec un processus d'inscription en plusieurs étapes.

## Nouveaux Rôles

1. **Administrateur** - Gestion complète de la plateforme
2. **Gestionnaire de Station** - Gestion d'une station spécifique
3. **Mécanicien** - Intervention sur les demandes
4. **Utilisateur** - Création de demandes d'assistance

## Processus d'Inscription Multi-Étapes

### Étape 1: Inscription initiale
- L'utilisateur s'inscrit normalement avec email/mot de passe
- Redirection automatique vers la sélection de rôle

### Étape 2: Sélection du rôle
- Page `/select-role` avec choix du rôle
- Interface avec cartes descriptives pour chaque rôle

### Étape 3: Configuration spécifique selon le rôle

#### Pour Gestionnaire de Station
- Redirection vers `/create-station`
- Formulaire de création de station avec :
  - Nom de la station
  - Adresse
  - Coordonnées GPS (optionnel)
  - Téléphone
  - Email (optionnel)
- Redirection vers `/station/dashboard` après création

#### Pour Mécanicien
- Redirection vers `/select-station`
- Liste des stations disponibles avec :
  - Informations de la station
  - Nombre de mécaniciens
  - Distance (si géolocalisation activée)
- Redirection vers `/dashboard` après sélection

#### Pour Administrateur
- Redirection directe vers `/admin/dashboard`

## Nouveaux Tableaux de Bord

### Dashboard Gestionnaire (`/station/dashboard`)
- Statistiques de la station
- Gestion des mécaniciens
- Suivi des demandes d'intervention
- Rapports de performance

### Dashboard Mécanicien (`/mecano/dashboard`)
- Demandes d'intervention assignées
- Gestion de la disponibilité
- Historique des interventions

### Dashboard Administrateur (`/admin/dashboard`)
- Vue d'ensemble de toute la plateforme
- Gestion des stations
- Gestion des utilisateurs
- Analytics globales

## Nouveaux Composants Créés

### Pages
- `/app/(auth)/select-role/page.tsx` - Sélection de rôle
- `/app/(auth)/create-station/page.tsx` - Création de station
- `/app/(auth)/select-station/page.tsx` - Sélection de station
- `/app/(station)/dashboard/page.tsx` - Dashboard gestionnaire
- `/app/admin/dashboard/page.tsx` - Dashboard administrateur

### Actions
- `/app/actions/stations/manageStations.ts` - Gestion des stations
- `/app/actions/users/manageRoles.ts` - Gestion des rôles
- `/app/actions/mecano/joinStation.ts` - Adhésion à une station

### Infrastructure
- `/lib/db.ts` - Configuration Prisma
- `/middleware-new.ts` - Middleware de routage (à finaliser)

## Base de Données

Le schéma Prisma existant support déjà:
- Modèle `Role` avec permissions
- Modèle `Station` 
- Modèle `Mechanic` lié aux users et stations
- Relations appropriées entre les entités

## À Implémenter

### Actions Backend (Stubs créés)
1. **Gestion des stations**
   - `createStation()` - Créer une nouvelle station
   - `getAllStations()` - Récupérer toutes les stations
   - `updateStation()` - Modifier une station

2. **Gestion des rôles**
   - `updateUserRole()` - Assigner un rôle à un utilisateur
   - `getUserRole()` - Récupérer le rôle d'un utilisateur

3. **Mécaniciens**
   - `joinStation()` - Rejoindre une station
   - `getMechanicInfo()` - Informations du mécanicien
   - `updateMechanicAvailability()` - Gérer la disponibilité

### Middleware de sécurité
- Vérification des sessions
- Contrôle d'accès basé sur les rôles
- Redirection automatique selon les permissions

### Interface utilisateur
- Finaliser les dashboards spécifiques
- Ajouter les fonctionnalités de gestion
- Implémenter les formulaires d'action

## Flux Utilisateur

1. **Inscription** → **Sélection de rôle** → **Configuration spécifique** → **Dashboard**

2. **Gestionnaire**: Inscription → Rôle → Créer station → Dashboard station

3. **Mécanicien**: Inscription → Rôle → Choisir station → Dashboard mécanicien

4. **Admin**: Inscription → Rôle → Dashboard admin

## Points d'Amélioration Future

1. Notifications en temps réel
2. Géolocalisation avancée
3. Système de rating/évaluation
4. Chat intégré
5. Paiements en ligne
6. API mobile

## Structure des Permissions

- **Admins**: Accès complet
- **Gestionnaires**: Gestion de leur station uniquement
- **Mécaniciens**: Interventions et profil
- **Utilisateurs**: Demandes d'assistance uniquement
