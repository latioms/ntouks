import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import type { AdminStats } from "@/types/admin";

interface OperationalMetricsProps {
  stats: AdminStats;
}

export function OperationalMetrics({ stats }: OperationalMetricsProps) {
  return (
    <div className="grid md:grid-cols-3 gap-6">
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Demandes d'intervention</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            <div className="flex justify-between">
              <span>Total:</span>
              <span className="font-semibold">{stats.totalRequests}</span>
            </div>
            <div className="flex justify-between">
              <span>En attente:</span>
              <span className="font-semibold text-amber-600">{stats.pendingRequests}</span>
            </div>
            <div className="flex justify-between">
              <span>Taux de résolution:</span>
              <span className="font-semibold text-green-600">94%</span>
            </div>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Performance réseau</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            <div className="flex justify-between">
              <span>Temps de réponse moyen:</span>
              <span className="font-semibold">12 min</span>
            </div>
            <div className="flex justify-between">
              <span>Satisfaction client:</span>
              <span className="font-semibold text-green-600">4.7/5</span>
            </div>
            <div className="flex justify-between">
              <span>Couverture géographique:</span>
              <span className="font-semibold">15 villes</span>
            </div>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Système</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            <div className="flex justify-between">
              <span>Disponibilité:</span>
              <span className="font-semibold text-green-600">99.8%</span>
            </div>
            <div className="flex justify-between">
              <span>Version API:</span>
              <span className="font-semibold">v2.1.3</span>
            </div>
            <div className="flex justify-between">
              <span>Dernière sauvegarde:</span>
              <span className="font-semibold">Il y a 2h</span>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
