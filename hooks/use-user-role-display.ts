"use client";

import { useState, useEffect } from "react";
import { useSession } from "@/lib/auth-client";

interface UserRole {
  id: string;
  name: string;
  displayName?: string;
}

export function useUserRole() {
  const [role, setRole] = useState<UserRole | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const { data: session } = useSession();

  useEffect(() => {
    const fetchUserRole = async () => {
      if (!session?.user) {
        setRole(null);
        setLoading(false);
        return;
      }

      try {
        setLoading(true);
        const response = await fetch('/api/user/role');
        
        if (response.ok) {
          const data = await response.json();
          setRole(data.role);
        } else {
          setError('Erreur lors de la récupération du rôle');
        }
      } catch (err) {
        setError('Erreur de connexion');
        console.error('Erreur lors de la récupération du rôle:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchUserRole();
  }, [session?.user]);

  return { role, loading, error };
}

export function getRoleDisplayName(roleName: string): string {
  const roleDisplayNames: Record<string, string> = {
    "admin": "Admin",
    "station-manager": "Gestionnaire",
    "mechanic": "Mécanicien",
    "customer": "Client"
  };
  
  return roleDisplayNames[roleName] || roleName;
}
