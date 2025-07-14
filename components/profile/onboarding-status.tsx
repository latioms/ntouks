"use client";

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/hooks/use-auth";
import { CheckCircle, AlertCircle, User, Shield } from "lucide-react";
import { useRouter } from "next/navigation";

export function OnboardingStatus() {
  const { user, hasRole, needsOnboarding } = useAuth();
  const router = useRouter();

  if (!user) return null;

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <User className="h-5 w-5" />
          Statut du Profil
        </CardTitle>
        <CardDescription>
          Informations sur votre compte et votre progression
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Informations utilisateur */}
        <div className="flex items-center justify-between p-3 bg-muted/50 rounded-lg">
          <div>
            <p className="font-medium">{user.name}</p>
            <p className="text-sm text-muted-foreground">{user.email}</p>
          </div>
          <CheckCircle className="h-5 w-5 text-green-500" />
        </div>

        {/* Statut du rôle */}
        <div className="flex items-center justify-between p-3 bg-muted/50 rounded-lg">
          <div className="flex items-center gap-3">
            <Shield className="h-5 w-5" />
            <div>
              <p className="font-medium">Rôle assigné</p>
              <p className="text-sm text-muted-foreground">
                {hasRole ? "Votre rôle a été configuré" : "Configuration requise"}
              </p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            {hasRole ? (
              <>
                <Badge className="bg-green-100 text-green-800">
                  {user.role?.name}
                </Badge>
                <CheckCircle className="h-5 w-5 text-green-500" />
              </>
            ) : (
              <>
                <Badge variant="outline" className="text-orange-600 border-orange-300">
                  Non assigné
                </Badge>
                <AlertCircle className="h-5 w-5 text-orange-500" />
              </>
            )}
          </div>
        </div>

        {/* Action si onboarding incomplet */}
        {needsOnboarding && (
          <div className="bg-orange-50 border border-orange-200 rounded-lg p-4">
            <div className="flex items-start gap-3">
              <AlertCircle className="h-5 w-5 text-orange-600 mt-0.5" />
              <div className="flex-1">
                <h4 className="font-medium text-orange-900">Configuration incomplète</h4>
                <p className="text-sm text-orange-700 mt-1">
                  Vous devez choisir un rôle pour accéder à toutes les fonctionnalités de la plateforme.
                </p>
                <Button 
                  size="sm" 
                  className="mt-3"
                  onClick={() => router.push("/select-role")}
                >
                  Choisir un rôle maintenant
                </Button>
              </div>
            </div>
          </div>
        )}

        {/* Message de confirmation si onboarding terminé */}
        {hasRole && (
          <div className="bg-green-50 border border-green-200 rounded-lg p-4">
            <div className="flex items-start gap-3">
              <CheckCircle className="h-5 w-5 text-green-600 mt-0.5" />
              <div>
                <h4 className="font-medium text-green-900">Profil complet</h4>
                <p className="text-sm text-green-700 mt-1">
                  Votre compte est entièrement configuré et prêt à utiliser.
                </p>
              </div>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
