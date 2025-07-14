import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { AlertCircle } from "lucide-react";

export function SystemAlerts() {
  return (
    <Card className="border-amber-200 bg-amber-50">
      <CardHeader>
        <CardTitle className="flex items-center gap-2 text-amber-800">
          <AlertCircle className="h-5 w-5" />
          Alertes système
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-2 text-amber-800">
          <p>• 2 stations nécessitent une vérification de conformité</p>
          <p>• 5 mécaniciens en attente d'approbation</p>
          <p>• Mise à jour système programmée pour ce weekend</p>
        </div>
      </CardContent>
    </Card>
  );
}
