import { Building2, Wrench, Users } from "lucide-react";
import { ReactElement } from "react";

export interface Role {
  id: string;
  title: string;
  description: string;
  icon: ReactElement;
  features: string[];
  redirectPath: string;
}

export const ROLES: Role[] = [
  {
    id: "station-manager",
    title: "Gestionnaire de Station",
    description: "Gérez une station de service et supervisez les mécaniciens",
    icon: <Building2 className="h-8 w-8" />,
    features: ["Créer et gérer une station", "Superviser les mécaniciens", "Voir les statistiques"],
    redirectPath: "/create-station"
  },
  {
    id: "mechanic",
    title: "Mécanicien",
    description: "Rejoignez une station et répondez aux demandes d'intervention",
    icon: <Wrench className="h-8 w-8" />,
    features: ["Rejoindre une station existante", "Accepter des interventions", "Gérer votre disponibilité"],
    redirectPath: "/select-station"
  },
  {
    id: "admin",
    title: "Administrateur",
    description: "Gérez l'ensemble de la plateforme",
    icon: <Users className="h-8 w-8" />,
    features: ["Gérer toutes les stations", "Superviser tous les utilisateurs", "Accès aux analytics"],
    redirectPath: "/admin/dashboard"
  }
];
