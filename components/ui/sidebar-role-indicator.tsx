"use client";

import { useUserRole, getRoleDisplayName } from "@/hooks/use-user-role-display";
import { Shield, Building2, Wrench, User } from "lucide-react";

export function SidebarRoleIndicator() {
  const { role, loading } = useUserRole();

  if (loading || !role) {
    return null;
  }

  const getRoleIcon = (roleName: string) => {
    switch (roleName) {
      case "admin":
        return <Shield className="h-4 w-4" />;
      case "station-manager":
        return <Building2 className="h-4 w-4" />;
      case "mechanic":
        return <Wrench className="h-4 w-4" />;
      default:
        return <User className="h-4 w-4" />;
    }
  };

  const getRoleColor = (roleName: string) => {
    switch (roleName) {
      case "admin":
        return "text-red-500 bg-red-50 border-red-200";
      case "station-manager":
        return "text-blue-500 bg-blue-50 border-blue-200";
      case "mechanic":
        return "text-green-500 bg-green-50 border-green-200";
      default:
        return "text-gray-500 bg-gray-50 border-gray-200";
    }
  };

  return (
    <div className="flex items-center gap-2 px-4 py-2 border-t border-border/40 group-data-[collapsible=icon]:justify-center group-data-[collapsible=icon]:border-none group-data-[collapsible=icon]:px-2">
      <div className={`${getRoleColor(role.name)} flex items-center gap-1.5 px-2.5 py-1.5 rounded-full text-xs font-medium border group-data-[collapsible=icon]:px-1.5`}>
        {getRoleIcon(role.name)}
        <span className="group-data-[collapsible=icon]:hidden">
          {getRoleDisplayName(role.name)}
        </span>
      </div>
    </div>
  );
}
