"use client";

import { useState, useEffect } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { toast } from "sonner";
import { 
  BarChart3, 
  TrendingUp, 
  Users, 
  Clock, 
  CheckCircle,
  DollarSign,
  Download,
  Calendar,
  Loader2,
  PieChart,
  Activity
} from "lucide-react";

interface ReportData {
  period: number;
  type: string;
  reportDate: string;
  data: {
    requests?: {
      statusDistribution: Array<{ status: string; _count: { status: number } }>;
      breakdownTypes: Array<{ breakdownType: string; _count: { breakdownType: number } }>;
      dailyEvolution: Record<string, { total: number; completed: number }>;
      totalRequests: number;
    };
    mechanics?: {
      performance: Array<{
        id: string;
        name: string;
        totalRequests: number;
        completedRequests: number;
        completionRate: number;
        isAvailable: boolean;
        specialties: string[];
      }>;
      totalMechanics: number;
      availableMechanics: number;
    };
    revenue?: {
      totalRevenue: number;
      averagePerRequest: number;
      completedInterventions: number;
      projectedMonthly: number;
    };
  };
}

export function ReportsManager() {
  const [reportData, setReportData] = useState<ReportData | null>(null);
  const [loading, setLoading] = useState(false);
  const [period, setPeriod] = useState("30");
  const [reportType, setReportType] = useState("general");

  const generateReport = async () => {
    setLoading(true);
    try {
      const response = await fetch(`/api/manager/reports?period=${period}&type=${reportType}`);
      
      if (!response.ok) {
        throw new Error('Erreur lors de la génération du rapport');
      }
      
      const data = await response.json();
      setReportData(data);
      toast.success("Rapport généré avec succès");

    } catch (error) {
      console.error("Erreur:", error);
      toast.error(error instanceof Error ? error.message : "Erreur de génération");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    generateReport();
  }, [period, reportType]);

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'PENDING': return 'bg-red-100 text-red-800';
      case 'ASSIGNED': return 'bg-blue-100 text-blue-800';
      case 'IN_PROGRESS': return 'bg-yellow-100 text-yellow-800';
      case 'COMPLETED': return 'bg-green-100 text-green-800';
      case 'CANCELLED': return 'bg-gray-100 text-gray-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getBreakdownTypeLabel = (type: string) => {
    const labels: Record<string, string> = {
      'MECHANICAL': 'Mécanique',
      'ELECTRICAL': 'Électrique',
      'TIRE': 'Pneu',
      'BATTERY': 'Batterie',
      'ENGINE': 'Moteur',
      'TRANSMISSION': 'Transmission',
      'BRAKES': 'Freins',
      'OTHER': 'Autre'
    };
    return labels[type] || type;
  };

  if (loading && !reportData) {
    return (
      <Card>
        <CardContent className="p-6">
          <div className="flex items-center justify-center">
            <Loader2 className="h-8 w-8 animate-spin" />
            <span className="ml-2">Génération du rapport...</span>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      {/* En-tête avec contrôles */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold">Rapports et Analytics</h2>
          <p className="text-muted-foreground">
            Analysez les performances et tendances de votre activité
          </p>
        </div>
        <div className="flex items-center gap-4">
          <Select value={period} onValueChange={setPeriod}>
            <SelectTrigger className="w-32">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="7">7 jours</SelectItem>
              <SelectItem value="30">30 jours</SelectItem>
              <SelectItem value="90">90 jours</SelectItem>
              <SelectItem value="365">1 an</SelectItem>
            </SelectContent>
          </Select>
          
          <Select value={reportType} onValueChange={setReportType}>
            <SelectTrigger className="w-40">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="general">Général</SelectItem>
              <SelectItem value="requests">Demandes</SelectItem>
              <SelectItem value="mechanics">Mécaniciens</SelectItem>
              <SelectItem value="revenue">Revenus</SelectItem>
            </SelectContent>
          </Select>

          <Button onClick={generateReport} disabled={loading} variant="outline">
            {loading ? (
              <Loader2 className="h-4 w-4 animate-spin" />
            ) : (
              <Download className="h-4 w-4" />
            )}
            Actualiser
          </Button>
        </div>
      </div>

      {reportData && (
        <>
          {/* Métriques générales */}
          {reportData.data.requests && (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              <Card>
                <CardContent className="p-6">
                  <div className="flex items-center gap-3">
                    <BarChart3 className="h-8 w-8 text-blue-600" />
                    <div>
                      <p className="text-2xl font-bold">{reportData.data.requests.totalRequests}</p>
                      <p className="text-sm text-muted-foreground">Total demandes</p>
                    </div>
                  </div>
                </CardContent>
              </Card>

              {reportData.data.revenue && (
                <Card>
                  <CardContent className="p-6">
                    <div className="flex items-center gap-3">
                      <DollarSign className="h-8 w-8 text-green-600" />
                      <div>
                        <p className="text-2xl font-bold">{reportData.data.revenue.totalRevenue}€</p>
                        <p className="text-sm text-muted-foreground">Revenus générés</p>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              )}

              {reportData.data.mechanics && (
                <>
                  <Card>
                    <CardContent className="p-6">
                      <div className="flex items-center gap-3">
                        <Users className="h-8 w-8 text-purple-600" />
                        <div>
                          <p className="text-2xl font-bold">{reportData.data.mechanics.totalMechanics}</p>
                          <p className="text-sm text-muted-foreground">Mécaniciens</p>
                        </div>
                      </div>
                    </CardContent>
                  </Card>

                  <Card>
                    <CardContent className="p-6">
                      <div className="flex items-center gap-3">
                        <CheckCircle className="h-8 w-8 text-green-600" />
                        <div>
                          <p className="text-2xl font-bold">{reportData.data.mechanics.availableMechanics}</p>
                          <p className="text-sm text-muted-foreground">Disponibles</p>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                </>
              )}
            </div>
          )}

          {/* Répartition des statuts */}
          {reportData.data.requests?.statusDistribution && (
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <PieChart className="h-5 w-5" />
                  Répartition des demandes par statut
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4">
                  {reportData.data.requests.statusDistribution.map((item, index) => (
                    <div key={index} className="text-center">
                      <div className="text-2xl font-bold">{item._count.status}</div>
                      <Badge className={getStatusColor(item.status)} variant="secondary">
                        {item.status}
                      </Badge>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          )}

          {/* Types de pannes */}
          {reportData.data.requests?.breakdownTypes && (
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Activity className="h-5 w-5" />
                  Types de pannes les plus fréquents
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {reportData.data.requests.breakdownTypes
                    .sort((a, b) => b._count.breakdownType - a._count.breakdownType)
                    .slice(0, 6)
                    .map((item, index) => (
                      <div key={index} className="flex items-center justify-between">
                        <span className="font-medium">
                          {getBreakdownTypeLabel(item.breakdownType)}
                        </span>
                        <div className="flex items-center gap-2">
                          <div className="w-32 bg-gray-200 rounded-full h-2">
                            <div
                              className="bg-blue-600 h-2 rounded-full"
                              style={{
                                width: `${(item._count.breakdownType / Math.max(...reportData.data.requests!.breakdownTypes.map(t => t._count.breakdownType))) * 100}%`
                              }}
                            />
                          </div>
                          <span className="text-sm font-medium min-w-[2rem]">
                            {item._count.breakdownType}
                          </span>
                        </div>
                      </div>
                    ))}
                </div>
              </CardContent>
            </Card>
          )}

          {/* Performance des mécaniciens */}
          {reportData.data.mechanics?.performance && (
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <TrendingUp className="h-5 w-5" />
                  Performance des mécaniciens
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {reportData.data.mechanics.performance
                    .sort((a, b) => b.completionRate - a.completionRate)
                    .slice(0, 10)
                    .map((mechanic, index) => (
                      <div key={mechanic.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                        <div className="flex items-center gap-3">
                          <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center text-sm font-medium">
                            {index + 1}
                          </div>
                          <div>
                            <div className="font-medium">{mechanic.name}</div>
                            <div className="text-sm text-muted-foreground">
                              {mechanic.specialties.join(', ')}
                            </div>
                          </div>
                        </div>
                        <div className="text-right">
                          <div className="font-medium">
                            {mechanic.completedRequests}/{mechanic.totalRequests}
                          </div>
                          <div className="text-sm text-muted-foreground">
                            {Math.round(mechanic.completionRate)}% réussite
                          </div>
                        </div>
                        <Badge variant={mechanic.isAvailable ? "outline" : "secondary"}>
                          {mechanic.isAvailable ? "Disponible" : "Occupé"}
                        </Badge>
                      </div>
                    ))}
                </div>
              </CardContent>
            </Card>
          )}

          {/* Informations sur le rapport */}
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center gap-2 text-sm text-muted-foreground">
                <Calendar className="h-4 w-4" />
                <span>
                  Rapport généré le {new Date(reportData.reportDate).toLocaleString('fr-FR')} 
                  • Période: {reportData.period} jours
                  • Type: {reportType}
                </span>
              </div>
            </CardContent>
          </Card>
        </>
      )}
    </div>
  );
}
