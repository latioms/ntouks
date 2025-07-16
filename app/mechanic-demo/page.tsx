"use client";

import { useState, useEffect } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { toast } from "sonner";
import { 
  MapPin, 
  Play, 
  Square, 
  Navigation,
  Clock,
  User,
  CheckCircle
} from "lucide-react";
import { broadcastMechanicLocation } from "@/lib/supabase";

interface Request {
  id: string;
  requesterName: string;
  requesterPhone: string;
  address: string;
  description: string;
  status: string;
  latitude: number;
  longitude: number;
  createdAt: string;
}

export default function MechanicTrackingDemo() {
  const [requests, setRequests] = useState<Request[]>([]);
  const [selectedRequest, setSelectedRequest] = useState<Request | null>(null);
  const [tracking, setTracking] = useState(false);
  const [mechanicId] = useState("demo-mechanic-" + Math.random().toString(36).substr(2, 9));
  const [currentPosition, setCurrentPosition] = useState<{lat: number, lng: number} | null>(null);

  useEffect(() => {
    // Simuler des demandes en cours
    setRequests([
      {
        id: "demo-request-1",
        requesterName: "Marie Dubois",
        requesterPhone: "+237 6 12 34 56 78",
        address: "Avenue Kennedy, Centre-ville, Yaoundé",
        description: "Batterie à plat",
        status: "ASSIGNED",
        latitude: 3.8516,
        longitude: 11.5017,
        createdAt: new Date().toISOString()
      },
      {
        id: "demo-request-2", 
        requesterName: "Paul Ndjock",
        requesterPhone: "+237 6 98 76 54 32",
        address: "Quartier Bastos, Yaoundé",
        description: "Pneu crevé",
        status: "ASSIGNED",
        latitude: 3.8720,
        longitude: 11.5140,
        createdAt: new Date().toISOString()
      }
    ]);
  }, []);

  const startTracking = async () => {
    if (!selectedRequest) {
      toast.error("Veuillez sélectionner une demande");
      return;
    }

    // Démarrer le statut "en cours"
    await updateRequestStatus(selectedRequest.id, 'IN_PROGRESS');
    
    setTracking(true);
    toast.success("Suivi démarré ! La position sera mise à jour en temps réel.");

    // Simuler le mouvement du mécanicien vers le client
    simulateMovement(selectedRequest);
  };

  const stopTracking = async () => {
    setTracking(false);
    
    if (selectedRequest) {
      await updateRequestStatus(selectedRequest.id, 'COMPLETED');
      toast.success("Intervention terminée !");
    }
  };

  const updateRequestStatus = async (requestId: string, status: string) => {
    try {
      await fetch(`/api/request/${requestId}`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ status })
      });
    } catch (error) {
      console.error('Erreur lors de la mise à jour du statut:', error);
    }
  };

  const simulateMovement = (targetRequest: Request) => {
    // Position initiale (station)
    let currentLat = 3.8480;
    let currentLng = 11.5021;
    
    const targetLat = targetRequest.latitude;
    const targetLng = targetRequest.longitude;
    
    const steps = 20; // 20 étapes pour le mouvement
    const latStep = (targetLat - currentLat) / steps;
    const lngStep = (targetLng - currentLng) / steps;
    
    let stepCount = 0;
    
    const moveInterval = setInterval(() => {
      if (!tracking || stepCount >= steps) {
        clearInterval(moveInterval);
        return;
      }
      
      currentLat += latStep + (Math.random() - 0.5) * 0.001; // Ajouter un peu de variation
      currentLng += lngStep + (Math.random() - 0.5) * 0.001;
      
      const position = { lat: currentLat, lng: currentLng };
      setCurrentPosition(position);
      
      // Diffuser la position en temps réel
      broadcastMechanicLocation(mechanicId, {
        latitude: currentLat,
        longitude: currentLng
      });
      
      stepCount++;
    }, 2000); // Mise à jour toutes les 2 secondes
  };

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="container mx-auto px-4 max-w-4xl">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900">Démonstration Mécanicien</h1>
          <p className="text-gray-600 mt-2">
            Simulez le déplacement d'un mécanicien pour tester le suivi en temps réel
          </p>
        </div>

        <div className="grid gap-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <User className="h-5 w-5" />
                Mécanicien Demo
              </CardTitle>
              <CardDescription>
                ID: {mechanicId}
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="flex items-center gap-4">
                <Badge variant={tracking ? "default" : "outline"}>
                  {tracking ? "En déplacement" : "Disponible"}
                </Badge>
                {currentPosition && (
                  <Badge variant="outline">
                    Position: {currentPosition.lat.toFixed(4)}, {currentPosition.lng.toFixed(4)}
                  </Badge>
                )}
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Clock className="h-5 w-5" />
                Demandes assignées
              </CardTitle>
              <CardDescription>
                Sélectionnez une demande pour démarrer l'intervention
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              {requests.map((request) => (
                <div
                  key={request.id}
                  className={`p-4 border rounded-lg cursor-pointer transition-all ${
                    selectedRequest?.id === request.id
                      ? 'border-blue-500 bg-blue-50'
                      : 'border-gray-200 hover:border-gray-300'
                  }`}
                  onClick={() => setSelectedRequest(request)}
                >
                  <div className="flex justify-between items-start">
                    <div>
                      <h3 className="font-semibold">{request.requesterName}</h3>
                      <p className="text-sm text-gray-600">{request.address}</p>
                      <p className="text-sm text-gray-600">{request.description}</p>
                      <p className="text-sm text-gray-500">{request.requesterPhone}</p>
                    </div>
                    <Badge variant="outline">
                      {request.status === 'ASSIGNED' ? 'Assigné' : 'En cours'}
                    </Badge>
                  </div>
                </div>
              ))}
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Navigation className="h-5 w-5" />
                Contrôles de suivi
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {selectedRequest && (
                <Alert>
                  <MapPin className="h-4 w-4" />
                  <AlertDescription>
                    <strong>Destination:</strong> {selectedRequest.address}<br />
                    <strong>Client:</strong> {selectedRequest.requesterName} - {selectedRequest.requesterPhone}
                  </AlertDescription>
                </Alert>
              )}

              <div className="flex gap-4">
                <Button 
                  onClick={startTracking}
                  disabled={tracking || !selectedRequest}
                  className="flex items-center gap-2"
                >
                  <Play className="h-4 w-4" />
                  Démarrer l'intervention
                </Button>
                
                <Button 
                  onClick={stopTracking}
                  disabled={!tracking}
                  variant="outline"
                  className="flex items-center gap-2"
                >
                  <Square className="h-4 w-4" />
                  Terminer l'intervention
                </Button>
              </div>

              {tracking && (
                <Alert>
                  <Navigation className="h-4 w-4" />
                  <AlertDescription>
                    <strong>Suivi actif</strong><br />
                    Votre position est diffusée en temps réel au client. 
                    Les clients peuvent suivre votre progression sur /track?id={selectedRequest?.id}
                  </AlertDescription>
                </Alert>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
