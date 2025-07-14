"use client";

import { useState, useEffect } from "react";
import { authClient } from "@/lib/auth-client";
import { getUserRole } from "@/app/actions/users/manageRoles";
import { UserWithRole, hasUserRole, hasUserPermission } from "@/lib/roles-client";

export function useUserRole() {
  const [user, setUser] = useState<UserWithRole | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    loadUserRole();
  }, []);

  const loadUserRole = async () => {
    try {
      setIsLoading(true);
      setError(null);

      const { data: session } = await authClient.getSession();
      
      if (!session?.user) {
        setUser(null);
        return;
      }

      const userRole = await getUserRole(session.user.id);
      
      const userWithRole: UserWithRole = {
        id: session.user.id,
        name: session.user.name,
        email: session.user.email,
        role: userRole || null
      };

      setUser(userWithRole);
    } catch (err) {
      console.error("Erreur lors du chargement du rôle utilisateur:", err);
      setError(err instanceof Error ? err.message : "Erreur inconnue");
    } finally {
      setIsLoading(false);
    }
  };

  const refetchUserRole = () => {
    loadUserRole();
  };

  const checkRole = (roleName: string) => {
    return hasUserRole(user, roleName);
  };

  const checkPermission = (resource: string, action: string) => {
    return hasUserPermission(user, resource, action);
  };

  const isAdmin = () => checkRole("admin");
  const isStationManager = () => checkRole("station-manager");
  const isMechanic = () => checkRole("mechanic");

  return {
    user,
    isLoading,
    error,
    refetchUserRole,
    checkRole,
    checkPermission,
    isAdmin,
    isStationManager,
    isMechanic,
    hasRole: !!user?.role
  };
}
