"use client";

import { useState, useEffect } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { 
  Users, 
  Building2, 
  Wrench, 
  TrendingUp, 
  AlertCircle,
  Settings,
  BarChart3,
  Shield,
  Globe
} from "lucide-react";

interface AdminStats {
  totalStations: number;
  activeStations: number;
  totalMechanics: number;
  activeMechanics: number;
  totalRequests: number;
  pendingRequests: number;
  totalRevenue: number;
  platformUsers: number;
}

export default function AdminDashboard() {
  const [stats, setStats] = useState<AdminStats | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  // Données mockées
  const mockStats: AdminStats = {
    totalStations: 25,
    activeStations: 23,
    totalMechanics: 127,
    activeMechanics: 89,
    totalRequests: 1543,
    pendingRequests: 34,
    totalRevenue: 12500000,
    platformUsers: 2847
  };

  useEffect(() => {
    // Simulation du chargement des données
    const loadData = async () => {
      setIsLoading(true);
      try {
        // TODO: Remplacer par des appels API réels
        await new Promise(resolve => setTimeout(resolve, 1000));
        setStats(mockStats);
      } catch (error) {
        console.error("Erreur lors du chargement:", error);
      } finally {
        setIsLoading(false);
      }
    };

    loadData();
  }, []);

  if (isLoading) {
    return (
      <div className="min-h-screen bg-muted flex items-center justify-center">
        <div className="text-center space-y-4">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto"></div>
          <p>Chargement du tableau de bord administrateur...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-muted p-4 space-y-6">
      {/* En-tête */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Tableau de Bord - Administrateur</h1>
          <p className="text-muted-foreground">
            Vue d'ensemble de la plateforme NTouks
          </p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline">
            <BarChart3 className="mr-2 h-4 w-4" />
            Rapports détaillés
          </Button>
          <Button>
            <Settings className="mr-2 h-4 w-4" />
            Administration
          </Button>
        </div>
      </div>

      {/* Alertes système */}
      <Card className="border-amber-200 bg-amber-50">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-amber-800">
            <AlertCircle className="h-5 w-5" />
            Alertes système
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-2 text-amber-800">
            <p>• 2 stations nécessitent une vérification de conformité</p>
            <p>• 5 mécaniciens en attente d'approbation</p>
            <p>• Mise à jour système programmée pour ce weekend</p>
          </div>
        </CardContent>
      </Card>

      {/* Statistiques principales */}
      {stats && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Stations</CardTitle>
              <Building2 className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats.totalStations}</div>
              <p className="text-xs text-muted-foreground">
                {stats.activeStations} actives
              </p>
              <Badge variant="secondary" className="mt-2">
                +3 ce mois
              </Badge>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Mécaniciens</CardTitle>
              <Wrench className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats.totalMechanics}</div>
              <p className="text-xs text-muted-foreground">
                {stats.activeMechanics} en ligne
              </p>
              <Badge variant="secondary" className="mt-2">
                70% de taux d'activité
              </Badge>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Utilisateurs</CardTitle>
              <Users className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats.platformUsers}</div>
              <p className="text-xs text-muted-foreground">
                Utilisateurs inscrits
              </p>
              <Badge variant="secondary" className="mt-2">
                +12% ce mois
              </Badge>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Chiffre d'affaires</CardTitle>
              <TrendingUp className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                {(stats.totalRevenue / 1000000).toFixed(1)}M FCFA
              </div>
              <p className="text-xs text-muted-foreground">
                Total plateforme
              </p>
              <Badge variant="secondary" className="mt-2">
                +8% ce mois
              </Badge>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Métriques opérationnelles */}
      {stats && (
        <div className="grid md:grid-cols-3 gap-6">
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Demandes d'intervention</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                <div className="flex justify-between">
                  <span>Total:</span>
                  <span className="font-semibold">{stats.totalRequests}</span>
                </div>
                <div className="flex justify-between">
                  <span>En attente:</span>
                  <span className="font-semibold text-amber-600">{stats.pendingRequests}</span>
                </div>
                <div className="flex justify-between">
                  <span>Taux de résolution:</span>
                  <span className="font-semibold text-green-600">94%</span>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Performance réseau</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                <div className="flex justify-between">
                  <span>Temps de réponse moyen:</span>
                  <span className="font-semibold">12 min</span>
                </div>
                <div className="flex justify-between">
                  <span>Satisfaction client:</span>
                  <span className="font-semibold text-green-600">4.7/5</span>
                </div>
                <div className="flex justify-between">
                  <span>Couverture géographique:</span>
                  <span className="font-semibold">15 villes</span>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Système</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                <div className="flex justify-between">
                  <span>Disponibilité:</span>
                  <span className="font-semibold text-green-600">99.8%</span>
                </div>
                <div className="flex justify-between">
                  <span>Version API:</span>
                  <span className="font-semibold">v2.1.3</span>
                </div>
                <div className="flex justify-between">
                  <span>Dernière sauvegarde:</span>
                  <span className="font-semibold">Il y a 2h</span>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Actions administratives */}
      <div className="grid md:grid-cols-3 lg:grid-cols-5 gap-4">
        <Card className="cursor-pointer hover:shadow-lg transition-shadow">
          <CardContent className="p-6 text-center space-y-2">
            <Building2 className="h-8 w-8 mx-auto text-primary" />
            <h3 className="font-medium">Gérer les stations</h3>
            <p className="text-sm text-muted-foreground">Administration des stations</p>
          </CardContent>
        </Card>

        <Card className="cursor-pointer hover:shadow-lg transition-shadow">
          <CardContent className="p-6 text-center space-y-2">
            <Users className="h-8 w-8 mx-auto text-primary" />
            <h3 className="font-medium">Utilisateurs</h3>
            <p className="text-sm text-muted-foreground">Gestion des comptes</p>
          </CardContent>
        </Card>

        <Card className="cursor-pointer hover:shadow-lg transition-shadow">
          <CardContent className="p-6 text-center space-y-2">
            <Shield className="h-8 w-8 mx-auto text-primary" />
            <h3 className="font-medium">Sécurité</h3>
            <p className="text-sm text-muted-foreground">Audit et permissions</p>
          </CardContent>
        </Card>

        <Card className="cursor-pointer hover:shadow-lg transition-shadow">
          <CardContent className="p-6 text-center space-y-2">
            <BarChart3 className="h-8 w-8 mx-auto text-primary" />
            <h3 className="font-medium">Analytics</h3>
            <p className="text-sm text-muted-foreground">Rapports détaillés</p>
          </CardContent>
        </Card>

        <Card className="cursor-pointer hover:shadow-lg transition-shadow">
          <CardContent className="p-6 text-center space-y-2">
            <Globe className="h-8 w-8 mx-auto text-primary" />
            <h3 className="font-medium">Système</h3>
            <p className="text-sm text-muted-foreground">Configuration globale</p>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
