"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
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
  Plus,
  CheckCircle,
  AlertCircle,
  Car,
  DollarSign
} from "lucide-react";

interface User {
  id: string;
  email: string;
  role: {
    name: string;
  };
}

interface StationStats {
  totalMechanics: number;
  activeMechanics: number;
  pendingRequests: number;
  completedToday: number;
  revenue: number;
  averageResponseTime: string;
}

interface MechanicStats {
  assignedRequests: number;
  completedToday: number;
  rating: number;
  earnings: number;
}

interface StationInfo {
  id: string;
  name: string;
  address: string;
  phone: string;
  email?: string;
}

export default function DashboardPage() {
  const [user, setUser] = useState<User | null>(null);
  const [stationInfo, setStationInfo] = useState<StationInfo | null>(null);
  const [stationStats, setStationStats] = useState<StationStats | null>(null);
  const [mechanicStats, setMechanicStats] = useState<MechanicStats | null>(null);
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
          
          // Charger les données spécifiques au rôle
          if (userData.user.role?.name === 'STATION_MANAGER') {
            // TODO: Charger les données de la station
            // const stationData = await getStationInfo();
            // const stationStatsData = await getStationStats();
            // setStationInfo(stationData);
            // setStationStats(stationStatsData);
          } else if (userData.user.role?.name === 'MECHANIC') {
            // TODO: Charger les données du mécanicien
            // const mechanicData = await getMechanicStats();
            // setMechanicStats(mechanicData);
          }
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

  // Dashboard pour STATION_MANAGER
  if (user.role?.name === 'STATION_MANAGER') {
    // Si aucune station n'est configurée
    if (!stationInfo) {
      return (
        <div className="min-h-screen bg-muted flex items-center justify-center">
          <div className="text-center space-y-6 max-w-md">
            <Building2 className="h-16 w-16 mx-auto text-muted-foreground" />
            <div className="space-y-2">
              <h1 className="text-2xl font-bold">Aucune station configurée</h1>
              <p className="text-muted-foreground">
                Vous devez d'abord créer ou configurer votre station pour accéder au tableau de bord.
              </p>
            </div>
            <Button onClick={() => router.push('/create-station')}>
              <Plus className="mr-2 h-4 w-4" />
              Créer une station
            </Button>
          </div>
        </div>
      );
    }

    return (
      <div className="min-h-screen bg-muted p-4 space-y-6">
        {/* En-tête Station Manager */}
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

        {/* Statistiques Station */}
        {stationStats && (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Mécaniciens</CardTitle>
                <Users className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{stationStats.totalMechanics}</div>
                <p className="text-xs text-muted-foreground">
                  {stationStats.activeMechanics} actuellement actifs
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Demandes en attente</CardTitle>
                <Clock className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{stationStats.pendingRequests}</div>
                <p className="text-xs text-muted-foreground">
                  Temps moyen: {stationStats.averageResponseTime}
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Interventions aujourd'hui</CardTitle>
                <Wrench className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{stationStats.completedToday}</div>
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
                <div className="text-2xl font-bold">{stationStats.revenue.toLocaleString()} FCFA</div>
                <p className="text-xs text-muted-foreground">
                  Ce mois-ci
                </p>
              </CardContent>
            </Card>
          </div>
        )}
      </div>
    );
  }

  // Dashboard pour MECHANIC
  if (user.role?.name === 'MECHANIC') {
    return (
      <div className="min-h-screen bg-muted p-4 space-y-6">
        {/* En-tête Mechanic */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold">Tableau de Bord - Mécanicien</h1>
            <p className="text-muted-foreground">
              Gérez vos interventions et suivez vos performances
            </p>
          </div>
          <div className="flex gap-2">
            <Button variant="outline">
              <Settings className="mr-2 h-4 w-4" />
              Profil
            </Button>
            <Button>
              <Car className="mr-2 h-4 w-4" />
              Voir les demandes
            </Button>
          </div>
        </div>

        {/* Statistiques Mechanic */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Demandes assignées</CardTitle>
              <AlertCircle className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{mechanicStats?.assignedRequests || 0}</div>
              <p className="text-xs text-muted-foreground">
                En attente d'intervention
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Complétées aujourd'hui</CardTitle>
              <CheckCircle className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{mechanicStats?.completedToday || 0}</div>
              <p className="text-xs text-muted-foreground">
                Interventions réussies
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Note moyenne</CardTitle>
              <TrendingUp className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{mechanicStats?.rating || 0}/5</div>
              <p className="text-xs text-muted-foreground">
                Satisfaction client
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Gains ce mois</CardTitle>
              <DollarSign className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{mechanicStats?.earnings.toLocaleString() || 0} FCFA</div>
              <p className="text-xs text-muted-foreground">
                Total des commissions
              </p>
            </CardContent>
          </Card>
        </div>

        {/* Actions rapides pour mécanicien */}
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
          <Card className="cursor-pointer hover:shadow-lg transition-shadow">
            <CardContent className="p-6 text-center space-y-2">
              <Car className="h-8 w-8 mx-auto text-primary" />
              <h3 className="font-medium">Nouvelles demandes</h3>
              <p className="text-sm text-muted-foreground">Voir les interventions disponibles</p>
            </CardContent>
          </Card>

          <Card className="cursor-pointer hover:shadow-lg transition-shadow">
            <CardContent className="p-6 text-center space-y-2">
              <Clock className="h-8 w-8 mx-auto text-primary" />
              <h3 className="font-medium">Mes interventions</h3>
              <p className="text-sm text-muted-foreground">Suivre mes interventions en cours</p>
            </CardContent>
          </Card>

          <Card className="cursor-pointer hover:shadow-lg transition-shadow">
            <CardContent className="p-6 text-center space-y-2">
              <TrendingUp className="h-8 w-8 mx-auto text-primary" />
              <h3 className="font-medium">Historique & Stats</h3>
              <p className="text-sm text-muted-foreground">Voir mes performances</p>
            </CardContent>
          </Card>
        </div>
      </div>
    );
  }

  // Dashboard par défaut (fallback)
  return (
    <div className="min-h-screen bg-muted p-4 space-y-6">
      <div>
        <h1 className="text-3xl font-bold">Tableau de Bord</h1>
        <p className="text-muted-foreground">
          Bienvenue sur votre tableau de bord Ntouks
        </p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Tableau de bord général</CardTitle>
          <CardDescription>
            Rôle: {user.role?.name || 'Non défini'}
          </CardDescription>
        </CardHeader>
        <CardContent>
          <p>Contenu du dashboard en cours de développement pour votre rôle.</p>
        </CardContent>
      </Card>
    </div>
  );
}
