import { useState, useEffect } from 'react';

interface MechanicRequest {
  id: string;
  description: string;
  location: string;
  status: string;
  priority: number;
  createdAt: string;
  notes?: string;
}

interface MechanicInfo {
  id: string;
  name: string;
  specialties: string[];
  isAvailable: boolean;
}

interface UseMechanicRequestsReturn {
  requests: MechanicRequest[];
  mechanicInfo: MechanicInfo | null;
  isLoading: boolean;
  error: string | null;
  updateRequestStatus: (requestId: string, status: string, notes?: string) => Promise<void>;
  refreshRequests: () => void;
}

export function useMechanicRequests(): UseMechanicRequestsReturn {
  const [requests, setRequests] = useState<MechanicRequest[]>([]);
  const [mechanicInfo, setMechanicInfo] = useState<MechanicInfo | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchRequests = async () => {
    try {
      setIsLoading(true);
      setError(null);
      
      const response = await fetch('/api/mechanic/requests');
      const data = await response.json();
      
      if (!response.ok) {
        throw new Error(data.error || 'Erreur lors du chargement des demandes');
      }
      
      setRequests(data.requests || []);
      setMechanicInfo(data.mechanicInfo || null);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Une erreur est survenue');
    } finally {
      setIsLoading(false);
    }
  };

  const updateRequestStatus = async (requestId: string, status: string, notes?: string) => {
    try {
      const response = await fetch(`/api/mechanic/requests/${requestId}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ status, notes }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Erreur lors de la mise à jour');
      }

      // Mettre à jour la liste locale
      setRequests(prev => 
        prev.map(req => 
          req.id === requestId 
            ? { ...req, status, notes: notes || req.notes }
            : req
        )
      );
    } catch (err) {
      throw new Error(err instanceof Error ? err.message : 'Erreur lors de la mise à jour');
    }
  };

  const refreshRequests = () => {
    fetchRequests();
  };

  useEffect(() => {
    fetchRequests();
  }, []);

  return {
    requests,
    mechanicInfo,
    isLoading,
    error,
    updateRequestStatus,
    refreshRequests,
  };
}
