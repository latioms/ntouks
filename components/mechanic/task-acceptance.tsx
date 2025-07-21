"use client";

import { useState, useEffect } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { toast } from "sonner";
import { 
  MapPin, 
  Play, 
  Phone, 
  User,
  Clock,
  CheckCircle,
  AlertTriangle,
  Loader2,
  Navigation
} from "lucide-react";

interface AssignedTask {
  id: string;
  description: string;
  requesterName: string;
  requesterPhone: string;
  address: string;
  status: string;
  priority: number;
  createdAt: string;
  assignedAt: string;
  latitude: number;
  longitude: number;
  vehicleBrand?: string;
  vehicleModel?: string;
  urgency: number;
}

export function MechanicTaskAcceptance() {
  const [assignedTasks, setAssignedTasks] = useState<AssignedTask[]>([]);
  const [loading, setLoading] = useState(true);
  const [processingTask, setProcessingTask] = useState<string | null>(null);
  const [trackingTask, setTrackingTask] = useState<string | null>(null);

  const fetchAssignedTasks = async () => {
    try {
      setLoading(true);
      const response = await fetch('/api/mechanic/requests');
      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Erreur lors du chargement des tâches');
      }

      // Filtrer seulement les tâches assignées
      const assignedOnly = data.requests.filter((task: AssignedTask) => 
        task.status === 'ASSIGNED'
      );
      
      setAssignedTasks(assignedOnly);
    } catch (error) {
      console.error('Erreur:', error);
      toast.error('Impossible de charger les tâches assignées');
    } finally {
      setLoading(false);
    }
  };

  const acceptTask = async (taskId: string) => {
    try {
      setProcessingTask(taskId);
      
      const response = await fetch(`/api/mechanic/requests/${taskId}/accept`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        }
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Erreur lors de l\'acceptation');
      }

      toast.success('Tâche acceptée ! Vous pouvez maintenant démarrer le tracking.');
      
      // Actualiser la liste
      fetchAssignedTasks();
      
    } catch (error) {
      console.error('Erreur:', error);
      toast.error(error instanceof Error ? error.message : 'Erreur lors de l\'acceptation');
    } finally {
      setProcessingTask(null);
    }
  };

  const startTracking = async (taskId: string) => {
    if (!navigator.geolocation) {
      toast.error('Géolocalisation non supportée par votre navigateur');
      return;
    }

    try {
      setTrackingTask(taskId);
      
      // Obtenir la position actuelle
      const position = await new Promise<GeolocationPosition>((resolve, reject) => {
        navigator.geolocation.getCurrentPosition(resolve, reject, {
          enableHighAccuracy: true,
          timeout: 10000,
          maximumAge: 300000
        });
      });

      const { latitude, longitude } = position.coords;

      // Démarrer le tracking
      const response = await fetch(`/api/mechanic/requests/${taskId}/start-tracking`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          latitude,
          longitude
        })
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Erreur lors du démarrage du tracking');
      }

      toast.success('Tracking démarré ! Votre position sera suivie en temps réel.');
      
      // Démarrer les mises à jour de position périodiques
      startLocationUpdates(taskId);
      
    } catch (error) {
      console.error('Erreur:', error);
      toast.error(error instanceof Error ? error.message : 'Erreur lors du démarrage du tracking');
    } finally {
      setTrackingTask(null);
    }
  };

  const startLocationUpdates = (requestId: string) => {
    const updateInterval = setInterval(() => {
      if (navigator.geolocation) {
        navigator.geolocation.getCurrentPosition(
          async (position) => {
            const { latitude, longitude } = position.coords;
            
            try {
              await fetch('/api/mechanic/location/update', {
                method: 'POST',
                headers: {
                  'Content-Type': 'application/json'
                },
                body: JSON.stringify({
                  latitude,
                  longitude,
                  requestId
                })
              });
            } catch (error) {
              console.error('Erreur mise à jour position:', error);
            }
          },
          (error) => {
            console.error('Erreur géolocalisation:', error);
          },
          {
            enableHighAccuracy: true,
            timeout: 5000,
            maximumAge: 10000
          }
        );
      }
    }, 10000); // Mise à jour toutes les 10 secondes

    // Stocker l'interval pour pouvoir l'arrêter plus tard
    // Dans un vrai app, il faudrait gérer cela de manière plus sophistiquée
    return updateInterval;
  };

  const getPriorityBadge = (priority: number) => {
    if (priority >= 4) return <Badge variant="destructive">Urgent</Badge>;
    if (priority >= 3) return <Badge variant="default">Haute</Badge>;
    if (priority >= 2) return <Badge variant="secondary">Normale</Badge>;
    return <Badge variant="outline">Basse</Badge>;
  };

  const getDistanceDisplay = (lat: number, lng: number) => {
    // Simuler une distance - dans un vrai app, calculer avec la position du mécanicien
    const distance = Math.random() * 20 + 1; // 1-21 km
    return `~${distance.toFixed(1)} km`;
  };

  useEffect(() => {
    fetchAssignedTasks();
    
    // Actualiser toutes les minutes
    const interval = setInterval(fetchAssignedTasks, 60000);
    return () => clearInterval(interval);
  }, []);

  if (loading) {
    return (
      <Card>
        <CardContent className="p-6">
          <div className="flex items-center justify-center">
            <Loader2 className="h-8 w-8 animate-spin" />
            <span className="ml-2">Chargement de vos tâches...</span>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold">Tâches assignées</h2>
          <p className="text-muted-foreground">
            {assignedTasks.length} tâche(s) en attente d'acceptation
          </p>
        </div>
        <Button variant="outline" onClick={fetchAssignedTasks}>
          Actualiser
        </Button>
      </div>

      {assignedTasks.length === 0 ? (
        <Card>
          <CardContent className="p-6 text-center">
            <CheckCircle className="h-12 w-12 mx-auto mb-4 text-green-600" />
            <h3 className="text-lg font-medium mb-2">Aucune tâche assignée</h3>
            <p className="text-muted-foreground">
              Vous n'avez actuellement aucune nouvelle tâche assignée.
            </p>
          </CardContent>
        </Card>
      ) : (
        <div className="grid gap-4">
          {assignedTasks.map((task) => (
            <Card key={task.id} className="border-l-4 border-l-blue-500">
              <CardHeader>
                <div className="flex items-start justify-between">
                  <div className="space-y-1">
                    <CardTitle className="text-lg flex items-center gap-2">
                      <User className="h-4 w-4" />
                      {task.requesterName}
                      {getPriorityBadge(task.priority)}
                    </CardTitle>
                    <CardDescription className="flex items-center gap-4">
                      <span className="flex items-center gap-1">
                        <Phone className="h-3 w-3" />
                        {task.requesterPhone}
                      </span>
                      <span className="flex items-center gap-1">
                        <Clock className="h-3 w-3" />
                        {new Date(task.assignedAt).toLocaleString()}
                      </span>
                    </CardDescription>
                  </div>
                  <Badge variant="outline" className="text-blue-600 border-blue-600">
                    Assignée
                  </Badge>
                </div>
              </CardHeader>
              
              <CardContent className="space-y-4">
                <div>
                  <h4 className="font-medium mb-2">Description du problème</h4>
                  <p className="text-sm text-muted-foreground">{task.description}</p>
                </div>

                <div className="flex items-center gap-4">
                  <div className="flex items-center gap-1 text-sm text-muted-foreground">
                    <MapPin className="h-4 w-4" />
                    <span>{task.address}</span>
                  </div>
                  <div className="flex items-center gap-1 text-sm text-muted-foreground">
                    <Navigation className="h-4 w-4" />
                    <span>{getDistanceDisplay(task.latitude, task.longitude)}</span>
                  </div>
                </div>

                {(task.vehicleBrand || task.vehicleModel) && (
                  <div className="text-sm">
                    <span className="font-medium">Véhicule: </span>
                    <span className="text-muted-foreground">
                      {task.vehicleBrand} {task.vehicleModel}
                    </span>
                  </div>
                )}

                <div className="flex gap-2 pt-2">
                  <Button
                    onClick={() => acceptTask(task.id)}
                    disabled={processingTask === task.id}
                    className="flex-1"
                  >
                    {processingTask === task.id ? (
                      <>
                        <Loader2 className="h-4 w-4 animate-spin mr-2" />
                        Acceptation...
                      </>
                    ) : (
                      <>
                        <CheckCircle className="h-4 w-4 mr-2" />
                        Accepter la tâche
                      </>
                    )}
                  </Button>
                </div>

                <Alert>
                  <AlertTriangle className="h-4 w-4" />
                  <AlertDescription>
                    Une fois acceptée, vous devrez démarrer le tracking GPS pour permettre au client de suivre votre progression.
                  </AlertDescription>
                </Alert>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
