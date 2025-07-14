"use client";

import { useEffect } from "react";
import { useUserRole } from "@/hooks/use-user-role";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Shield, Users, Settings, CheckCircle, XCircle } from "lucide-react";

export function UserRoleDemo() {
  const {
    user,
    isLoading,
    error,
    checkRole,
    checkPermission,
    isAdmin,
    isStationManager,
    isMechanic,
    hasRole,
    refetchUserRole
  } = useUserRole();

  if (isLoading) {
    return (
      <Card>
        <CardContent className="flex items-center justify-center py-8">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
        </CardContent>
      </Card>
    );
  }

  if (error) {
    return (
      <Card>
        <CardContent className="py-8">
          <div className="text-center text-red-500">
            Erreur: {error}
          </div>
          <Button onClick={refetchUserRole} className="mt-4">
            Réessayer
          </Button>
        </CardContent>
      </Card>
    );
  }

  const PermissionCheck = ({ resource, action }: { resource: string; action: string }) => {
    const hasPermission = checkPermission(resource, action);
    return (
      <div className="flex items-center gap-2">
        {hasPermission ? (
          <CheckCircle className="h-4 w-4 text-green-500" />
        ) : (
          <XCircle className="h-4 w-4 text-red-500" />
        )}
        <span className="text-sm">
          {resource}:{action}
        </span>
      </div>
    );
  };

  return (
    <div className="space-y-6">
      {/* Informations utilisateur */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Users className="h-5 w-5" />
            Informations Utilisateur
          </CardTitle>
          <CardDescription>
            Détails de l'utilisateur connecté et son rôle
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div>
            <strong>Nom:</strong> {user?.name || "Non défini"}
          </div>
          <div>
            <strong>Email:</strong> {user?.email || "Non défini"}
          </div>
          <div className="flex items-center gap-2">
            <strong>Rôle:</strong>
            {user?.role ? (
              <Badge className="flex items-center gap-1">
                <Shield className="h-3 w-3" />
                {user.role.name}
              </Badge>
            ) : (
              <Badge variant="outline">Aucun rôle assigné</Badge>
            )}
          </div>
          {user?.role?.description && (
            <div>
              <strong>Description:</strong> {user.role.description}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Vérifications de rôles */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Shield className="h-5 w-5" />
            Vérifications de Rôles
          </CardTitle>
          <CardDescription>
            Vérification des rôles et permissions de l'utilisateur
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div className="flex items-center gap-2">
              {isAdmin() ? (
                <CheckCircle className="h-4 w-4 text-green-500" />
              ) : (
                <XCircle className="h-4 w-4 text-red-500" />
              )}
              <span>Admin</span>
            </div>
            <div className="flex items-center gap-2">
              {isStationManager() ? (
                <CheckCircle className="h-4 w-4 text-green-500" />
              ) : (
                <XCircle className="h-4 w-4 text-red-500" />
              )}
              <span>Gestionnaire Station</span>
            </div>
            <div className="flex items-center gap-2">
              {isMechanic() ? (
                <CheckCircle className="h-4 w-4 text-green-500" />
              ) : (
                <XCircle className="h-4 w-4 text-red-500" />
              )}
              <span>Mécanicien</span>
            </div>
            <div className="flex items-center gap-2">
              {hasRole ? (
                <CheckCircle className="h-4 w-4 text-green-500" />
              ) : (
                <XCircle className="h-4 w-4 text-red-500" />
              )}
              <span>A un rôle</span>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Permissions (si l'utilisateur a un rôle) */}
      {user?.role?.permissions && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Settings className="h-5 w-5" />
              Permissions
            </CardTitle>
            <CardDescription>
              Permissions associées au rôle de l'utilisateur
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-2">
            {user.role.permissions.length === 0 ? (
              <p className="text-muted-foreground">Aucune permission définie</p>
            ) : (
              user.role.permissions.map((rp) => (
                <PermissionCheck
                  key={rp.permission.id}
                  resource={rp.permission.resource}
                  action={rp.permission.action}
                />
              ))
            )}
          </CardContent>
        </Card>
      )}

      {/* Actions */}
      <Card>
        <CardHeader>
          <CardTitle>Actions</CardTitle>
        </CardHeader>
        <CardContent>
          <Button onClick={refetchUserRole} variant="outline">
            Actualiser les informations
          </Button>
        </CardContent>
      </Card>
    </div>
  );
}
