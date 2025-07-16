"use client";

import { useState, useEffect } from "react";
import { useSearchParams } from "next/navigation";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Label } from "@/components/ui/label";
import { toast } from "sonner";
import { 
  Search, 
  MapPin, 
  Phone, 
  Clock, 
  User, 
  CheckCircle,
  AlertTriangle,
  Car,
  Wrench,
  Loader2,
  Navigation,
  MessageCircle
} from "lucide-react";
import { GoogleMap, LoadScript, Marker, InfoWindow, DirectionsRenderer } from '@react-google-maps/api';
import { subscribeToRequestUpdates, subscribeMechanicLocation } from "@/lib/supabase";

interface Request {
  id: string;
  requesterName: string;
  requesterPhone: string;
  requesterEmail?: string;
  breakdownType: string;
  description: string;
  urgency: number;
  address: string;
  latitude: number;
  longitude: number;
  status: string;
  priority: number;
  createdAt: string;
  assignedAt?: string;
  startedAt?: string;
  completedAt?: string;
  mechanic?: {
    id: string;
    firstName: string;
    lastName: string;
    phone: string;
    latitude?: number;
    longitude?: number;
    user?: {
      name: string;
      phone?: string;
    };
  };
  station?: {
    name: string;
    address: string;
    phone: string;
    latitude: number;
    longitude: number;
  };
  interventions?: any[];
  invoice?: any;
}

const mapContainerStyle = {
  width: '100%',
  height: '400px',
  borderRadius: '12px'
};

const defaultCenter = {
  lat: 3.8480, // Cameroun - Yaoundé coordinates  
  lng: 11.5021
};

export default function TrackPage() {
  const searchParams = useSearchParams();
  const phoneParam = searchParams.get('phone');
  const idParam = searchParams.get('id');
  
  const [phone, setPhone] = useState(phoneParam || "");
  const [requests, setRequests] = useState<Request[]>([]);
  const [loading, setLoading] = useState(false);
  const [searched, setSearched] = useState(false);
  const [selectedRequest, setSelectedRequest] = useState<Request | null>(null);
  const [mechanicLocation, setMechanicLocation] = useState<{lat: number, lng: number} | null>(null);
  const [directionsResult, setDirectionsResult] = useState<google.maps.DirectionsResult | null>(null);
  const [trackingActive, setTrackingActive] = useState(false);

  // Rechercher par ID si fourni en paramètre
  useEffect(() => {
    if (idParam && !searched) {
      searchRequestById(idParam);
    } else if (phoneParam && !searched) {
      searchRequests();
    }
  }, [idParam, phoneParam]);

  // S'abonner aux mises à jour temps réel quand une demande est sélectionnée
  useEffect(() => {
    if (!selectedRequest) return;

    const subscription = subscribeToRequestUpdates(
      selectedRequest.id,
      (payload) => {
        console.log('Mise à jour de la demande:', payload);
        // Recharger les données de la demande
        searchRequestById(selectedRequest.id);
      }
    );

    return () => {
      subscription.unsubscribe();
    };
  }, [selectedRequest?.id]);

  // S'abonner à la localisation du mécanicien
  useEffect(() => {
    if (!selectedRequest?.mechanic?.id || selectedRequest.status !== 'IN_PROGRESS') return;

    const subscription = subscribeMechanicLocation(
      selectedRequest.mechanic.id,
      (payload) => {
        console.log('Mise à jour localisation mécanicien:', payload);
        setMechanicLocation({
          lat: payload.latitude,
          lng: payload.longitude
        });
        
        // Mettre à jour les directions si on a la localisation client
        if (selectedRequest.latitude && selectedRequest.longitude) {
          calculateRoute(
            { lat: payload.latitude, lng: payload.longitude },
            { lat: selectedRequest.latitude, lng: selectedRequest.longitude }
          );
        }
      }
    );

    setTrackingActive(true);

    return () => {
      subscription.unsubscribe();
      setTrackingActive(false);
    };
  }, [selectedRequest?.mechanic?.id, selectedRequest?.status]);

  const calculateRoute = async (
    origin: { lat: number; lng: number },
    destination: { lat: number; lng: number }
  ) => {
    if (!window.google) return;

    const directionsService = new google.maps.DirectionsService();
    
    try {
      const result = await directionsService.route({
        origin: origin,
        destination: destination,
        travelMode: google.maps.TravelMode.DRIVING,
      });
      setDirectionsResult(result);
    } catch (error) {
      console.error('Erreur lors du calcul de l\'itinéraire:', error);
    }
  };

  const searchRequestById = async (requestId: string) => {
    setLoading(true);
    try {
      const response = await fetch(`/api/request/${requestId}`);
      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Erreur lors de la recherche');
      }

      setSelectedRequest(data.request);
      setRequests([data.request]);
      setSearched(true);

      if (data.request.mechanic?.latitude && data.request.mechanic?.longitude) {
        setMechanicLocation({
          lat: data.request.mechanic.latitude,
          lng: data.request.mechanic.longitude
        });
      }

    } catch (error) {
      console.error("Erreur:", error);
      toast.error(error instanceof Error ? error.message : "Erreur de recherche");
    } finally {
      setLoading(false);
    }
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'PENDING':
        return <Badge variant="destructive">En attente</Badge>;
      case 'ASSIGNED':
        return <Badge variant="default">Assignée</Badge>;
      case 'IN_PROGRESS':
        return <Badge variant="secondary">En cours</Badge>;
      case 'COMPLETED':
        return <Badge variant="outline" className="text-green-600 border-green-600">Terminée</Badge>;
      case 'CANCELLED':
        return <Badge variant="outline" className="text-gray-600 border-gray-600">Annulée</Badge>;
      default:
        return <Badge variant="outline">{status}</Badge>;
    }
  };

  const getUrgencyBadge = (urgency: number) => {
    if (urgency >= 4) {
      return <Badge variant="destructive">Critique</Badge>;
    } else if (urgency >= 3) {
      return <Badge className="bg-orange-100 text-orange-800">Urgent</Badge>;
    } else if (urgency >= 2) {
      return <Badge className="bg-yellow-100 text-yellow-800">Moyen</Badge>;
    } else {
      return <Badge variant="secondary">Normal</Badge>;
    }
  };

  const searchRequests = async () => {
    if (!phone.trim()) {
      toast.error("Veuillez saisir votre numéro de téléphone");
      return;
    }

    setLoading(true);
    try {
      const response = await fetch(`/api/request?phone=${encodeURIComponent(phone)}`);
      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Erreur lors de la recherche');
      }

      setRequests(data.requests || []);
      setSearched(true);

      if (data.requests.length === 0) {
        toast.info("Aucune demande trouvée pour ce numéro");
      }

    } catch (error) {
      console.error("Erreur:", error);
      toast.error(error instanceof Error ? error.message : "Erreur de recherche");
    } finally {
      setLoading(false);
    }
  };

  // Recherche automatique si le téléphone est fourni en paramètre
  useEffect(() => {
    if (phoneParam && !searched) {
      searchRequests();
    }
  }, [phoneParam]);

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'PENDING':
        return <AlertTriangle className="h-4 w-4 text-orange-600" />;
      case 'ASSIGNED':
        return <User className="h-4 w-4 text-blue-600" />;
      case 'IN_PROGRESS':
        return <Wrench className="h-4 w-4 text-purple-600" />;
      case 'COMPLETED':
        return <CheckCircle className="h-4 w-4 text-green-600" />;
      default:
        return <Clock className="h-4 w-4" />;
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleString('fr-FR');
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 p-4">
      <div className="max-w-4xl mx-auto space-y-6">
        {/* En-tête */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Search className="h-6 w-6" />
              Suivi de vos demandes d'assistance
            </CardTitle>
            <CardDescription>
              Entrez votre numéro de téléphone pour voir l'état de vos demandes
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="flex gap-4">
              <div className="flex-1">
                <Label htmlFor="phone">Numéro de téléphone</Label>
                <Input
                  id="phone"
                  type="tel"
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  placeholder="Ex: +237 6XX XXX XXX"
                  onKeyPress={(e) => e.key === 'Enter' && searchRequests()}
                />
              </div>
              <div className="flex items-end">
                <Button onClick={searchRequests} disabled={loading}>
                  {loading ? (
                    <Loader2 className="h-4 w-4 animate-spin" />
                  ) : (
                    <Search className="h-4 w-4" />
                  )}
                  Rechercher
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Résultats */}
        {searched && (
          <div className="space-y-4">
            {requests.length === 0 ? (
              <Card>
                <CardContent className="p-6 text-center">
                  <AlertTriangle className="h-12 w-12 mx-auto mb-4 text-muted-foreground" />
                  <h3 className="text-lg font-medium mb-2">Aucune demande trouvée</h3>
                  <p className="text-muted-foreground">
                    Aucune demande d'assistance n'a été trouvée pour ce numéro de téléphone.
                  </p>
                </CardContent>
              </Card>
            ) : (
              <>
                <div className="flex items-center justify-between">
                  <h2 className="text-2xl font-bold">
                    {requests.length} demande{requests.length > 1 ? 's' : ''} trouvée{requests.length > 1 ? 's' : ''}
                  </h2>
                </div>

                {requests.map((request) => (
                  <Card key={request.id} className="overflow-hidden">
                    <CardHeader className="pb-3">
                      <div className="flex items-start justify-between">
                        <div className="space-y-2">
                          <div className="flex items-center gap-2">
                            {getStatusIcon(request.status)}
                            <CardTitle className="text-lg">
                              Demande #{request.id.slice(-8)}
                            </CardTitle>
                            {getStatusBadge(request.status)}
                            {getUrgencyBadge(request.urgency)}
                          </div>
                          <CardDescription className="flex items-center gap-4">
                            <span className="flex items-center gap-1">
                              <Clock className="h-3 w-3" />
                              {formatDate(request.createdAt)}
                            </span>
                            <span className="flex items-center gap-1">
                              <MapPin className="h-3 w-3" />
                              {request.address}
                            </span>
                          </CardDescription>
                        </div>
                      </div>
                    </CardHeader>
                    
                    <CardContent className="space-y-4">
                      {/* Description du problème */}
                      <div>
                        <h4 className="font-medium mb-2">Problème signalé</h4>
                        <div className="bg-muted p-3 rounded">
                          <p className="text-sm"><strong>Type:</strong> {request.breakdownType}</p>
                          <p className="text-sm mt-1">{request.description}</p>
                        </div>
                      </div>

                      {/* Statut et progression */}
                      <div>
                        <h4 className="font-medium mb-2">Progression</h4>
                        <div className="space-y-2">
                          <div className="flex items-center gap-2 text-sm">
                            <CheckCircle className="h-4 w-4 text-green-600" />
                            <span>Demande créée - {formatDate(request.createdAt)}</span>
                          </div>
                          
                          {request.assignedAt && (
                            <div className="flex items-center gap-2 text-sm">
                              <CheckCircle className="h-4 w-4 text-green-600" />
                              <span>Mécanicien assigné - {formatDate(request.assignedAt)}</span>
                            </div>
                          )}
                          
                          {request.startedAt && (
                            <div className="flex items-center gap-2 text-sm">
                              <CheckCircle className="h-4 w-4 text-green-600" />
                              <span>Intervention démarrée - {formatDate(request.startedAt)}</span>
                            </div>
                          )}
                          
                          {request.completedAt && (
                            <div className="flex items-center gap-2 text-sm">
                              <CheckCircle className="h-4 w-4 text-green-600" />
                              <span>Intervention terminée - {formatDate(request.completedAt)}</span>
                            </div>
                          )}
                        </div>
                      </div>

                      {/* Informations mécanicien */}
                      {request.mechanic && (
                        <Alert>
                          <User className="h-4 w-4" />
                          <AlertDescription>
                            <strong>Mécanicien assigné:</strong> {request.mechanic.user?.name || `${request.mechanic.firstName} ${request.mechanic.lastName}`}
                            {(request.mechanic.user?.phone || request.mechanic.phone) && (
                              <>
                                <br />
                                <strong>Contact:</strong> {request.mechanic.user?.phone || request.mechanic.phone}
                              </>
                            )}
                          </AlertDescription>
                        </Alert>
                      )}

                      {/* Informations station */}
                      {request.station && (
                        <Alert>
                          <MapPin className="h-4 w-4" />
                          <AlertDescription>
                            <strong>Station responsable:</strong> {request.station.name}
                            <br />
                            <strong>Adresse:</strong> {request.station.address}
                            <br />
                            <strong>Téléphone:</strong> {request.station.phone}
                          </AlertDescription>
                        </Alert>
                      )}

                      {/* Carte de suivi en temps réel */}
                      {request.status === 'IN_PROGRESS' && request.mechanic && (
                        <div className="mt-6">
                          <div className="flex items-center justify-between mb-4">
                            <h3 className="text-lg font-semibold flex items-center gap-2">
                              <Navigation className="h-5 w-5" />
                              Suivi en temps réel
                            </h3>
                            {trackingActive && (
                              <Badge variant="outline" className="text-green-600 border-green-600">
                                <div className="flex items-center gap-1">
                                  <div className="w-2 h-2 bg-green-600 rounded-full animate-pulse"></div>
                                  En direct
                                </div>
                              </Badge>
                            )}
                          </div>
                          
                          <LoadScript googleMapsApiKey={process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY || ""}>
                            <GoogleMap
                              mapContainerStyle={mapContainerStyle}
                              center={mechanicLocation || { lat: request.latitude, lng: request.longitude }}
                              zoom={14}
                            >
                              {/* Marqueur du client */}
                              <Marker
                                position={{ lat: request.latitude, lng: request.longitude }}
                                icon={{
                                  url: 'data:image/svg+xml;base64,' + btoa(`
                                    <svg width="32" height="32" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                                      <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z" fill="#EF4444"/>
                                      <circle cx="12" cy="10" r="3" fill="white"/>
                                    </svg>
                                  `),
                                  scaledSize: new google.maps.Size(32, 32)
                                }}
                                title="Votre position"
                              />

                              {/* Marqueur du mécanicien */}
                              {mechanicLocation && (
                                <Marker
                                  position={mechanicLocation}
                                  icon={{
                                    url: 'data:image/svg+xml;base64,' + btoa(`
                                      <svg width="32" height="32" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                                        <circle cx="12" cy="12" r="10" fill="#3B82F6"/>
                                        <path d="M12 6v6l4 2" stroke="white" stroke-width="2" stroke-linecap="round"/>
                                      </svg>
                                    `),
                                    scaledSize: new google.maps.Size(32, 32)
                                  }}
                                  title={`Mécanicien: ${request.mechanic.user?.name || `${request.mechanic.firstName} ${request.mechanic.lastName}`}`}
                                />
                              )}

                              {/* Itinéraire */}
                              {directionsResult && (
                                <DirectionsRenderer
                                  directions={directionsResult}
                                  options={{
                                    suppressMarkers: true,
                                    polylineOptions: {
                                      strokeColor: '#3B82F6',
                                      strokeWeight: 4,
                                      strokeOpacity: 0.8
                                    }
                                  }}
                                />
                              )}
                            </GoogleMap>
                          </LoadScript>

                          {/* Informations de trajet */}
                          {directionsResult && (
                            <div className="mt-4 p-4 bg-blue-50 rounded-lg">
                              <div className="grid grid-cols-2 gap-4 text-sm">
                                <div>
                                  <strong>Distance:</strong> {directionsResult.routes[0]?.legs[0]?.distance?.text}
                                </div>
                                <div>
                                  <strong>Temps estimé:</strong> {directionsResult.routes[0]?.legs[0]?.duration?.text}
                                </div>
                              </div>
                            </div>
                          )}
                        </div>
                      )}

                      {/* Affichage pour les autres statuts */}
                      {(request.status === 'PENDING' || request.status === 'ASSIGNED') && (
                        <Alert className="mt-6">
                          <AlertTriangle className="h-4 w-4" />
                          <AlertDescription>
                            {request.status === 'PENDING' ? (
                              <span>
                                <strong>En attente de traitement</strong><br />
                                Votre demande est en cours de traitement. Un mécanicien vous sera assigné sous peu.
                              </span>
                            ) : (
                              <span>
                                <strong>Mécanicien assigné</strong><br />
                                Un mécanicien vous a été assigné et va bientôt vous contacter pour démarrer l'intervention.
                              </span>
                            )}
                          </AlertDescription>
                        </Alert>
                      )}

                      {request.status === 'COMPLETED' && (
                        <Alert className="mt-6">
                          <CheckCircle className="h-4 w-4" />
                          <AlertDescription>
                            <strong>Intervention terminée</strong><br />
                            L'intervention a été complétée avec succès. Merci d'avoir utilisé nos services.
                          </AlertDescription>
                        </Alert>
                      )}
                    </CardContent>
                  </Card>
                ))}
              </>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
