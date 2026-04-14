import { Alert, AlertDescription } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useActor } from "@/hooks/useActor";
import { useInternetIdentity } from "@/hooks/useInternetIdentity";
import { useNavigate } from "@tanstack/react-router";
import { AlertCircle, CheckCircle2, KeyRound, Loader2 } from "lucide-react";
import { useEffect, useState } from "react";

export default function AdminSetup() {
  const navigate = useNavigate();
  const { identity, isInitializing } = useInternetIdentity();
  const { actor, isFetching: actorFetching } = useActor();

  const [setupCode, setSetupCode] = useState("");
  const [isPending, setIsPending] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);

  useEffect(() => {
    document.title = "Admin-Zugang einrichten – Everblack Music";
  }, []);

  useEffect(() => {
    if (success) {
      const t = setTimeout(() => navigate({ to: "/admin" }), 2000);
      return () => clearTimeout(t);
    }
  }, [success, navigate]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!setupCode.trim() || !actor) return;

    setError(null);
    setIsPending(true);
    try {
      const result = await actor.resetAdminForNewPrincipal(setupCode.trim());
      if (result) {
        setSuccess(true);
      } else {
        setError("Ungültiger Setup-Code. Bitte versuche es erneut.");
      }
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : "Unbekannter Fehler";
      setError(msg);
    } finally {
      setIsPending(false);
    }
  };

  const isLoading = isInitializing || actorFetching;

  return (
    <section className="py-32 min-h-screen flex items-center justify-center">
      <div className="container mx-auto px-4">
        <div className="max-w-md mx-auto">
          <Card className="border-2">
            <CardHeader className="text-center">
              <div className="mx-auto p-4 rounded-full bg-primary/10 text-primary w-fit mb-4">
                <KeyRound className="w-8 h-8" />
              </div>
              <CardTitle className="text-2xl">
                Admin-Zugang einrichten
              </CardTitle>
              <CardDescription>
                Gib den Setup-Code ein, um Admin-Rechte für diesen Account zu
                erhalten.
              </CardDescription>
            </CardHeader>

            <CardContent className="space-y-5">
              {/* Not logged in */}
              {!isLoading && !identity && (
                <Alert variant="destructive">
                  <AlertCircle className="h-4 w-4" />
                  <AlertDescription>
                    Bitte zuerst anmelden.{" "}
                    <a
                      href="/admin/login"
                      className="underline font-medium hover:text-destructive-foreground/80"
                    >
                      Zur Anmeldung
                    </a>
                  </AlertDescription>
                </Alert>
              )}

              {/* Error */}
              {error && (
                <Alert variant="destructive">
                  <AlertCircle className="h-4 w-4" />
                  <AlertDescription>{error}</AlertDescription>
                </Alert>
              )}

              {/* Success */}
              {success && (
                <Alert className="border-primary/40 bg-primary/10 text-primary">
                  <CheckCircle2 className="h-4 w-4" />
                  <AlertDescription>
                    Admin-Zugang erfolgreich eingerichtet. Du wirst
                    weitergeleitet…
                  </AlertDescription>
                </Alert>
              )}

              {/* Form */}
              {!success && (
                <form onSubmit={handleSubmit} className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="setup-code">Setup-Code</Label>
                    <Input
                      id="setup-code"
                      type="password"
                      value={setupCode}
                      onChange={(e) => setSetupCode(e.target.value)}
                      placeholder="Setup-Code eingeben"
                      disabled={isPending || isLoading || !identity}
                      autoComplete="off"
                      data-ocid="admin-setup-code-input"
                    />
                  </div>

                  <Button
                    type="submit"
                    className="w-full"
                    size="lg"
                    disabled={
                      isPending || isLoading || !identity || !setupCode.trim()
                    }
                    data-ocid="admin-setup-submit"
                  >
                    {isPending ? (
                      <>
                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                        Wird überprüft…
                      </>
                    ) : (
                      "Bestätigen"
                    )}
                  </Button>
                </form>
              )}

              <p className="text-xs text-center text-muted-foreground">
                Nur für autorisierte Administratoren
              </p>
            </CardContent>
          </Card>
        </div>
      </div>
    </section>
  );
}
