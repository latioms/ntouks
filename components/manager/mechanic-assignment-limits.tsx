"use client";

import { useState, useEffect } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { useMechanicAssignmentLimits } from "@/hooks/use-mechanic-assignment-limits";
import { 
  User, 
  AlertTriangle, 
  CheckCircle, 
  Clock,
  Loader2,
  ListChecks
} from "lucide-react";

export function MechanicAssignmentLimitsView() {
  const { 
    limits, 
    loading, 
    error, 
    fetchAssignmentLimits,
    getAvailableMechanics 
  } = useMechanicAssignmentLimits();

  if (loading) {
    return (
      <Card>
        <CardContent className="p-6">
          <div className="flex items-center justify-center">
            <Loader2 className="h-8 w-8 animate-spin" />
            <span className="ml-2">Chargement des limites d'assignation...</span>
          </div>
        </CardContent>
      </Card>
    );
  }

  if (error) {
    return (
      <Alert variant="destructive">
        <AlertTriangle className="h-4 w-4" />
        <AlertDescription>{error}</AlertDescription>
      </Alert>
    );
  }

  const availableMechanics = getAvailableMechanics();
  const fullyAssigned = limits.filter(l => l.assignedRequestsCount >= l.maxAllowed);

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold">Limites d'assignation</h2>
          <p className="text-muted-foreground">
            Gérez les tâches assignées à vos mécaniciens (max. 2 par mécanicien)
          </p>
        </div>
        <Button variant="outline" onClick={fetchAssignmentLimits}>
          Actualiser
        </Button>
      </div>

      {/* Résumé */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <CheckCircle className="h-8 w-8 text-green-600" />
              <div>
                <p className="text-2xl font-bold">{availableMechanics.length}</p>
                <p className="text-sm text-muted-foreground">Disponibles pour nouvelles tâches</p>
              </div>
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <AlertTriangle className="h-8 w-8 text-red-600" />
              <div>
                <p className="text-2xl font-bold">{fullyAssigned.length}</p>
                <p className="text-sm text-muted-foreground">À capacité maximale</p>
              </div>
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <ListChecks className="h-8 w-8 text-blue-600" />
              <div>
                <p className="text-2xl font-bold">{limits.reduce((acc, l) => acc + l.assignedRequestsCount, 0)}</p>
                <p className="text-sm text-muted-foreground">Tâches actives totales</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Liste des mécaniciens */}
      <div className="grid gap-4">
        {limits.map((limit) => (
          <Card key={limit.mechanicId} className={`border-l-4 ${
            limit.canReceiveMoreTasks ? 'border-l-green-500' : 'border-l-red-500'
          }`}>
            <CardHeader className="pb-3">
              <div className="flex items-start justify-between">
                <div className="space-y-1">
                  <CardTitle className="text-lg flex items-center gap-2">
                    <User className="h-4 w-4" />
                    {limit.name}
                    {limit.canReceiveMoreTasks ? (
                      <Badge variant="outline" className="text-green-600 border-green-600">
                        Disponible
                      </Badge>
                    ) : (
                      <Badge variant="outline" className="text-red-600 border-red-600">
                        Complet
                      </Badge>
                    )}
                  </CardTitle>
                  <CardDescription>
                    {limit.assignedRequestsCount} / {limit.maxAllowed} tâches assignées
                  </CardDescription>
                </div>
                <div className="text-right">
                  <Progress 
                    value={(limit.assignedRequestsCount / limit.maxAllowed) * 100}
                    className="w-24 h-2"
                  />
                </div>
              </div>
            </CardHeader>
            
            {limit.activeRequests.length > 0 && (
              <CardContent className="pt-0">
                <div className="space-y-2">
                  <h4 className="font-medium text-sm text-muted-foreground">Tâches actives :</h4>
                  <div className="space-y-2">
                    {limit.activeRequests.map((request) => (
                      <div key={request.id} className="flex items-center justify-between p-2 bg-muted rounded-lg">
                        <div className="flex-1">
                          <p className="text-sm font-medium">{request.requesterName}</p>
                          <p className="text-xs text-muted-foreground">
                            {request.description.length > 50 
                              ? `${request.description.substring(0, 50)}...` 
                              : request.description
                            }
                          </p>
                        </div>
                        <div className="flex items-center gap-2">
                          <Badge variant="secondary" className="text-xs">
                            {request.status === 'ASSIGNED' ? 'Assignée' : 'En cours'}
                          </Badge>
                          <Clock className="h-3 w-3 text-muted-foreground" />
                          <span className="text-xs text-muted-foreground">
                            {new Date(request.assignedAt || request.createdAt).toLocaleDateString()}
                          </span>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </CardContent>
            )}
          </Card>
        ))}
      </div>

      {limits.length === 0 && (
        <Card>
          <CardContent className="p-6 text-center">
            <User className="h-12 w-12 mx-auto mb-4 text-muted-foreground" />
            <p className="text-muted-foreground">Aucun mécanicien trouvé</p>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
