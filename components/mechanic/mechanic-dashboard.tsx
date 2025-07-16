"use client";

import { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { toast } from "sonner";
import { 
  AlertCircle, 
  CheckCircle, 
  Clock, 
  TrendingUp, 
  Car,
  MapPin,
  Phone,
  Settings,
  Wrench,
  RefreshCw,
  Loader2
} from "lucide-react";
import { useMechanicStats } from "@/hooks/use-mechanic-stats";
import { useMechanicRequests } from "@/hooks/use-mechanic-requests";

const statusOptions = [
  { value: 'PENDING', label: 'En attente' },
  { value: 'IN_PROGRESS', label: 'En cours' },
  { value: 'COMPLETED', label: 'Terminé' },
  { value: 'CANCELLED', label: 'Annulé' }
];

const getPriorityLabel = (priority: number) => {
  switch (priority) {
    case 3: return { label: 'Élevée', color: 'bg-red-100 text-red-800' };
    case 2: return { label: 'Moyenne', color: 'bg-yellow-100 text-yellow-800' };
    case 1: return { label: 'Faible', color: 'bg-green-100 text-green-800' };
    default: return { label: 'Normal', color: 'bg-gray-100 text-gray-800' };
  }
};

const getStatusLabel = (status: string) => {
  switch (status) {
    case 'PENDING': return { label: 'En attente', color: 'bg-yellow-100 text-yellow-800' };
    case 'IN_PROGRESS': return { label: 'En cours', color: 'bg-blue-100 text-blue-800' };
    case 'COMPLETED': return { label: 'Terminé', color: 'bg-green-100 text-green-800' };
    case 'CANCELLED': return { label: 'Annulé', color: 'bg-red-100 text-red-800' };
    default: return { label: status, color: 'bg-gray-100 text-gray-800' };
  }
};

export function MechanicDashboard() {
  const { stats, isLoading: statsLoading, error: statsError, refreshStats } = useMechanicStats();
  const { 
    requests, 
    mechanicInfo, 
    isLoading: requestsLoading, 
    error: requestsError, 
    updateRequestStatus, 
    refreshRequests 
  } = useMechanicRequests();

  const [updatingRequest, setUpdatingRequest] = useState<string | null>(null);
  const [selectedStatus, setSelectedStatus] = useState<string>('');
  const [notes, setNotes] = useState<string>('');

  const handleStatusUpdate = async (requestId: string, newStatus: string, requestNotes?: string) => {
    try {
      setUpdatingRequest(requestId);
      await updateRequestStatus(requestId, newStatus, requestNotes);
      toast.success("Statut mis à jour avec succès");
      refreshStats(); // Rafraîchir les stats après mise à jour
    } catch (error) {
      toast.error("Erreur lors de la mise à jour du statut");
      console.error("Erreur:", error);
    } finally {
      setUpdatingRequest(null);
      setSelectedStatus('');
      setNotes('');
    }
  };

  const handleRefresh = () => {
    refreshStats();
    refreshRequests();
    toast.success("Données actualisées");
  };

  if (statsLoading || requestsLoading) {
    return (
      <div className="min-h-screen bg-muted flex items-center justify-center">
        <div className="text-center space-y-4">
          <Loader2 className="animate-spin h-12 w-12 mx-auto text-primary" />
          <p>Chargement du tableau de bord...</p>
        </div>
      </div>
    );
  }

  if (statsError || requestsError) {
    return (
      <div className="min-h-screen bg-muted flex items-center justify-center">
        <div className="text-center space-y-4">
          <AlertCircle className="h-12 w-12 mx-auto text-red-500" />
          <p className="text-red-600">Erreur: {statsError || requestsError}</p>
          <Button onClick={handleRefresh} variant="outline">
            <RefreshCw className="mr-2 h-4 w-4" />
            Réessayer
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-muted p-4 space-y-6">
      {/* En-tête */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Tableau de Bord - Mécanicien</h1>
          <p className="text-muted-foreground">
            Gérez vos interventions et suivez vos performances
          </p>
          {mechanicInfo && (
            <div className="mt-2 flex items-center gap-4 text-sm text-muted-foreground">
              <span>Spécialités: {mechanicInfo.specialties?.join(', ') || 'Général'}</span>
              <Badge variant={mechanicInfo.isAvailable ? "default" : "secondary"}>
                {mechanicInfo.isAvailable ? "Disponible" : "Indisponible"}
              </Badge>
            </div>
          )}
        </div>
        <div className="flex gap-2">
          <Button variant="outline" onClick={handleRefresh}>
            <RefreshCw className="mr-2 h-4 w-4" />
            Actualiser
          </Button>
          <Button variant="outline">
            <Settings className="mr-2 h-4 w-4" />
            Profil
          </Button>
        </div>
      </div>

      {/* Statistiques */}
      {stats && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Demandes en attente</CardTitle>
              <Clock className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats.pendingRequests}</div>
              <p className="text-xs text-muted-foreground">
                À traiter
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">En cours</CardTitle>
              <Wrench className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats.inProgressRequests}</div>
              <p className="text-xs text-muted-foreground">
                Interventions actives
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Terminées</CardTitle>
              <CheckCircle className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats.completedRequests}</div>
              <p className="text-xs text-muted-foreground">
                Total complétées
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Taux de succès</CardTitle>
              <TrendingUp className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats.completionRate}%</div>
              <p className="text-xs text-muted-foreground">
                Performance
              </p>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Demandes urgentes */}
      {stats?.recentUrgentRequests && stats.recentUrgentRequests.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <AlertCircle className="h-5 w-5 text-red-500" />
              Demandes urgentes
            </CardTitle>
            <CardDescription>
              Interventions prioritaires nécessitant une attention immédiate
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {stats.recentUrgentRequests.map((request) => (
                <div key={request.id} className="flex items-center justify-between p-4 border rounded-lg bg-red-50">
                  <div>
                    <h4 className="font-medium">{request.description}</h4>
                    <p className="text-sm text-muted-foreground">
                      Créée le {new Date(request.createdAt).toLocaleDateString()}
                    </p>
                  </div>
                  <Badge className="bg-red-100 text-red-800">
                    Urgent
                  </Badge>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Liste des demandes */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Car className="h-5 w-5" />
            Mes interventions
          </CardTitle>
          <CardDescription>
            Gérez vos demandes d'assistance assignées
          </CardDescription>
        </CardHeader>
        <CardContent>
          {requests.length === 0 ? (
            <div className="text-center py-8 text-muted-foreground">
              <Car className="h-12 w-12 mx-auto mb-4 opacity-50" />
              <p>Aucune demande assignée pour le moment</p>
            </div>
          ) : (
            <div className="space-y-4">
              {requests.map((request) => {
                const priority = getPriorityLabel(request.priority);
                const status = getStatusLabel(request.status);
                
                return (
                  <div key={request.id} className="border rounded-lg p-4 space-y-4">
                    <div className="flex items-start justify-between">
                      <div className="space-y-2">
                        <h4 className="font-medium">{request.description}</h4>
                        <div className="flex items-center gap-4 text-sm text-muted-foreground">
                          <div className="flex items-center gap-1">
                            <MapPin className="h-4 w-4" />
                            {request.location}
                          </div>
                          <div className="flex items-center gap-1">
                            <Clock className="h-4 w-4" />
                            {new Date(request.createdAt).toLocaleDateString()}
                          </div>
                        </div>
                        {request.notes && (
                          <p className="text-sm text-muted-foreground bg-gray-50 p-2 rounded">
                            <strong>Notes:</strong> {request.notes}
                          </p>
                        )}
                      </div>
                      <div className="flex flex-col gap-2">
                        <Badge className={priority.color}>
                          {priority.label}
                        </Badge>
                        <Badge className={status.color}>
                          {status.label}
                        </Badge>
                      </div>
                    </div>

                    {/* Actions de mise à jour */}
                    <div className="flex items-center gap-4 pt-2 border-t">
                      <div className="flex items-center gap-2">
                        <Select 
                          value={selectedStatus} 
                          onValueChange={setSelectedStatus}
                          disabled={updatingRequest === request.id}
                        >
                          <SelectTrigger className="w-40">
                            <SelectValue placeholder="Changer statut" />
                          </SelectTrigger>
                          <SelectContent>
                            {statusOptions.map((option) => (
                              <SelectItem key={option.value} value={option.value}>
                                {option.label}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                        
                        <Textarea
                          placeholder="Notes (optionnel)"
                          value={notes}
                          onChange={(e) => setNotes(e.target.value)}
                          className="w-60 h-8"
                          disabled={updatingRequest === request.id}
                        />
                        
                        <Button
                          size="sm"
                          onClick={() => handleStatusUpdate(request.id, selectedStatus, notes)}
                          disabled={!selectedStatus || updatingRequest === request.id}
                        >
                          {updatingRequest === request.id ? (
                            <>
                              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                              Mise à jour...
                            </>
                          ) : (
                            <>
                              <CheckCircle className="mr-2 h-4 w-4" />
                              Mettre à jour
                            </>
                          )}
                        </Button>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
