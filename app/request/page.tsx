"use client";

import { useState, useEffect, useCallback } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { toast } from "sonner";
import { 
  MapPin, 
  Phone, 
  Mail, 
  Car, 
  Wrench, 
  AlertTriangle,
  Clock,
  Navigation,
  Loader2,
  User
} from "lucide-react";
import { GoogleMap, LoadScript, Marker, InfoWindow } from '@react-google-maps/api';
import { useRouter } from "next/navigation";

interface Station {
  id: string;
  name: string;
  address: string;
  latitude: number;
  longitude: number;
  phone: string;
  email?: string;
  isActive: boolean;
  mechanicsCount?: number;
  distance?: number;
}

interface RequestFormData {
  requesterName: string;
  requesterPhone: string;
  requesterEmail: string;
  breakdownType: string;
  description: string;
  urgency: number;
  address: string;
  latitude: number;
  longitude: number;
  vehicleBrand: string;
  vehicleModel: string;
  vehicleYear: number;
  licensePlate: string;
  stationId: string;
}

const breakdownTypes = [
  { value: "MECHANICAL", label: "Mécanique" },
  { value: "ELECTRICAL", label: "Électrique" },
  { value: "TIRE", label: "Pneu" },
  { value: "BATTERY", label: "Batterie" },
  { value: "ENGINE", label: "Moteur" },
  { value: "TRANSMISSION", label: "Transmission" },
  { value: "BRAKES", label: "Freins" },
  { value: "OTHER", label: "Autre" }
];

const urgencyLevels = [
  { value: 1, label: "Faible", color: "bg-green-100 text-green-800" },
  { value: 2, label: "Moyenne", color: "bg-yellow-100 text-yellow-800" },
  { value: 3, label: "Élevée", color: "bg-orange-100 text-orange-800" },
  { value: 4, label: "Critique", color: "bg-red-100 text-red-800" }
];

const mapContainerStyle = {
  width: '100%',
  height: '400px',
  borderRadius: '12px'
};

const defaultCenter = {
  lat: 14.6928, // Dakar coordinates
  lng: -17.4467
};

export default function RequestPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [stations, setStations] = useState<Station[]>([]);
  const [selectedStation, setSelectedStation] = useState<Station | null>(null);
  const [userLocation, setUserLocation] = useState<{ lat: number; lng: number } | null>(null);
  const [mapCenter, setMapCenter] = useState(defaultCenter);
  const [formData, setFormData] = useState<RequestFormData>({
    requesterName: "",
    requesterPhone: "",
    requesterEmail: "",
    breakdownType: "",
    description: "",
    urgency: 2,
    address: "",
    latitude: 0,
    longitude: 0,
    vehicleBrand: "",
    vehicleModel: "",
    vehicleYear: new Date().getFullYear(),
    licensePlate: "",
    stationId: ""
  });

  // Charger les stations
  useEffect(() => {
    const fetchStations = async () => {
      try {
        const response = await fetch('/api/stations');
        if (response.ok) {
          const data = await response.json();
          setStations(data);
        }
      } catch (error) {
        console.error('Erreur lors du chargement des stations:', error);
        toast.error('Erreur lors du chargement des stations');
      }
    };

    fetchStations();
  }, []);

  // Obtenir la localisation de l'utilisateur
  useEffect(() => {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          const location = {
            lat: position.coords.latitude,
            lng: position.coords.longitude
          };
          setUserLocation(location);
          setMapCenter(location);
          setFormData(prev => ({
            ...prev,
            latitude: location.lat,
            longitude: location.lng
          }));
          
          // Géocoder inverse pour obtenir l'adresse
          reverseGeocode(location.lat, location.lng);
        },
        (error) => {
          console.error('Erreur de géolocalisation:', error);
          toast.error('Impossible d\'obtenir votre localisation');
        }
      );
    }
  }, []);

  const reverseGeocode = async (lat: number, lng: number) => {
    try {
      const response = await fetch(
        `https://maps.googleapis.com/maps/api/geocode/json?latlng=${lat},${lng}&key=${process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY}`
      );
      const data = await response.json();
      
      if (data.results && data.results[0]) {
        setFormData(prev => ({
          ...prev,
          address: data.results[0].formatted_address
        }));
      }
    } catch (error) {
      console.error('Erreur de géocodage inverse:', error);
    }
  };

  const calculateDistance = (lat1: number, lng1: number, lat2: number, lng2: number) => {
    const R = 6371; // Rayon de la Terre en km
    const dLat = (lat2 - lat1) * Math.PI / 180;
    const dLng = (lng2 - lng1) * Math.PI / 180;
    const a = 
      Math.sin(dLat/2) * Math.sin(dLat/2) +
      Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) * 
      Math.sin(dLng/2) * Math.sin(dLng/2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));
    return R * c;
  };

  const stationsWithDistance = stations.map(station => ({
    ...station,
    distance: userLocation 
      ? calculateDistance(userLocation.lat, userLocation.lng, station.latitude, station.longitude)
      : 0
  })).sort((a, b) => a.distance - b.distance);

  const handleStationSelect = (station: Station) => {
    setSelectedStation(station);
    setFormData(prev => ({
      ...prev,
      stationId: station.id
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!userLocation) {
      toast.error('Veuillez définir votre localisation');
      return;
    }
    
    if (!formData.stationId) {
      toast.error('Veuillez sélectionner une station');
      return;
    }

    setLoading(true);

    try {
      const response = await fetch('/api/request', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(formData),
      });

      if (response.ok) {
        const result = await response.json();
        toast.success('Demande créée avec succès!');
        router.push(`/track?id=${result.id}`);
      } else {
        const error = await response.json();
        toast.error(error.message || 'Erreur lors de la création de la demande');
      }
    } catch (error) {
      console.error('Erreur:', error);
      toast.error('Erreur lors de la création de la demande');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="container mx-auto px-4 max-w-4xl">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900">Nouvelle demande d'assistance</h1>
          <p className="text-gray-600 mt-2">
            Sélectionnez une station et décrivez votre problème pour recevoir de l'aide
          </p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-8">
          {/* Étape 1: Localisation */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Navigation className="h-5 w-5" />
                Étape 1: Votre localisation
              </CardTitle>
              <CardDescription>
                Confirmez votre position actuelle ou ajustez-la sur la carte
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <Label htmlFor="address">Adresse de la panne *</Label>
                <Input
                  id="address"
                  required
                  value={formData.address}
                  onChange={(e) => setFormData(prev => ({ ...prev, address: e.target.value }))}
                  placeholder="Votre adresse actuelle..."
                />
              </div>
              
              <LoadScript googleMapsApiKey={process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY || ""}>
                <GoogleMap
                  mapContainerStyle={mapContainerStyle}
                  center={mapCenter}
                  zoom={14}
                  onClick={(e) => {
                    if (e.latLng) {
                      const lat = e.latLng.lat();
                      const lng = e.latLng.lng();
                      setUserLocation({ lat, lng });
                      setFormData(prev => ({
                        ...prev,
                        latitude: lat,
                        longitude: lng
                      }));
                      reverseGeocode(lat, lng);
                    }
                  }}
                >
                  {/* Marqueur de l'utilisateur */}
                  {userLocation && (
                    <Marker
                      position={userLocation}
                      draggable={true}
                      onDragEnd={(e) => {
                        if (e.latLng) {
                          const lat = e.latLng.lat();
                          const lng = e.latLng.lng();
                          setUserLocation({ lat, lng });
                          setFormData(prev => ({
                            ...prev,
                            latitude: lat,
                            longitude: lng
                          }));
                          reverseGeocode(lat, lng);
                        }
                      }}
                      icon={{
                        url: 'data:image/svg+xml;base64,' + btoa(`
                          <svg width="32" height="32" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                            <circle cx="12" cy="12" r="8" fill="#3B82F6"/>
                            <circle cx="12" cy="12" r="3" fill="white"/>
                          </svg>
                        `),
                        scaledSize: new google.maps.Size(32, 32)
                      }}
                      title="Votre position (glissez pour ajuster)"
                    />
                  )}
                </GoogleMap>
              </LoadScript>

              {userLocation && (
                <Alert>
                  <MapPin className="h-4 w-4" />
                  <AlertDescription>
                    Position confirmée: {formData.address || `${userLocation.lat.toFixed(6)}, ${userLocation.lng.toFixed(6)}`}
                    <br />
                    <small className="text-muted-foreground">Vous pouvez glisser le marqueur pour ajuster votre position</small>
                  </AlertDescription>
                </Alert>
              )}
            </CardContent>
          </Card>

          {/* Étape 2: Sélection de station (uniquement si localisation définie) */}
          {userLocation && (
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <MapPin className="h-5 w-5" />
                  Étape 2: Choisir une station d'assistance
                </CardTitle>
                <CardDescription>
                  Stations triées par distance depuis votre position
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                {/* Carte avec stations et distances */}
                <LoadScript googleMapsApiKey={process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY || ""}>
                  <GoogleMap
                    mapContainerStyle={mapContainerStyle}
                    center={userLocation}
                    zoom={12}
                  >
                    {/* Marqueur de l'utilisateur */}
                    <Marker
                      position={userLocation}
                      icon={{
                        url: 'data:image/svg+xml;base64,' + btoa(`
                          <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                            <circle cx="12" cy="12" r="8" fill="#3B82F6"/>
                            <circle cx="12" cy="12" r="3" fill="white"/>
                          </svg>
                        `),
                        scaledSize: new google.maps.Size(24, 24)
                      }}
                      title="Votre position"
                    />

                    {/* Marqueurs des stations */}
                    {stationsWithDistance.map((station) => (
                      <Marker
                        key={station.id}
                        position={{ lat: station.latitude, lng: station.longitude }}
                        onClick={() => handleStationSelect(station)}
                        icon={{
                          url: selectedStation?.id === station.id
                            ? 'data:image/svg+xml;base64,' + btoa(`
                                <svg width="32" height="32" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                                  <path d="M12 2L2 7L12 12L22 7L12 2Z" fill="#EF4444"/>
                                  <path d="M2 17L12 22L22 17" stroke="#EF4444" stroke-width="2"/>
                                  <path d="M2 12L12 17L22 12" stroke="#EF4444" stroke-width="2"/>
                                </svg>
                              `)
                            : 'data:image/svg+xml;base64,' + btoa(`
                                <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                                  <path d="M12 2L2 7L12 12L22 7L12 2Z" fill="#10B981"/>
                                  <path d="M2 17L12 22L22 17" stroke="#10B981" stroke-width="2"/>
                                  <path d="M2 12L12 17L22 12" stroke="#10B981" stroke-width="2"/>
                                </svg>
                              `),
                          scaledSize: new google.maps.Size(selectedStation?.id === station.id ? 32 : 24, selectedStation?.id === station.id ? 32 : 24)
                        }}
                      />
                    ))}

                    {/* InfoWindow pour la station sélectionnée */}
                    {selectedStation && (
                      <InfoWindow
                        position={{ lat: selectedStation.latitude, lng: selectedStation.longitude }}
                        onCloseClick={() => setSelectedStation(null)}
                      >
                        <div className="p-2">
                          <h3 className="font-semibold">{selectedStation.name}</h3>
                          <p className="text-sm text-gray-600">{selectedStation.address}</p>
                          <p className="text-sm text-gray-600">{selectedStation.phone}</p>
                          {selectedStation.distance && (
                            <p className="text-sm text-blue-600 font-medium">
                              Distance: {selectedStation.distance.toFixed(1)} km
                            </p>
                          )}
                        </div>
                      </InfoWindow>
                    )}
                  </GoogleMap>
                </LoadScript>

                {/* Liste des stations triées par distance */}
                <div className="space-y-3">
                  <h4 className="font-medium text-sm text-gray-700">
                    Stations disponibles ({stationsWithDistance.length}) - Triées par distance
                  </h4>
                  <div className="grid gap-3 max-h-60 overflow-y-auto">
                    {stationsWithDistance.map((station, index) => (
                      <div
                        key={station.id}
                        className={`p-4 border rounded-lg cursor-pointer transition-all ${
                          selectedStation?.id === station.id
                            ? 'border-blue-500 bg-blue-50 ring-2 ring-blue-200'
                            : 'border-gray-200 hover:border-gray-300 hover:shadow-sm'
                        }`}
                        onClick={() => handleStationSelect(station)}
                      >
                        <div className="flex justify-between items-start">
                          <div className="flex-1">
                            <div className="flex items-center gap-2 mb-1">
                              <h3 className="font-semibold">{station.name}</h3>
                              {index === 0 && (
                                <Badge className="bg-green-100 text-green-800 text-xs">
                                  Plus proche
                                </Badge>
                              )}
                            </div>
                            <p className="text-sm text-gray-600 mb-1">{station.address}</p>
                            <p className="text-sm text-gray-600">{station.phone}</p>
                          </div>
                          <div className="text-right flex flex-col gap-2">
                            <Badge variant="outline" className="text-blue-600 border-blue-200">
                              {station.distance?.toFixed(1)} km
                            </Badge>
                            {station.isActive ? (
                              <Badge className="bg-green-100 text-green-800">
                                Ouvert
                              </Badge>
                            ) : (
                              <Badge variant="destructive">
                                Fermé
                              </Badge>
                            )}
                          </div>
                        </div>
                        {selectedStation?.id === station.id && (
                          <div className="mt-3 pt-3 border-t border-blue-200">
                            <p className="text-sm text-blue-700 font-medium">
                              ✓ Station sélectionnée - Distance: {station.distance?.toFixed(1)} km
                            </p>
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                </div>
              </CardContent>
            </Card>
          )}

          {/* Étape 3: Informations personnelles */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <User className="h-5 w-5" />
                Étape 3: Vos informations
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="requesterName">Nom complet *</Label>
                  <Input
                    id="requesterName"
                    required
                    value={formData.requesterName}
                    onChange={(e) => setFormData(prev => ({ ...prev, requesterName: e.target.value }))}
                  />
                </div>
                <div>
                  <Label htmlFor="requesterPhone">Téléphone *</Label>
                  <Input
                    id="requesterPhone"
                    type="tel"
                    required
                    value={formData.requesterPhone}
                    onChange={(e) => setFormData(prev => ({ ...prev, requesterPhone: e.target.value }))}
                  />
                </div>
              </div>
              <div>
                <Label htmlFor="requesterEmail">Email (optionnel)</Label>
                <Input
                  id="requesterEmail"
                  type="email"
                  value={formData.requesterEmail}
                  onChange={(e) => setFormData(prev => ({ ...prev, requesterEmail: e.target.value }))}
                />
              </div>
            </CardContent>
          </Card>

          {/* Étape 4: Informations du véhicule */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Car className="h-5 w-5" />
                Étape 4: Informations du véhicule
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div>
                  <Label htmlFor="vehicleBrand">Marque</Label>
                  <Input
                    id="vehicleBrand"
                    value={formData.vehicleBrand}
                    onChange={(e) => setFormData(prev => ({ ...prev, vehicleBrand: e.target.value }))}
                  />
                </div>
                <div>
                  <Label htmlFor="vehicleModel">Modèle</Label>
                  <Input
                    id="vehicleModel"
                    value={formData.vehicleModel}
                    onChange={(e) => setFormData(prev => ({ ...prev, vehicleModel: e.target.value }))}
                  />
                </div>
                <div>
                  <Label htmlFor="vehicleYear">Année</Label>
                  <Input
                    id="vehicleYear"
                    type="number"
                    min="1990"
                    max={new Date().getFullYear()}
                    value={formData.vehicleYear}
                    onChange={(e) => setFormData(prev => ({ ...prev, vehicleYear: parseInt(e.target.value) }))}
                  />
                </div>
              </div>
              <div>
                <Label htmlFor="licensePlate">Plaque d'immatriculation</Label>
                <Input
                  id="licensePlate"
                  value={formData.licensePlate}
                  onChange={(e) => setFormData(prev => ({ ...prev, licensePlate: e.target.value }))}
                />
              </div>
            </CardContent>
          </Card>

          {/* Étape 5: Détails du problème */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Wrench className="h-5 w-5" />
                Étape 5: Détails du problème
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="breakdownType">Type de panne *</Label>
                  <Select 
                    required
                    value={formData.breakdownType} 
                    onValueChange={(value) => setFormData(prev => ({ ...prev, breakdownType: value }))}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Sélectionnez le type de panne" />
                    </SelectTrigger>
                    <SelectContent>
                      {breakdownTypes.map((type) => (
                        <SelectItem key={type.value} value={type.value}>
                          {type.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <Label htmlFor="urgency">Niveau d'urgence *</Label>
                  <Select 
                    required
                    value={formData.urgency.toString()} 
                    onValueChange={(value) => setFormData(prev => ({ ...prev, urgency: parseInt(value) }))}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Sélectionnez l'urgence" />
                    </SelectTrigger>
                    <SelectContent>
                      {urgencyLevels.map((level) => (
                        <SelectItem key={level.value} value={level.value.toString()}>
                          <Badge className={level.color}>
                            {level.label}
                          </Badge>
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>
              <div>
                <Label htmlFor="description">Description détaillée *</Label>
                <Textarea
                  id="description"
                  required
                  rows={4}
                  placeholder="Décrivez le problème en détail..."
                  value={formData.description}
                  onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
                />
              </div>
            </CardContent>
          </Card>

          {/* Boutons d'action */}
          <div className="flex gap-4 justify-end">
            <Button 
              type="button" 
              variant="outline"
              onClick={() => router.back()}
            >
              Annuler
            </Button>
            <Button 
              type="submit" 
              disabled={loading || !userLocation || !formData.stationId}
              className="min-w-32"
            >
              {loading ? (
                <>
                  <Loader2 className="h-4 w-4 animate-spin mr-2" />
                  Création...
                </>
              ) : (
                'Créer la demande'
              )}
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
}
