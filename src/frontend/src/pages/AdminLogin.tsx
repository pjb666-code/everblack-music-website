import { Alert, AlertDescription } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { useActor } from "@/hooks/useActor";
import { useInternetIdentity } from "@/hooks/useInternetIdentity";
import { useQuery } from "@tanstack/react-query";
import { useNavigate } from "@tanstack/react-router";
import { AlertCircle, Loader2, Shield } from "lucide-react";
import { useEffect, useState } from "react";

export default function AdminLogin() {
  const navigate = useNavigate();
  const { login, loginStatus, identity, isInitializing } =
    useInternetIdentity();
  const { actor, isFetching: actorFetching } = useActor();
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    document.title = "Admin Login - Everblack Music";
  }, []);

  const { data: isAdmin, isLoading: checkingAdmin } = useQuery({
    queryKey: ["is-admin", identity?.getPrincipal().toString()],
    queryFn: async () => {
      if (!actor || !identity) return false;
      return actor.isCallerAdmin();
    },
    enabled: !!actor && !!identity && !actorFetching,
    retry: false,
  });

  useEffect(() => {
    if (isAdmin && !checkingAdmin) {
      navigate({ to: "/admin" });
    }
  }, [isAdmin, checkingAdmin, navigate]);

  const handleLogin = async () => {
    setError(null);
    try {
      await login();
    } catch (err: any) {
      console.error("Login error:", err);
      setError(err.message || "Login fehlgeschlagen");
    }
  };

  const isLoading =
    loginStatus === "logging-in" ||
    isInitializing ||
    actorFetching ||
    checkingAdmin;

  return (
    <section className="py-32 min-h-screen flex items-center justify-center">
      <div className="container mx-auto px-4">
        <div className="max-w-md mx-auto">
          <Card className="border-2">
            <CardHeader className="text-center">
              <div className="mx-auto p-4 rounded-full bg-primary/10 text-primary w-fit mb-4">
                <Shield className="w-8 h-8" />
              </div>
              <CardTitle className="text-2xl">Admin-Bereich</CardTitle>
              <CardDescription>
                Melde dich an, um auf das Admin-Panel zuzugreifen
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              {error && (
                <Alert variant="destructive">
                  <AlertCircle className="h-4 w-4" />
                  <AlertDescription>{error}</AlertDescription>
                </Alert>
              )}

              {identity && !isAdmin && !checkingAdmin && (
                <Alert variant="destructive">
                  <AlertCircle className="h-4 w-4" />
                  <AlertDescription>
                    Du hast keine Admin-Berechtigung. Bitte melde dich mit einem
                    Admin-Account an.
                  </AlertDescription>
                </Alert>
              )}

              <Button
                onClick={handleLogin}
                disabled={isLoading || !!identity}
                className="w-full"
                size="lg"
              >
                {isLoading ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Anmeldung läuft...
                  </>
                ) : identity ? (
                  "Angemeldet"
                ) : (
                  "Mit Internet Identity anmelden"
                )}
              </Button>

              <p className="text-xs text-center text-muted-foreground">
                Nur für autorisierte Administratoren
              </p>
              <p className="text-xs text-center text-muted-foreground">
                Neuer Account?{" "}
                <a
                  href="/admin/setup"
                  className="text-primary underline hover:text-primary/80 transition-colors"
                >
                  Admin-Zugang einrichten
                </a>
              </p>
            </CardContent>
          </Card>
        </div>
      </div>
    </section>
  );
}
