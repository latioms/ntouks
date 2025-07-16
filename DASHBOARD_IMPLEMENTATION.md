# 🚗 NTOUKS - Plateforme d'Assistance Routière

## 🌟 Fonctionnalités Implémentées

### 🔐 Système d'Authentification
- ✅ Inscription et connexion utilisateur
- ✅ Gestion des rôles (Admin, Gestionnaire de station, Mécanicien)
- ✅ Redirection automatique selon le rôle
- ✅ Sessions sécurisées

### 📱 Interface Automobiliste (Public)
- ✅ **Page de demande d'assistance** (`/assist`)
  - Formulaire complet de signalement de panne
  - Géolocalisation GPS automatique
  - Types de pannes prédéfinis
  - Niveaux d'urgence
  - Informations véhicule optionnelles

- ✅ **Page de suivi** (`/track`)
  - Suivi des demandes par numéro de téléphone
  - Progression en temps réel
  - Informations sur le mécanicien assigné
  - Contact de la station responsable

### 🏢 Dashboard Gestionnaire de Station
- ✅ **Vue d'ensemble statistiques**
  - Nombre de demandes (en attente, assignées, terminées)
  - État de l'équipe (mécaniciens disponibles/occupés)
  - Métriques de performance
  - Taux de completion

- ✅ **Gestion des demandes**
  - Liste des demandes d'assistance
  - Assignation de mécaniciens
  - Filtrage par statut et urgence
  - Mise à jour des statuts

- ✅ **Gestion des mécaniciens**
  - Liste de l'équipe
  - Modification du statut (disponible/occupé)
  - Affichage des spécialités
  - Informations de contact

- ✅ **Rapports et Analytics**
  - Répartition des demandes par statut
  - Types de pannes les plus fréquents
  - Performance des mécaniciens
  - Évolution temporelle
  - Calculs de revenus

### 👑 Dashboard Administrateur
- ✅ **Statistiques plateforme globales**
  - Nombre total de stations/mécaniciens
  - Vue d'ensemble des demandes
  - Revenus générés
  - Utilisateurs de la plateforme

- ✅ **Gestion multi-stations**
  - Accès à toutes les données
  - Vue globale des opérations
  - Métriques consolidées

## 🛠 APIs Implémentées

### APIs Publiques
```
POST   /api/request              - Créer une demande d'assistance
GET    /api/request?phone=xxx    - Suivre ses demandes
GET    /api/stations/nearby      - Trouver stations proches
```

### APIs Gestionnaire/Admin
```
GET    /api/manager/mechanics    - Liste des mécaniciens
POST   /api/manager/mechanics    - Ajouter un mécanicien
PATCH  /api/manager/status       - Modifier statut mécanicien
GET    /api/manager/requests     - Liste des demandes
POST   /api/manager/assign       - Assigner mécanicien
PATCH  /api/manager/update-status - Modifier statut demande
GET    /api/manager/reports      - Rapports et analytics
```

### APIs Admin uniquement
```
GET    /api/admin/stats          - Statistiques plateforme
```

## 🚀 Démarrage Rapide

### 1. Installation
```bash
# Cloner le projet
git clone <repo>
cd ntouks

# Installer les dépendances
npm install
# ou
pnpm install
```

### 2. Configuration Base de Données
```bash
# Configurer les variables d'environnement
cp .env.example .env.local

# Lancer les migrations Prisma
npx prisma migrate dev

# Générer le client Prisma
npx prisma generate

# (Optionnel) Seed initial
npx prisma db seed
```

### 3. Démarrage
```bash
# Démarrer le serveur de développement
npm run dev

# L'application sera accessible sur http://localhost:3000
```

### 4. Test des APIs
```bash
# Tester les APIs publiques
node test-apis.js
```

## 📋 Guide d'Utilisation

### Pour les Automobilistes
1. **Signaler une panne** : Aller sur `/assist`
2. **Suivre sa demande** : Aller sur `/track` avec son numéro

### Pour les Gestionnaires
1. **Se connecter** : Aller sur `/login`
2. **Accéder au dashboard** : `/dashboard`
3. **Naviguer** entre les sections via les onglets

### Pour les Administrateurs
1. **Se connecter** avec un compte admin
2. **Accéder aux statistiques globales**
3. **Gérer toutes les stations**

## 🏗 Architecture Technique

### Frontend
- **Next.js 15** avec App Router
- **TypeScript** pour la sécurité des types
- **Tailwind CSS** + **shadcn/ui** pour l'interface
- **Zustand** pour la gestion d'état

### Backend
- **Next.js API Routes** pour les endpoints
- **Prisma** comme ORM
- **PostgreSQL** en base de données
- **Better-Auth** pour l'authentification

### Fonctionnalités Avancées
- **Géolocalisation** GPS native
- **Temps réel** pour les mises à jour
- **Responsive design** mobile-first
- **Système de permissions** granulaire
- **Analytics** intégrés

## 🔧 Hooks et Utilitaires

### Hooks Métier
- `useManagerStats()` - Statistiques gestionnaire
- `useManagerRequests()` - Gestion des demandes
- `useManagerMechanics()` - Gestion des mécaniciens
- `useManagerPermissions()` - Permissions utilisateur
- `useAuth()` - État d'authentification

### Composants Réutilisables
- `CompactRoleDisplay` - Affichage du rôle
- `StatsOverview` - Vue d'ensemble statistiques
- `RequestsManager` - Gestion des demandes
- `MechanicsManager` - Gestion des mécaniciens
- `ReportsManager` - Rapports et analytics

## 📊 Base de Données

### Modèles Principaux
- `User` - Utilisateurs de la plateforme
- `Role` - Rôles et permissions
- `Station` - Stations de service
- `Mechanic` - Mécaniciens
- `Request` - Demandes d'assistance
- `Invoice` - Factures

### Relations
- User ↔ Role (many-to-one)
- User ↔ Mechanic (one-to-one)
- Station ↔ Mechanic (one-to-many)
- Request ↔ Mechanic (many-to-one)
- Request ↔ Station (many-to-one)

## 🎯 Prochaines Étapes

### Fonctionnalités à Ajouter
- [ ] Notifications en temps réel (WebSocket)
- [ ] Chat entre client et mécanicien
- [ ] Système de paiement intégré
- [ ] Application mobile (React Native)
- [ ] GPS tracking en temps réel
- [ ] Système de notation
- [ ] Multi-langues (FR/EN)

### Améliorations Techniques
- [ ] Tests automatisés (Jest, Cypress)
- [ ] CI/CD Pipeline
- [ ] Monitoring et alertes
- [ ] Optimisation performances
- [ ] PWA pour mobile
- [ ] Cache Redis
- [ ] Backup automatique

## 🐛 Debugging

### Logs Utiles
```bash
# Logs du serveur
npm run dev

# Logs Prisma
npx prisma studio

# Vérifier la base
npx prisma db push
```

### Problèmes Courants
1. **Erreur Prisma Client** : `npx prisma generate`
2. **Migration échouée** : `npx prisma migrate reset`
3. **Types manquants** : Redémarrer TypeScript

## 📞 Support

Pour toute question ou problème :
1. Vérifier les logs du serveur
2. Consulter la documentation Prisma
3. Tester les APIs avec `test-apis.js`
4. Vérifier les permissions utilisateur

---

**🚀 Votre plateforme d'assistance routière est maintenant opérationnelle !**
