import type { Product } from "@/backend";
import { useFileUpload } from "@/blob-storage/FileStorage";
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
import { Switch } from "@/components/ui/switch";
import { Textarea } from "@/components/ui/textarea";
import { useActor } from "@/hooks/useActor";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { Loader2, Package, Pencil, Plus, Save, Trash2, X } from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";

type FormData = {
  title: string;
  description: string;
  price: string;
  imageUrl: string;
  category: string;
  inventory: string;
  isDigital: boolean;
};

const emptyForm: FormData = {
  title: "",
  description: "",
  price: "",
  imageUrl: "",
  category: "",
  inventory: "0",
  isDigital: true,
};

export default function AdminProducts() {
  const { actor } = useActor();
  const queryClient = useQueryClient();
  const { uploadFile, isUploading } = useFileUpload();
  const [editingId, setEditingId] = useState<bigint | null>(null);
  const [showAddForm, setShowAddForm] = useState(false);
  const [selectedImage, setSelectedImage] = useState<File | null>(null);
  const [formData, setFormData] = useState<FormData>(emptyForm);

  const { data: products } = useQuery({
    queryKey: ["products"],
    queryFn: async () => {
      if (!actor) return [];
      return actor.getProducts();
    },
    enabled: !!actor,
  });

  const addMutation = useMutation({
    mutationFn: async (product: Product) => {
      if (!actor) throw new Error("Actor not available");
      await actor.addProduct(product);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["products"] });
      toast.success("Produkt erfolgreich hinzugefügt");
      setShowAddForm(false);
      resetForm();
    },
    onError: (error: Error) => toast.error(`Fehler: ${error.message}`),
  });

  const updateMutation = useMutation({
    mutationFn: async (product: Product) => {
      if (!actor) throw new Error("Actor not available");
      await actor.updateProduct(product);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["products"] });
      toast.success("Produkt erfolgreich aktualisiert");
      setEditingId(null);
      resetForm();
    },
    onError: (error: Error) => toast.error(`Fehler: ${error.message}`),
  });

  const deleteMutation = useMutation({
    mutationFn: async (id: bigint) => {
      if (!actor) throw new Error("Actor not available");
      await actor.deleteProduct(id);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["products"] });
      toast.success("Produkt erfolgreich gelöscht");
    },
    onError: (error: Error) => toast.error(`Fehler: ${error.message}`),
  });

  const resetForm = () => {
    setFormData(emptyForm);
    setSelectedImage(null);
  };

  const handleEdit = (product: Product) => {
    setEditingId(product.id);
    setFormData({
      title: product.title,
      description: product.description,
      price: (Number(product.price) / 100).toFixed(2),
      imageUrl: product.imageUrl,
      category: product.category,
      inventory: product.inventory.toString(),
      isDigital: product.isDigital,
    });
    setShowAddForm(false);
  };

  const handleImageUpload = async (): Promise<string> => {
    if (!selectedImage) return formData.imageUrl;
    const path = `products/${Date.now()}-${selectedImage.name}`;
    const result = await uploadFile(path, selectedImage);
    return result.path;
  };

  const handleSubmit = async () => {
    if (!formData.title.trim()) {
      toast.error("Bitte Titel eingeben");
      return;
    }
    try {
      const imageUrl = await handleImageUpload();
      const priceInCents = Math.round(Number.parseFloat(formData.price) * 100);
      const newId = editingId !== null ? editingId : BigInt(Date.now());

      const product: Product = {
        id: newId,
        title: formData.title,
        description: formData.description,
        price: BigInt(priceInCents || 0),
        imageUrl,
        category: formData.category,
        inventory: BigInt(Number.parseInt(formData.inventory) || 0),
        isDigital: formData.isDigital,
      };

      if (editingId !== null) {
        updateMutation.mutate(product);
      } else {
        addMutation.mutate(product);
      }
    } catch (_err) {
      toast.error("Fehler beim Hochladen");
    }
  };

  const isBusy =
    addMutation.isPending || updateMutation.isPending || isUploading;

  const ProductForm = ({ isNew }: { isNew: boolean }) => (
    <Card className="border-primary/50">
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <CardTitle className="text-base">
            {isNew ? "Neues Produkt" : "Produkt bearbeiten"}
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
      <CardContent className="space-y-4">
        <div className="grid sm:grid-cols-2 gap-4">
          <div className="space-y-2">
            <Label>Titel *</Label>
            <Input
              value={formData.title}
              onChange={(e) =>
                setFormData({ ...formData, title: e.target.value })
              }
              placeholder="z.B. Gitarren-Tab Collection"
              data-ocid="product-title"
            />
          </div>
          <div className="space-y-2">
            <Label>Kategorie</Label>
            <Input
              value={formData.category}
              onChange={(e) =>
                setFormData({ ...formData, category: e.target.value })
              }
              placeholder="z.B. Noten, Merch"
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
            placeholder="Beschreibe das Produkt..."
            rows={3}
          />
        </div>
        <div className="grid sm:grid-cols-2 gap-4">
          <div className="space-y-2">
            <Label>Preis (€)</Label>
            <Input
              type="number"
              step="0.01"
              value={formData.price}
              onChange={(e) =>
                setFormData({ ...formData, price: e.target.value })
              }
              placeholder="19.99"
            />
          </div>
          <div className="space-y-2">
            <Label>Lagerbestand</Label>
            <Input
              type="number"
              value={formData.inventory}
              onChange={(e) =>
                setFormData({ ...formData, inventory: e.target.value })
              }
              placeholder="0 = unbegrenzt bei Digital"
            />
          </div>
        </div>
        <div className="space-y-2">
          <Label>Produktbild</Label>
          <Input
            type="file"
            accept="image/*"
            onChange={(e) => setSelectedImage(e.target.files?.[0] || null)}
          />
          {selectedImage && (
            <p className="text-xs text-muted-foreground">
              ✓ {selectedImage.name}
            </p>
          )}
        </div>
        <div className="flex items-center gap-3 py-1">
          <Switch
            id="product-digital"
            checked={formData.isDigital}
            onCheckedChange={(checked) =>
              setFormData({ ...formData, isDigital: checked })
            }
          />
          <Label htmlFor="product-digital">Digitales Produkt</Label>
        </div>
        <div className="flex gap-2 pt-2">
          <Button
            onClick={handleSubmit}
            disabled={isBusy}
            data-ocid="product-save"
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
            Abbrechen
          </Button>
        </div>
      </CardContent>
    </Card>
  );

  return (
    <div className="space-y-5">
      <div className="flex items-center justify-between">
        <p className="text-muted-foreground text-sm">
          {products?.length || 0} Produkte
        </p>
        <Button
          onClick={() => {
            setShowAddForm(true);
            setEditingId(null);
            resetForm();
          }}
          disabled={showAddForm}
          data-ocid="product-add"
        >
          <Plus className="mr-2 h-4 w-4" />
          Neues Produkt
        </Button>
      </div>

      {showAddForm && <ProductForm isNew />}

      <div className="grid gap-4">
        {products?.map((product) => (
          <div key={Number(product.id)}>
            {editingId === product.id ? (
              <ProductForm isNew={false} />
            ) : (
              <Card>
                <div className="flex items-start gap-4 p-4">
                  <div className="flex-1 min-w-0">
                    <div className="flex items-start justify-between gap-2">
                      <div className="min-w-0">
                        <h3 className="font-semibold text-foreground truncate">
                          {product.title}
                        </h3>
                        <div className="flex items-center gap-2 mt-1">
                          <span className="text-primary font-bold">
                            {(Number(product.price) / 100).toFixed(2)} €
                          </span>
                          <Badge variant="secondary" className="text-xs">
                            {product.isDigital ? "Digital" : "Physisch"}
                          </Badge>
                          {product.category && (
                            <Badge variant="outline" className="text-xs">
                              {product.category}
                            </Badge>
                          )}
                        </div>
                        {product.description && (
                          <p className="text-sm text-muted-foreground mt-1 line-clamp-2">
                            {product.description}
                          </p>
                        )}
                      </div>
                      <div className="flex items-center gap-1 shrink-0">
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => handleEdit(product)}
                          data-ocid="product-edit"
                          aria-label={`Produkt ${product.title} bearbeiten`}
                        >
                          <Pencil className="h-4 w-4" />
                        </Button>
                        <AlertDialog>
                          <AlertDialogTrigger asChild>
                            <Button
                              variant="ghost"
                              size="sm"
                              disabled={deleteMutation.isPending}
                              data-ocid="product-delete"
                              aria-label={`Produkt ${product.title} löschen`}
                            >
                              <Trash2 className="h-4 w-4 text-destructive" />
                            </Button>
                          </AlertDialogTrigger>
                          <AlertDialogContent>
                            <AlertDialogHeader>
                              <AlertDialogTitle>
                                Produkt löschen?
                              </AlertDialogTitle>
                              <AlertDialogDescription>
                                Bist du sicher, dass du{" "}
                                <strong>„{product.title}"</strong> löschen
                                möchtest? Diese Aktion kann nicht rückgängig
                                gemacht werden.
                              </AlertDialogDescription>
                            </AlertDialogHeader>
                            <AlertDialogFooter>
                              <AlertDialogCancel>Abbrechen</AlertDialogCancel>
                              <AlertDialogAction
                                onClick={() =>
                                  deleteMutation.mutate(product.id)
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
                  </div>
                </div>
              </Card>
            )}
          </div>
        ))}
      </div>

      {!showAddForm && (!products || products.length === 0) && (
        <div
          className="text-center py-16 text-muted-foreground"
          data-ocid="products-empty"
        >
          <Package className="w-10 h-10 mx-auto mb-3 opacity-30" />
          <p className="text-sm">
            Noch keine Produkte. Füge dein erstes Produkt hinzu.
          </p>
        </div>
      )}
    </div>
  );
}
