"use client";

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";
import { useManagerMechanics } from "@/hooks/use-manager-mechanics";
import { useState } from "react";
import { toast } from "sonner";
import { 
  Users, 
  User, 
  Mail, 
  Phone, 
  CheckCircle, 
  XCircle,
  Wrench,
  Building2,
  Loader2
} from "lucide-react";

export function MechanicsManager() {
  const { 
    mechanics, 
    loading, 
    updateMechanicStatus, 
    availableCount, 
    busyCount,
    totalCount 
  } = useManagerMechanics();
  const [updatingMechanic, setUpdatingMechanic] = useState<string | null>(null);

  const handleStatusToggle = async (mechanicId: string, newStatus: boolean) => {
    try {
      setUpdatingMechanic(mechanicId);
      await updateMechanicStatus(mechanicId, newStatus);
      toast.success(`Statut mis à jour avec succès`);
    } catch (error) {
      toast.error("Erreur lors de la mise à jour");
      console.error(error);
    } finally {
      setUpdatingMechanic(null);
    }
  };

  const getStatusIcon = (isAvailable: boolean) => {
    return isAvailable ? (
      <CheckCircle className="h-4 w-4 text-green-600" />
    ) : (
      <XCircle className="h-4 w-4 text-red-600" />
    );
  };

  const getStatusBadge = (isAvailable: boolean) => {
    return isAvailable ? (
      <Badge variant="outline" className="text-green-600 border-green-600">
        Disponible
      </Badge>
    ) : (
      <Badge variant="outline" className="text-red-600 border-red-600">
        Occupé
      </Badge>
    );
  };

  if (loading) {
    return (
      <Card>
        <CardContent className="p-6">
          <div className="flex items-center justify-center">
            <Loader2 className="h-8 w-8 animate-spin" />
            <span className="ml-2">Chargement des mécaniciens...</span>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold">Équipe de mécaniciens</h2>
          <p className="text-muted-foreground">
            Gérez votre équipe et leur disponibilité
          </p>
        </div>
        <div className="flex items-center gap-4">
          <div className="text-sm text-muted-foreground">
            <span className="font-medium text-green-600">{availableCount}</span> disponibles • 
            <span className="font-medium text-red-600 ml-1">{busyCount}</span> occupés
          </div>
        </div>
      </div>

      {/* Statistiques rapides */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <Users className="h-8 w-8 text-blue-600" />
              <div>
                <p className="text-2xl font-bold">{totalCount}</p>
                <p className="text-sm text-muted-foreground">Total mécaniciens</p>
              </div>
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <CheckCircle className="h-8 w-8 text-green-600" />
              <div>
                <p className="text-2xl font-bold">{availableCount}</p>
                <p className="text-sm text-muted-foreground">Disponibles</p>
              </div>
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <XCircle className="h-8 w-8 text-red-600" />
              <div>
                <p className="text-2xl font-bold">{busyCount}</p>
                <p className="text-sm text-muted-foreground">Occupés</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Liste des mécaniciens */}
      <div className="grid gap-4">
        {mechanics.length === 0 ? (
          <Card>
            <CardContent className="p-6 text-center">
              <Users className="h-12 w-12 mx-auto mb-4 text-muted-foreground" />
              <p className="text-muted-foreground">Aucun mécanicien dans votre équipe</p>
            </CardContent>
          </Card>
        ) : (
          mechanics.map((mechanic) => (
            <Card key={mechanic.id} className="overflow-hidden">
              <CardHeader className="pb-3">
                <div className="flex items-start justify-between">
                  <div className="space-y-1">
                    <CardTitle className="text-lg flex items-center gap-2">
                      <User className="h-4 w-4" />
                      {mechanic.user.name}
                      {getStatusBadge(mechanic.isAvailable)}
                    </CardTitle>
                    <CardDescription className="flex items-center gap-4">
                      <span className="flex items-center gap-1">
                        <Mail className="h-3 w-3" />
                        {mechanic.user.email}
                      </span>
                      {mechanic.user.phone && (
                        <span className="flex items-center gap-1">
                          <Phone className="h-3 w-3" />
                          {mechanic.user.phone}
                        </span>
                      )}
                    </CardDescription>
                  </div>
                  <div className="flex items-center gap-2">
                    {getStatusIcon(mechanic.isAvailable)}
                    <Switch
                      checked={mechanic.isAvailable}
                      onCheckedChange={(checked: boolean) => handleStatusToggle(mechanic.id, checked)}
                      disabled={updatingMechanic === mechanic.id}
                    />
                    {updatingMechanic === mechanic.id && (
                      <Loader2 className="h-4 w-4 animate-spin" />
                    )}
                  </div>
                </div>
              </CardHeader>
              
              <CardContent className="pt-0">
                <div className="space-y-3">
                  {mechanic.specialties && mechanic.specialties.length > 0 && (
                    <div>
                      <h4 className="font-medium mb-2 flex items-center gap-2">
                        <Wrench className="h-4 w-4" />
                        Spécialités
                      </h4>
                      <div className="flex flex-wrap gap-2">
                        {mechanic.specialties.map((specialty, index) => (
                          <Badge key={index} variant="secondary">
                            {specialty}
                          </Badge>
                        ))}
                      </div>
                    </div>
                  )}

                  {mechanic.station && (
                    <div className="flex items-center gap-2 text-sm text-muted-foreground">
                      <Building2 className="h-4 w-4" />
                      <span>{mechanic.station.name}</span>
                      <span>•</span>
                      <span>{mechanic.station.address}</span>
                    </div>
                  )}

                  <div className="text-xs text-muted-foreground">
                    Membre depuis {new Date(mechanic.createdAt).toLocaleDateString()}
                  </div>
                </div>
              </CardContent>
            </Card>
          ))
        )}
      </div>
    </div>
  );
}
