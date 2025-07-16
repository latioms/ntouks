"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { toast } from "sonner";
import { 
  MapPin, 
  Phone, 
  Mail, 
  Car, 
  AlertTriangle, 
  CheckCircle,
  Loader2,
  Navigation,
  Clock
} from "lucide-react";

interface LocationData {
  latitude: number;
  longitude: number;
  address?: string;
}

export default function AssistPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [locationLoading, setLocationLoading] = useState(false);
  const [location, setLocation] = useState<LocationData | null>(null);
  const [requestCreated, setRequestCreated] = useState(false);
  const [requestId, setRequestId] = useState<string | null>(null);

  const [formData, setFormData] = useState({
    requesterName: "",
    requesterPhone: "",
    requesterEmail: "",
    breakdownType: "",
    description: "",
    urgency: "2",
    address: "",
    vehicleBrand: "",
    vehicleModel: "",
    vehicleYear: "",
    licensePlate: ""
  });

  const breakdownTypes = [
    { value: "MECHANICAL", label: "Problème mécanique" },
    { value: "ELECTRICAL", label: "Problème électrique" },
    { value: "TIRE", label: "Problème de pneu" },
    { value: "BATTERY", label: "Batterie à plat" },
    { value: "ENGINE", label: "Problème moteur" },
    { value: "TRANSMISSION", label: "Problème de transmission" },
    { value: "BRAKES", label: "Problème de freins" },
    { value: "OTHER", label: "Autre" }
  ];

  const urgencyLevels = [
    { value: "1", label: "Normal", color: "bg-green-100 text-green-800" },
    { value: "2", label: "Moyen", color: "bg-yellow-100 text-yellow-800" },
    { value: "3", label: "Urgent", color: "bg-orange-100 text-orange-800" },
    { value: "4", label: "Très urgent", color: "bg-red-100 text-red-800" },
    { value: "5", label: "Critique", color: "bg-red-200 text-red-900" }
  ];

  const getCurrentLocation = async () => {
    setLocationLoading(true);
    try {
      if (!navigator.geolocation) {
        throw new Error("Géolocalisation non supportée");
      }

      const position = await new Promise<GeolocationPosition>((resolve, reject) => {
        navigator.geolocation.getCurrentPosition(resolve, reject, {
          enableHighAccuracy: true,
          timeout: 10000,
          maximumAge: 300000
        });
      });

      const { latitude, longitude } = position.coords;
      
      setLocation({ latitude, longitude });
      toast.success("Position GPS obtenue !");
    } catch (error) {
      console.error("Erreur géolocalisation:", error);
      toast.error("Impossible d'obtenir votre position. Veuillez saisir votre adresse manuellement.");
    } finally {
      setLocationLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!location && !formData.address) {
      toast.error("Veuillez obtenir votre position GPS ou saisir votre adresse");
      return;
    }

    setLoading(true);
    try {
      const requestData = {
        ...formData,
        latitude: location?.latitude || 0,
        longitude: location?.longitude || 0,
        urgency: parseInt(formData.urgency)
      };

      const response = await fetch('/api/request', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(requestData)
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Erreur lors de la création de la demande');
      }

      setRequestId(data.request.id);
      setRequestCreated(true);
      toast.success("Demande d'assistance envoyée avec succès !");

    } catch (error) {
      console.error("Erreur:", error);
      toast.error(error instanceof Error ? error.message : "Erreur inconnue");
    } finally {
      setLoading(false);
    }
  };

  if (requestCreated) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center p-4">
        <Card className="w-full max-w-md">
          <CardHeader className="text-center">
            <div className="mx-auto w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mb-4">
              <CheckCircle className="h-8 w-8 text-green-600" />
            </div>
            <CardTitle className="text-green-600">Demande envoyée !</CardTitle>
            <CardDescription>
              Votre demande d'assistance a été transmise aux stations proches
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <Alert>
              <Clock className="h-4 w-4" />
              <AlertDescription>
                <strong>ID de suivi:</strong> {requestId}<br/>
                Vous recevrez un appel sous peu pour confirmer l'intervention.
              </AlertDescription>
            </Alert>
            <div className="space-y-2">
              <Button 
                onClick={() => router.push(`/track?phone=${formData.requesterPhone}`)}
                className="w-full"
              >
                Suivre ma demande
              </Button>
              <Button 
                variant="outline" 
                onClick={() => {
                  setRequestCreated(false);
                  setRequestId(null);
                  setFormData({
                    requesterName: "",
                    requesterPhone: "",
                    requesterEmail: "",
                    breakdownType: "",
                    description: "",
                    urgency: "2",
                    address: "",
                    vehicleBrand: "",
                    vehicleModel: "",
                    vehicleYear: "",
                    licensePlate: ""
                  });
                }}
                className="w-full"
              >
                Nouvelle demande
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 p-4">
      <div className="max-w-2xl mx-auto">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <AlertTriangle className="h-6 w-6 text-orange-600" />
              Demande d'assistance routière
            </CardTitle>
            <CardDescription>
              Signalez votre panne et obtenez de l'aide rapidement
            </CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-6">
              {/* Informations personnelles */}
              <div className="space-y-4">
                <h3 className="text-lg font-medium">Vos informations</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="name">Nom complet *</Label>
                    <Input
                      id="name"
                      value={formData.requesterName}
                      onChange={(e) => setFormData(prev => ({ ...prev, requesterName: e.target.value }))}
                      required
                    />
                  </div>
                  <div>
                    <Label htmlFor="phone">Téléphone *</Label>
                    <Input
                      id="phone"
                      type="tel"
                      value={formData.requesterPhone}
                      onChange={(e) => setFormData(prev => ({ ...prev, requesterPhone: e.target.value }))}
                      required
                    />
                  </div>
                </div>
                <div>
                  <Label htmlFor="email">Email (optionnel)</Label>
                  <Input
                    id="email"
                    type="email"
                    value={formData.requesterEmail}
                    onChange={(e) => setFormData(prev => ({ ...prev, requesterEmail: e.target.value }))}
                  />
                </div>
              </div>

              {/* Localisation */}
              <div className="space-y-4">
                <h3 className="text-lg font-medium">Votre position</h3>
                <div className="flex items-center gap-4">
                  <Button
                    type="button"
                    onClick={getCurrentLocation}
                    disabled={locationLoading}
                    variant={location ? "outline" : "default"}
                    className="flex items-center gap-2"
                  >
                    {locationLoading ? (
                      <Loader2 className="h-4 w-4 animate-spin" />
                    ) : (
                      <Navigation className="h-4 w-4" />
                    )}
                    {location ? "Position obtenue" : "Obtenir ma position GPS"}
                  </Button>
                  {location && (
                    <Badge variant="outline" className="text-green-600">
                      <MapPin className="h-3 w-3 mr-1" />
                      GPS activé
                    </Badge>
                  )}
                </div>
                <div>
                  <Label htmlFor="address">Adresse complète *</Label>
                  <Input
                    id="address"
                    value={formData.address}
                    onChange={(e) => setFormData(prev => ({ ...prev, address: e.target.value }))}
                    placeholder="Rue, ville, code postal..."
                    required
                  />
                </div>
              </div>

              {/* Informations sur la panne */}
              <div className="space-y-4">
                <h3 className="text-lg font-medium">Description de la panne</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="breakdown">Type de panne *</Label>
                    <Select 
                      value={formData.breakdownType} 
                      onValueChange={(value) => setFormData(prev => ({ ...prev, breakdownType: value }))}
                      required
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Sélectionnez le type" />
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
                      value={formData.urgency} 
                      onValueChange={(value) => setFormData(prev => ({ ...prev, urgency: value }))}
                    >
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        {urgencyLevels.map((level) => (
                          <SelectItem key={level.value} value={level.value}>
                            <span className={level.color + " px-2 py-1 rounded text-xs"}>
                              {level.label}
                            </span>
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
                    value={formData.description}
                    onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
                    placeholder="Décrivez le problème en détail..."
                    rows={4}
                    required
                  />
                </div>
              </div>

              {/* Informations véhicule */}
              <div className="space-y-4">
                <h3 className="text-lg font-medium">Informations véhicule (optionnel)</h3>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div>
                    <Label htmlFor="brand">Marque</Label>
                    <Input
                      id="brand"
                      value={formData.vehicleBrand}
                      onChange={(e) => setFormData(prev => ({ ...prev, vehicleBrand: e.target.value }))}
                      placeholder="Ex: Peugeot"
                    />
                  </div>
                  <div>
                    <Label htmlFor="model">Modèle</Label>
                    <Input
                      id="model"
                      value={formData.vehicleModel}
                      onChange={(e) => setFormData(prev => ({ ...prev, vehicleModel: e.target.value }))}
                      placeholder="Ex: 308"
                    />
                  </div>
                  <div>
                    <Label htmlFor="year">Année</Label>
                    <Input
                      id="year"
                      type="number"
                      value={formData.vehicleYear}
                      onChange={(e) => setFormData(prev => ({ ...prev, vehicleYear: e.target.value }))}
                      placeholder="Ex: 2020"
                    />
                  </div>
                </div>
                <div>
                  <Label htmlFor="plate">Plaque d'immatriculation</Label>
                  <Input
                    id="plate"
                    value={formData.licensePlate}
                    onChange={(e) => setFormData(prev => ({ ...prev, licensePlate: e.target.value }))}
                    placeholder="Ex: AB-123-CD"
                  />
                </div>
              </div>

              <Button type="submit" disabled={loading} className="w-full">
                {loading ? (
                  <>
                    <Loader2 className="h-4 w-4 animate-spin mr-2" />
                    Envoi en cours...
                  </>
                ) : (
                  "Envoyer la demande d'assistance"
                )}
              </Button>
            </form>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
