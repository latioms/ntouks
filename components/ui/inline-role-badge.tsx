"use client";

import { useUserRole, getRoleDisplayName } from "@/hooks/use-user-role-display";
import { Shield, Building2, Wrench, User } from "lucide-react";

export function InlineRoleBadge({ className }: { className?: string }) {
  const { role, loading, error } = useUserRole();

  if (loading || error || !role) {
    return null;
  }

  const getRoleIcon = (roleName: string) => {
    switch (roleName) {
      case "admin":
        return <Shield className="h-3 w-3" />;
      case "station-manager":
        return <Building2 className="h-3 w-3" />;
      case "mechanic":
        return <Wrench className="h-3 w-3" />;
      default:
        return <User className="h-3 w-3" />;
    }
  };

  const getRoleColor = (roleName: string) => {
    switch (roleName) {
      case "admin":
        return "text-red-600 bg-red-50";
      case "station-manager":
        return "text-blue-600 bg-blue-50";
      case "mechanic":
        return "text-green-600 bg-green-50";
      default:
        return "text-gray-600 bg-gray-50";
    }
  };

  return (
    <span className={`inline-flex items-center gap-1 px-1.5 py-0.5 rounded-md text-xs font-medium ${getRoleColor(role.name)} ${className}`}>
      {getRoleIcon(role.name)}
      {getRoleDisplayName(role.name)}
    </span>
  );
}
