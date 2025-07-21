"use client";

import { useState, useEffect, useRef } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { toast } from "sonner";
import { 
  MapPin, 
  Navigation, 
  Phone,
  User,
  Clock,
  Car,
  Loader2,
  CheckCircle,
  AlertTriangle
} from "lucide-react";
import { subscribeMechanicLocation, subscribeToRequestUpdates } from "@/lib/supabase";

interface TrackingData {
  requestId: string;
  status: string;
  mechanic: {
    id: string;
    name: string;
    phone: string;
    latitude?: number;
    longitude?: number;
  };
  customer: {
    name: string;
    phone: string;
    latitude: number;
    longitude: number;
    address: string;
  };
  estimatedArrival?: string;
  distance?: number;
}

interface RealTimeTrackingProps {
  requestId: string;
  onStatusChange?: (status: string) => void;
}

export function RealTimeTracking({ requestId, onStatusChange }: RealTimeTrackingProps) {
  const [trackingData, setTrackingData] = useState<TrackingData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isConnected, setIsConnected] = useState(false);
  const mapRef = useRef<google.maps.Map | null>(null);
  const mechanicMarkerRef = useRef<google.maps.Marker | null>(null);
  const customerMarkerRef = useRef<google.maps.Marker | null>(null);
  const directionsRendererRef = useRef<google.maps.DirectionsRenderer | null>(null);

  const fetchTrackingData = async () => {
    try {
      setLoading(true);
      setError(null);

      const response = await fetch(`/api/request/${requestId}`);
      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Erreur lors du chargement des données de tracking');
      }

      if (data.request && data.request.mechanic) {
        setTrackingData({
          requestId: data.request.id,
          status: data.request.status,
          mechanic: {
            id: data.request.mechanic.id,
            name: data.request.mechanic.user?.name || `${data.request.mechanic.firstName} ${data.request.mechanic.lastName}`,
            phone: data.request.mechanic.user?.phone || data.request.mechanic.phone,
            latitude: data.request.mechanic.latitude,
            longitude: data.request.mechanic.longitude
          },
          customer: {
            name: data.request.requesterName,
            phone: data.request.requesterPhone,
            latitude: data.request.latitude,
            longitude: data.request.longitude,
            address: data.request.address
          }
        });
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Une erreur est survenue');
    } finally {
      setLoading(false);
    }
  };

  const initializeMap = () => {
    if (!trackingData || !window.google) return;

    const mapContainer = document.getElementById('tracking-map');
    if (!mapContainer) return;

    // Initialiser la carte centrée sur le client
    const map = new google.maps.Map(mapContainer, {
      zoom: 13,
      center: { 
        lat: trackingData.customer.latitude, 
        lng: trackingData.customer.longitude 
      },
      mapTypeControl: false,
      streetViewControl: false,
      fullscreenControl: false
    });

    mapRef.current = map;

    // Marqueur client (destination)
    customerMarkerRef.current = new google.maps.Marker({
      position: { 
        lat: trackingData.customer.latitude, 
        lng: trackingData.customer.longitude 
      },
      map: map,
      title: 'Localisation du client',
      icon: {
        url: 'data:image/svg+xml;charset=UTF-8,' + encodeURIComponent(`
          <svg width="40" height="40" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
            <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z" fill="#ef4444" stroke="#dc2626" stroke-width="2"/>
            <circle cx="12" cy="10" r="3" fill="white"/>
          </svg>
        `),
        scaledSize: new google.maps.Size(40, 40),
        anchor: new google.maps.Point(20, 40)
      }
    });

    // Marqueur mécanicien (s'il a une position)
    if (trackingData.mechanic.latitude && trackingData.mechanic.longitude) {
      updateMechanicPosition(trackingData.mechanic.latitude, trackingData.mechanic.longitude);
    }

    // Initialiser le directionsRenderer
    directionsRendererRef.current = new google.maps.DirectionsRenderer({
      suppressMarkers: true,
      polylineOptions: {
        strokeColor: '#3b82f6',
        strokeWeight: 4,
        strokeOpacity: 0.8
      }
    });
    directionsRendererRef.current.setMap(map);
  };

  const updateMechanicPosition = (lat: number, lng: number) => {
    if (!mapRef.current) return;

    // Mettre à jour ou créer le marqueur mécanicien
    if (mechanicMarkerRef.current) {
      mechanicMarkerRef.current.setPosition({ lat, lng });
    } else {
      mechanicMarkerRef.current = new google.maps.Marker({
        position: { lat, lng },
        map: mapRef.current,
        title: 'Mécanicien en route',
        icon: {
          url: 'data:image/svg+xml;charset=UTF-8,' + encodeURIComponent(`
            <svg width="40" height="40" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
              <circle cx="12" cy="12" r="10" fill="#10b981" stroke="#059669" stroke-width="2"/>
              <path d="M8 12l2 2 4-4" stroke="white" stroke-width="2" fill="none"/>
            </svg>
          `),
          scaledSize: new google.maps.Size(40, 40),
          anchor: new google.maps.Point(20, 20)
        }
      });
    }

    // Calculer et afficher l'itinéraire
    if (trackingData && directionsRendererRef.current) {
      const directionsService = new google.maps.DirectionsService();
      
      directionsService.route({
        origin: { lat, lng },
        destination: { 
          lat: trackingData.customer.latitude, 
          lng: trackingData.customer.longitude 
        },
        travelMode: google.maps.TravelMode.DRIVING
      }, (result, status) => {
        if (status === 'OK' && directionsRendererRef.current) {
          directionsRendererRef.current.setDirections(result);
          
          // Mettre à jour la distance et le temps estimé
          const route = result?.routes[0];
          if (route && route.legs[0]) {
            const leg = route.legs[0];
            setTrackingData(prev => prev ? {
              ...prev,
              distance: leg.distance?.value ? Math.round(leg.distance.value / 1000 * 10) / 10 : undefined,
              estimatedArrival: leg.duration?.text
            } : null);
          }
        }
      });
    }
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'ASSIGNED':
        return <Badge variant="default">Assignée</Badge>;
      case 'IN_PROGRESS':
        return <Badge variant="secondary" className="bg-blue-100 text-blue-800">En route</Badge>;
      case 'COMPLETED':
        return <Badge variant="outline" className="text-green-600 border-green-600">Terminée</Badge>;
      default:
        return <Badge variant="outline">{status}</Badge>;
    }
  };

  // S'abonner aux mises à jour temps réel
  useEffect(() => {
    if (!trackingData) return;

    setIsConnected(true);

    // S'abonner aux mises à jour de statut de la demande
    const requestSubscription = subscribeToRequestUpdates(
      requestId,
      (payload) => {
        console.log('Mise à jour demande:', payload);
        if (payload.status && onStatusChange) {
          onStatusChange(payload.status);
        }
        fetchTrackingData();
      }
    );

    // S'abonner à la position du mécanicien
    const locationSubscription = subscribeMechanicLocation(
      trackingData.mechanic.id,
      (payload) => {
        console.log('Mise à jour position mécanicien:', payload);
        updateMechanicPosition(payload.latitude, payload.longitude);
      }
    );

    return () => {
      requestSubscription.unsubscribe();
      locationSubscription.unsubscribe();
      setIsConnected(false);
    };
  }, [trackingData?.mechanic.id, requestId, onStatusChange]);

  // Charger les données initiales
  useEffect(() => {
    fetchTrackingData();
  }, [requestId]);

  // Initialiser la carte quand les données sont prêtes
  useEffect(() => {
    if (trackingData && window.google) {
      initializeMap();
    }
  }, [trackingData]);

  if (loading) {
    return (
      <Card>
        <CardContent className="p-6">
          <div className="flex items-center justify-center">
            <Loader2 className="h-8 w-8 animate-spin" />
            <span className="ml-2">Chargement du tracking...</span>
          </div>
        </CardContent>
      </Card>
    );
  }

  if (error) {
    return (
      <Alert variant="destructive">
        <AlertTriangle className="h-4 w-4" />
        <AlertDescription>{error}</AlertDescription>
      </Alert>
    );
  }

  if (!trackingData) {
    return (
      <Alert>
        <AlertTriangle className="h-4 w-4" />
        <AlertDescription>Aucune donnée de tracking disponible pour cette demande.</AlertDescription>
      </Alert>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header avec statut */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="flex items-center gap-2">
                <Navigation className="h-5 w-5" />
                Suivi en temps réel
              </CardTitle>
              <CardDescription>
                Intervention pour {trackingData.customer.name}
              </CardDescription>
            </div>
            <div className="flex items-center gap-2">
              {getStatusBadge(trackingData.status)}
              <div className="flex items-center gap-1">
                <div className={`w-2 h-2 rounded-full ${isConnected ? 'bg-green-500' : 'bg-red-500'}`} />
                <span className="text-xs text-muted-foreground">
                  {isConnected ? 'Connecté' : 'Déconnecté'}
                </span>
              </div>
            </div>
          </div>
        </CardHeader>
      </Card>

      {/* Informations mécanicien */}
      <Card>
        <CardContent className="p-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <Car className="h-8 w-8 text-blue-600" />
              <div>
                <p className="font-medium">{trackingData.mechanic.name}</p>
                <p className="text-sm text-muted-foreground">Mécanicien assigné</p>
              </div>
            </div>
            <div className="text-right">
              {trackingData.distance && (
                <p className="text-lg font-bold text-blue-600">{trackingData.distance} km</p>
              )}
              {trackingData.estimatedArrival && (
                <p className="text-sm text-muted-foreground">ETA: {trackingData.estimatedArrival}</p>
              )}
            </div>
          </div>
          
          <div className="flex items-center gap-4 mt-3 pt-3 border-t">
            <Button variant="outline" size="sm" asChild>
              <a href={`tel:${trackingData.mechanic.phone}`}>
                <Phone className="h-4 w-4 mr-2" />
                Appeler
              </a>
            </Button>
            <span className="text-sm text-muted-foreground">
              {trackingData.mechanic.phone}
            </span>
          </div>
        </CardContent>
      </Card>

      {/* Carte */}
      <Card>
        <CardContent className="p-0">
          <div 
            id="tracking-map" 
            style={{ 
              width: '100%', 
              height: '400px',
              borderRadius: '0 0 8px 8px'
            }}
          />
        </CardContent>
      </Card>

      {/* Destination */}
      <Card>
        <CardContent className="p-4">
          <div className="flex items-start gap-3">
            <MapPin className="h-5 w-5 text-red-600 mt-0.5" />
            <div className="flex-1">
              <p className="font-medium">Destination</p>
              <p className="text-sm text-muted-foreground">{trackingData.customer.address}</p>
              <p className="text-sm text-muted-foreground mt-1">
                Client: {trackingData.customer.name} • {trackingData.customer.phone}
              </p>
            </div>
          </div>
        </CardContent>
      </Card>

      {trackingData.status === 'COMPLETED' && (
        <Alert>
          <CheckCircle className="h-4 w-4" />
          <AlertDescription>
            Intervention terminée ! Le mécanicien a résolu le problème.
          </AlertDescription>
        </Alert>
      )}
    </div>
  );
}
