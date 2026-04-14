import { useFileUrl } from "@/blob-storage/FileStorage";
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
import { Skeleton } from "@/components/ui/skeleton";
import { useActor } from "@/hooks/useActor";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { Check, Copy, Image as ImageIcon, Search, Trash2 } from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";

// ─── Image extensions we want to show ────────────────────────────────────────
const IMAGE_EXTS = [
  ".jpg",
  ".jpeg",
  ".png",
  ".webp",
  ".gif",
  ".svg",
  ".ico",
  ".avif",
];

function isImagePath(path: string) {
  const lower = path.toLowerCase();
  return IMAGE_EXTS.some((ext) => lower.endsWith(ext));
}

// ─── Single image tile ────────────────────────────────────────────────────────

function ImageTile({
  path,
  onDelete,
}: { path: string; onDelete: (path: string) => void }) {
  const { data: url } = useFileUrl(path);
  const [copied, setCopied] = useState(false);

  const handleCopy = async () => {
    const textToCopy = url ?? path;
    await navigator.clipboard.writeText(textToCopy);
    setCopied(true);
    toast.success("URL kopiert");
    setTimeout(() => setCopied(false), 2000);
  };

  const filename = path.split("/").pop() ?? path;

  return (
    <div className="group relative rounded-lg overflow-hidden border border-border bg-muted/20 hover:border-primary/40 transition-colors duration-200">
      {/* Thumbnail */}
      <div className="aspect-square relative overflow-hidden bg-muted/30">
        {url ? (
          <img
            src={url}
            alt={filename}
            className="w-full h-full object-cover"
            loading="lazy"
          />
        ) : (
          <div className="flex items-center justify-center h-full">
            <ImageIcon className="w-8 h-8 text-muted-foreground/30" />
          </div>
        )}
      </div>

      {/* Filename */}
      <div className="p-2">
        <p
          className="text-xs text-muted-foreground truncate font-mono"
          title={path}
        >
          {filename}
        </p>
        <p
          className="text-[10px] text-muted-foreground/60 truncate"
          title={path}
        >
          {path}
        </p>
      </div>

      {/* Action overlay */}
      <div className="absolute top-2 right-2 flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity duration-200">
        <button
          type="button"
          onClick={handleCopy}
          className="w-7 h-7 rounded-md bg-background/90 backdrop-blur-sm border border-border flex items-center justify-center hover:bg-primary/10 transition-colors"
          title="URL kopieren"
          aria-label="URL kopieren"
        >
          {copied ? (
            <Check className="w-3.5 h-3.5 text-primary" />
          ) : (
            <Copy className="w-3.5 h-3.5 text-foreground" />
          )}
        </button>

        <AlertDialog>
          <AlertDialogTrigger asChild>
            <button
              type="button"
              className="w-7 h-7 rounded-md bg-background/90 backdrop-blur-sm border border-border flex items-center justify-center hover:bg-destructive/10 transition-colors"
              title="Bild löschen"
              aria-label="Bild löschen"
            >
              <Trash2 className="w-3.5 h-3.5 text-destructive" />
            </button>
          </AlertDialogTrigger>
          <AlertDialogContent>
            <AlertDialogHeader>
              <AlertDialogTitle>Bild löschen?</AlertDialogTitle>
              <AlertDialogDescription>
                <strong>{filename}</strong> wird dauerhaft aus dem Speicher
                entfernt. Seiten, die dieses Bild verwenden, zeigen dann kein
                Bild mehr.
              </AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter>
              <AlertDialogCancel>Abbrechen</AlertDialogCancel>
              <AlertDialogAction
                onClick={() => onDelete(path)}
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
}

// ─── Main component ────────────────────────────────────────────────────────────

export default function AdminImages() {
  const { actor } = useActor();
  const qc = useQueryClient();
  const [search, setSearch] = useState("");

  const { data: files, isLoading } = useQuery({
    queryKey: ["file-references"],
    queryFn: async () => {
      if (!actor) return [];
      return actor.listFileReferences();
    },
    enabled: !!actor,
    staleTime: 30_000,
  });

  const deleteMutation = useMutation({
    mutationFn: async (path: string) => {
      if (!actor) throw new Error("No actor");
      await actor.dropFileReference(path);
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["file-references"] });
      toast.success("Bild gelöscht");
    },
    onError: (err: Error) => toast.error(`Fehler: ${err.message}`),
  });

  const imagePaths =
    files?.filter((f) => isImagePath(f.path)).map((f) => f.path) ?? [];

  const filtered = search.trim()
    ? imagePaths.filter((p) =>
        p.toLowerCase().includes(search.trim().toLowerCase()),
      )
    : imagePaths;

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>Hochgeladene Bilder</CardTitle>
          <CardDescription>
            Alle Bilder im Blob-Speicher. Kopiere die URL um sie in anderen
            Bereichen zu verwenden, oder lösche nicht mehr benötigte Bilder.
            Bilder werden kontextuell hochgeladen — direkt beim jeweiligen
            Inhalt (Unterrichtsmodell, Studio Service, Logo, usw.).
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          {/* Search */}
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
            <Input
              placeholder="Bilder suchen…"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="pl-9"
              data-ocid="images-search"
            />
          </div>

          {/* Count */}
          {!isLoading && (
            <p className="text-sm text-muted-foreground">
              {filtered.length} Bild{filtered.length !== 1 ? "er" : ""}{" "}
              {search && `gefunden für "${search}"`}
            </p>
          )}

          {/* Loading */}
          {isLoading && (
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-3">
              {[1, 2, 3, 4, 5, 6, 7, 8].map((n) => (
                <div key={n} className="space-y-2">
                  <Skeleton className="aspect-square w-full rounded-lg" />
                  <Skeleton className="h-3 w-full" />
                </div>
              ))}
            </div>
          )}

          {/* Grid */}
          {!isLoading && filtered.length > 0 && (
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-3">
              {filtered.map((path) => (
                <ImageTile
                  key={path}
                  path={path}
                  onDelete={(p) => deleteMutation.mutate(p)}
                />
              ))}
            </div>
          )}

          {/* Empty */}
          {!isLoading && filtered.length === 0 && (
            <div
              className="flex flex-col items-center justify-center py-16 text-center text-muted-foreground"
              data-ocid="images-empty"
            >
              <ImageIcon className="w-10 h-10 mb-3 opacity-30" />
              <p className="text-sm">
                {search
                  ? "Keine Bilder für diese Suche gefunden."
                  : "Noch keine Bilder hochgeladen."}
              </p>
              {search && (
                <button
                  type="button"
                  onClick={() => setSearch("")}
                  className="mt-3 text-xs text-primary hover:underline"
                >
                  Suche zurücksetzen
                </button>
              )}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
