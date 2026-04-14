import type { TeachingModel } from "@/backend";
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
import { Badge } from "@/components/ui/badge";
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
import { Textarea } from "@/components/ui/textarea";
import { useActor } from "@/hooks/useActor";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import {
  ChevronDown,
  ChevronUp,
  Image as ImageIcon,
  Loader2,
  Pencil,
  Plus,
  Save,
  Trash2,
  Upload,
  X,
} from "lucide-react";
import { useRef, useState } from "react";
import { toast } from "sonner";

type FormData = {
  title: string;
  subtitle: string;
  description: string;
  features: string;
  price: string;
  imagePath: string;
};

const emptyForm: FormData = {
  title: "",
  subtitle: "",
  description: "",
  features: "",
  price: "",
  imagePath: "",
};

export default function AdminTeachingModels() {
  const { actor } = useActor();
  const queryClient = useQueryClient();
  const { uploadFile, isUploading } = useFileUpload();
  const [editingId, setEditingId] = useState<bigint | null>(null);
  const [showAddForm, setShowAddForm] = useState(false);
  const [selectedImage, setSelectedImage] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const { data: models } = useQuery({
    queryKey: ["teaching-models"],
    queryFn: async () => {
      if (!actor) return [];
      return actor.getTeachingModels();
    },
    enabled: !!actor,
  });

  const [formData, setFormData] = useState<FormData>(emptyForm);

  const addMutation = useMutation({
    mutationFn: async (model: TeachingModel) => {
      if (!actor) throw new Error("Actor not available");
      await actor.addTeachingModel(model);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["teaching-models"] });
      toast.success("Unterrichtsmodell erfolgreich hinzugefügt");
      setShowAddForm(false);
      resetForm();
    },
    onError: (error: Error) => {
      toast.error(`Fehler: ${error.message}`);
    },
  });

  const updateMutation = useMutation({
    mutationFn: async (model: TeachingModel) => {
      if (!actor) throw new Error("Actor not available");
      await actor.updateTeachingModel(model);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["teaching-models"] });
      toast.success("Unterrichtsmodell erfolgreich aktualisiert");
      setEditingId(null);
      resetForm();
    },
    onError: (error: Error) => {
      toast.error(`Fehler: ${error.message}`);
    },
  });

  const deleteMutation = useMutation({
    mutationFn: async (id: bigint) => {
      if (!actor) throw new Error("Actor not available");
      await actor.deleteTeachingModel(id);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["teaching-models"] });
      toast.success("Unterrichtsmodell erfolgreich gelöscht");
    },
    onError: (error: Error) => {
      toast.error(`Fehler: ${error.message}`);
    },
  });

  const resetForm = () => {
    setFormData(emptyForm);
    setSelectedImage(null);
    setImagePreview(null);
  };

  const handleEdit = (model: TeachingModel) => {
    setEditingId(model.id);
    setFormData({
      title: model.title,
      subtitle: model.subtitle ?? "",
      description: model.description,
      features: model.features.join("\n"),
      price: model.price,
      imagePath: model.imagePath || "",
    });
    setSelectedImage(null);
    setImagePreview(null);
    setShowAddForm(false);
  };

  const handleImageChange = (file: File | null) => {
    setSelectedImage(file);
    if (file) {
      const url = URL.createObjectURL(file);
      setImagePreview(url);
    } else {
      setImagePreview(null);
    }
  };

  const handleImageUpload = async (): Promise<string | undefined> => {
    if (!selectedImage) return formData.imagePath || undefined;
    const path = `teaching-models/${Date.now()}-${selectedImage.name}`;
    const result = await uploadFile(path, selectedImage);
    return result.path;
  };

  const handleSubmit = async () => {
    if (!formData.title.trim()) {
      toast.error("Bitte gib einen Titel ein");
      return;
    }
    try {
      const uploadedImagePath = await handleImageUpload();
      const featuresArray = formData.features
        .split("\n")
        .filter((f) => f.trim());
      const newId = editingId !== null ? editingId : BigInt(Date.now());

      const model: TeachingModel = {
        id: newId,
        order: BigInt(0),
        featured: false,
        title: formData.title,
        subtitle: formData.subtitle,
        description: formData.description,
        features: featuresArray,
        price: formData.price,
        imagePath: uploadedImagePath,
      };

      if (editingId !== null) {
        updateMutation.mutate(model);
      } else {
        addMutation.mutate(model);
      }
    } catch (_error) {
      toast.error("Fehler beim Hochladen des Bildes");
    }
  };

  const isBusy =
    addMutation.isPending || updateMutation.isPending || isUploading;

  const ModelForm = ({ isNew }: { isNew: boolean }) => (
    <Card className="border-primary/50 bg-card">
      <CardHeader className="pb-4">
        <div className="flex items-center justify-between">
          <CardTitle className="text-lg">
            {isNew ? "Neues Unterrichtsmodell" : "Modell bearbeiten"}
          </CardTitle>
          <Button
            variant="ghost"
            size="sm"
            onClick={() => {
              if (isNew) setShowAddForm(false);
              else {
                setEditingId(null);
              }
              resetForm();
            }}
          >
            <X className="h-4 w-4" />
          </Button>
        </div>
      </CardHeader>
      <CardContent className="space-y-5">
        {/* Image upload at top */}
        <div className="space-y-3">
          <Label>Bild (optional)</Label>
          <button
            type="button"
            className="w-full relative border-2 border-dashed border-border rounded-lg overflow-hidden cursor-pointer hover:border-primary/50 transition-colors text-left"
            style={{ minHeight: "140px" }}
            onClick={() => fileInputRef.current?.click()}
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
              >
                <X className="h-3 w-3" />
              </Button>
            </div>
          )}
        </div>

        <div className="grid sm:grid-cols-2 gap-4">
          <div className="space-y-2">
            <Label htmlFor="form-title">Titel *</Label>
            <Input
              id="form-title"
              value={formData.title}
              onChange={(e) =>
                setFormData({ ...formData, title: e.target.value })
              }
              placeholder="z.B. Privatunterricht"
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="form-price">Preis</Label>
            <Input
              id="form-price"
              value={formData.price}
              onChange={(e) =>
                setFormData({ ...formData, price: e.target.value })
              }
              placeholder="150 € / Monat"
            />
          </div>
        </div>

        <div className="space-y-2">
          <Label htmlFor="form-subtitle">
            Untertitel{" "}
            <span className="text-muted-foreground text-xs">(optional)</span>
          </Label>
          <Input
            id="form-subtitle"
            value={formData.subtitle}
            onChange={(e) =>
              setFormData({ ...formData, subtitle: e.target.value })
            }
            placeholder="z.B. Aachen & online"
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="form-description">Kurzbeschreibung</Label>
          <Input
            id="form-description"
            value={formData.description}
            onChange={(e) =>
              setFormData({ ...formData, description: e.target.value })
            }
            placeholder="Kurze Beschreibung des Angebots"
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="form-features">Leistungen (eine pro Zeile)</Label>
          <Textarea
            id="form-features"
            value={formData.features}
            onChange={(e) =>
              setFormData({ ...formData, features: e.target.value })
            }
            placeholder={
              "Wöchentliche 1:1-Sessions (45min)\nPersönliche Betreuung\nIndividueller Lehrplan"
            }
            rows={6}
          />
          <p className="text-xs text-muted-foreground">
            Jede Zeile wird als eigener Punkt angezeigt
          </p>
        </div>

        <div className="flex gap-2 pt-2">
          <Button
            onClick={handleSubmit}
            disabled={isBusy}
            data-ocid="teaching-model-save"
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
    <div className="space-y-5">
      <div className="flex items-center justify-between">
        <div>
          <p className="text-muted-foreground text-sm">
            {models?.length || 0} Modelle gespeichert
          </p>
        </div>
        <Button
          onClick={() => {
            setShowAddForm(true);
            setEditingId(null);
            resetForm();
          }}
          disabled={showAddForm}
          data-ocid="teaching-model-add"
        >
          <Plus className="mr-2 h-4 w-4" />
          Neues Modell
        </Button>
      </div>

      {showAddForm && <ModelForm isNew />}

      <div className="grid gap-4">
        {models?.map((model) => (
          <div key={Number(model.id)}>
            {editingId === model.id ? (
              <ModelForm isNew={false} />
            ) : (
              <ModelRow
                model={model}
                onEdit={() => handleEdit(model)}
                onDelete={() => deleteMutation.mutate(model.id)}
                isDeleting={deleteMutation.isPending}
              />
            )}
          </div>
        ))}
      </div>

      {!showAddForm && (!models || models.length === 0) && (
        <div className="text-center py-16 text-muted-foreground">
          <Layers className="w-10 h-10 mx-auto mb-3 opacity-30" />
          <p className="text-sm">
            Noch keine Unterrichtsmodelle. Füge dein erstes Modell hinzu.
          </p>
        </div>
      )}
    </div>
  );
}

function Layers({ className }: { className?: string }) {
  return (
    <svg
      className={className}
      fill="none"
      viewBox="0 0 24 24"
      stroke="currentColor"
      strokeWidth={1.5}
      aria-hidden="true"
    >
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        d="M12 2L2 7l10 5 10-5-10-5zM2 17l10 5 10-5M2 12l10 5 10-5"
      />
    </svg>
  );
}

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

function ModelRow({
  model,
  onEdit,
  onDelete,
  isDeleting,
}: {
  model: TeachingModel;
  onEdit: () => void;
  onDelete: () => void;
  isDeleting: boolean;
}) {
  const { data: imageUrl } = useFileUrl(model.imagePath || "");
  const [expanded, setExpanded] = useState(false);

  return (
    <Card className="overflow-hidden">
      <div className="flex items-start gap-4 p-4">
        {model.imagePath && imageUrl ? (
          <img
            src={imageUrl}
            alt={model.title}
            className="w-20 h-16 object-cover rounded-md shrink-0"
          />
        ) : (
          <div className="w-20 h-16 bg-muted rounded-md shrink-0 flex items-center justify-center">
            <ImageIcon className="w-6 h-6 text-muted-foreground opacity-40" />
          </div>
        )}
        <div className="flex-1 min-w-0">
          <div className="flex items-start justify-between gap-2">
            <div>
              <h3 className="font-semibold text-foreground truncate">
                {model.title}
              </h3>
              {model.price && (
                <Badge variant="secondary" className="mt-1 text-xs">
                  {model.price}
                </Badge>
              )}
            </div>
            <div className="flex items-center gap-1 shrink-0">
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setExpanded(!expanded)}
              >
                {expanded ? (
                  <ChevronUp className="h-4 w-4" />
                ) : (
                  <ChevronDown className="h-4 w-4" />
                )}
              </Button>
              <Button
                variant="ghost"
                size="sm"
                onClick={onEdit}
                data-ocid="teaching-model-edit"
              >
                <Pencil className="h-4 w-4" />
              </Button>
              <AlertDialog>
                <AlertDialogTrigger asChild>
                  <Button
                    variant="ghost"
                    size="sm"
                    disabled={isDeleting}
                    data-ocid="teaching-model-delete"
                  >
                    <Trash2 className="h-4 w-4 text-destructive" />
                  </Button>
                </AlertDialogTrigger>
                <AlertDialogContent>
                  <AlertDialogHeader>
                    <AlertDialogTitle>
                      Unterrichtsmodell löschen?
                    </AlertDialogTitle>
                    <AlertDialogDescription>
                      Bist du sicher, dass du <strong>„{model.title}"</strong>{" "}
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
          {model.description && (
            <p className="text-sm text-muted-foreground mt-1 truncate">
              {model.description}
            </p>
          )}
        </div>
      </div>
      {expanded && model.features.length > 0 && (
        <div className="px-4 pb-4 border-t border-border/50 pt-3 ml-24">
          <ul className="space-y-1">
            {model.features.map((feature) => (
              <li
                key={feature}
                className="text-sm text-muted-foreground flex items-start gap-2"
              >
                <span className="text-primary mt-0.5">•</span>
                {feature}
              </li>
            ))}
          </ul>
        </div>
      )}
    </Card>
  );
}
