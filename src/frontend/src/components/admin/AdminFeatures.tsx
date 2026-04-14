import type { FeatureCard } from "@/backend";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
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
import {
  Award,
  Guitar,
  Heart,
  Loader2,
  Mic,
  Music,
  Pencil,
  Plus,
  Save,
  Star,
  Target,
  Trash2,
  Users,
  X,
  Zap,
} from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";

type IconEntry = {
  value: string;
  label: string;
  icon: React.ReactNode;
};

const iconOptions: IconEntry[] = [
  { value: "guitar", label: "Gitarre", icon: <Guitar className="w-5 h-5" /> },
  {
    value: "award",
    label: "Auszeichnung",
    icon: <Award className="w-5 h-5" />,
  },
  { value: "heart", label: "Herz", icon: <Heart className="w-5 h-5" /> },
  { value: "target", label: "Ziel", icon: <Target className="w-5 h-5" /> },
  { value: "microphone", label: "Mikrofon", icon: <Mic className="w-5 h-5" /> },
  {
    value: "musicnote",
    label: "Musiknote",
    icon: <Music className="w-5 h-5" />,
  },
  { value: "star", label: "Stern", icon: <Star className="w-5 h-5" /> },
  { value: "users", label: "Gruppe", icon: <Users className="w-5 h-5" /> },
  { value: "zap", label: "Energie", icon: <Zap className="w-5 h-5" /> },
];

const iconMap: Record<string, React.ReactNode> = {
  guitar: <Guitar className="w-5 h-5" />,
  award: <Award className="w-5 h-5" />,
  heart: <Heart className="w-5 h-5" />,
  target: <Target className="w-5 h-5" />,
  microphone: <Mic className="w-5 h-5" />,
  musicnote: <Music className="w-5 h-5" />,
  star: <Star className="w-5 h-5" />,
  users: <Users className="w-5 h-5" />,
  zap: <Zap className="w-5 h-5" />,
};

type CardFormState = {
  icon: string;
  title: string;
  subtitle: string;
  color: string;
};

const defaultFormData: CardFormState = {
  icon: "guitar",
  title: "",
  subtitle: "",
  color: "#0D9488",
};

export default function AdminFeatures() {
  const { actor } = useActor();
  const queryClient = useQueryClient();

  const [editingCard, setEditingCard] = useState<FeatureCard | null>(null);
  const [isCreating, setIsCreating] = useState(false);
  const [formData, setFormData] = useState<CardFormState>(defaultFormData);

  const { data: featureCards } = useQuery({
    queryKey: ["feature-cards"],
    queryFn: async () => {
      if (!actor) return [];
      return actor.getFeatureCards();
    },
    enabled: !!actor,
  });

  const addCardMutation = useMutation({
    mutationFn: async (card: FeatureCard) => {
      if (!actor) throw new Error("Actor not available");
      await actor.addFeatureCard(card);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["feature-cards"] });
      toast.success("Feature-Karte erfolgreich hinzugefügt");
      resetForm();
    },
    onError: (error: Error) => toast.error(`Fehler: ${error.message}`),
  });

  const updateCardMutation = useMutation({
    mutationFn: async (card: FeatureCard) => {
      if (!actor) throw new Error("Actor not available");
      await actor.updateFeatureCard(card);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["feature-cards"] });
      toast.success("Feature-Karte erfolgreich aktualisiert");
      resetForm();
    },
    onError: (error: Error) => toast.error(`Fehler: ${error.message}`),
  });

  const deleteCardMutation = useMutation({
    mutationFn: async (id: bigint) => {
      if (!actor) throw new Error("Actor not available");
      await actor.deleteFeatureCard(id);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["feature-cards"] });
      toast.success("Feature-Karte erfolgreich gelöscht");
    },
    onError: (error: Error) => toast.error(`Fehler: ${error.message}`),
  });

  const resetForm = () => {
    setFormData(defaultFormData);
    setEditingCard(null);
    setIsCreating(false);
  };

  const handleEdit = (card: FeatureCard) => {
    setEditingCard(card);
    setFormData({
      icon: card.icon,
      title: card.title,
      subtitle: card.subtitle,
      color: card.color,
    });
    setIsCreating(false);
  };

  const handleSubmit = async () => {
    if (!formData.title || !formData.subtitle) {
      toast.error("Bitte Titel und Untertitel ausfüllen");
      return;
    }
    const cardData: FeatureCard = {
      id: editingCard ? editingCard.id : BigInt(Date.now()),
      order: editingCard
        ? editingCard.order
        : BigInt(featureCards?.length ?? 0),
      icon: formData.icon,
      title: formData.title,
      subtitle: formData.subtitle,
      color: formData.color,
    };
    if (editingCard) {
      updateCardMutation.mutate(cardData);
    } else {
      addCardMutation.mutate(cardData);
    }
  };

  const isBusy = addCardMutation.isPending || updateCardMutation.isPending;

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle>Feature-Karten</CardTitle>
              <CardDescription>
                Icons und Texte für den Über-mich-Bereich
              </CardDescription>
            </div>
            <Button
              onClick={() => {
                setIsCreating(true);
                setEditingCard(null);
                setFormData(defaultFormData);
              }}
              disabled={isCreating || !!editingCard}
              data-ocid="feature-card-add"
            >
              <Plus className="mr-2 h-4 w-4" />
              Neue Karte
            </Button>
          </div>
        </CardHeader>
        <CardContent className="space-y-5">
          {/* Create/Edit Form */}
          {(isCreating || editingCard) && (
            <Card className="border-primary/50">
              <CardHeader className="pb-3">
                <div className="flex items-center justify-between">
                  <CardTitle className="text-base">
                    {editingCard ? "Karte bearbeiten" : "Neue Karte"}
                  </CardTitle>
                  <Button variant="ghost" size="sm" onClick={resetForm}>
                    <X className="h-4 w-4" />
                  </Button>
                </div>
              </CardHeader>
              <CardContent className="space-y-5">
                {/* Icon Grid */}
                <div className="space-y-2">
                  <Label>Icon auswählen</Label>
                  <div className="grid grid-cols-5 sm:grid-cols-9 gap-2">
                    {iconOptions.map((opt) => (
                      <button
                        key={opt.value}
                        type="button"
                        title={opt.label}
                        onClick={() =>
                          setFormData({ ...formData, icon: opt.value })
                        }
                        className={`flex flex-col items-center justify-center p-2 rounded-lg border transition-all aspect-square ${
                          formData.icon === opt.value
                            ? "border-primary bg-primary/10 text-primary"
                            : "border-border hover:border-border/80 hover:bg-muted text-muted-foreground"
                        }`}
                      >
                        {opt.icon}
                        <span className="text-[10px] mt-1 hidden sm:block">
                          {opt.label}
                        </span>
                      </button>
                    ))}
                  </div>
                </div>

                <div className="grid sm:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label>Titel *</Label>
                    <Input
                      value={formData.title}
                      onChange={(e) =>
                        setFormData({ ...formData, title: e.target.value })
                      }
                      placeholder="z.B. 10+ Jahre"
                      data-ocid="feature-card-title"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label>Untertitel *</Label>
                    <Input
                      value={formData.subtitle}
                      onChange={(e) =>
                        setFormData({ ...formData, subtitle: e.target.value })
                      }
                      placeholder="z.B. Erfahrung"
                      data-ocid="feature-card-subtitle"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label>Icon-Farbe</Label>
                    <div className="flex gap-2">
                      <input
                        type="color"
                        value={formData.color}
                        onChange={(e) =>
                          setFormData({
                            ...formData,
                            color: e.target.value,
                          })
                        }
                        className="w-10 h-10 rounded-md border border-input cursor-pointer bg-transparent p-0.5 shrink-0"
                        aria-label="Icon-Farbe"
                      />
                      <Input
                        value={formData.color}
                        onChange={(e) =>
                          setFormData({
                            ...formData,
                            color: e.target.value,
                          })
                        }
                        placeholder="#0D9488"
                        className="font-mono text-sm"
                      />
                    </div>
                  </div>
                </div>

                {/* Live preview */}
                {(formData.title || formData.subtitle) && (
                  <div className="pt-2">
                    <Label className="text-xs text-muted-foreground mb-2 block">
                      Live-Vorschau
                    </Label>
                    <div className="inline-flex items-center gap-3 px-4 py-3 rounded-xl border border-border/40 bg-muted/20">
                      <div style={{ color: formData.color }}>
                        {iconMap[formData.icon] ?? (
                          <Guitar className="w-5 h-5" />
                        )}
                      </div>
                      <div>
                        <div className="font-bold text-sm text-foreground">
                          {formData.title || "Titel"}
                        </div>
                        <div className="text-xs text-muted-foreground">
                          {formData.subtitle || "Untertitel"}
                        </div>
                      </div>
                    </div>
                  </div>
                )}

                <div className="flex gap-2">
                  <Button
                    onClick={handleSubmit}
                    disabled={isBusy}
                    data-ocid="feature-card-save"
                  >
                    {isBusy ? (
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
                  <Button variant="outline" onClick={resetForm}>
                    Abbrechen
                  </Button>
                </div>
              </CardContent>
            </Card>
          )}

          {/* Cards Grid */}
          {featureCards && featureCards.length > 0 ? (
            <div className="grid sm:grid-cols-2 gap-3">
              {featureCards.map((card) => (
                <div
                  key={Number(card.id)}
                  className="flex items-start gap-3 p-3 rounded-xl border border-border/40 bg-muted/10"
                >
                  <div
                    className="shrink-0 mt-0.5"
                    style={{ color: card.color }}
                  >
                    {iconMap[card.icon] ?? <Guitar className="w-5 h-5" />}
                  </div>
                  <div className="flex-1 min-w-0">
                    <h4 className="font-bold text-sm text-foreground">
                      {card.title}
                    </h4>
                    <p className="text-xs text-muted-foreground">
                      {card.subtitle}
                    </p>
                  </div>
                  <div className="flex gap-1 shrink-0">
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => handleEdit(card)}
                      data-ocid="feature-card-edit"
                      aria-label={`Karte ${card.title} bearbeiten`}
                    >
                      <Pencil className="h-3.5 w-3.5" />
                    </Button>
                    <AlertDialog>
                      <AlertDialogTrigger asChild>
                        <Button
                          variant="ghost"
                          size="sm"
                          disabled={deleteCardMutation.isPending}
                          data-ocid="feature-card-delete"
                          aria-label={`Karte ${card.title} löschen`}
                        >
                          <Trash2 className="h-3.5 w-3.5 text-destructive" />
                        </Button>
                      </AlertDialogTrigger>
                      <AlertDialogContent>
                        <AlertDialogHeader>
                          <AlertDialogTitle>
                            Feature-Karte löschen?
                          </AlertDialogTitle>
                          <AlertDialogDescription>
                            Bist du sicher, dass du die Karte{" "}
                            <strong>„{card.title}"</strong> löschen möchtest?
                            Diese Aktion kann nicht rückgängig gemacht werden.
                          </AlertDialogDescription>
                        </AlertDialogHeader>
                        <AlertDialogFooter>
                          <AlertDialogCancel>Abbrechen</AlertDialogCancel>
                          <AlertDialogAction
                            onClick={() => deleteCardMutation.mutate(card.id)}
                            className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                          >
                            Löschen
                          </AlertDialogAction>
                        </AlertDialogFooter>
                      </AlertDialogContent>
                    </AlertDialog>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div
              className="text-center py-12 text-muted-foreground"
              data-ocid="feature-cards-empty"
            >
              <Guitar className="w-10 h-10 mx-auto mb-3 opacity-30" />
              <p className="text-sm">
                Noch keine Feature-Karten. Erstelle deine erste Karte!
              </p>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
