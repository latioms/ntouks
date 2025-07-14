"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { authClient } from "@/lib/auth-client";
import { Card, CardContent } from "@/components/ui/card";
import { CheckCircle, ArrowRight, User, Shield } from "lucide-react";

interface RedirectMessageProps {
  userRole?: string;
  redirectPath?: string;
}

export function RedirectMessage({ userRole, redirectPath }: RedirectMessageProps) {
  const [countdown, setCountdown] = useState(3);
  const router = useRouter();

  useEffect(() => {
    if (countdown > 0) {
      const timer = setTimeout(() => setCountdown(countdown - 1), 1000);
      return () => clearTimeout(timer);
    } else if (redirectPath) {
      router.push(redirectPath);
    }
  }, [countdown, redirectPath, router]);

  const getMessage = () => {
    if (!userRole) {
      return {
        title: "Configuration requise",
        description: "Vous devez choisir votre rôle pour continuer",
        icon: <User className="h-8 w-8 text-blue-500" />,
        color: "blue"
      };
    }

    const roleMessages: Record<string, any> = {
      "admin": {
        title: "Bienvenue Administrateur",
        description: "Redirection vers le tableau de bord administrateur",
        icon: <Shield className="h-8 w-8 text-red-500" />,
        color: "red"
      },
      "station-manager": {
        title: "Bienvenue Gestionnaire",
        description: "Redirection vers votre espace de gestion",
        icon: <Shield className="h-8 w-8 text-blue-500" />,
        color: "blue"
      },
      "mechanic": {
        title: "Bienvenue Mécanicien",
        description: "Redirection vers votre espace de travail",
        icon: <Shield className="h-8 w-8 text-green-500" />,
        color: "green"
      }
    };

    return roleMessages[userRole] || {
      title: "Redirection en cours",
      description: "Redirection vers votre espace personnel",
      icon: <CheckCircle className="h-8 w-8 text-green-500" />,
      color: "green"
    };
  };

  const message = getMessage();

  return (
    <div className="min-h-screen bg-muted flex items-center justify-center p-4">
      <Card className="w-full max-w-md">
        <CardContent className="flex flex-col items-center space-y-6 p-8">
          <div className="flex items-center justify-center w-16 h-16 bg-muted rounded-full">
            {message.icon}
          </div>
          
          <div className="text-center space-y-2">
            <h2 className="text-xl font-semibold">{message.title}</h2>
            <p className="text-muted-foreground">{message.description}</p>
          </div>

          <div className="flex items-center space-x-2 text-sm text-muted-foreground">
            <span>Redirection dans {countdown}s</span>
            <ArrowRight className="h-4 w-4" />
          </div>

          <div className="w-full bg-muted rounded-full h-2">
            <div 
              className={`bg-${message.color}-500 h-2 rounded-full transition-all duration-1000`}
              style={{ width: `${((3 - countdown) / 3) * 100}%` }}
            />
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
