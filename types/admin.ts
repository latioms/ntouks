export interface AdminStats {
  totalStations: number;
  activeStations: number;
  totalMechanics: number;
  activeMechanics: number;
  totalRequests: number;
  pendingRequests: number;
  completedRequests: number;
  totalRevenue: number;
  platformUsers: number;
  recentRequests: number;
  recentCompletions: number;
  completionRate: number;
  activeStationRate: number;
}

export interface AdminDashboardProps {
  stats: AdminStats;
}
