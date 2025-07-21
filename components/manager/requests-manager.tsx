"use client";

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useManagerRequests } from "@/hooks/use-manager-requests";
import { useManagerMechanics } from "@/hooks/use-manager-mechanics";
import { useMechanicAssignmentLimits } from "@/hooks/use-mechanic-assignment-limits";
import { useState } from "react";
import { toast } from "sonner";
import { 
  Clock, 
  User, 
  MapPin, 
  Phone, 
  AlertTriangle, 
  CheckCircle,
  UserPlus,
  Loader2
} from "lucide-react";

export function RequestsManager() {
  const { requests, loading, assignMechanic, fetchRequests } = useManagerRequests();
  const { mechanics, getAvailableMechanics } = useManagerMechanics();
  const { 
    limits, 
    checkMechanicAvailability, 
    getAvailableMechanics: getAvailableMechanicsForAssignment,
    getMechanicTaskCount 
  } = useMechanicAssignmentLimits();
  const [assigningRequest, setAssigningRequest] = useState<string | null>(null);
  const [statusFilter, setStatusFilter] = useState<string>('ALL');

  // Filtrer les demandes par statut
  const filteredRequests = statusFilter === 'ALL' 
    ? requests 
    : requests.filter(request => request.status === statusFilter);

  const handleAssignMechanic = async (requestId: string, mechanicId: string) => {
    try {
      setAssigningRequest(requestId);
      await assignMechanic(requestId, mechanicId);
      toast.success("Mécanicien assigné avec succès !");
    } catch (error) {
      toast.error("Erreur lors de l'assignation");
      console.error(error);
    } finally {
      setAssigningRequest(null);
    }
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'PENDING':
        return <Badge variant="destructive">En attente</Badge>;
      case 'ASSIGNED':
        return <Badge variant="default">Assignée</Badge>;
      case 'IN_PROGRESS':
        return <Badge variant="secondary">En cours</Badge>;
      case 'COMPLETED':
        return <Badge variant="outline" className="text-green-600 border-green-600">Terminée</Badge>;
      default:
        return <Badge variant="outline">{status}</Badge>;
    }
  };

  const getUrgencyBadge = (urgency: number) => {
    if (urgency >= 3) {
      return <Badge variant="destructive">Urgent</Badge>;
    } else if (urgency >= 2) {
      return <Badge variant="default">Moyen</Badge>;
    } else {
      return <Badge variant="secondary">Normal</Badge>;
    }
  };

  const availableMechanics = getAvailableMechanics();

  if (loading) {
    return (
      <Card>
        <CardContent className="p-6">
          <div className="flex items-center justify-center">
            <Loader2 className="h-8 w-8 animate-spin" />
            <span className="ml-2">Chargement des demandes...</span>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold">Demandes d'assistance</h2>
          <p className="text-muted-foreground">
            Gérez les demandes clients et assignez des mécaniciens ({requests.length} demande{requests.length > 1 ? 's' : ''} au total)
          </p>
        </div>
        <div className="flex gap-2">
          <Button onClick={fetchRequests} variant="outline" size="sm">
            Actualiser
          </Button>
          <Badge variant="secondary" className="text-sm">
            {availableMechanics.length} mécanicien{availableMechanics.length > 1 ? 's' : ''} disponible{availableMechanics.length > 1 ? 's' : ''}
          </Badge>
        </div>
      </div>

      {/* Filtres */}
      <div className="flex items-center gap-4 p-4 bg-muted/50 rounded-lg">
        <span className="text-sm font-medium">Filtrer par statut :</span>
        <Select value={statusFilter} onValueChange={setStatusFilter}>
          <SelectTrigger className="w-48">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="ALL">Toutes les demandes</SelectItem>
            <SelectItem value="PENDING">En attente</SelectItem>
            <SelectItem value="ASSIGNED">Assignées</SelectItem>
            <SelectItem value="IN_PROGRESS">En cours</SelectItem>
            <SelectItem value="COMPLETED">Terminées</SelectItem>
          </SelectContent>
        </Select>
        <div className="flex gap-2 ml-auto">
          <Badge variant="destructive">{requests.filter(r => r.status === 'PENDING').length} en attente</Badge>
          <Badge variant="default">{requests.filter(r => r.status === 'ASSIGNED').length} assignées</Badge>
          <Badge variant="secondary">{requests.filter(r => r.status === 'IN_PROGRESS').length} en cours</Badge>
        </div>
      </div>

      <div className="grid gap-4">
        {filteredRequests.length === 0 ? (
          <Card>
            <CardContent className="p-6 text-center">
              <AlertTriangle className="h-12 w-12 mx-auto mb-4 text-muted-foreground" />
              <p className="text-muted-foreground">
                {statusFilter === 'ALL' ? 'Aucune demande d\'assistance' : `Aucune demande avec le statut "${statusFilter}"`}
              </p>
            </CardContent>
          </Card>
        ) : (
          filteredRequests.map((request) => (
            <Card key={request.id} className="overflow-hidden">
              <CardHeader className="pb-3">
                <div className="flex items-start justify-between">
                  <div className="space-y-1">
                    <CardTitle className="text-lg flex items-center gap-2">
                      <User className="h-4 w-4" />
                      {request.requesterName}
                      {getUrgencyBadge(request.urgency)}
                    </CardTitle>
                    <CardDescription className="flex items-center gap-4 flex-wrap">
                      <span className="flex items-center gap-1">
                        <Phone className="h-3 w-3" />
                        {request.requesterPhone}
                      </span>
                      <span className="flex items-center gap-1">
                        <MapPin className="h-3 w-3" />
                        {request.address}
                      </span>
                      {request.station && (
                        <span className="flex items-center gap-1 text-blue-600">
                          <Badge variant="outline" className="text-xs">
                            📍 {request.station.name}
                          </Badge>
                        </span>
                      )}
                    </CardDescription>
                  </div>
                  <div className="flex flex-col items-end gap-2">
                    {getStatusBadge(request.status)}
                    <span className="text-xs text-muted-foreground flex items-center gap-1">
                      <Clock className="h-3 w-3" />
                      {new Date(request.createdAt).toLocaleString()}
                    </span>
                  </div>
                </div>
              </CardHeader>
              
              <CardContent className="pt-0">
                <div className="space-y-4">
                  <div>
                    <h4 className="font-medium mb-2">Description du problème</h4>
                    <p className="text-sm text-muted-foreground bg-muted p-3 rounded">
                      {request.description}
                    </p>
                    <p className="text-xs text-muted-foreground mt-1">
                      Type: {request.breakdownType}
                    </p>
                  </div>

                  {request.mechanic ? (
                    <div className="space-y-3">
                      <div className="flex items-center justify-between p-3 bg-green-50 rounded-md">
                        <div className="flex items-center gap-2">
                          <CheckCircle className="h-4 w-4 text-green-600" />
                          <span className="text-sm font-medium">
                            Assigné à {
                              request.mechanic.user?.name || 
                              `${request.mechanic.firstName || ''} ${request.mechanic.lastName || ''}`.trim() || 
                              'Mécanicien'
                            }
                          </span>
                        </div>
                      </div>
                        {/* Possibilité de réassigner */}
                      <div className="flex items-center gap-3 p-3 bg-blue-50 rounded-md">
                        <UserPlus className="h-4 w-4 text-blue-600" />
                        <div className="flex-1">
                          {getAvailableMechanicsForAssignment()
                            .filter(mechanicLimit => mechanicLimit.mechanicId !== request.mechanic?.id)
                            .length === 0 ? (
                            <div className="text-sm text-muted-foreground">
                              Aucun autre mécanicien disponible pour la réassignation
                            </div>
                          ) : (
                            <Select 
                              onValueChange={(mechanicId) => handleAssignMechanic(request.id, mechanicId)}
                              disabled={assigningRequest === request.id}
                            >
                              <SelectTrigger className="w-full">
                                <SelectValue placeholder="Réassigner à un autre mécanicien" />
                              </SelectTrigger>
                              <SelectContent>
                                {getAvailableMechanicsForAssignment()
                                  .filter(mechanicLimit => mechanicLimit.mechanicId !== request.mechanic?.id)
                                  .map((mechanicLimit) => {
                                    const mechanic = mechanics.find(m => m.id === mechanicLimit.mechanicId);
                                    if (!mechanic) return null;
                                    
                                    return (
                                      <SelectItem key={mechanic.id} value={mechanic.id}>
                                        <div className="flex flex-col">
                                          <div className="flex items-center justify-between">
                                            <span className="font-medium">
                                              {
                                                mechanic.user?.name || 
                                                `${mechanic.firstName || ''} ${mechanic.lastName || ''}`.trim() || 
                                                'Mécanicien'
                                              }
                                            </span>
                                            <span className="text-xs text-muted-foreground ml-2">
                                              ({mechanicLimit.assignedRequestsCount}/{mechanicLimit.maxAllowed})
                                            </span>
                                          </div>
                                          <span className="text-xs text-muted-foreground">
                                            {mechanic.specialties?.length > 0 ? mechanic.specialties.join(', ') : 'Généraliste'}
                                            {mechanic.station?.name && ` • ${mechanic.station.name}`}
                                          </span>
                                        </div>
                                      </SelectItem>
                                    );
                                  })}
                              </SelectContent>
                            </Select>
                          )}
                        </div>
                        {assigningRequest === request.id && (
                          <Loader2 className="h-4 w-4 animate-spin" />
                        )}
                      </div>
                    </div>
                  ) : (
                    <div className="flex items-center gap-3 p-3 bg-orange-50 rounded-md">
                      <UserPlus className="h-4 w-4 text-orange-600" />
                      {getAvailableMechanicsForAssignment().length === 0 ? (
                        <div className="text-sm text-muted-foreground">
                          Aucun mécanicien disponible (tous ont 2+ tâches assignées)
                        </div>
                      ) : (
                        <Select 
                          onValueChange={(mechanicId) => handleAssignMechanic(request.id, mechanicId)}
                          disabled={assigningRequest === request.id}
                        >
                          <SelectTrigger className="w-full">
                            <SelectValue placeholder="Assigner un mécanicien" />
                          </SelectTrigger>
                          <SelectContent>
                            {getAvailableMechanicsForAssignment().map((mechanicLimit) => {
                              const mechanic = mechanics.find(m => m.id === mechanicLimit.mechanicId);
                              if (!mechanic) return null;
                              
                              return (
                                <SelectItem key={mechanic.id} value={mechanic.id}>
                                  <div className="flex flex-col">
                                    <div className="flex items-center justify-between">
                                      <span className="font-medium">
                                        {
                                          mechanic.user?.name || 
                                          `${mechanic.firstName || ''} ${mechanic.lastName || ''}`.trim() || 
                                          'Mécanicien'
                                        }
                                      </span>
                                      <span className="text-xs text-muted-foreground ml-2">
                                        ({mechanicLimit.assignedRequestsCount}/{mechanicLimit.maxAllowed})
                                      </span>
                                    </div>
                                    <span className="text-xs text-muted-foreground">
                                      {mechanic.specialties?.length > 0 ? mechanic.specialties.join(', ') : 'Généraliste'}
                                      {mechanic.station?.name && ` • ${mechanic.station.name}`}
                                    </span>
                                  </div>
                                </SelectItem>
                              );
                            })}
                          </SelectContent>
                        </Select>
                      )}
                      {assigningRequest === request.id && (
                        <Loader2 className="h-4 w-4 animate-spin" />
                      )}
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          ))
        )}
      </div>
    </div>
  );
}
