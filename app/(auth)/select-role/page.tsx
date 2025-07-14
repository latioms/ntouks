"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { ROLES } from "@/constants/roles";
import { assignCurrentUserRole, mapConstantRoleToDbRole } from "@/lib/roles-client";
import { useAuth } from "@/hooks/use-auth";
import { toast } from "sonner";
import { Car, CheckCircle } from "lucide-react";

export default function RoleSelectionPage() {
  const [selectedRole, setSelectedRole] = useState<string>("");
  const [isLoading, setIsLoading] = useState(false);
  const { user, isLoading: authLoading } = useAuth();
  const router = useRouter();

  // Rediriger si l'utilisateur a déjà un rôle
  useEffect(() => {
    if (!authLoading && user?.role) {
      toast.info("Vous avez déjà un rôle assigné");
      router.push("/dashboard");
    }
  }, [user, authLoading, router]);

  const handleRoleSelection = async (roleId: string, redirectPath: string) => {
    setIsLoading(true);
    setSelectedRole(roleId);
    
    try {
      // Mapper l'ID du rôle constant vers l'ID de base de données
      const dbRoleId = mapConstantRoleToDbRole(roleId);
      
      // Assigner le rôle à l'utilisateur connecté
      await assignCurrentUserRole(dbRoleId);
      
      toast.success("Rôle assigné avec succès ! Bienvenue sur NTouks !");
      
      // Attendre un peu pour que l'utilisateur voit le message
      setTimeout(() => {
        router.push(redirectPath);
      }, 1500);
      
    } catch (error) {
      console.error("Erreur lors de la sélection du rôle:", error);
      toast.error(error instanceof Error ? error.message : "Erreur lors de l'assignement du rôle");
      setIsLoading(false);
      setSelectedRole("");
    }
  };

  if (authLoading) {
    return (
      <div className="min-h-screen bg-muted flex items-center justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-muted flex items-center justify-center p-4">
      <div className="w-full max-w-4xl space-y-8">
        {/* En-tête de bienvenue */}
        <div className="text-center space-y-4">
          <div className="flex justify-center mb-4">
            <div className="p-3 bg-primary/10 rounded-full">
              <Car className="h-12 w-12 text-primary" />
            </div>
          </div>
          
          <h1 className="text-3xl font-bold">
            Bienvenue sur NTouks, {user?.name} !
          </h1>
          
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 max-w-2xl mx-auto">
            <div className="flex items-start gap-3">
              <CheckCircle className="h-5 w-5 text-blue-600 mt-0.5" />
              <div className="text-left">
                <h3 className="font-medium text-blue-900">Dernière étape de configuration</h3>
                <p className="text-sm text-blue-700 mt-1">
                  Pour terminer votre inscription, veuillez choisir votre rôle sur la plateforme. 
                  Ceci nous permettra de vous offrir la meilleure expérience possible.
                </p>
              </div>
            </div>
          </div>
          
          <p className="text-muted-foreground">
            Sélectionnez le rôle qui correspond le mieux à votre utilisation de la plateforme
          </p>
        </div>

        <div className="grid md:grid-cols-3 gap-6">
          {ROLES.map((role) => (
            <Card 
              key={role.id}
              className={`cursor-pointer transition-all hover:shadow-lg ${
                selectedRole === role.id ? "ring-2 ring-primary" : ""
              } ${isLoading ? "opacity-50 pointer-events-none" : ""}`}
              onClick={() => !isLoading && handleRoleSelection(role.id, role.redirectPath)}
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
