"use client";

import { Badge } from "@/components/ui/badge";
import { useUserRole, getRoleDisplayName } from "@/hooks/use-user-role-display";
import { Shield, Building2, Wrench, User } from "lucide-react";

export function UserRoleBadge({ className }: { className?: string }) {
  const { role, loading, error } = useUserRole();

  if (loading) {
    return (
      <Badge variant="secondary" className={className}>
        <div className="h-3 w-3 animate-spin rounded-full border-2 border-current border-t-transparent mr-1" />
        Chargement...
      </Badge>
    );
  }

  if (error || !role) {
    return null;
  }

  const getRoleIcon = (roleName: string) => {
    switch (roleName) {
      case "admin":
        return <Shield className="h-3 w-3 mr-1" />;
      case "station-manager":
        return <Building2 className="h-3 w-3 mr-1" />;
      case "mechanic":
        return <Wrench className="h-3 w-3 mr-1" />;
      default:
        return <User className="h-3 w-3 mr-1" />;
    }
  };

  const getRoleVariant = (roleName: string) => {
    switch (roleName) {
      case "admin":
        return "destructive";
      case "station-manager":
        return "default";
      case "mechanic":
        return "secondary";
      default:
        return "outline";
    }
  };

  return (
    <Badge 
      variant={getRoleVariant(role.name) as "destructive" | "default" | "secondary" | "outline"} 
      className={`text-xs flex items-center gap-1 px-2 py-0.5 ${className}`}
    >
      {getRoleIcon(role.name)}
      <span className="font-medium">{getRoleDisplayName(role.name)}</span>
    </Badge>
  );
}
