"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Building2, Wrench, Users } from "lucide-react";

export default function RoleSelectionPage() {
  const [selectedRole, setSelectedRole] = useState<string>("");
  const [isLoading, setIsLoading] = useState(false);
  const router = useRouter();

  const roles = [
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

  const handleRoleSelection = async (roleId: string, redirectPath: string) => {
    setIsLoading(true);
    setSelectedRole(roleId);
    
    try {
      // TODO: Implémenter la mise à jour du rôle utilisateur
      // await updateUserRole(roleId);
      
      // Redirection vers la page appropriée
      router.push(redirectPath);
    } catch (error) {
      console.error("Erreur lors de la sélection du rôle:", error);
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-muted flex items-center justify-center p-4">
      <div className="w-full max-w-4xl space-y-8">
        <div className="text-center space-y-4">
          <h1 className="text-3xl font-bold">Choisissez votre rôle</h1>
          <p className="text-muted-foreground">
            Sélectionnez le rôle qui correspond le mieux à votre utilisation de la plateforme
          </p>
        </div>

        <div className="grid md:grid-cols-3 gap-6">
          {roles.map((role) => (
            <Card 
              key={role.id}
              className={`cursor-pointer transition-all hover:shadow-lg ${
                selectedRole === role.id ? "ring-2 ring-primary" : ""
              }`}
              onClick={() => handleRoleSelection(role.id, role.redirectPath)}
            >
              <CardHeader className="text-center space-y-4">
                <div className="mx-auto p-3 bg-primary/10 rounded-full w-fit">
                  {role.icon}
                </div>
                <div>
                  <CardTitle className="text-xl">{role.title}</CardTitle>
                  <CardDescription className="mt-2">
                    {role.description}
                  </CardDescription>
                </div>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  {role.features.map((feature, index) => (
                    <div key={index} className="flex items-center gap-2">
                      <div className="w-1.5 h-1.5 bg-primary rounded-full" />
                      <span className="text-sm text-muted-foreground">{feature}</span>
                    </div>
                  ))}
                </div>
                <Button 
                  className="w-full" 
                  disabled={isLoading}
                  onClick={(e) => {
                    e.stopPropagation();
                    handleRoleSelection(role.id, role.redirectPath);
                  }}
                >
                  {isLoading && selectedRole === role.id ? "Chargement..." : "Choisir ce rôle"}
                </Button>
              </CardContent>
            </Card>
          ))}
        </div>

        <div className="text-center">
          <p className="text-sm text-muted-foreground">
            Vous pourrez modifier votre rôle plus tard dans les paramètres de votre compte
          </p>
        </div>
      </div>
    </div>
  );
}
