"use client";

import { useEffect, useRef } from "react";
import { useRouter, usePathname } from "next/navigation";
import { authClient } from "@/lib/auth-client";

export function useAuthRedirect() {
  const router = useRouter();
  const pathname = usePathname();
  const hasChecked = useRef(false);

  useEffect(() => {
    const checkAuthAndRedirect = async () => {
      // Éviter les vérifications multiples
      if (hasChecked.current) return;
      
      try {
        const { data: session } = await authClient.getSession();
        
        if (session?.user) {
          // Utilisateur connecté, vérifier son rôle
          const response = await fetch('/api/user/role');
          
          if (response.ok) {
            const data = await response.json();
            
            if (!data.role) {
              // Pas de rôle assigné
              if (pathname !== '/select-role') {
                console.log("Redirection post-login: utilisateur sans rôle → /select-role");
                router.push('/select-role');
                hasChecked.current = true;
                return;
              }
            } else {
              // Utilisateur avec rôle
              if (pathname === '/login' || pathname === '/register' || pathname === '/select-role') {
                const redirectPath = getRedirectPathForRole(data.role.name);
                console.log(`Redirection post-login: utilisateur avec rôle ${data.role.name} → ${redirectPath}`);
                router.push(redirectPath);
                hasChecked.current = true;
                return;
              }
            }
          }
        }
      } catch (error) {
        console.error("Erreur lors de la vérification d'authentification:", error);
      }
      
      hasChecked.current = true;
    };

    // Délai court pour éviter les conflits avec le middleware
    const timer = setTimeout(checkAuthAndRedirect, 100);
    
    return () => clearTimeout(timer);
  }, [router, pathname]);

  // Reset la vérification quand l'utilisateur navigue
  useEffect(() => {
    hasChecked.current = false;
  }, [pathname]);
}

function getRedirectPathForRole(roleName: string): string {
  const redirectPaths: Record<string, string> = {
    "admin": "/admin/dashboard",
    "station-manager": "/dashboard", 
    "mechanic": "/dashboard"
  };
  
  return redirectPaths[roleName] || "/dashboard";
}
