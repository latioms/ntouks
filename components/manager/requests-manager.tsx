"use client";

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useManagerRequests } from "@/hooks/use-manager-requests";
import { useManagerMechanics } from "@/hooks/use-manager-mechanics";
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
  const [assigningRequest, setAssigningRequest] = useState<string | null>(null);

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
            Gérez les demandes clients et assignez des mécaniciens
          </p>
        </div>
        <Button onClick={fetchRequests} variant="outline">
          Actualiser
        </Button>
      </div>

      <div className="grid gap-4">
        {requests.length === 0 ? (
          <Card>
            <CardContent className="p-6 text-center">
              <AlertTriangle className="h-12 w-12 mx-auto mb-4 text-muted-foreground" />
              <p className="text-muted-foreground">Aucune demande d'assistance</p>
            </CardContent>
          </Card>
        ) : (
          requests.map((request) => (
            <Card key={request.id} className="overflow-hidden">
              <CardHeader className="pb-3">
                <div className="flex items-start justify-between">
                  <div className="space-y-1">
                    <CardTitle className="text-lg flex items-center gap-2">
                      <User className="h-4 w-4" />
                      {request.requesterName}
                      {getUrgencyBadge(request.urgency)}
                    </CardTitle>
                    <CardDescription className="flex items-center gap-4">
                      <span className="flex items-center gap-1">
                        <Phone className="h-3 w-3" />
                        {request.requesterPhone}
                      </span>
                      <span className="flex items-center gap-1">
                        <MapPin className="h-3 w-3" />
                        {request.address}
                      </span>
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
                    <div className="flex items-center justify-between p-3 bg-green-50 rounded-md">
                      <div className="flex items-center gap-2">
                        <CheckCircle className="h-4 w-4 text-green-600" />
                        <span className="text-sm font-medium">
                          Assigné à {request.mechanic.user.name}
                        </span>
                      </div>
                    </div>
                  ) : (
                    <div className="flex items-center gap-3 p-3 bg-orange-50 rounded-md">
                      <UserPlus className="h-4 w-4 text-orange-600" />
                      <Select 
                        onValueChange={(mechanicId) => handleAssignMechanic(request.id, mechanicId)}
                        disabled={assigningRequest === request.id}
                      >
                        <SelectTrigger className="w-full">
                          <SelectValue placeholder="Assigner un mécanicien" />
                        </SelectTrigger>
                        <SelectContent>
                          {availableMechanics.length === 0 ? (
                            <SelectItem value="" disabled>
                              Aucun mécanicien disponible
                            </SelectItem>
                          ) : (
                            availableMechanics.map((mechanic) => (
                              <SelectItem key={mechanic.id} value={mechanic.id}>
                                {mechanic.user.name} - {mechanic.specialties.join(', ')}
                              </SelectItem>
                            ))
                          )}
                        </SelectContent>
                      </Select>
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
