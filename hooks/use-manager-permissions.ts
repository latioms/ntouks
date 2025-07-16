"use client";

import { useUserRole } from "./use-user-role-display";

interface DashboardPermissions {
  canViewRequests: boolean;
  canAssignMechanics: boolean;
  canManageMechanics: boolean;
  canViewStats: boolean;
  canManageUsers: boolean;
  canManageStations: boolean;
  canViewReports: boolean;
  canManageSettings: boolean;
}

export function useManagerPermissions() {
  const { role, loading } = useUserRole();

  const getPermissions = (): DashboardPermissions => {
    if (!role) {
      return {
        canViewRequests: false,
        canAssignMechanics: false,
        canManageMechanics: false,
        canViewStats: false,
        canManageUsers: false,
        canManageStations: false,
        canViewReports: false,
        canManageSettings: false
      };
    }

    switch (role.name) {
      case 'admin':
        return {
          canViewRequests: true,
          canAssignMechanics: true,
          canManageMechanics: true,
          canViewStats: true,
          canManageUsers: true,
          canManageStations: true,
          canViewReports: true,
          canManageSettings: true
        };

      case 'station-manager':
        return {
          canViewRequests: true,
          canAssignMechanics: true,
          canManageMechanics: true,
          canViewStats: true,
          canManageUsers: false,
          canManageStations: false,
          canViewReports: true,
          canManageSettings: false
        };

      case 'mechanic':
        return {
          canViewRequests: true,
          canAssignMechanics: false,
          canManageMechanics: false,
          canViewStats: false,
          canManageUsers: false,
          canManageStations: false,
          canViewReports: false,
          canManageSettings: false
        };

      default:
        return {
          canViewRequests: false,
          canAssignMechanics: false,
          canManageMechanics: false,
          canViewStats: false,
          canManageUsers: false,
          canManageStations: false,
          canViewReports: false,
          canManageSettings: false
        };
    }
  };

  const permissions = getPermissions();

  const getDashboardSections = () => {
    const sections = [];

    if (permissions.canViewStats) {
      sections.push({
        id: 'stats',
        title: 'Statistiques',
        description: 'Vue d\'ensemble de l\'activité',
        icon: 'BarChart'
      });
    }

    if (permissions.canViewRequests) {
      sections.push({
        id: 'requests',
        title: 'Demandes d\'assistance',
        description: 'Gérer les requêtes clients',
        icon: 'AlertCircle'
      });
    }

    if (permissions.canManageMechanics) {
      sections.push({
        id: 'mechanics',
        title: 'Mécaniciens',
        description: 'Gérer l\'équipe technique',
        icon: 'Users'
      });
    }

    if (permissions.canViewReports) {
      sections.push({
        id: 'reports',
        title: 'Rapports',
        description: 'Analyses et données',
        icon: 'FileText'
      });
    }

    return sections;
  };

  const isAdmin = role?.name === 'admin';
  const isManager = role?.name === 'station-manager';
  const hasManagerAccess = isAdmin || isManager;

  return {
    permissions,
    role,
    loading,
    getDashboardSections,
    isAdmin,
    isManager,
    hasManagerAccess
  };
}
