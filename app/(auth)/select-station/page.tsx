"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Building2, MapPin, Phone, Search, Users } from "lucide-react";

interface Station {
  id: string;
  name: string;
  address: string;
  phone: string;
  email?: string;
  mechanicsCount: number;
  distance?: string;
  isActive: boolean;
}

export default function SelectStationPage() {
  const [stations, setStations] = useState<Station[]>([]);
  const [filteredStations, setFilteredStations] = useState<Station[]>([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedStation, setSelectedStation] = useState<string>("");
  const [isLoading, setIsLoading] = useState(false);
  const [isLoadingStations, setIsLoadingStations] = useState(true);
  const router = useRouter();

  // Données mockées pour les stations
  const mockStations: Station[] = [
    {
      id: "1",
      name: "Station Service Dakar Central",
      address: "Avenue Bourguiba, Dakar",
      phone: "+221 77 123 45 67",
      email: "contact@dakarcentral.com",
      mechanicsCount: 5,
      distance: "2.3 km",
      isActive: true
    },
    {
      id: "2",
      name: "Garage Moderne Almadies",
      address: "Route des Almadies, Dakar",
      phone: "+221 77 234 56 78",
      mechanicsCount: 3,
      distance: "5.1 km",
      isActive: true
    },
    {
      id: "3",
      name: "Station Auto Plus",
      address: "Parcelles Assainies, Dakar",
      phone: "+221 77 345 67 89",
      mechanicsCount: 7,
      distance: "8.7 km",
      isActive: true
    },
    {
      id: "4",
      name: "Garage Express Thiaroye",
      address: "Thiaroye sur Mer",
      phone: "+221 77 456 78 90",
      mechanicsCount: 2,
      distance: "12.4 km",
      isActive: true
    }
  ];

  useEffect(() => {
    // Simulation du chargement des stations
    const loadStations = async () => {
      setIsLoadingStations(true);
      try {
        // TODO: Remplacer par un appel API réel
        // const data = await getAllStations();
        await new Promise(resolve => setTimeout(resolve, 1000)); // Simulation
        setStations(mockStations);
        setFilteredStations(mockStations);
      } catch (error) {
        console.error("Erreur lors du chargement des stations:", error);
      } finally {
        setIsLoadingStations(false);
      }
    };

    loadStations();
  }, []);

  useEffect(() => {
    // Filtrer les stations basé sur le terme de recherche
    const filtered = stations.filter(station =>
      station.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      station.address.toLowerCase().includes(searchTerm.toLowerCase())
    );
    setFilteredStations(filtered);
  }, [searchTerm, stations]);

  const handleJoinStation = async (stationId: string) => {
    setIsLoading(true);
    setSelectedStation(stationId);

    try {
      // TODO: Implémenter la demande de rejoindre la station
      // await joinStation(stationId);
      
      console.log("Demande pour rejoindre la station:", stationId);
      
      // Redirection vers le dashboard mécanicien
      router.push("/dashboard");
    } catch (error) {
      console.error("Erreur lors de la demande:", error);
      setIsLoading(false);
    }
  };

  if (isLoadingStations) {
    return (
      <div className="min-h-screen bg-muted flex items-center justify-center">
        <div className="text-center space-y-4">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto"></div>
          <p>Chargement des stations...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-muted p-4">
      <div className="max-w-4xl mx-auto space-y-8">
        <div className="text-center space-y-4">
          <h1 className="text-3xl font-bold">Choisissez votre station</h1>
          <p className="text-muted-foreground">
            Sélectionnez la station à laquelle vous souhaitez vous associer
          </p>
        </div>

        {/* Barre de recherche */}
        <div className="relative">
          <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Rechercher une station..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-10"
          />
        </div>

        {/* Liste des stations */}
        <div className="grid gap-4">
          {filteredStations.length === 0 ? (
            <Card>
              <CardContent className="text-center py-8">
                <p className="text-muted-foreground">
                  Aucune station trouvée pour votre recherche
                </p>
              </CardContent>
            </Card>
          ) : (
            filteredStations.map((station) => (
              <Card key={station.id} className="hover:shadow-lg transition-shadow">
                <CardContent className="p-6">
                  <div className="flex items-start justify-between">
                    <div className="space-y-3 flex-1">
                      <div className="flex items-center gap-3">
                        <Building2 className="h-5 w-5 text-primary" />
                        <h3 className="font-semibold text-lg">{station.name}</h3>
                        <Badge variant="secondary">
                          {station.mechanicsCount} mécanicien{station.mechanicsCount > 1 ? 's' : ''}
                        </Badge>
                      </div>
                      
                      <div className="space-y-2 text-sm text-muted-foreground">
                        <div className="flex items-center gap-2">
                          <MapPin className="h-4 w-4" />
                          <span>{station.address}</span>
                          {station.distance && (
                            <Badge variant="outline" className="ml-2">
                              {station.distance}
                            </Badge>
                          )}
                        </div>
                        
                        <div className="flex items-center gap-2">
                          <Phone className="h-4 w-4" />
                          <span>{station.phone}</span>
                        </div>
                      </div>
                    </div>

                    <Button
                      onClick={() => handleJoinStation(station.id)}
                      disabled={isLoading && selectedStation === station.id}
                      className="ml-4"
                    >
                      {isLoading && selectedStation === station.id ? (
                        "Demande en cours..."
                      ) : (
                        "Rejoindre"
                      )}
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ))
          )}
        </div>

        {/* Actions */}
        <div className="flex justify-center gap-4">
          <Button
            variant="outline"
            onClick={() => router.back()}
          >
            Retour
          </Button>
          
          <Button
            variant="secondary"
            onClick={() => {
              // TODO: Implémenter une demande de création de nouvelle station
              console.log("Demande de création de nouvelle station");
            }}
          >
            Ma station n'est pas listée
          </Button>
        </div>
      </div>
    </div>
  );
}
