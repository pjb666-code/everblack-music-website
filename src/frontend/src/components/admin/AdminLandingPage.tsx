import type { LandingPageConfig } from "@/backend";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useActor } from "@/hooks/useActor";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import {
  CheckCircle2,
  LayoutDashboard,
  Loader2,
  Music,
  Save,
  Sparkles,
  Video,
} from "lucide-react";
import { useEffect, useState } from "react";
import { toast } from "sonner";

type ContentOption = {
  value: string;
  label: string;
  description: string;
  icon: React.ReactNode;
};

const contentOptions: ContentOption[] = [
  {
    value: "none",
    label: "Nur Basics",
    description:
      "Hero-Bereich + Kontaktinformationen. Sauber und minimalistisch.",
    icon: <LayoutDashboard className="w-5 h-5" />,
  },
  {
    value: "video",
    label: "Neuestes Video",
    description: "Zeige ein Featured Video direkt auf der Startseite an.",
    icon: <Video className="w-5 h-5" />,
  },
  {
    value: "service",
    label: "Featured Studio Service",
    description:
      "Hebe einen bestimmten Studio Service auf der Startseite hervor.",
    icon: <Sparkles className="w-5 h-5" />,
  },
  {
    value: "minimal",
    label: "Minimales Layout",
    description: "Nur Logo, Headline und Call-to-Action. Maximaler Fokus.",
    icon: <Music className="w-5 h-5" />,
  },
];

export default function AdminLandingPage() {
  const { actor } = useActor();
  const queryClient = useQueryClient();

  const { data: config, isLoading } = useQuery({
    queryKey: ["landing-page-config"],
    queryFn: async () => {
      if (!actor) return null;
      return actor.getLandingPageConfig();
    },
    enabled: !!actor,
  });

  const { data: mediaItems } = useQuery({
    queryKey: ["media-items"],
    queryFn: async () => {
      if (!actor) return [];
      return actor.getMediaItems();
    },
    enabled: !!actor,
  });

  const { data: studioServices } = useQuery({
    queryKey: ["studio-services"],
    queryFn: async () => {
      if (!actor) return [];
      return actor.getStudioServices();
    },
    enabled: !!actor,
  });

  const [featuredType, setFeaturedType] = useState("none");
  const [featuredId, setFeaturedId] = useState<number>(0);

  useEffect(() => {
    if (config) {
      setFeaturedType(config.featuredContentType || "none");
      setFeaturedId(
        config.featuredContentId ? Number(config.featuredContentId) : 0,
      );
    }
  }, [config]);

  const updateMutation = useMutation({
    mutationFn: async (newConfig: LandingPageConfig) => {
      if (!actor) throw new Error("Actor not available");
      await actor.updateLandingPageConfig(newConfig);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["landing-page-config"] });
      toast.success("Landing Page Konfiguration gespeichert");
    },
    onError: (error: Error) => {
      toast.error(`Fehler: ${error.message}`);
    },
  });

  const handleSubmit = () => {
    const newConfig: LandingPageConfig = {
      featuredContentType: featuredType,
      featuredContentId: featuredId > 0 ? BigInt(featuredId) : undefined,
      showFeaturedContent: featuredType !== "none" && featuredType !== "",
    };
    updateMutation.mutate(newConfig);
  };

  const videoItems =
    mediaItems?.filter(
      (item) =>
        item.mediaType.includes("video") || item.mediaType === "youtube",
    ) || [];

  if (isLoading) {
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
          <CardTitle>Featured Content</CardTitle>
          <CardDescription>
            Wähle, was auf der Landing Page zusätzlich zum Hero-Bereich
            angezeigt wird
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-5">
          {/* Visual radio buttons */}
          <div className="grid sm:grid-cols-2 gap-3">
            {contentOptions.map((opt) => (
              <button
                key={opt.value}
                type="button"
                onClick={() => setFeaturedType(opt.value)}
                className={`flex items-start gap-3 p-4 rounded-xl border text-left transition-all ${
                  featuredType === opt.value
                    ? "border-primary bg-primary/5 ring-1 ring-primary"
                    : "border-border hover:border-border/80 hover:bg-muted/30"
                }`}
                data-ocid={`landing-type-${opt.value}`}
              >
                <div
                  className={`mt-0.5 shrink-0 ${featuredType === opt.value ? "text-primary" : "text-muted-foreground"}`}
                >
                  {opt.icon}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2">
                    <span className="font-semibold text-sm text-foreground">
                      {opt.label}
                    </span>
                    {featuredType === opt.value && (
                      <CheckCircle2 className="w-4 h-4 text-primary" />
                    )}
                  </div>
                  <p className="text-xs text-muted-foreground mt-1 leading-relaxed">
                    {opt.description}
                  </p>
                </div>
              </button>
            ))}
          </div>

          {/* Video selector */}
          {featuredType === "video" && (
            <div className="space-y-2 p-4 bg-muted/30 rounded-xl border border-border/50">
              <Label className="text-sm font-semibold">Video auswählen</Label>
              {videoItems.length === 0 ? (
                <p className="text-sm text-muted-foreground">
                  Keine Videos vorhanden. Lade zuerst Videos in der{" "}
                  <strong>Medien</strong>-Sektion hoch.
                </p>
              ) : (
                <Select
                  value={featuredId.toString()}
                  onValueChange={(v) => setFeaturedId(Number.parseInt(v))}
                >
                  <SelectTrigger data-ocid="landing-video-select">
                    <SelectValue placeholder="Video auswählen..." />
                  </SelectTrigger>
                  <SelectContent>
                    {videoItems.map((item) => (
                      <SelectItem
                        key={Number(item.id)}
                        value={item.id.toString()}
                      >
                        {item.title}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              )}
            </div>
          )}

          {/* Service selector */}
          {featuredType === "service" && (
            <div className="space-y-2 p-4 bg-muted/30 rounded-xl border border-border/50">
              <Label className="text-sm font-semibold">
                Studio Service auswählen
              </Label>
              {!studioServices || studioServices.length === 0 ? (
                <p className="text-sm text-muted-foreground">
                  Keine Studio Services vorhanden. Füge zuerst Services in der{" "}
                  <strong>Studio</strong>-Sektion hinzu.
                </p>
              ) : (
                <Select
                  value={featuredId.toString()}
                  onValueChange={(v) => setFeaturedId(Number.parseInt(v))}
                >
                  <SelectTrigger data-ocid="landing-service-select">
                    <SelectValue placeholder="Service auswählen..." />
                  </SelectTrigger>
                  <SelectContent>
                    {studioServices.map((service) => (
                      <SelectItem
                        key={Number(service.id)}
                        value={service.id.toString()}
                      >
                        {service.title}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              )}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Save Button */}
      <div className="flex justify-end">
        <Button
          onClick={handleSubmit}
          disabled={updateMutation.isPending}
          data-ocid="landing-save"
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
      </div>
    </div>
  );
}
