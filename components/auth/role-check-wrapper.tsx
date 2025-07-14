"use client";

import { useEffect, useState } from "react";
import { useRouter, usePathname } from "next/navigation";
import { authClient } from "@/lib/auth-client";
import { getUserRole } from "@/app/actions/users/manageRoles";

interface RoleCheckWrapperProps {
  children: React.ReactNode;
}

export function RoleCheckWrapper({ children }: RoleCheckWrapperProps) {
  const [isChecking, setIsChecking] = useState(true);
  const [hasRole, setHasRole] = useState(false);
  const router = useRouter();
  const pathname = usePathname();

  // Pages qui ne nécessitent pas de vérification de rôle
  const publicPages = [
    "/",
    "/login", 
    "/register",
    "/select-role",
    "/api"
  ];

  // Vérifier si la page actuelle est publique
  const isPublicPage = publicPages.some(page => pathname.startsWith(page));

  useEffect(() => {
    // Ne pas vérifier sur les pages publiques
    if (isPublicPage) {
      setIsChecking(false);
      return;
    }

    checkUserRoleStatus();
  }, [pathname, isPublicPage]);

  const checkUserRoleStatus = async () => {
    try {
      setIsChecking(true);

      // Vérifier si l'utilisateur est connecté
      const { data: session } = await authClient.getSession();
      
      if (!session?.user) {
        // Non connecté, rediriger vers login
        router.push("/login");
        return;
      }

      // Vérifier si l'utilisateur a un rôle
      const userRole = await getUserRole(session.user.id);
      
      if (!userRole) {
        // Pas de rôle assigné, rediriger vers la sélection de rôle
        console.log("RoleCheckWrapper: Utilisateur sans rôle détecté, redirection vers /select-role");
        router.push("/select-role");
        return;
      }

      // L'utilisateur a un rôle
      setHasRole(true);
      
      // Si l'utilisateur avec un rôle est sur /select-role, le rediriger
      if (pathname === "/select-role") {
        const redirectPath = getRedirectPathForRole(userRole.name);
        console.log(`RoleCheckWrapper: Utilisateur avec rôle sur /select-role, redirection vers ${redirectPath}`);
        router.push(redirectPath);
        return;
      }
      
    } catch (error) {
      console.error("Erreur lors de la vérification du rôle:", error);
      // En cas d'erreur, rediriger vers la page de connexion
      router.push("/login");
    } finally {
      setIsChecking(false);
    }
  };

  // Afficher un loader pendant la vérification
  if (isChecking) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <div className="flex flex-col items-center space-y-4">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
          <p className="text-sm text-muted-foreground">Vérification de votre profil...</p>
        </div>
      </div>
    );
  }

  // Pour les pages publiques, afficher directement le contenu
  if (isPublicPage) {
    return <>{children}</>;
  }

  // Pour les pages protégées, afficher le contenu seulement si l'utilisateur a un rôle
  if (hasRole) {
    return <>{children}</>;
  }

  // Ne rien afficher pendant la redirection
  return null;
}

function getRedirectPathForRole(roleName: string): string {
  const redirectPaths: Record<string, string> = {
    "admin": "/admin/dashboard",
    "station-manager": "/dashboard",
    "mechanic": "/dashboard"
  };
  
  return redirectPaths[roleName] || "/dashboard";
}
