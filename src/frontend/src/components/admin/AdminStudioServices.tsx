import type { StudioService, StudioStat } from "@/backend";
import { useFileUpload, useFileUrl } from "@/blob-storage/FileStorage";
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
import { Separator } from "@/components/ui/separator";
import { Textarea } from "@/components/ui/textarea";
import { useActor } from "@/hooks/useActor";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import {
  Award,
  Calendar,
  CheckCircle2,
  Clock,
  Disc,
  Headphones,
  Image as ImageIcon,
  Loader2,
  Mic,
  Music,
  Music2,
  Pencil,
  Plus,
  Save,
  Sliders,
  Star,
  Trash2,
  Upload,
  Users,
  X,
  Zap,
} from "lucide-react";
import { useRef, useState } from "react";
import { toast } from "sonner";

// ─── Stat icon options ────────────────────────────────────────────────────────

const ICON_OPTIONS = [
  { name: "Calendar", label: "Kalender", Icon: Calendar },
  { name: "CheckCircle2", label: "Haken", Icon: CheckCircle2 },
  { name: "Headphones", label: "Kopfhörer", Icon: Headphones },
  { name: "Zap", label: "Blitz", Icon: Zap },
  { name: "Music", label: "Musik", Icon: Music },
  { name: "Music2", label: "Musik 2", Icon: Music2 },
  { name: "Star", label: "Stern", Icon: Star },
  { name: "Award", label: "Award", Icon: Award },
  { name: "Users", label: "Personen", Icon: Users },
  { name: "Clock", label: "Uhr", Icon: Clock },
  { name: "Mic", label: "Mikrofon", Icon: Mic },
  { name: "Disc", label: "Disc", Icon: Disc },
  { name: "Sliders", label: "Regler", Icon: Sliders },
];

// ─── Service form types ───────────────────────────────────────────────────────

type ServiceFormData = {
  title: string;
  description: string;
  price: string;
  imagePath: string;
  mediaSamples: string[];
};

const emptyServiceForm: ServiceFormData = {
  title: "",
  description: "",
  price: "",
  imagePath: "",
  mediaSamples: [],
};

// ─── AdminStudioServices (main export) ───────────────────────────────────────

export default function AdminStudioServices() {
  const { actor } = useActor();
  const queryClient = useQueryClient();
  const { uploadFile, isUploading } = useFileUpload();
  const [editingId, setEditingId] = useState<bigint | null>(null);
  const [showAddForm, setShowAddForm] = useState(false);
  const [selectedImage, setSelectedImage] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const [selectedMediaSamples, setSelectedMediaSamples] = useState<File[]>([]);
  const [formData, setFormData] = useState<ServiceFormData>(emptyServiceForm);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const { data: services } = useQuery({
    queryKey: ["studio-services"],
    queryFn: async () => {
      if (!actor) return [];
      return actor.getStudioServices();
    },
    enabled: !!actor,
  });

  const addMutation = useMutation({
    mutationFn: async (service: StudioService) => {
      if (!actor) throw new Error("Actor not available");
      await actor.addStudioService(service);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["studio-services"] });
      toast.success("Studio Service erfolgreich hinzugefügt");
      setShowAddForm(false);
      resetForm();
    },
    onError: (error: Error) => toast.error(`Fehler: ${error.message}`),
  });

  const updateMutation = useMutation({
    mutationFn: async (service: StudioService) => {
      if (!actor) throw new Error("Actor not available");
      await actor.updateStudioService(service);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["studio-services"] });
      toast.success("Studio Service erfolgreich aktualisiert");
      setEditingId(null);
      resetForm();
    },
    onError: (error: Error) => toast.error(`Fehler: ${error.message}`),
  });

  const deleteMutation = useMutation({
    mutationFn: async (id: bigint) => {
      if (!actor) throw new Error("Actor not available");
      await actor.deleteStudioService(id);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["studio-services"] });
      toast.success("Studio Service erfolgreich gelöscht");
    },
    onError: (error: Error) => toast.error(`Fehler: ${error.message}`),
  });

  const resetForm = () => {
    setFormData(emptyServiceForm);
    setSelectedImage(null);
    setImagePreview(null);
    setSelectedMediaSamples([]);
  };

  const handleEdit = (service: StudioService) => {
    setEditingId(service.id);
    setFormData({
      title: service.title,
      description: service.description,
      price: service.price,
      imagePath: service.imagePath || "",
      mediaSamples: service.mediaSamples || [],
    });
    setSelectedImage(null);
    setImagePreview(null);
    setSelectedMediaSamples([]);
    setShowAddForm(false);
  };

  const handleImageChange = (file: File | null) => {
    setSelectedImage(file);
    if (file) {
      setImagePreview(URL.createObjectURL(file));
    } else {
      setImagePreview(null);
    }
  };

  const handleImageUpload = async (): Promise<string | undefined> => {
    if (!selectedImage) return formData.imagePath || undefined;
    const path = `studio-services/${Date.now()}-${selectedImage.name}`;
    const result = await uploadFile(path, selectedImage);
    return result.path;
  };

  const handleMediaSamplesUpload = async (): Promise<string[]> => {
    if (selectedMediaSamples.length === 0) return formData.mediaSamples;
    const uploadedPaths: string[] = [];
    for (const file of selectedMediaSamples) {
      const path = `studio-samples/${Date.now()}-${file.name}`;
      const result = await uploadFile(path, file);
      uploadedPaths.push(result.path);
    }
    return [...formData.mediaSamples, ...uploadedPaths];
  };

  const handleSubmit = async () => {
    if (!formData.title.trim()) {
      toast.error("Bitte gib einen Titel ein");
      return;
    }
    try {
      const uploadedImagePath = await handleImageUpload();
      const mediaSamples = await handleMediaSamplesUpload();
      const newId = editingId !== null ? editingId : BigInt(Date.now());

      const service: StudioService = {
        id: newId,
        order: BigInt(0),
        title: formData.title,
        description: formData.description,
        price: formData.price,
        imagePath: uploadedImagePath,
        mediaSamples,
      };

      if (editingId !== null) {
        updateMutation.mutate(service);
      } else {
        addMutation.mutate(service);
      }
    } catch (_err) {
      toast.error("Fehler beim Hochladen");
    }
  };

  const isBusy =
    addMutation.isPending || updateMutation.isPending || isUploading;

  const ServiceForm = ({ isNew }: { isNew: boolean }) => (
    <Card className="border-primary/50">
      <CardHeader className="pb-4">
        <div className="flex items-center justify-between">
          <CardTitle className="text-lg">
            {isNew ? "Neuer Studio Service" : "Service bearbeiten"}
          </CardTitle>
          <Button
            variant="ghost"
            size="sm"
            onClick={() => {
              if (isNew) setShowAddForm(false);
              else setEditingId(null);
              resetForm();
            }}
            aria-label="Formular schließen"
          >
            <X className="h-4 w-4" />
          </Button>
        </div>
      </CardHeader>
      <CardContent className="space-y-5">
        {/* Image upload */}
        <div className="space-y-3">
          <Label>Bild (optional)</Label>
          <button
            type="button"
            className="w-full relative border-2 border-dashed border-border rounded-lg overflow-hidden cursor-pointer hover:border-primary/50 transition-colors text-left"
            style={{ minHeight: "140px" }}
            onClick={() => fileInputRef.current?.click()}
            aria-label="Bild auswählen"
          >
            {imagePreview ? (
              <img
                src={imagePreview}
                alt="Vorschau"
                className="w-full h-40 object-cover"
              />
            ) : formData.imagePath ? (
              <ExistingImagePreview path={formData.imagePath} />
            ) : (
              <div className="flex flex-col items-center justify-center h-36 text-muted-foreground">
                <ImageIcon className="w-8 h-8 mb-2 opacity-40" />
                <p className="text-sm">Klicken zum Hochladen</p>
                <p className="text-xs opacity-60 mt-1">JPG, PNG, WebP</p>
              </div>
            )}
            {(imagePreview || formData.imagePath) && (
              <div className="absolute inset-0 bg-background/60 opacity-0 hover:opacity-100 transition-opacity flex items-center justify-center">
                <Upload className="w-6 h-6 text-foreground" />
                <span className="ml-2 text-sm font-medium text-foreground">
                  Bild ändern
                </span>
              </div>
            )}
          </button>
          <input
            ref={fileInputRef}
            type="file"
            accept="image/*"
            className="sr-only"
            onChange={(e) => handleImageChange(e.target.files?.[0] || null)}
          />
          {selectedImage && (
            <div className="flex items-center gap-2 text-xs text-muted-foreground">
              <span className="truncate">✓ {selectedImage.name}</span>
              <Button
                variant="ghost"
                size="sm"
                className="h-5 w-5 p-0"
                onClick={() => handleImageChange(null)}
                aria-label="Bild entfernen"
              >
                <X className="h-3 w-3" />
              </Button>
            </div>
          )}
        </div>

        <div className="grid sm:grid-cols-2 gap-4">
          <div className="space-y-2">
            <Label>Titel *</Label>
            <Input
              value={formData.title}
              onChange={(e) =>
                setFormData({ ...formData, title: e.target.value })
              }
              placeholder="z.B. Recording"
              data-ocid="studio-service-title"
            />
          </div>
          <div className="space-y-2">
            <Label>Preis</Label>
            <Input
              value={formData.price}
              onChange={(e) =>
                setFormData({ ...formData, price: e.target.value })
              }
              placeholder="ab 50 € / Stunde"
            />
          </div>
        </div>

        <div className="space-y-2">
          <Label>Beschreibung</Label>
          <Textarea
            value={formData.description}
            onChange={(e) =>
              setFormData({ ...formData, description: e.target.value })
            }
            placeholder="Beschreibe den Service..."
            rows={4}
          />
        </div>

        {/* Media samples upload */}
        <div className="space-y-2">
          <Label>Demo-Samples hinzufügen (Audio/Video, optional)</Label>
          <Input
            type="file"
            accept="audio/*,video/*"
            multiple
            onChange={(e) =>
              setSelectedMediaSamples(Array.from(e.target.files || []))
            }
          />
          {selectedMediaSamples.length > 0 && (
            <p className="text-xs text-muted-foreground">
              {selectedMediaSamples.length} Datei(en) ausgewählt
            </p>
          )}
          {formData.mediaSamples.length > 0 && (
            <div className="space-y-1">
              <Label className="text-xs">Vorhandene Samples:</Label>
              {formData.mediaSamples.map((sample, idx) => (
                <div
                  key={`sample-${sample.slice(-20)}-${idx}`}
                  className="flex items-center justify-between bg-muted/40 px-2 py-1.5 rounded text-xs"
                >
                  <span className="truncate flex-1">
                    {sample.split("/").pop()}
                  </span>
                  <Button
                    variant="ghost"
                    size="sm"
                    className="h-5 w-5 p-0 ml-2 shrink-0"
                    onClick={() => {
                      const newSamples = [...formData.mediaSamples];
                      newSamples.splice(idx, 1);
                      setFormData({ ...formData, mediaSamples: newSamples });
                    }}
                    aria-label="Sample entfernen"
                  >
                    <X className="h-3 w-3" />
                  </Button>
                </div>
              ))}
            </div>
          )}
        </div>

        <div className="flex gap-2">
          <Button
            onClick={handleSubmit}
            disabled={isBusy}
            data-ocid="studio-service-save"
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
          <Button
            variant="outline"
            onClick={() => {
              if (isNew) setShowAddForm(false);
              else setEditingId(null);
              resetForm();
            }}
          >
            <X className="mr-2 h-4 w-4" />
            Abbrechen
          </Button>
        </div>
      </CardContent>
    </Card>
  );

  return (
    <div className="space-y-8">
      {/* ── Studio Services ─────────────────────────────────────────────── */}
      <div className="space-y-5">
        <div className="flex items-center justify-between">
          <p className="text-muted-foreground text-sm">
            {services?.length || 0} Services gespeichert
          </p>
          <Button
            onClick={() => {
              setShowAddForm(true);
              setEditingId(null);
              resetForm();
            }}
            disabled={showAddForm}
            data-ocid="studio-service-add"
          >
            <Plus className="mr-2 h-4 w-4" />
            Neuer Service
          </Button>
        </div>

        {showAddForm && <ServiceForm isNew />}

        <div className="grid gap-4">
          {services?.map((service) => (
            <div key={Number(service.id)}>
              {editingId === service.id ? (
                <ServiceForm isNew={false} />
              ) : (
                <ServiceRow
                  service={service}
                  onEdit={() => handleEdit(service)}
                  onDelete={() => deleteMutation.mutate(service.id)}
                  isDeleting={deleteMutation.isPending}
                />
              )}
            </div>
          ))}
        </div>

        {!showAddForm && (!services || services.length === 0) && (
          <div
            className="text-center py-16 text-muted-foreground"
            data-ocid="studio-services-empty"
          >
            <ImageIcon className="w-10 h-10 mx-auto mb-3 opacity-30" />
            <p className="text-sm">
              Noch keine Studio Services. Füge deinen ersten Service hinzu.
            </p>
            <p className="text-xs mt-1 opacity-60">
              Empfohlen: Recording, Mixing, Mastering
            </p>
          </div>
        )}
      </div>

      <Separator />

      {/* ── Studio-Statistiken ──────────────────────────────────────────── */}
      <StudioStatsAdmin />
    </div>
  );
}

// ─── Studio Stats Admin Section ───────────────────────────────────────────────

function StudioStatsAdmin() {
  const { actor } = useActor();
  const queryClient = useQueryClient();
  const [showAddForm, setShowAddForm] = useState(false);
  const [editingStatId, setEditingStatId] = useState<string | null>(null);
  const [statLabel, setStatLabel] = useState("");
  const [statIcon, setStatIcon] = useState("Calendar");

  const { data: stats } = useQuery({
    queryKey: ["studio-stats"],
    queryFn: async () => {
      if (!actor) return [];
      return actor.getStudioStats();
    },
    enabled: !!actor,
  });

  const addStatMutation = useMutation({
    mutationFn: async (stat: StudioStat) => {
      if (!actor) throw new Error("No actor");
      return actor.addStudioStat(stat);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["studio-stats"] });
      toast.success("Statistik hinzugefügt");
      resetStatForm();
    },
    onError: (err: Error) => toast.error(`Fehler: ${err.message}`),
  });

  const updateStatMutation = useMutation({
    mutationFn: async (stat: StudioStat) => {
      if (!actor) throw new Error("No actor");
      return actor.updateStudioStat(stat);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["studio-stats"] });
      toast.success("Statistik aktualisiert");
      resetStatForm();
    },
    onError: (err: Error) => toast.error(`Fehler: ${err.message}`),
  });

  const deleteStatMutation = useMutation({
    mutationFn: async (id: string) => {
      if (!actor) throw new Error("No actor");
      return actor.deleteStudioStat(id);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["studio-stats"] });
      toast.success("Statistik gelöscht");
    },
    onError: (err: Error) => toast.error(`Fehler: ${err.message}`),
  });

  const resetStatForm = () => {
    setShowAddForm(false);
    setEditingStatId(null);
    setStatLabel("");
    setStatIcon("Calendar");
  };

  const handleEditStat = (stat: StudioStat) => {
    setEditingStatId(stat.id);
    setStatLabel(stat.statLabel);
    setStatIcon(stat.icon);
    setShowAddForm(false);
  };

  const handleSaveStat = () => {
    if (!statLabel.trim()) {
      toast.error("Bitte gib einen Text ein");
      return;
    }
    const existingCount = stats?.length ?? 0;
    const stat: StudioStat = {
      id: editingStatId ?? `stat-${Date.now()}`,
      icon: statIcon,
      statLabel: statLabel.trim(),
      order:
        editingStatId != null
          ? (stats?.find((s) => s.id === editingStatId)?.order ?? 0n)
          : BigInt(existingCount),
    };
    if (editingStatId != null) {
      updateStatMutation.mutate(stat);
    } else {
      addStatMutation.mutate(stat);
    }
  };

  const isBusy = addStatMutation.isPending || updateStatMutation.isPending;

  const SelectedIcon =
    ICON_OPTIONS.find((o) => o.name === statIcon)?.Icon ?? Zap;

  const StatForm = () => (
    <Card className="border-primary/50">
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <CardTitle className="text-base">
            {editingStatId ? "Statistik bearbeiten" : "Neue Statistik"}
          </CardTitle>
          <Button
            variant="ghost"
            size="sm"
            onClick={resetStatForm}
            aria-label="Formular schließen"
          >
            <X className="h-4 w-4" />
          </Button>
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Icon selector */}
        <div className="space-y-2">
          <Label>Icon</Label>
          <div className="grid grid-cols-4 sm:grid-cols-7 gap-2">
            {ICON_OPTIONS.map(({ name, label, Icon }) => (
              <button
                key={name}
                type="button"
                onClick={() => setStatIcon(name)}
                title={label}
                aria-label={label}
                data-ocid={`stat-icon-${name}`}
                className={[
                  "flex flex-col items-center gap-1 p-2 rounded-lg border text-xs transition-colors",
                  statIcon === name
                    ? "border-primary bg-primary/10 text-primary"
                    : "border-border hover:border-primary/40 text-muted-foreground hover:text-foreground",
                ].join(" ")}
              >
                <Icon className="w-4 h-4" />
                <span className="text-[10px] leading-none hidden sm:block">
                  {label}
                </span>
              </button>
            ))}
          </div>
          {/* Icon preview */}
          <div className="flex items-center gap-2 text-sm text-muted-foreground">
            <div className="p-1.5 rounded bg-primary/10 text-primary">
              <SelectedIcon className="w-4 h-4" />
            </div>
            <span>
              Ausgewählt: {ICON_OPTIONS.find((o) => o.name === statIcon)?.label}
            </span>
          </div>
        </div>

        {/* Label */}
        <div className="space-y-2">
          <Label htmlFor="stat-label">Text / Bezeichnung *</Label>
          <Input
            id="stat-label"
            value={statLabel}
            onChange={(e) => setStatLabel(e.target.value)}
            placeholder="z.B. 10+ Jahre Erfahrung"
            data-ocid="studio-stat-label-input"
          />
          <p className="text-xs text-muted-foreground">
            Tipp: Wert und Einheit in einem Text, z.B. "200+ Projekte"
          </p>
        </div>

        <div className="flex gap-2">
          <Button
            onClick={handleSaveStat}
            disabled={isBusy}
            data-ocid="studio-stat-save"
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
          <Button variant="outline" onClick={resetStatForm}>
            <X className="mr-2 h-4 w-4" />
            Abbrechen
          </Button>
        </div>
      </CardContent>
    </Card>
  );

  return (
    <div className="space-y-4">
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="text-lg">Studio-Statistiken</CardTitle>
              <CardDescription className="mt-1">
                Die kleinen Info-Kacheln im Studio-Hero (z.B. "10+ Jahre
                Erfahrung"). Bis zu 4 Statistiken werden empfohlen.
              </CardDescription>
            </div>
            <Button
              size="sm"
              onClick={() => {
                setShowAddForm(true);
                setEditingStatId(null);
                setStatLabel("");
                setStatIcon("Calendar");
              }}
              disabled={showAddForm}
              data-ocid="studio-stat-add"
            >
              <Plus className="mr-2 h-4 w-4" />
              Neue Statistik
            </Button>
          </div>
        </CardHeader>
        <CardContent className="space-y-3">
          {showAddForm && !editingStatId && <StatForm />}

          {stats && stats.length > 0 ? (
            <div className="space-y-2">
              {[...stats]
                .sort((a, b) => Number(a.order) - Number(b.order))
                .map((stat) => {
                  const IconComp =
                    ICON_OPTIONS.find((o) => o.name === stat.icon)?.Icon ?? Zap;
                  return editingStatId === stat.id ? (
                    <StatForm key={stat.id} />
                  ) : (
                    <div
                      key={stat.id}
                      className="flex items-center gap-3 p-3 rounded-lg border border-border bg-muted/20 hover:bg-muted/40 transition-colors"
                    >
                      <div className="p-2 rounded-md bg-primary/10 text-primary shrink-0">
                        <IconComp className="w-4 h-4" />
                      </div>
                      <span className="flex-1 text-sm font-medium text-foreground">
                        {stat.statLabel}
                      </span>
                      <div className="flex items-center gap-1 shrink-0">
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => handleEditStat(stat)}
                          aria-label={`Statistik ${stat.statLabel} bearbeiten`}
                          data-ocid="studio-stat-edit"
                        >
                          <Pencil className="h-4 w-4" />
                        </Button>
                        <AlertDialog>
                          <AlertDialogTrigger asChild>
                            <Button
                              variant="ghost"
                              size="sm"
                              disabled={deleteStatMutation.isPending}
                              aria-label={`Statistik ${stat.statLabel} löschen`}
                              data-ocid="studio-stat-delete"
                            >
                              <Trash2 className="h-4 w-4 text-destructive" />
                            </Button>
                          </AlertDialogTrigger>
                          <AlertDialogContent>
                            <AlertDialogHeader>
                              <AlertDialogTitle>
                                Statistik löschen?
                              </AlertDialogTitle>
                              <AlertDialogDescription>
                                Bist du sicher, dass du{" "}
                                <strong>„{stat.statLabel}"</strong> löschen
                                möchtest?
                              </AlertDialogDescription>
                            </AlertDialogHeader>
                            <AlertDialogFooter>
                              <AlertDialogCancel>Abbrechen</AlertDialogCancel>
                              <AlertDialogAction
                                onClick={() =>
                                  deleteStatMutation.mutate(stat.id)
                                }
                                className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                              >
                                Löschen
                              </AlertDialogAction>
                            </AlertDialogFooter>
                          </AlertDialogContent>
                        </AlertDialog>
                      </div>
                    </div>
                  );
                })}
            </div>
          ) : (
            !showAddForm && (
              <div
                className="text-center py-8 text-muted-foreground"
                data-ocid="studio-stats-empty"
              >
                <Zap className="w-8 h-8 mx-auto mb-2 opacity-30" />
                <p className="text-sm">
                  Keine Statistiken. Die Standard-Werte werden angezeigt.
                </p>
              </div>
            )
          )}
        </CardContent>
      </Card>
    </div>
  );
}

// ─── Helpers ──────────────────────────────────────────────────────────────────

function ExistingImagePreview({ path }: { path: string }) {
  const { data: imageUrl } = useFileUrl(path);
  if (!imageUrl)
    return (
      <div className="flex items-center justify-center h-36 text-muted-foreground">
        <Loader2 className="w-5 h-5 animate-spin" />
      </div>
    );
  return (
    <img
      src={imageUrl}
      alt="Aktuelles Bild"
      className="w-full h-40 object-cover"
    />
  );
}

function ServiceRow({
  service,
  onEdit,
  onDelete,
  isDeleting,
}: {
  service: StudioService;
  onEdit: () => void;
  onDelete: () => void;
  isDeleting: boolean;
}) {
  const { data: imageUrl } = useFileUrl(service.imagePath || "");

  return (
    <Card className="overflow-hidden">
      <div className="flex items-start gap-4 p-4">
        {service.imagePath && imageUrl ? (
          <img
            src={imageUrl}
            alt={service.title}
            className="w-20 h-16 object-cover rounded-md shrink-0"
          />
        ) : (
          <div className="w-20 h-16 bg-muted rounded-md shrink-0 flex items-center justify-center">
            <ImageIcon className="w-6 h-6 text-muted-foreground opacity-40" />
          </div>
        )}
        <div className="flex-1 min-w-0">
          <div className="flex items-start justify-between gap-2">
            <div className="min-w-0">
              <h3 className="font-semibold text-foreground truncate">
                {service.title}
              </h3>
              {service.price && (
                <p className="text-sm text-primary mt-0.5">{service.price}</p>
              )}
              {service.description && (
                <p className="text-sm text-muted-foreground mt-1 line-clamp-2">
                  {service.description}
                </p>
              )}
              {service.mediaSamples.length > 0 && (
                <p className="text-xs text-muted-foreground mt-1">
                  {service.mediaSamples.length} Demo-Sample(s)
                </p>
              )}
            </div>
            <div className="flex items-center gap-1 shrink-0">
              <Button
                variant="ghost"
                size="sm"
                onClick={onEdit}
                data-ocid="studio-service-edit"
                aria-label={`Service ${service.title} bearbeiten`}
              >
                <Pencil className="h-4 w-4" />
              </Button>
              <AlertDialog>
                <AlertDialogTrigger asChild>
                  <Button
                    variant="ghost"
                    size="sm"
                    disabled={isDeleting}
                    data-ocid="studio-service-delete"
                    aria-label={`Service ${service.title} löschen`}
                  >
                    <Trash2 className="h-4 w-4 text-destructive" />
                  </Button>
                </AlertDialogTrigger>
                <AlertDialogContent>
                  <AlertDialogHeader>
                    <AlertDialogTitle>Studio Service löschen?</AlertDialogTitle>
                    <AlertDialogDescription>
                      Bist du sicher, dass du <strong>„{service.title}"</strong>{" "}
                      löschen möchtest? Diese Aktion kann nicht rückgängig
                      gemacht werden.
                    </AlertDialogDescription>
                  </AlertDialogHeader>
                  <AlertDialogFooter>
                    <AlertDialogCancel>Abbrechen</AlertDialogCancel>
                    <AlertDialogAction
                      onClick={onDelete}
                      className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                    >
                      Löschen
                    </AlertDialogAction>
                  </AlertDialogFooter>
                </AlertDialogContent>
              </AlertDialog>
            </div>
          </div>
        </div>
      </div>
    </Card>
  );
}
