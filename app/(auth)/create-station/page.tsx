"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Building2, MapPin, Phone, Mail } from "lucide-react";
import { GeolocationHelper } from "@/components/ui/geolocation-helper";
import { toast } from "sonner";
import { useSession } from "@/lib/auth-client";

export default function CreateStationPage() {
  const [formData, setFormData] = useState({
    name: "",
    address: "",
    phone: "",
    email: "",
    latitude: "",
    longitude: ""
  });
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");
  const [isSessionLoading, setIsSessionLoading] = useState(true);
  const router = useRouter();
  const { data: session } = useSession();

  // Vérifier les permissions au chargement
  useEffect(() => {
    // Marquer le chargement de session comme terminé après un délai
    const timer = setTimeout(() => {
      setIsSessionLoading(false);
      
      // Si après le délai il n'y a toujours pas de session, rediriger
      if (session === null || session === undefined) {
        toast.error("Accès refusé", {
          description: "Vous devez être connecté pour créer une station"
        });
        router.push("/login");
      }
    }, 1000);

    // Si la session est déjà disponible, arrêter le chargement immédiatement
    if (session?.user) {
      setIsSessionLoading(false);
      clearTimeout(timer);
    }

    return () => clearTimeout(timer);
  }, [session, router]);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError("");

    try {
      // Vérifier que l'utilisateur est connecté
      if (!session?.user?.id) {
        toast.error("Session expirée", {
          description: "Veuillez vous reconnecter pour continuer"
        });
        router.push("/login");
        return;
      }

      // Validation des champs requis
      if (!formData.name || !formData.address || !formData.phone) {
        throw new Error("Veuillez remplir tous les champs obligatoires");
      }

      // Validation et conversion des coordonnées
      const latitude = formData.latitude ? parseFloat(formData.latitude) : 0;
      const longitude = formData.longitude ? parseFloat(formData.longitude) : 0;

      if (formData.latitude && isNaN(latitude)) {
        throw new Error("La latitude doit être un nombre valide");
      }
      if (formData.longitude && isNaN(longitude)) {
        throw new Error("La longitude doit être un nombre valide");
      }

      // Créer la station avec les données du formulaire
      const stationData = {
        name: formData.name,
        address: formData.address,
        latitude: latitude,
        longitude: longitude,
        phone: formData.phone,
        email: formData.email || undefined
      };

      // Créer la station via l'API
      console.log("Création de la station avec les données:", stationData);
      console.log("ID utilisateur:", session.user.id);
      
      const response = await fetch('/api/stations/create', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(stationData)
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Erreur lors de la création de la station');
      }

      const result = await response.json();
      console.log("Station créée avec succès:", result.station);
      
      // Notification de succès
      toast.success("Station créée avec succès !", {
        description: `La station "${formData.name}" a été créée et vous êtes maintenant son gestionnaire.`
      });
      
      // Redirection vers le dashboard
      setTimeout(() => {
        router.push("/dashboard");
      }, 1500);
    } catch (err) {
      console.error("Erreur détaillée lors de la création:", err);
      const errorMessage = err instanceof Error ? err.message : "Erreur lors de la création de la station";
      setError(errorMessage);
      toast.error("Erreur", {
        description: errorMessage
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleGetLocation = () => {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          setFormData(prev => ({
            ...prev,
            latitude: position.coords.latitude.toString(),
            longitude: position.coords.longitude.toString()
          }));
          toast.success("Position récupérée avec succès !");
        },
        (error) => {
          console.error("Erreur de géolocalisation:", error);
          toast.error("Impossible de récupérer votre position");
        }
      );
    } else {
      toast.error("Géolocalisation non supportée par votre navigateur");
    }
  };

  const handleLocationReceived = (location: { latitude: number; longitude: number }) => {
    setFormData(prev => ({
      ...prev,
      latitude: location.latitude.toString(),
      longitude: location.longitude.toString()
    }));
    toast.success("Position récupérée avec succès !");
  };

  // Afficher un écran de chargement si la session n'est pas encore chargée
  if (isSessionLoading) {
    return (
      <div className="min-h-screen bg-muted flex items-center justify-center p-4">
        <Card className="w-full max-w-md">
          <CardContent className="p-6">
            <div className="flex flex-col items-center space-y-4">
              <div className="h-8 w-8 animate-spin rounded-full border-4 border-primary border-t-transparent" />
              <p className="text-sm text-muted-foreground">Vérification de votre session...</p>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-muted flex items-center justify-center p-4">
      <Card className="w-full max-w-2xl">
        <CardHeader className="text-center space-y-4">
          <div className="mx-auto p-3 bg-primary/10 rounded-full w-fit">
            <Building2 className="h-8 w-8" />
          </div>
          <div>
            <CardTitle className="text-2xl">Créer votre station</CardTitle>
            <CardDescription>
              Configurez votre station de service pour commencer à recevoir des demandes
            </CardDescription>
          </div>
        </CardHeader>
        
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-6">
            {error && (
              <div className="bg-destructive/10 text-destructive p-3 rounded-md text-sm">
                {error}
              </div>
            )}

            <div className="space-y-4">
              <div>
                <Label htmlFor="name">Nom de la station *</Label>
                <Input
                  id="name"
                  name="name"
                  type="text"
                  placeholder="Ex: Station Service Central"
                  value={formData.name}
                  onChange={handleInputChange}
                  required
                />
              </div>

              <div>
                <Label htmlFor="address">Adresse *</Label>
                <div className="relative">
                  <MapPin className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                  <Input
                    id="address"
                    name="address"
                    type="text"
                    placeholder="Adresse complète de la station"
                    value={formData.address}
                    onChange={handleInputChange}
                    className="pl-10"
                    required
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="latitude">Latitude</Label>
                  <Input
                    id="latitude"
                    name="latitude"
                    type="number"
                    step="any"
                    placeholder="Ex: 14.6928"
                    value={formData.latitude}
                    onChange={handleInputChange}
                    min="-90"
                    max="90"
                  />
                </div>
                <div>
                  <Label htmlFor="longitude">Longitude</Label>
                  <Input
                    id="longitude"
                    name="longitude"
                    type="number"
                    step="any"
                    placeholder="Ex: -17.4467"
                    value={formData.longitude}
                    onChange={handleInputChange}
                    min="-180"
                    max="180"
                  />
                </div>
              </div>

              <GeolocationHelper onLocationReceived={handleLocationReceived} />

              <div>
                <Label htmlFor="phone">Téléphone *</Label>
                <div className="relative">
                  <Phone className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                  <Input
                    id="phone"
                    name="phone"
                    type="tel"
                    placeholder="Ex: +221 77 123 45 67"
                    value={formData.phone}
                    onChange={handleInputChange}
                    className="pl-10"
                    required
                  />
                </div>
              </div>

              <div>
                <Label htmlFor="email">Email</Label>
                <div className="relative">
                  <Mail className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                  <Input
                    id="email"
                    name="email"
                    type="email"
                    placeholder="contact@station.com"
                    value={formData.email}
                    onChange={handleInputChange}
                    className="pl-10"
                  />
                </div>
              </div>
            </div>

            <div className="flex gap-4">
              <Button
                type="button"
                variant="outline"
                onClick={() => router.back()}
                className="flex-1"
              >
                Retour
              </Button>
              <Button
                type="submit"
                disabled={isLoading}
                className="flex-1"
              >
                {isLoading ? "Création..." : "Créer la station"}
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
