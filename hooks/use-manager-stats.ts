"use client";

import { useState, useEffect } from "react";

interface ManagerStats {
  totalRequests: number;
  pendingRequests: number;
  assignedRequests: number;
  completedRequests: number;
  totalMechanics: number;
  availableMechanics: number;
  busyMechanics: number;
  averageResponseTime: number;
  completionRate: number;
  dailyRequests: number;
  weeklyRequests: number;
  monthlyRequests: number;
}

export function useManagerStats() {
  const [stats, setStats] = useState<ManagerStats>({
    totalRequests: 0,
    pendingRequests: 0,
    assignedRequests: 0,
    completedRequests: 0,
    totalMechanics: 0,
    availableMechanics: 0,
    busyMechanics: 0,
    averageResponseTime: 0,
    completionRate: 0,
    dailyRequests: 0,
    weeklyRequests: 0,
    monthlyRequests: 0
  });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchStats = async () => {
    try {
      setLoading(true);
      
      // Récupérer les requêtes et mécaniciens en parallèle
      const [requestsResponse, mechanicsResponse] = await Promise.all([
        fetch('/api/manager/requests'),
        fetch('/api/manager/mechanics')
      ]);

      if (!requestsResponse.ok || !mechanicsResponse.ok) {
        throw new Error('Erreur lors du chargement des statistiques');
      }

      const requestsData = await requestsResponse.json();
      const mechanicsData = await mechanicsResponse.json();

      const requests = requestsData.requests || [];
      const mechanics = mechanicsData.mechanics || [];

      // Calculer les statistiques
      const now = new Date();
      const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
      const weekAgo = new Date(today.getTime() - 7 * 24 * 60 * 60 * 1000);
      const monthAgo = new Date(today.getTime() - 30 * 24 * 60 * 60 * 1000);

      const pendingRequests = requests.filter((r: any) => r.status === 'PENDING').length;
      const assignedRequests = requests.filter((r: any) => r.status === 'ASSIGNED').length;
      const completedRequests = requests.filter((r: any) => r.status === 'COMPLETED').length;

      const dailyRequests = requests.filter((r: any) => 
        new Date(r.createdAt) >= today
      ).length;

      const weeklyRequests = requests.filter((r: any) => 
        new Date(r.createdAt) >= weekAgo
      ).length;

      const monthlyRequests = requests.filter((r: any) => 
        new Date(r.createdAt) >= monthAgo
      ).length;

      const availableMechanics = mechanics.filter((m: any) => m.isAvailable).length;
      const busyMechanics = mechanics.filter((m: any) => !m.isAvailable).length;

      // Calcul du taux de completion
      const totalProcessed = assignedRequests + completedRequests;
      const completionRate = totalProcessed > 0 ? (completedRequests / totalProcessed) * 100 : 0;

      // Calcul du temps de réponse moyen (simulé pour l'instant)
      const averageResponseTime = 45; // minutes

      setStats({
        totalRequests: requests.length,
        pendingRequests,
        assignedRequests,
        completedRequests,
        totalMechanics: mechanics.length,
        availableMechanics,
        busyMechanics,
        averageResponseTime,
        completionRate,
        dailyRequests,
        weeklyRequests,
        monthlyRequests
      });

    } catch (err) {
      setError(err instanceof Error ? err.message : 'Erreur inconnue');
    } finally {
      setLoading(false);
    }
  };

  const refreshStats = () => {
    fetchStats();
  };

  useEffect(() => {
    fetchStats();
    
    // Rafraîchir les stats toutes les 5 minutes
    const interval = setInterval(fetchStats, 5 * 60 * 1000);
    
    return () => clearInterval(interval);
  }, []);

  return {
    stats,
    loading,
    error,
    refreshStats
  };
}
