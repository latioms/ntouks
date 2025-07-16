"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { DynamicManagerDashboard } from "@/components/manager/dynamic-manager-dashboard";
import { MechanicDashboard } from "@/components/mechanic/mechanic-dashboard";

interface User {
  id: string;
  email: string;
  role: {
    name: string;
  };
}

export default function DashboardPage() {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const router = useRouter();

  useEffect(() => {
    const loadUserAndData = async () => {
      setIsLoading(true);
      try {
        // Récupérer les informations de l'utilisateur
        const userResponse = await fetch('/api/user');
        if (userResponse.ok) {
          const userData = await userResponse.json();
          setUser(userData.user);
        } else {
          router.push('/login');
        }
      } catch (error) {
        console.error("Erreur lors du chargement des données:", error);
        router.push('/login');
      } finally {
        setIsLoading(false);
      }
    };

    loadUserAndData();
  }, [router]);

  if (isLoading) {
    return (
      <div className="min-h-screen bg-muted flex items-center justify-center">
        <div className="text-center space-y-4">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto"></div>
          <p>Chargement du tableau de bord...</p>
        </div>
      </div>
    );
  }

  if (!user) {
    return null; // Redirection en cours
  }

  // Dashboard pour STATION_MANAGER et ADMIN
  if (user.role?.name === 'station-manager' || user.role?.name === 'admin') {
    return (
      <div className="min-h-screen bg-background p-4">
        <DynamicManagerDashboard />
      </div>
    );
  }

  // Dashboard pour MECHANIC
  if (user.role?.name === 'mechanic') {
    return (
      <div className="min-h-screen bg-background p-4">
        <MechanicDashboard />
      </div>
    );
  }

  // Dashboard par défaut pour les rôles non reconnus
  return (
    <div className="min-h-screen bg-background p-4 space-y-6">
      <div>
        <h1 className="text-3xl font-bold">Tableau de Bord</h1>
        <p className="text-muted-foreground">
          Bienvenue sur votre tableau de bord Ntouks
        </p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Information de l'utilisateur</CardTitle>
          <CardDescription>
            Rôle actuel: {user.role?.name || 'Non défini'}
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-2">
            <p><strong>Email:</strong> {user.email}</p>
            <p><strong>ID:</strong> {user.id}</p>
            <Badge variant="outline">
              {user.role?.name || 'Aucun rôle'}
            </Badge>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Action recommandée</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-sm text-muted-foreground mb-4">
            Votre rôle ne correspond à aucun dashboard configuré. 
            Contactez l'administrateur pour résoudre ce problème.
          </p>
          <Button variant="outline" onClick={() => router.push('/settings')}>
            Aller aux paramètres
          </Button>
        </CardContent>
      </Card>
    </div>
  );
}
