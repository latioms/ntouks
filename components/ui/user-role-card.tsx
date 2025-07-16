"use client";

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { useUserRole, getRoleDisplayName } from "@/hooks/use-user-role-display";
import { Shield, Building2, Wrench, User, Crown } from "lucide-react";

export function UserRoleCard() {
  const { role, loading, error } = useUserRole();

  if (loading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="text-sm">Mon Rôle</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex items-center space-x-2">
            <div className="h-4 w-4 animate-spin rounded-full border-2 border-current border-t-transparent" />
            <span className="text-sm text-muted-foreground">Chargement...</span>
          </div>
        </CardContent>
      </Card>
    );
  }

  if (error || !role) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="text-sm">Mon Rôle</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-sm text-muted-foreground">Rôle non défini</p>
        </CardContent>
      </Card>
    );
  }

  const getRoleIcon = (roleName: string) => {
    switch (roleName) {
      case "admin":
        return <Crown className="h-5 w-5 text-red-600" />;
      case "station-manager":
        return <Building2 className="h-5 w-5 text-blue-600" />;
      case "mechanic":
        return <Wrench className="h-5 w-5 text-green-600" />;
      default:
        return <User className="h-5 w-5 text-gray-600" />;
    }
  };

  const getRoleDescription = (roleName: string) => {
    switch (roleName) {
      case "admin":
        return "Accès complet au système";
      case "station-manager":
        return "Gestion de station-service";
      case "mechanic":
        return "Intervention et réparations";
      default:
        return "Utilisateur standard";
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-sm">Mon Rôle</CardTitle>
        <CardDescription>Votre niveau d'accès actuel</CardDescription>
      </CardHeader>
      <CardContent>
        <div className="flex items-center space-x-3">
          {getRoleIcon(role.name)}
          <div>
            <p className="font-medium">{getRoleDisplayName(role.name)}</p>
            <p className="text-sm text-muted-foreground">
              {getRoleDescription(role.name)}
            </p>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
