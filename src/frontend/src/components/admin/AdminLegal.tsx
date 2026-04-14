import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { useActor } from "@/hooks/useActor";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { Loader2, Save } from "lucide-react";
import { useEffect, useState } from "react";
import { toast } from "sonner";

export default function AdminLegal() {
  const { actor } = useActor();
  const queryClient = useQueryClient();

  const { data: imprintData, isLoading: imprintLoading } = useQuery({
    queryKey: ["imprint"],
    queryFn: async () => {
      if (!actor) throw new Error("Actor not available");
      return actor.getImprint();
    },
    enabled: !!actor,
  });

  const { data: privacyData, isLoading: privacyLoading } = useQuery({
    queryKey: ["privacy-policy"],
    queryFn: async () => {
      if (!actor) throw new Error("Actor not available");
      return actor.getPrivacyPolicy();
    },
    enabled: !!actor,
  });

  const { data: termsData, isLoading: termsLoading } = useQuery({
    queryKey: ["terms-of-service"],
    queryFn: async () => {
      if (!actor) throw new Error("Actor not available");
      return actor.getTermsOfService();
    },
    enabled: !!actor,
  });

  const [imprintContent, setImprintContent] = useState("");
  const [privacyContent, setPrivacyContent] = useState("");
  const [termsContent, setTermsContent] = useState("");

  useEffect(() => {
    if (imprintData) setImprintContent(imprintData.content);
  }, [imprintData]);

  useEffect(() => {
    if (privacyData) setPrivacyContent(privacyData.content);
  }, [privacyData]);

  useEffect(() => {
    if (termsData) setTermsContent(termsData.content);
  }, [termsData]);

  const updateImprintMutation = useMutation({
    mutationFn: async (content: string) => {
      if (!actor) throw new Error("Actor not available");
      await actor.updateImprint(content);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["imprint"] });
      toast.success("Impressum erfolgreich aktualisiert");
    },
    onError: (error: any) => {
      toast.error(`Fehler beim Aktualisieren: ${error.message}`);
    },
  });

  const updatePrivacyMutation = useMutation({
    mutationFn: async (content: string) => {
      if (!actor) throw new Error("Actor not available");
      await actor.updatePrivacyPolicy(content);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["privacy-policy"] });
      toast.success("Datenschutzerklärung erfolgreich aktualisiert");
    },
    onError: (error: any) => {
      toast.error(`Fehler beim Aktualisieren: ${error.message}`);
    },
  });

  const updateTermsMutation = useMutation({
    mutationFn: async (content: string) => {
      if (!actor) throw new Error("Actor not available");
      await actor.updateTermsOfService(content);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["terms-of-service"] });
      toast.success("Nutzungsbedingungen erfolgreich aktualisiert");
    },
    onError: (error: any) => {
      toast.error(`Fehler beim Aktualisieren: ${error.message}`);
    },
  });

  const formatDate = (timestamp: bigint) => {
    const date = new Date(Number(timestamp) / 1000000);
    return date.toLocaleDateString("de-DE", {
      year: "numeric",
      month: "long",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  if (imprintLoading || privacyLoading || termsLoading) {
    return (
      <div className="flex items-center justify-center py-12">
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>Impressum</CardTitle>
          <CardDescription>
            Bearbeite das Impressum der Website
            {imprintData && (
              <span className="block mt-1 text-xs">
                Zuletzt aktualisiert: {formatDate(imprintData.lastUpdated)}
              </span>
            )}
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="imprint-content">Inhalt</Label>
            <Textarea
              id="imprint-content"
              value={imprintContent}
              onChange={(e) => setImprintContent(e.target.value)}
              placeholder="Impressum-Inhalt..."
              rows={12}
              className="font-mono text-sm"
            />
          </div>
          <Button
            onClick={() => updateImprintMutation.mutate(imprintContent)}
            disabled={updateImprintMutation.isPending}
          >
            {updateImprintMutation.isPending ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Speichern...
              </>
            ) : (
              <>
                <Save className="mr-2 h-4 w-4" />
                Speichern
              </>
            )}
          </Button>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Datenschutzerklärung</CardTitle>
          <CardDescription>
            Bearbeite die Datenschutzerklärung der Website
            {privacyData && (
              <span className="block mt-1 text-xs">
                Zuletzt aktualisiert: {formatDate(privacyData.lastUpdated)}
              </span>
            )}
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="privacy-content">Inhalt</Label>
            <Textarea
              id="privacy-content"
              value={privacyContent}
              onChange={(e) => setPrivacyContent(e.target.value)}
              placeholder="Datenschutzerklärung-Inhalt..."
              rows={12}
              className="font-mono text-sm"
            />
          </div>
          <Button
            onClick={() => updatePrivacyMutation.mutate(privacyContent)}
            disabled={updatePrivacyMutation.isPending}
          >
            {updatePrivacyMutation.isPending ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Speichern...
              </>
            ) : (
              <>
                <Save className="mr-2 h-4 w-4" />
                Speichern
              </>
            )}
          </Button>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Nutzungsbedingungen</CardTitle>
          <CardDescription>
            Bearbeite die Nutzungsbedingungen der Website
            {termsData && (
              <span className="block mt-1 text-xs">
                Zuletzt aktualisiert: {formatDate(termsData.lastUpdated)}
              </span>
            )}
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="terms-content">Inhalt</Label>
            <Textarea
              id="terms-content"
              value={termsContent}
              onChange={(e) => setTermsContent(e.target.value)}
              placeholder="Nutzungsbedingungen-Inhalt..."
              rows={12}
              className="font-mono text-sm"
            />
          </div>
          <Button
            onClick={() => updateTermsMutation.mutate(termsContent)}
            disabled={updateTermsMutation.isPending}
          >
            {updateTermsMutation.isPending ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Speichern...
              </>
            ) : (
              <>
                <Save className="mr-2 h-4 w-4" />
                Speichern
              </>
            )}
          </Button>
        </CardContent>
      </Card>
    </div>
  );
}
