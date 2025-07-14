"use client";

import { useState, useEffect, useCallback } from "react";
import { authClient } from "@/lib/auth-client";

export interface AuthUser {
  id: string;
  name: string;
  email: string;
  role?: {
    id: string;
    name: string;
    description: string | null;
  } | null;
}

interface UseAuthReturn {
  user: AuthUser | null;
  isLoading: boolean;
  isAuthenticated: boolean;
  hasRole: boolean;
  needsOnboarding: boolean;
  refetch: () => Promise<void>;
  logout: () => Promise<void>;
}

export function useAuth(): UseAuthReturn {
  const [user, setUser] = useState<AuthUser | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  const fetchUser = useCallback(async () => {
    try {
      setIsLoading(true);
      
      const { data: session } = await authClient.getSession();
      
      if (!session?.user) {
        setUser(null);
        return;
      }

      // Appeler l'API au lieu d'importer directement la fonction Prisma
      const response = await fetch('/api/user/role');
      
      if (!response.ok) {
        // Si l'API échoue, créer un utilisateur sans rôle
        setUser({
          id: session.user.id,
          name: session.user.name,
          email: session.user.email,
          role: null
        });
        return;
      }

      const data = await response.json();
      
      setUser({
        id: session.user.id,
        name: session.user.name,
        email: session.user.email,
        role: data.role ? {
          id: data.role.id,
          name: data.role.name,
          description: data.role.description
        } : null
      });
      
    } catch (error) {
      console.error("Erreur lors de la récupération de l'utilisateur:", error);
      setUser(null);
    } finally {
      setIsLoading(false);
    }
  }, []);

  const logout = useCallback(async () => {
    try {
      await authClient.signOut();
      setUser(null);
    } catch (error) {
      console.error("Erreur lors de la déconnexion:", error);
    }
  }, []);

  useEffect(() => {
    fetchUser();
  }, [fetchUser]);

  const isAuthenticated = !!user;
  const hasRole = !!user?.role;
  const needsOnboarding = isAuthenticated && !hasRole;

  return {
    user,
    isLoading,
    isAuthenticated,
    hasRole,
    needsOnboarding,
    refetch: fetchUser,
    logout
  };
}
