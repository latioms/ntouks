"use client";

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { useManagerStats } from "@/hooks/use-manager-stats";
import { 
  BarChart3, 
  Users, 
  Clock, 
  TrendingUp, 
  AlertCircle, 
  CheckCircle, 
  UserCheck,
  Calendar,
  RefreshCw,
  Loader2
} from "lucide-react";

export function StatsOverview() {
  const { stats, loading, refreshStats } = useManagerStats();

  if (loading) {
    return (
      <Card>
        <CardContent className="p-6">
          <div className="flex items-center justify-center">
            <Loader2 className="h-8 w-8 animate-spin" />
            <span className="ml-2">Chargement des statistiques...</span>
          </div>
        </CardContent>
      </Card>
    );
  }

  const statCards = [
    {
      title: "Demandes en attente",
      value: stats.pendingRequests,
      icon: AlertCircle,
      color: "text-red-600",
      bgColor: "bg-red-50",
      description: "Nécessitent une action"
    },
    {
      title: "Demandes assignées",
      value: stats.assignedRequests,
      icon: UserCheck,
      color: "text-blue-600",
      bgColor: "bg-blue-50",
      description: "En cours de traitement"
    },
    {
      title: "Demandes terminées",
      value: stats.completedRequests,
      icon: CheckCircle,
      color: "text-green-600",
      bgColor: "bg-green-50",
      description: "Ce mois-ci"
    },
    {
      title: "Mécaniciens disponibles",
      value: stats.availableMechanics,
      icon: Users,
      color: "text-purple-600",
      bgColor: "bg-purple-50",
      description: `Sur ${stats.totalMechanics} total`
    }
  ];

  const performanceCards = [
    {
      title: "Temps de réponse moyen",
      value: `${stats.averageResponseTime} min`,
      icon: Clock,
      description: "Délai d'assignation"
    },
    {
      title: "Taux de completion",
      value: `${Math.round(stats.completionRate)}%`,
      icon: TrendingUp,
      description: "Demandes résolues"
    },
    {
      title: "Demandes aujourd'hui",
      value: stats.dailyRequests,
      icon: Calendar,
      description: "Nouvelles demandes"
    },
    {
      title: "Demandes cette semaine",
      value: stats.weeklyRequests,
      icon: BarChart3,
      description: "Activité hebdomadaire"
    }
  ];

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold">Tableau de bord</h2>
          <p className="text-muted-foreground">
            Vue d'ensemble de l'activité de votre station
          </p>
        </div>
        <Button onClick={refreshStats} variant="outline" size="sm">
          <RefreshCw className="h-4 w-4 mr-2" />
          Actualiser
        </Button>
      </div>

      {/* Statistiques principales */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {statCards.map((stat, index) => {
          const Icon = stat.icon;
          return (
            <Card key={index}>
              <CardContent className="p-4">
                <div className="flex items-center justify-between">
                  <div className="space-y-1">
                    <p className="text-sm font-medium text-muted-foreground">
                      {stat.title}
                    </p>
                    <p className="text-2xl font-bold">{stat.value}</p>
                    <p className="text-xs text-muted-foreground">
                      {stat.description}
                    </p>
                  </div>
                  <div className={`p-3 rounded-full ${stat.bgColor}`}>
                    <Icon className={`h-6 w-6 ${stat.color}`} />
                  </div>
                </div>
              </CardContent>
            </Card>
          );
        })}
      </div>

      {/* Métriques de performance */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <BarChart3 className="h-5 w-5" />
            Métriques de performance
          </CardTitle>
          <CardDescription>
            Indicateurs clés de performance de votre station
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {performanceCards.map((metric, index) => {
              const Icon = metric.icon;
              return (
                <div key={index} className="space-y-2">
                  <div className="flex items-center gap-2">
                    <Icon className="h-4 w-4 text-muted-foreground" />
                    <span className="text-sm font-medium text-muted-foreground">
                      {metric.title}
                    </span>
                  </div>
                  <p className="text-2xl font-bold">{metric.value}</p>
                  <p className="text-xs text-muted-foreground">
                    {metric.description}
                  </p>
                </div>
              );
            })}
          </div>
        </CardContent>
      </Card>

      {/* Résumé rapide */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Activité récente</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-sm">Demandes ce mois</span>
                <span className="font-medium">{stats.monthlyRequests}</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm">Demandes cette semaine</span>
                <span className="font-medium">{stats.weeklyRequests}</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm">Demandes aujourd'hui</span>
                <span className="font-medium">{stats.dailyRequests}</span>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-lg">État de l'équipe</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-sm">Total mécaniciens</span>
                <span className="font-medium">{stats.totalMechanics}</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm text-green-600">Disponibles</span>
                <span className="font-medium text-green-600">{stats.availableMechanics}</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm text-red-600">Occupés</span>
                <span className="font-medium text-red-600">{stats.busyMechanics}</span>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
