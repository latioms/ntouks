"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Building2, MapPin, Phone, Mail } from "lucide-react";
import { createStation, createStationWithManager } from "@/app/actions/stations/manageStations";
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
  const router = useRouter();
  const { data: session } = useSession();

  // Vérifier les permissions au chargement
  useEffect(() => {
    if (session === null) {
      // Utilisateur non connecté
      toast.error("Accès refusé", {
        description: "Vous devez être connecté pour créer une station"
      });
      router.push("/login");
    }
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
        throw new Error("Vous devez être connecté pour créer une station");
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

      // Créer la station et assigner l'utilisateur comme gestionnaire
      const newStation = await createStationWithManager(stationData, session.user.id);
      
      console.log("Station créée:", newStation);
      
      // Notification de succès
      toast.success("Station créée avec succès !", {
        description: `La station "${formData.name}" a été créée et vous êtes maintenant son gestionnaire.`
      });
      
      // Redirection vers le dashboard
      setTimeout(() => {
        router.push("/dashboard");
      }, 1500);
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : "Erreur lors de la création de la station";
      setError(errorMessage);
      toast.error("Erreur", {
        description: errorMessage
      });
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
        },
        (error) => {
          console.error("Erreur de géolocalisation:", error);
        }
      );
    }
  };

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

              <Button
                type="button"
                variant="outline"
                onClick={handleGetLocation}
                className="w-full"
              >
                <MapPin className="mr-2 h-4 w-4" />
                Utiliser ma position actuelle
              </Button>

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
