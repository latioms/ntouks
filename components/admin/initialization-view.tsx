import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Shield, BarChart3, Settings } from "lucide-react";
import { AdminDashboardHeader } from "./admin-dashboard-header";
import { AdminActions } from "./admin-actions";

export function InitializationView() {
  return (
    <div className="min-h-screen bg-muted p-4 space-y-6">
      <AdminDashboardHeader />

      <Card>
        <CardContent className="p-8 text-center space-y-4">
          <Shield className="h-16 w-16 mx-auto text-muted-foreground" />
          <div className="space-y-2">
            <h2 className="text-xl font-semibold">Plateforme en cours d'initialisation</h2>
            <p className="text-muted-foreground">
              Les données de la plateforme seront affichées une fois que des stations et utilisateurs seront créés.
            </p>
          </div>
        </CardContent>
      </Card>

      <AdminActions />
    </div>
  );
}
