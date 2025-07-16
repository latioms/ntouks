"use client";

import { useState, useEffect } from "react";

interface Mechanic {
  id: string;
  firstName?: string;
  lastName?: string;
  specialties: string[];
  isAvailable: boolean;
  createdAt: string;
  user?: {
    name: string;
    email: string;
    phone?: string;
  };
  station?: {
    name: string;
    address: string;
  };
}

export function useManagerMechanics() {
  const [mechanics, setMechanics] = useState<Mechanic[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchMechanics = async () => {
    try {
      setLoading(true);
      const response = await fetch('/api/manager/mechanics');
      
      if (!response.ok) {
        throw new Error('Erreur lors du chargement des mécaniciens');
      }
      
      const data = await response.json();
      setMechanics(data.mechanics || []);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Erreur inconnue');
    } finally {
      setLoading(false);
    }
  };

  const addMechanic = async (userId: string, specialties: string[], stationId?: string) => {
    try {
      const response = await fetch('/api/manager/mechanics', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          userId,
          specialties,
          stationId
        })
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Erreur lors de l\'ajout');
      }

      // Rafraîchir la liste
      await fetchMechanics();
      return await response.json();
    } catch (err) {
      throw err;
    }
  };

  const updateMechanicStatus = async (mechanicId: string, isAvailable: boolean, specialties?: string[]) => {
    try {
      const response = await fetch('/api/manager/status', {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          mechanicId,
          isAvailable,
          specialties
        })
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Erreur lors de la mise à jour');
      }

      // Rafraîchir la liste
      await fetchMechanics();
      return await response.json();
    } catch (err) {
      throw err;
    }
  };

  const getAvailableMechanics = () => {
    return mechanics.filter(m => m.isAvailable);
  };

  const getMechanicsBySpecialty = (specialty: string) => {
    return mechanics.filter(m => 
      m.specialties.includes(specialty) && m.isAvailable
    );
  };

  useEffect(() => {
    fetchMechanics();
  }, []);

  return {
    mechanics,
    loading,
    error,
    fetchMechanics,
    addMechanic,
    updateMechanicStatus,
    getAvailableMechanics,
    getMechanicsBySpecialty,
    availableCount: mechanics.filter(m => m.isAvailable).length,
    busyCount: mechanics.filter(m => !m.isAvailable).length,
    totalCount: mechanics.length
  };
}
