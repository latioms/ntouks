import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import type { AdminStats } from "@/types/admin";
import { 
  Users, 
  Building2, 
  Wrench, 
  TrendingUp
} from "lucide-react";

interface StatsCardsProps {
  stats: AdminStats;
}

export function StatsCards({ stats }: StatsCardsProps) {
  return (
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
  );
}
