# 🎯 Système d'Assignement de Rôles - NTouks

## Vue d'ensemble

Le système d'assignement de rôles de NTouks garantit que chaque utilisateur inscrit doit choisir un rôle avant d'accéder aux fonctionnalités principales de l'application.

## 🔄 Flux d'Onboarding Automatique

```
1. Utilisateur s'inscrit
   ↓
2. Première connexion
   ↓  
3. Middleware détecte l'absence de rôle
   ↓
4. Redirection automatique vers /select-role
   ↓
5. Utilisateur choisit son rôle
   ↓
6. Rôle assigné en base de données
   ↓
7. Redirection vers le dashboard approprié
```

## 🛡️ Rôles Disponibles

### 1. **Admin** (`admin`)
- **Description** : Administrateur système avec tous les droits
- **Redirection** : `/admin/dashboard`
- **Permissions** : Accès total à la plateforme

### 2. **Gestionnaire de Station** (`station-manager`)
- **Description** : Gestionnaire de station de service
- **Redirection** : `/create-station`
- **Permissions** : Gestion d'une station et de ses mécaniciens

### 3. **Mécanicien** (`mechanic`)
- **Description** : Mécanicien intervenant
- **Redirection** : `/select-station`
- **Permissions** : Réponse aux demandes d'intervention

## 📁 Structure du Système

### Actions (Server-side)
- `app/actions/users/manageRoles.ts` - Fonctions de gestion des rôles
- `lib/roles-client.ts` - Utilitaires côté client
- `hooks/use-auth.ts` - Hook pour l'authentification
- `hooks/use-user-role.ts` - Hook pour la gestion des rôles

### API Routes
- `POST /api/roles/assign` - Assigner un rôle à un utilisateur
- `GET /api/roles` - Récupérer tous les rôles disponibles
- `GET /api/user/role` - Récupérer le rôle de l'utilisateur connecté
- `POST /api/roles/initialize` - Initialiser les rôles par défaut

### Composants
- `components/auth/role-check-wrapper.tsx` - Vérification globale des rôles
- `components/auth/role-redirect-wrapper.tsx` - Redirection selon le statut
- `components/admin/role-management.tsx` - Interface admin pour gérer les rôles
- `components/profile/onboarding-status.tsx` - Statut du profil utilisateur

### Middleware
- `middleware.ts` - Protection des routes et redirection automatique

## 🚀 Utilisation

### Installation et Configuration

1. **Initialiser les rôles par défaut** (une seule fois) :
   ```bash
   npm run init:roles
   ```

2. **Tester le système** :
   ```bash
   npm run test:roles
   ```

3. **Démarrer l'application** :
   ```bash
   npm run dev
   ```

### Utilisation Programmatique

#### Assigner un rôle côté client
```typescript
import { assignCurrentUserRole } from "@/lib/roles-client";

// Assigner le rôle "mechanic" à l'utilisateur connecté
await assignCurrentUserRole("mechanic");
```

#### Vérifier les permissions
```typescript
import { useUserRole } from "@/hooks/use-user-role";

function MyComponent() {
  const { checkRole, checkPermission, isAdmin } = useUserRole();
  
  if (isAdmin()) {
    // Afficher l'interface admin
  }
  
  if (checkRole("mechanic")) {
    // Afficher l'interface mécanicien
  }
}
```

#### Utiliser le hook d'authentification
```typescript
import { useAuth } from "@/hooks/use-auth";

function MyComponent() {
  const { user, needsOnboarding, hasRole } = useAuth();
  
  if (needsOnboarding) {
    // Utilisateur doit choisir un rôle
    return <RoleSelectionPrompt />;
  }
}
```

## 🔒 Sécurité

### Protection des Routes
Le middleware vérifie automatiquement :
- ✅ Authentification de l'utilisateur
- ✅ Présence d'un rôle assigné
- ✅ Permissions pour accéder aux routes spécifiques

### Routes Protégées
- `/dashboard` - Nécessite un rôle assigné
- `/admin/*` - Nécessite le rôle admin
- `/create-station` - Nécessite le rôle station-manager
- `/select-station` - Nécessite le rôle mechanic

### Routes Publiques
- `/` - Page d'accueil
- `/login` - Connexion
- `/register` - Inscription
- `/select-role` - Sélection de rôle (utilisateurs connectés sans rôle)

## 🎨 Interface Utilisateur

### Page de Sélection de Rôle (`/select-role`)
- Message de bienvenue personnalisé
- Cards interactives pour chaque rôle
- Description des fonctionnalités de chaque rôle
- Feedback visuel et notifications
- Redirection automatique après sélection

### Composant de Statut d'Onboarding
- Affichage du profil utilisateur
- Statut du rôle (assigné/non assigné)
- Actions pour compléter l'onboarding
- Indicateurs visuels de progression

## 📊 Base de Données

### Tables Principales
- `users` - Utilisateurs avec référence au rôle
- `roles` - Définition des rôles
- `permissions` - Permissions disponibles
- `role_permissions` - Association rôles-permissions

### Exemple de Données
```sql
-- Rôles créés automatiquement
INSERT INTO roles (name, description) VALUES 
('admin', 'Administrateur avec tous les droits'),
('station-manager', 'Gestionnaire de station de service'),
('mechanic', 'Mécanicien intervenant');
```

## 🐛 Dépannage

### Problèmes Courants

1. **Utilisateur bloqué en boucle de redirection**
   - Vérifier que les rôles sont initialisés : `npm run test:roles`
   - Vérifier la base de données

2. **Erreur "Rôle non trouvé"**
   - Réinitialiser les rôles : `npm run init:roles`

3. **Middleware ne fonctionne pas**
   - Vérifier la configuration dans `middleware.ts`
   - Vérifier les cookies de session

### Logs et Debugging
- Les redirections sont loggées dans la console
- Utiliser les DevTools pour vérifier les cookies de session
- Vérifier les erreurs dans la console du navigateur

## 🔄 Évolutions Futures

### Fonctionnalités à Ajouter
- [ ] Système de permissions granulaires
- [ ] Changement de rôle par l'utilisateur
- [ ] Rôles temporaires ou limités dans le temps
- [ ] Audit des changements de rôles
- [ ] Interface admin pour créer de nouveaux rôles

### Améliorations
- [ ] Cache des rôles côté client
- [ ] Optimisation des requêtes de vérification
- [ ] Tests automatisés
- [ ] Documentation API complète

---

## 📞 Support

Pour toute question ou problème avec le système d'assignement de rôles, consulter :
1. Cette documentation
2. Les logs de l'application
3. Les tests automatiques : `npm run test:roles`
