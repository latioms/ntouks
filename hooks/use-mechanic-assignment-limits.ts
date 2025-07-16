"use client";

import { useState, useEffect } from "react";

interface MechanicAssignmentLimits {
  mechanicId: string;
  name: string;
  assignedRequestsCount: number;
  maxAllowed: number;
  canReceiveMoreTasks: boolean;
  activeRequests: any[];
}

export function useMechanicAssignmentLimits() {
  const [limits, setLimits] = useState<MechanicAssignmentLimits[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchAssignmentLimits = async () => {
    try {
      setLoading(true);
      setError(null);

      const response = await fetch('/api/manager/mechanics/assignment-limits');
      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Erreur lors du chargement des limites');
      }

      setLimits(data.limits || []);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Une erreur est survenue');
    } finally {
      setLoading(false);
    }
  };

  const checkMechanicAvailability = (mechanicId: string): boolean => {
    const mechanic = limits.find(l => l.mechanicId === mechanicId);
    return mechanic ? mechanic.canReceiveMoreTasks : false;
  };

  const getAvailableMechanics = () => {
    return limits.filter(l => l.canReceiveMoreTasks);
  };

  const getMechanicTaskCount = (mechanicId: string): number => {
    const mechanic = limits.find(l => l.mechanicId === mechanicId);
    return mechanic ? mechanic.assignedRequestsCount : 0;
  };

  useEffect(() => {
    fetchAssignmentLimits();
  }, []);

  return {
    limits,
    loading,
    error,
    fetchAssignmentLimits,
    checkMechanicAvailability,
    getAvailableMechanics,
    getMechanicTaskCount
  };
}
