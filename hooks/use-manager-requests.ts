"use client";

import { useState, useEffect } from "react";

interface Request {
  id: string;
  requesterName: string;
  requesterPhone: string;
  requesterEmail?: string;
  breakdownType: string;
  description: string;
  urgency: number;
  address: string;
  status: string;
  priority: number;
  createdAt: string;
  mechanic?: {
    id: string;
    firstName?: string;
    lastName?: string;
    user?: {
      name: string;
      email: string;
    };
  };
  station?: {
    name: string;
    address: string;
  };
}

export function useManagerRequests() {
  const [requests, setRequests] = useState<Request[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchRequests = async () => {
    try {
      setLoading(true);
      const response = await fetch('/api/manager/requests');
      
      if (!response.ok) {
        throw new Error('Erreur lors du chargement des requêtes');
      }
      
      const data = await response.json();
      setRequests(data.requests || []);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Erreur inconnue');
    } finally {
      setLoading(false);
    }
  };

  const assignMechanic = async (requestId: string, mechanicId: string, priority?: number) => {
    try {
      const response = await fetch('/api/manager/assign', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          requestId,
          mechanicId,
          priority
        })
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Erreur lors de l\'assignation');
      }

      // Rafraîchir la liste
      await fetchRequests();
      return await response.json();
    } catch (err) {
      throw err;
    }
  };

  const updateRequestPriority = async (requestId: string, priority: number) => {
    try {
      // Cette fonctionnalité peut être ajoutée plus tard
      console.log('Update priority:', requestId, priority);
    } catch (err) {
      throw err;
    }
  };

  useEffect(() => {
    fetchRequests();
  }, []);

  return {
    requests,
    loading,
    error,
    fetchRequests,
    assignMechanic,
    updateRequestPriority,
    pendingCount: requests.filter(r => r.status === 'PENDING').length,
    assignedCount: requests.filter(r => r.status === 'ASSIGNED').length,
    completedCount: requests.filter(r => r.status === 'COMPLETED').length
  };
}
