import type { StripeConfiguration } from "@/backend";
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
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { CheckCircle, Loader2, Save, XCircle } from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";

export default function AdminStripe() {
  const { actor } = useActor();
  const queryClient = useQueryClient();

  const { data: isConfigured } = useQuery({
    queryKey: ["stripe-configured"],
    queryFn: async () => {
      if (!actor) return false;
      return actor.isStripeConfigured();
    },
    enabled: !!actor,
  });

  const [formData, setFormData] = useState({
    secretKey: "",
    allowedCountries: "DE,AT,CH",
  });

  const updateMutation = useMutation({
    mutationFn: async (config: StripeConfiguration) => {
      if (!actor) throw new Error("Actor not available");
      await actor.setStripeConfiguration(config);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["stripe-configured"] });
      toast.success("Stripe-Konfiguration erfolgreich gespeichert");
      setFormData({ secretKey: "", allowedCountries: "DE,AT,CH" });
    },
    onError: (error: any) => {
      toast.error(`Fehler: ${error.message}`);
    },
  });

  const handleSubmit = () => {
    const countries = formData.allowedCountries.split(",").map((c) => c.trim());
    const config: StripeConfiguration = {
      secretKey: formData.secretKey,
      allowedCountries: countries,
    };
    updateMutation.mutate(config);
  };

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle>Stripe-Konfiguration</CardTitle>
              <CardDescription>
                Konfiguriere Stripe für Zahlungen im Shop
              </CardDescription>
            </div>
            {isConfigured ? (
              <div className="flex items-center gap-2 text-primary">
                <CheckCircle className="w-5 h-5" />
                <span className="text-sm font-medium">Konfiguriert</span>
              </div>
            ) : (
              <div className="flex items-center gap-2 text-destructive">
                <XCircle className="w-5 h-5" />
                <span className="text-sm font-medium">Nicht konfiguriert</span>
              </div>
            )}
          </div>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="space-y-2">
            <Label htmlFor="secret-key">Stripe Secret Key</Label>
            <Input
              id="secret-key"
              type="password"
              value={formData.secretKey}
              onChange={(e) =>
                setFormData({ ...formData, secretKey: e.target.value })
              }
              placeholder="sk_test_..."
            />
            <p className="text-xs text-muted-foreground">
              Dein Stripe Secret Key (beginnt mit sk_test_ oder sk_live_)
            </p>
          </div>

          <div className="space-y-2">
            <Label htmlFor="countries">Erlaubte Länder</Label>
            <Input
              id="countries"
              value={formData.allowedCountries}
              onChange={(e) =>
                setFormData({ ...formData, allowedCountries: e.target.value })
              }
              placeholder="DE,AT,CH"
            />
            <p className="text-xs text-muted-foreground">
              Kommagetrennte Liste von Ländercodes (z.B. DE,AT,CH,US,GB)
            </p>
          </div>

          <Button
            onClick={handleSubmit}
            disabled={updateMutation.isPending || !formData.secretKey}
          >
            {updateMutation.isPending ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Speichern...
              </>
            ) : (
              <>
                <Save className="mr-2 h-4 w-4" />
                Konfiguration speichern
              </>
            )}
          </Button>

          <div className="pt-4 border-t">
            <h4 className="font-medium mb-2">Hinweise:</h4>
            <ul className="text-sm text-muted-foreground space-y-1 list-disc list-inside">
              <li>Verwende den Test-Key für Entwicklung (sk_test_...)</li>
              <li>Verwende den Live-Key für Produktion (sk_live_...)</li>
              <li>Der Secret Key wird sicher im Backend gespeichert</li>
              <li>Stelle sicher, dass dein Stripe-Account aktiviert ist</li>
            </ul>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
