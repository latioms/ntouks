"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { authClient } from "@/lib/auth-client";

export function PostLoginRedirect() {
  const router = useRouter();

  useEffect(() => {
    const handleAuthStateChange = async () => {
      try {
        // Écouter les changements d'état d'authentification
        const { data: session } = await authClient.getSession();
        
        if (session?.user) {
          // L'utilisateur vient de se connecter, vérifier son rôle
          const response = await fetch('/api/user/role');
          
          if (response.ok) {
            const data = await response.json();
            
            if (!data.role) {
              // Pas de rôle, rediriger immédiatement vers la sélection
              console.log("Utilisateur connecté sans rôle, redirection vers /select-role");
              router.push('/select-role');
            } else {
              // L'utilisateur a un rôle, rediriger vers son dashboard
              const redirectPath = getRedirectPathForRole(data.role.name);
              console.log(`Utilisateur connecté avec rôle ${data.role.name}, redirection vers ${redirectPath}`);
              router.push(redirectPath);
            }
          }
        }
      } catch (error) {
        console.error("Erreur lors de la vérification post-login:", error);
      }
    };

    // Vérifier immédiatement
    handleAuthStateChange();

  }, [router]);

  return null; // Ce composant ne rend rien
}

function getRedirectPathForRole(roleName: string): string {
  const redirectPaths: Record<string, string> = {
    "admin": "/admin/dashboard",
    "station-manager": "/dashboard",
    "mechanic": "/dashboard"
  };
  
  return redirectPaths[roleName] || "/dashboard";
}
