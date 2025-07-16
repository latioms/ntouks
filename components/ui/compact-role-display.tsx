"use client";

import { useUserRole, getRoleDisplayName } from "@/hooks/use-user-role-display";
import { Shield, Building2, Wrench, User, Dot } from "lucide-react";

export function CompactRoleDisplay({ variant = "sidebar" }: { variant?: "sidebar" | "inline" | "dropdown" }) {
  const { role, loading, error } = useUserRole();

  if (loading || error || !role) {
    return null;
  }

  const getRoleIcon = (roleName: string) => {
    const iconProps = variant === "inline" ? "h-3 w-3" : "h-4 w-4";
    switch (roleName) {
      case "admin":
        return <Shield className={iconProps} />;
      case "station-manager":
        return <Building2 className={iconProps} />;
      case "mechanic":
        return <Wrench className={iconProps} />;
      default:
        return <User className={iconProps} />;
    }
  };

  const getRoleStyles = (roleName: string) => {
    const baseStyles = "flex items-center gap-1.5 font-medium";
    
    switch (variant) {
      case "inline":
        return {
          admin: `${baseStyles} text-red-600 text-xs`,
          "station-manager": `${baseStyles} text-blue-600 text-xs`,
          mechanic: `${baseStyles} text-green-600 text-xs`,
          default: `${baseStyles} text-gray-600 text-xs`
        };
      case "dropdown":
        return {
          admin: `${baseStyles} text-red-600 text-sm`,
          "station-manager": `${baseStyles} text-blue-600 text-sm`,
          mechanic: `${baseStyles} text-green-600 text-sm`,
          default: `${baseStyles} text-gray-600 text-sm`
        };
      default: // sidebar
        return {
          admin: `${baseStyles} text-red-500 bg-red-50 px-2.5 py-1.5 rounded-full text-xs border border-red-200`,
          "station-manager": `${baseStyles} text-blue-500 bg-blue-50 px-2.5 py-1.5 rounded-full text-xs border border-blue-200`,
          mechanic: `${baseStyles} text-green-500 bg-green-50 px-2.5 py-1.5 rounded-full text-xs border border-green-200`,
          default: `${baseStyles} text-gray-500 bg-gray-50 px-2.5 py-1.5 rounded-full text-xs border border-gray-200`
        };
    }
  };

  const styles = getRoleStyles(role.name);
  const roleStyle = styles[role.name as keyof typeof styles] || styles.default;

  if (variant === "inline") {
    return (
      <span className={roleStyle}>
        <Dot className="h-2 w-2 -ml-1" />
        {getRoleDisplayName(role.name)}
      </span>
    );
  }

  return (
    <div className={roleStyle}>
      {getRoleIcon(role.name)}
      <span className={variant === "sidebar" ? "group-data-[collapsible=icon]:hidden" : ""}>
        {getRoleDisplayName(role.name)}
      </span>
    </div>
  );
}
