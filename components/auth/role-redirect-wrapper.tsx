"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { authClient } from "@/lib/auth-client";
import { getUserRole } from "@/app/actions/users/manageRoles";
import { getDefaultRouteForRole } from "@/lib/route-protection";

export function RoleRedirectWrapper({ children }: { children: React.ReactNode }) {
  const [isLoading, setIsLoading] = useState(true);
  const [hasRole, setHasRole] = useState(false);
  const router = useRouter();

  useEffect(() => {
    checkUserRole();
  }, []);

  const checkUserRole = async () => {
    try {
      const { data: session } = await authClient.getSession();
      
      if (!session?.user) {
        setIsLoading(false);
        return;
      }

      const userRole = await getUserRole(session.user.id);
      
      if (!userRole) {
        // L'utilisateur n'a pas de rôle, rediriger vers la sélection de rôle
        router.push("/select-role");
        return;
      }

      // L'utilisateur a un rôle, vérifier s'il est sur la bonne page
      const currentPath = window.location.pathname;
      
      if (currentPath === "/select-role") {
        // Rediriger vers la page appropriée selon le rôle
        const defaultRoute = getDefaultRouteForRole(userRole.name);
        router.push(defaultRoute);
        return;
      }

      setHasRole(true);
    } catch (error) {
      console.error("Erreur lors de la vérification du rôle:", error);
    } finally {
      setIsLoading(false);
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    );
  }

  return <>{children}</>;
}
