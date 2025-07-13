"use client";

import { useState, useEffect } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { 
  Building2, 
  Users, 
  Wrench, 
  Clock, 
  TrendingUp, 
  MapPin,
  Phone,
  Settings,
  Plus
} from "lucide-react";

interface StationStats {
  totalMechanics: number;
  activeMechanics: number;
  pendingRequests: number;
  completedToday: number;
  revenue: number;
  averageResponseTime: string;
}

interface StationInfo {
  id: string;
  name: string;
  address: string;
  phone: string;
  email?: string;
}

export default function StationDashboard() {
  const [stationInfo, setStationInfo] = useState<StationInfo | null>(null);
  const [stats, setStats] = useState<StationStats | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  // Données mockées
  const mockStationInfo: StationInfo = {
    id: "1",
    name: "Station Service Dakar Central",
    address: "Avenue Bourguiba, Dakar",
    phone: "+221 77 123 45 67",
    email: "contact@dakarcentral.com"
  };

  const mockStats: StationStats = {
    totalMechanics: 5,
    activeMechanics: 3,
    pendingRequests: 8,
    completedToday: 12,
    revenue: 145000,
    averageResponseTime: "15 min"
  };

  useEffect(() => {
    // Simulation du chargement des données
    const loadData = async () => {
      setIsLoading(true);
      try {
        // TODO: Remplacer par des appels API réels
        await new Promise(resolve => setTimeout(resolve, 1000));
        setStationInfo(mockStationInfo);
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
          <p>Chargement du tableau de bord...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-muted p-4 space-y-6">
      {/* En-tête */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Tableau de Bord - Gestionnaire</h1>
          <p className="text-muted-foreground">
            Gérez votre station et supervisez vos mécaniciens
          </p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline">
            <Settings className="mr-2 h-4 w-4" />
            Paramètres
          </Button>
          <Button>
            <Plus className="mr-2 h-4 w-4" />
            Ajouter un mécanicien
          </Button>
        </div>
      </div>

      {/* Informations de la station */}
      {stationInfo && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Building2 className="h-5 w-5" />
              {stationInfo.name}
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid md:grid-cols-2 gap-4">
              <div className="flex items-center gap-2">
                <MapPin className="h-4 w-4 text-muted-foreground" />
                <span>{stationInfo.address}</span>
              </div>
              <div className="flex items-center gap-2">
                <Phone className="h-4 w-4 text-muted-foreground" />
                <span>{stationInfo.phone}</span>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Statistiques */}
      {stats && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Mécaniciens</CardTitle>
              <Users className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats.totalMechanics}</div>
              <p className="text-xs text-muted-foreground">
                {stats.activeMechanics} actuellement actifs
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Demandes en attente</CardTitle>
              <Clock className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats.pendingRequests}</div>
              <p className="text-xs text-muted-foreground">
                Temps de réponse moyen: {stats.averageResponseTime}
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Interventions aujourd'hui</CardTitle>
              <Wrench className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats.completedToday}</div>
              <p className="text-xs text-muted-foreground">
                +15% par rapport à hier
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Chiffre d'affaires</CardTitle>
              <TrendingUp className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats.revenue.toLocaleString()} FCFA</div>
              <p className="text-xs text-muted-foreground">
                Ce mois-ci
              </p>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Actions rapides */}
      <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card className="cursor-pointer hover:shadow-lg transition-shadow">
          <CardContent className="p-6 text-center space-y-2">
            <Users className="h-8 w-8 mx-auto text-primary" />
            <h3 className="font-medium">Gérer les mécaniciens</h3>
            <p className="text-sm text-muted-foreground">Voir et gérer votre équipe</p>
          </CardContent>
        </Card>

        <Card className="cursor-pointer hover:shadow-lg transition-shadow">
          <CardContent className="p-6 text-center space-y-2">
            <Wrench className="h-8 w-8 mx-auto text-primary" />
            <h3 className="font-medium">Demandes d'intervention</h3>
            <p className="text-sm text-muted-foreground">Suivre les demandes en cours</p>
          </CardContent>
        </Card>

        <Card className="cursor-pointer hover:shadow-lg transition-shadow">
          <CardContent className="p-6 text-center space-y-2">
            <TrendingUp className="h-8 w-8 mx-auto text-primary" />
            <h3 className="font-medium">Rapports & Analytics</h3>
            <p className="text-sm text-muted-foreground">Voir les performances</p>
          </CardContent>
        </Card>

        <Card className="cursor-pointer hover:shadow-lg transition-shadow">
          <CardContent className="p-6 text-center space-y-2">
            <Settings className="h-8 w-8 mx-auto text-primary" />
            <h3 className="font-medium">Paramètres</h3>
            <p className="text-sm text-muted-foreground">Configurer la station</p>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
