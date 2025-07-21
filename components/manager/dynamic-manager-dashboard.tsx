import { useManagerPermissions } from "@/hooks/use-manager-permissions";
import { StatsOverview } from "./stats-overview";
import { RequestsManager } from "./requests-manager";
import { MechanicsManager } from "./mechanics-manager";
import { ReportsManager } from "./reports-manager";
import { MechanicAssignmentLimitsView } from "./mechanic-assignment-limits";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { CompactRoleDisplay } from "@/components/ui/compact-role-display";
import { 
  BarChart3, 
  AlertCircle, 
  Users, 
  FileText,
  Shield,
  Loader2,
  ListChecks
} from "lucide-react";
import { useState } from "react";

type DashboardSection = 'stats' | 'requests' | 'mechanics' | 'reports' | 'assignment-limits';

export function DynamicManagerDashboard() {
  const { permissions, role, loading, getDashboardSections, isAdmin, isManager } = useManagerPermissions();
  const [activeSection, setActiveSection] = useState<DashboardSection>('stats');

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <Loader2 className="h-8 w-8 animate-spin mx-auto mb-4" />
          <p className="text-muted-foreground">Chargement du dashboard...</p>
        </div>
      </div>
    );
  }

  if (!role || (!isAdmin && !isManager)) {
    return (
      <Card>
        <CardContent className="p-6 text-center">
          <Shield className="h-12 w-12 mx-auto mb-4 text-muted-foreground" />
          <h3 className="text-lg font-medium mb-2">Accès restreint</h3>
          <p className="text-muted-foreground">
            Vous n'avez pas les permissions nécessaires pour accéder à ce dashboard.
          </p>
        </CardContent>
      </Card>
    );
  }

  const dashboardSections = getDashboardSections();

  const getSectionIcon = (sectionId: string) => {
    switch (sectionId) {
      case 'stats':
        return <BarChart3 className="h-4 w-4" />;
      case 'requests':
        return <AlertCircle className="h-4 w-4" />;
      case 'mechanics':
        return <Users className="h-4 w-4" />;
      case 'reports':
        return <FileText className="h-4 w-4" />;
      case 'assignment-limits':
        return <ListChecks className="h-4 w-4" />;
      default:
        return null;
    }
  };

  const renderActiveSection = () => {
    switch (activeSection) {
      case 'stats':
        return permissions.canViewStats ? <StatsOverview /> : null;
      case 'requests':
        return permissions.canViewRequests ? <RequestsManager /> : null;
      case 'mechanics':
        return permissions.canManageMechanics ? <MechanicsManager /> : null;
      case 'reports':
        return permissions.canViewReports ? <ReportsManager /> : null;
      case 'assignment-limits':
        return permissions.canViewAssignmentLimits ? <MechanicAssignmentLimitsView /> : null;
      default:
        return null;
    }
  };

  return (
    <div className="space-y-6">
      {/* En-tête avec informations utilisateur */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Dashboard Gestionnaire</h1>
          <div className="flex items-center gap-2 mt-2">
            <CompactRoleDisplay variant="inline" />
            {isAdmin && (
              <Badge variant="destructive">
                <Shield className="h-3 w-3 mr-1" />
                Admin
              </Badge>
            )}
          </div>
        </div>
      </div>

      {/* Navigation par onglets */}
      <div className="border-b">
        <nav className="flex space-x-8">
          {dashboardSections.map((section) => {
            const isActive = activeSection === section.id;
            return (
              <button
                key={section.id}
                onClick={() => setActiveSection(section.id as DashboardSection)}
                className={`flex items-center gap-2 py-2 px-1 border-b-2 font-medium text-sm transition-colors ${
                  isActive
                    ? 'border-primary text-primary'
                    : 'border-transparent text-muted-foreground hover:text-foreground hover:border-muted-foreground'
                }`}
              >
                {getSectionIcon(section.id)}
                {section.title}
              </button>
            );
          })}
        </nav>
      </div>

      {/* Contenu de la section active */}
      <div className="min-h-[600px]">
        {renderActiveSection()}
      </div>

      {/* Informations sur les permissions (en mode debug) */}
      {process.env.NODE_ENV === 'development' && (
        <Card className="border-dashed border-orange-300">
          <CardContent className="p-4">
            <h4 className="font-medium text-orange-600 mb-2">Debug - Permissions</h4>
            <div className="grid grid-cols-2 gap-2 text-xs">
              <div>Voir requêtes: {permissions.canViewRequests ? '✅' : '❌'}</div>
              <div>Assigner mécaniciens: {permissions.canAssignMechanics ? '✅' : '❌'}</div>
              <div>Gérer mécaniciens: {permissions.canManageMechanics ? '✅' : '❌'}</div>
              <div>Voir stats: {permissions.canViewStats ? '✅' : '❌'}</div>
              <div>Gérer utilisateurs: {permissions.canManageUsers ? '✅' : '❌'}</div>
              <div>Voir rapports: {permissions.canViewReports ? '✅' : '❌'}</div>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
