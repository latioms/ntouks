"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { MapPin, Loader2 } from "lucide-react";

interface LocationData {
  latitude: number;
  longitude: number;
  address?: string;
}

interface GeolocationHelperProps {
  onLocationReceived: (location: LocationData) => void;
}

export function GeolocationHelper({ onLocationReceived }: GeolocationHelperProps) {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const getCurrentLocation = async () => {
    setIsLoading(true);
    setError(null);

    if (!navigator.geolocation) {
      setError("La géolocalisation n'est pas supportée par votre navigateur");
      setIsLoading(false);
      return;
    }

    navigator.geolocation.getCurrentPosition(
      async (position) => {
        const { latitude, longitude } = position.coords;
        
        try {
          // Optionnel: Récupérer l'adresse via reverse geocoding
          // Ici nous utilisons juste les coordonnées
          onLocationReceived({
            latitude,
            longitude
          });
          
          setIsLoading(false);
        } catch (err) {
          console.error("Erreur lors du traitement de la localisation:", err);
          onLocationReceived({ latitude, longitude });
          setIsLoading(false);
        }
      },
      (error) => {
        let errorMessage = "Erreur de géolocalisation";
        switch (error.code) {
          case error.PERMISSION_DENIED:
            errorMessage = "Permission de géolocalisation refusée";
            break;
          case error.POSITION_UNAVAILABLE:
            errorMessage = "Position non disponible";
            break;
          case error.TIMEOUT:
            errorMessage = "Délai de géolocalisation dépassé";
            break;
        }
        setError(errorMessage);
        setIsLoading(false);
      },
      {
        enableHighAccuracy: true,
        timeout: 10000,
        maximumAge: 60000
      }
    );
  };

  return (
    <div className="space-y-2">
      <Button
        type="button"
        variant="outline"
        onClick={getCurrentLocation}
        disabled={isLoading}
        className="w-full"
      >
        {isLoading ? (
          <>
            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
            Localisation en cours...
          </>
        ) : (
          <>
            <MapPin className="mr-2 h-4 w-4" />
            Utiliser ma position actuelle
          </>
        )}
      </Button>
      
      {error && (
        <p className="text-sm text-destructive">{error}</p>
      )}
    </div>
  );
}
