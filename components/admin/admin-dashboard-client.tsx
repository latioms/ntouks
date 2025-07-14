"use client";

import { useState, useEffect } from "react";
import { AdminDashboardHeader } from "@/components/admin/admin-dashboard-header";
import { SystemAlerts } from "@/components/admin/system-alerts";
import { StatsCards } from "@/components/admin/stats-cards";
import { OperationalMetrics } from "@/components/admin/operational-metrics";
import { AdminActions } from "@/components/admin/admin-actions";
import { InitializationView } from "@/components/admin/initialization-view";
import { getPlatformStats } from "@/lib/admin-stats";

interface AdminStats {
  totalStations: number;
  activeStations: number;
  totalMechanics: number;
  activeMechanics: number;
  totalRequests: number;
  pendingRequests: number;
  totalRevenue: number;
  platformUsers: number;
}

export function AdminDashboardClient() {
  const [stats, setStats] = useState<AdminStats | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    // Chargement des données réelles de la plateforme
    const loadData = async () => {
      setIsLoading(true);
      try {
        const platformStats = await getPlatformStats();
        setStats(platformStats);
      } catch (error) {
        console.error("Erreur lors du chargement:", error);
        setStats(null);
      } finally {
        setIsLoading(false);
      }
    };

    loadData();
  }, []);

  if (isLoading) {
    return (
      <div className="min-h-screen bg-muted flex items-center justify-center">
        <div className="text-center space-y-4">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto"></div>
          <p>Chargement du tableau de bord administrateur...</p>
        </div>
      </div>
    );
  }

  // Affichage initial pour nouveaux administrateurs
  if (!stats || (stats.totalStations === 0 && stats.totalMechanics === 0)) {
    return <InitializationView />;
  }

  return (
    <div className="min-h-screen bg-muted p-4 space-y-6">
      <AdminDashboardHeader />
      <SystemAlerts />
      <StatsCards stats={stats} />
      <OperationalMetrics stats={stats} />
      <AdminActions />
    </div>
  );
}
