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
  Loader2
} from "lucide-react";

interface Request {
  id: string;
  requesterName: string;
  requesterPhone: string;
  requesterEmail?: string;
  breakdownType: string;
  description: string;
  urgency: number;
  address: string;
  status: string;
  priority: number;
  createdAt: string;
  assignedAt?: string;
  startedAt?: string;
  completedAt?: string;
  mechanic?: {
    id: string;
    user: {
      name: string;
      phone?: string;
    };
  };
  station?: {
    name: string;
    address: string;
    phone: string;
  };
}

export default function TrackPage() {
  const searchParams = useSearchParams();
  const phoneParam = searchParams.get('phone');
  
  const [phone, setPhone] = useState(phoneParam || "");
  const [requests, setRequests] = useState<Request[]>([]);
  const [loading, setLoading] = useState(false);
  const [searched, setSearched] = useState(false);

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
                            <strong>Mécanicien assigné:</strong> {request.mechanic.user.name}
                            {request.mechanic.user.phone && (
                              <>
                                <br />
                                <strong>Contact:</strong> {request.mechanic.user.phone}
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
