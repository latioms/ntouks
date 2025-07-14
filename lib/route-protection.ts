import { auth } from "@/lib/auth";
import { getUserRole } from "@/app/actions/users/manageRoles";

// Interface pour les règles de protection des routes
interface RouteProtection {
  roles?: string[];
  permissions?: {
    resource: string;
    action: string;
  }[];
  redirectTo?: string;
}

// Configuration des protections par route
const ROUTE_PROTECTIONS: Record<string, RouteProtection> = {
  "/admin": {
    roles: ["admin"],
    redirectTo: "/dashboard"
  },
  "/admin/dashboard": {
    roles: ["admin"],
    redirectTo: "/dashboard"
  },
  "/create-station": {
    roles: ["station-manager"],
    redirectTo: "/select-role"
  },
  "/select-station": {
    roles: ["mechanic"],
    redirectTo: "/select-role"
  },
  "/dashboard": {
    roles: ["admin", "station-manager", "mechanic"],
    redirectTo: "/select-role"
  }
};

// Fonction pour vérifier si l'utilisateur a accès à une route
export async function checkRouteAccess(
  userId: string,
  pathname: string
): Promise<{ hasAccess: boolean; redirectTo?: string }> {
  try {
    // Récupérer le rôle de l'utilisateur
    const userRole = await getUserRole(userId);
    
    // Trouver la protection de route la plus spécifique
    let routeProtection: RouteProtection | undefined;
    let matchedPath = "";
    
    for (const [path, protection] of Object.entries(ROUTE_PROTECTIONS)) {
      if (pathname.startsWith(path) && path.length > matchedPath.length) {
        routeProtection = protection;
        matchedPath = path;
      }
    }
    
    // Si aucune protection n'est définie, permettre l'accès
    if (!routeProtection) {
      return { hasAccess: true };
    }
    
    // Si l'utilisateur n'a pas de rôle et que la route est protégée
    if (!userRole) {
      return { 
        hasAccess: false, 
        redirectTo: routeProtection.redirectTo || "/select-role" 
      };
    }
    
    // Vérifier les rôles requis
    if (routeProtection.roles && !routeProtection.roles.includes(userRole.name)) {
      return { 
        hasAccess: false, 
        redirectTo: routeProtection.redirectTo || "/dashboard" 
      };
    }
    
    // Vérifier les permissions requises
    if (routeProtection.permissions && userRole.permissions) {
      const hasRequiredPermissions = routeProtection.permissions.every(reqPerm =>
        userRole.permissions.some(userPerm =>
          userPerm.permission.resource === reqPerm.resource &&
          userPerm.permission.action === reqPerm.action
        )
      );
      
      if (!hasRequiredPermissions) {
        return { 
          hasAccess: false, 
          redirectTo: routeProtection.redirectTo || "/dashboard" 
        };
      }
    }
    
    return { hasAccess: true };
    
  } catch (error) {
    console.error("Erreur lors de la vérification d'accès à la route:", error);
    return { hasAccess: false, redirectTo: "/select-role" };
  }
}

// Fonction pour vérifier si un utilisateur a une route accessible après login
export function getDefaultRouteForRole(roleName: string): string {
  const defaultRoutes: Record<string, string> = {
    "admin": "/admin/dashboard",
    "station-manager": "/dashboard",
    "mechanic": "/dashboard"
  };
  
  return defaultRoutes[roleName] || "/select-role";
}
