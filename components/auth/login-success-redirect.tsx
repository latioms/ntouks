"use client";

import { useEffect } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { authClient } from "@/lib/auth-client";

export function LoginSuccessRedirect() {
  const router = useRouter();
  const searchParams = useSearchParams();

  useEffect(() => {
    const checkAndRedirectAfterLogin = async () => {
      try {
        // Vérifier si l'utilisateur est maintenant connecté
        const { data: session } = await authClient.getSession();
        
        if (session?.user) {
          console.log("LoginSuccessRedirect: Utilisateur connecté détecté");
          
          // Vérifier le rôle de l'utilisateur
          const response = await fetch('/api/user/role');
          
          if (response.ok) {
            const data = await response.json();
            
            if (!data.role) {
              // Pas de rôle, rediriger vers la sélection de rôle
              console.log("LoginSuccessRedirect: Redirection vers /select-role (pas de rôle)");
              router.push('/select-role');
            } else {
              // L'utilisateur a un rôle
              // Vérifier s'il y a une URL de redirection dans les paramètres
              const redirectUrl = searchParams.get('redirect');
              
              if (redirectUrl && redirectUrl !== '/login' && redirectUrl !== '/register') {
                console.log(`LoginSuccessRedirect: Redirection vers ${redirectUrl} (URL de retour)`);
                router.push(redirectUrl);
              } else {
                // Redirection selon le rôle
                const defaultPath = getRedirectPathForRole(data.role.name);
                console.log(`LoginSuccessRedirect: Redirection vers ${defaultPath} (rôle: ${data.role.name})`);
                router.push(defaultPath);
              }
            }
          } else {
            // Erreur lors de la récupération du rôle
            console.log("LoginSuccessRedirect: Erreur lors de la récupération du rôle, redirection vers /select-role");
            router.push('/select-role');
          }
        }
      } catch (error) {
        console.error("Erreur lors de la redirection post-login:", error);
      }
    };

    // Délai court pour s'assurer que la session est bien établie
    const timer = setTimeout(checkAndRedirectAfterLogin, 500);
    
    return () => clearTimeout(timer);
  }, [router, searchParams]);

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
