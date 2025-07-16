# Guide d'affichage des rôles utilisateur

## Fonctionnalités ajoutées

### 1. Hook personnalisé `useUserRole`
- **Fichier**: `hooks/use-user-role-display.ts`
- **Fonction**: Récupère automatiquement le rôle de l'utilisateur connecté
- **Utilisation**: 
```tsx
const { role, loading, error } = useUserRole();
```

### 2. Badge de rôle dans la sidebar
- **Composant**: `UserRoleBadge`
- **Emplacement**: Dans le menu utilisateur (NavUser)
- **Affichage**: Icône + nom du rôle avec couleurs distinctives

### 3. Indicateur de rôle en en-tête de sidebar
- **Composant**: `SidebarRoleIndicator`
- **Emplacement**: Sous le logo Ntouks dans la sidebar
- **Fonctionnalité**: Se cache automatiquement quand la sidebar est réduite

### 4. Carte d'informations de rôle (optionnel)
- **Composant**: `UserRoleCard`
- **Usage**: Peut être ajouté au dashboard principal si nécessaire
- **Contenu**: Rôle + description + permissions

## Rôles supportés

1. **Administrateur** (`admin`)
   - Icône: Crown/Shield
   - Couleur: Rouge
   - Accès: Complet

2. **Gestionnaire Station** (`station-manager`)
   - Icône: Building2
   - Couleur: Bleue
   - Accès: Gestion de station

3. **Mécanicien** (`mechanic`)
   - Icône: Wrench
   - Couleur: Verte
   - Accès: Interventions

4. **Client** (`customer`)
   - Icône: User
   - Couleur: Grise
   - Accès: Standard

## Affichage des noms de rôles

Les noms techniques sont automatiquement traduits :
- `admin` → "Administrateur"
- `station-manager` → "Gestionnaire Station"
- `mechanic` → "Mécanicien"
- `customer` → "Client"

## Gestion des états

- **Chargement**: Spinner animé
- **Erreur**: Affichage masqué ou message d'erreur
- **Aucun rôle**: Redirection vers sélection de rôle

## Responsivité

- Sidebar réduite: Seules les icônes sont visibles
- Mobile: Dropdown adaptatif
- Desktop: Affichage complet

## Performance

- Cache automatique via les hooks React
- Rechargement uniquement quand la session change
- API optimisée pour éviter les appels redondants
