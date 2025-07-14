import { Card, CardContent } from "@/components/ui/card";
import { 
  Users, 
  Building2, 
  BarChart3,
  Shield,
  Globe
} from "lucide-react";

export function AdminActions() {
  return (
    <div className="grid md:grid-cols-3 lg:grid-cols-5 gap-4">
      <Card className="cursor-pointer hover:shadow-lg transition-shadow">
        <CardContent className="p-6 text-center space-y-2">
          <Building2 className="h-8 w-8 mx-auto text-primary" />
          <h3 className="font-medium">Gérer les stations</h3>
          <p className="text-sm text-muted-foreground">Administration des stations</p>
        </CardContent>
      </Card>

      <Card className="cursor-pointer hover:shadow-lg transition-shadow">
        <CardContent className="p-6 text-center space-y-2">
          <Users className="h-8 w-8 mx-auto text-primary" />
          <h3 className="font-medium">Utilisateurs</h3>
          <p className="text-sm text-muted-foreground">Gestion des comptes</p>
        </CardContent>
      </Card>

      <Card className="cursor-pointer hover:shadow-lg transition-shadow">
        <CardContent className="p-6 text-center space-y-2">
          <Shield className="h-8 w-8 mx-auto text-primary" />
          <h3 className="font-medium">Sécurité</h3>
          <p className="text-sm text-muted-foreground">Audit et permissions</p>
        </CardContent>
      </Card>

      <Card className="cursor-pointer hover:shadow-lg transition-shadow">
        <CardContent className="p-6 text-center space-y-2">
          <BarChart3 className="h-8 w-8 mx-auto text-primary" />
          <h3 className="font-medium">Analytics</h3>
          <p className="text-sm text-muted-foreground">Rapports détaillés</p>
        </CardContent>
      </Card>

      <Card className="cursor-pointer hover:shadow-lg transition-shadow">
        <CardContent className="p-6 text-center space-y-2">
          <Globe className="h-8 w-8 mx-auto text-primary" />
          <h3 className="font-medium">Système</h3>
          <p className="text-sm text-muted-foreground">Configuration globale</p>
        </CardContent>
      </Card>
    </div>
  );
}
