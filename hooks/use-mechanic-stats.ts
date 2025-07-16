import { useState, useEffect } from 'react';

interface MechanicStats {
  totalRequests: number;
  pendingRequests: number;
  inProgressRequests: number;
  completedRequests: number;
  todayRequests: number;
  urgentRequests: number;
  completionRate: number;
  isAvailable: boolean;
  specialties: string[];
  recentUrgentRequests: Array<{
    id: string;
    description: string;
    priority: number;
    createdAt: string;
  }>;
}

interface UseMechanicStatsReturn {
  stats: MechanicStats | null;
  isLoading: boolean;
  error: string | null;
  refreshStats: () => void;
}

export function useMechanicStats(): UseMechanicStatsReturn {
  const [stats, setStats] = useState<MechanicStats | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchStats = async () => {
    try {
      setIsLoading(true);
      setError(null);
      
      const response = await fetch('/api/mechanic/stats');
      const data = await response.json();
      
      if (!response.ok) {
        throw new Error(data.error || 'Erreur lors du chargement des statistiques');
      }
      
      setStats(data.stats);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Une erreur est survenue');
    } finally {
      setIsLoading(false);
    }
  };

  const refreshStats = () => {
    fetchStats();
  };

  useEffect(() => {
    fetchStats();
  }, []);

  return {
    stats,
    isLoading,
    error,
    refreshStats,
  };
}
