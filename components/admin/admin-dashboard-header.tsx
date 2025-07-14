import { Button } from "@/components/ui/button";
import { BarChart3, Settings } from "lucide-react";

export function AdminDashboardHeader() {
  return (
    <div className="flex items-center justify-between">
      <div>
        <h1 className="text-3xl font-bold">Tableau de Bord - Administrateur</h1>
        <p className="text-muted-foreground">
          Vue d'ensemble de la plateforme NTouks
        </p>
      </div>
      <div className="flex gap-2">
        <Button variant="outline">
          <BarChart3 className="mr-2 h-4 w-4" />
          Rapports détaillés
        </Button>
        <Button>
          <Settings className="mr-2 h-4 w-4" />
          Administration
        </Button>
      </div>
    </div>
  );
}
