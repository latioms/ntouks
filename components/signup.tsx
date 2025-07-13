"use client";

import { useState } from "react";
import { FcGoogle } from "react-icons/fc";
import { signUp, signIn } from "@/lib/auth-client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useRouter } from "next/navigation";

interface Signup1Props {
  heading?: string;
  logo: {
    url: string;
    src?: string;
    component?: React.ReactNode;
    alt: string;
    title?: string;
  };
  signupText?: string;
  googleText?: string;
  loginText?: string;
  loginUrl?: string;
}

const Signup = ({
  heading = "Créer un compte",
  logo = {
    url: "/",
    src: "",
    alt: "logo",
    title: "shadcnblocks.com",
  },
  googleText = "S'inscrire avec Google",
  signupText = "Créer un compte",
  loginText = "Déjà un compte ?",
  loginUrl = "/login",
}: Signup1Props) => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");
  const router = useRouter();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError("");

    try {
      const result = await signUp.email({
        email,
        password,
        name: email.split("@")[0], // Utilise la partie avant @ comme nom
      });

      if (result.error) {
        setError(result.error.message || "Une erreur est survenue");
      } else {
        // Redirection vers la sélection de rôle après inscription réussie
        router.push("/select-role");
      }
    } catch (err) {
      setError("Une erreur est survenue lors de l'inscription");
    } finally {
      setIsLoading(false);
    }
  };

  const handleGoogleSignUp = async () => {
    setIsLoading(true);
    try {
      await signIn.social({
        provider: "google",
      });
    } catch (err) {
      setError("Erreur lors de l'inscription avec Google");
      setIsLoading(false);
    }
  };
  return (
    <section className="bg-muted h-screen">
      <div className="flex h-full items-center justify-center">
        <div className="border-muted bg-background flex w-full max-w-sm flex-col items-center gap-y-8 rounded-md border px-6 py-12 shadow-md">
          <div className="flex flex-col items-center gap-y-2">
            {/* Logo */}
            <div className="flex items-center gap-1 lg:justify-start">
              <a href={logo.url}>
                {logo.component ? (
                  logo.component
                ) : (
                  <img
                    src={logo.src}
                    alt={logo.alt}
                    title={logo.title}
                    className="h-10 dark:invert"
                  />
                )}
              </a>
            </div>
            {heading && <h1 className="text-3xl font-semibold">{heading}</h1>}
          </div>
          <form onSubmit={handleSubmit} className="flex w-full flex-col gap-8">
            <div className="flex flex-col gap-4">
              {error && (
                <div className="text-red-500 text-sm text-center">{error}</div>
              )}
              
              <div className="flex flex-col gap-2">
                <Input 
                  type="email" 
                  placeholder="Email" 
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required 
                  disabled={isLoading}
                />
              </div>
              <div className="flex flex-col gap-2">
                <Input 
                  type="password" 
                  placeholder="Mot de passe" 
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required 
                  disabled={isLoading}
                />
              </div>
              <div className="flex flex-col gap-4">
                <Button type="submit" className="mt-2 w-full" disabled={isLoading}>
                  {isLoading ? "Création..." : signupText}
                </Button>
                <Button 
                  type="button"
                  variant="outline" 
                  className="w-full"
                  onClick={handleGoogleSignUp}
                  disabled={isLoading}
                >
                  <FcGoogle className="mr-2 size-5" />
                  {googleText}
                </Button>
              </div>
            </div>
          </form>
          <div className="text-muted-foreground flex justify-center gap-1 text-sm">
            <p>{loginText}</p>
            <a
              href={loginUrl}
              className="text-primary font-medium hover:underline"
            >
              Se connecter
            </a>
          </div>
        </div>
      </div>
    </section>
  );
};

export { Signup };
