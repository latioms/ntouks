import { authClient } from "@/lib/auth-client";

// Interface pour les rôles côté client
export interface ClientRole {
  id: string;
  name: string;
  description: string | null;
  permissions: {
    permission: {
      id: string;
      name: string;
      resource: string;
      action: string;
    };
  }[];
}

// Interface pour l'utilisateur avec rôle
export interface UserWithRole {
  id: string;
  name: string;
  email: string;
  role: ClientRole | null;
}

// Hook pour assigner un rôle à l'utilisateur connecté
export async function assignCurrentUserRole(roleId: string) {
  try {
    const response = await fetch("/api/roles/assign", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ roleId }),
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.error || "Erreur lors de l'assignement du rôle");
    }

    const data = await response.json();
    return data.user;
  } catch (error) {
    console.error("Erreur lors de l'assignement du rôle:", error);
    throw error;
  }
}

// Hook pour mettre à jour le rôle d'un utilisateur (admin seulement)
export async function updateUserRoleClient(targetUserId: string, roleId: string) {
  try {
    const response = await fetch("/api/roles/assign", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ roleId, targetUserId }),
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.error || "Erreur lors de la mise à jour du rôle");
    }

    const data = await response.json();
    return data.user;
  } catch (error) {
    console.error("Erreur lors de la mise à jour du rôle:", error);
    throw error;
  }
}

// Hook pour récupérer tous les rôles disponibles
export async function getRolesClient() {
  try {
    const response = await fetch("/api/roles");

    if (!response.ok) {
      throw new Error("Erreur lors de la récupération des rôles");
    }

    const data = await response.json();
    return data.roles;
  } catch (error) {
    console.error("Erreur lors de la récupération des rôles:", error);
    throw error;
  }
}

// Fonction pour vérifier si l'utilisateur connecté a une permission
export function hasUserPermission(user: UserWithRole | null, resource: string, action: string): boolean {
  if (!user?.role?.permissions) {
    return false;
  }

  return user.role.permissions.some(
    rp => rp.permission.resource === resource && rp.permission.action === action
  );
}

// Fonction pour vérifier si l'utilisateur a un rôle spécifique
export function hasUserRole(user: UserWithRole | null, roleName: string): boolean {
  return user?.role?.name === roleName;
}

// Fonction pour rediriger selon le rôle
export function getRedirectPathForRole(roleName: string): string {
  const redirectPaths: Record<string, string> = {
    "admin": "/admin/dashboard",
    "station-manager": "/create-station",
    "mechanic": "/select-station"
  };

  return redirectPaths[roleName] || "/dashboard";
}

// Mappage des rôles constants vers les rôles de base de données
export function mapConstantRoleToDbRole(constantRoleId: string): string {
  const roleMapping: Record<string, string> = {
    "admin": "admin",
    "station-manager": "station-manager",
    "mechanic": "mechanic"
  };

  return roleMapping[constantRoleId] || constantRoleId;
}
