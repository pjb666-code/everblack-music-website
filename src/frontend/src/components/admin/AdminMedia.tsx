import type { MediaItem } from "@/backend";
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
import { Progress } from "@/components/ui/progress";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Textarea } from "@/components/ui/textarea";
import { useActor } from "@/hooks/useActor";
import {
  type StandaloneAlbum,
  type StandaloneAlbumTrack,
  useAddAlbum,
  useAddAlbumTrack,
  useAlbumTracks,
  useDeleteAlbum,
  useDeleteAlbumTrack,
  useStandaloneAlbums,
  useUpdateAlbum,
} from "@/hooks/useQueries";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import {
  ChevronDown,
  ChevronUp,
  Disc,
  Image as ImageIcon,
  Loader2,
  Music,
  Pencil,
  Plus,
  Save,
  Trash2,
  Upload,
  X,
} from "lucide-react";
import { useRef, useState } from "react";
import { toast } from "sonner";

// ─── Types ────────────────────────────────────────────────────────────────────

type UploadItem = {
  file: File;
  thumbnail: File | null;
  title: string;
  description: string;
};

type EditFormData = {
  title: string;
  description: string;
  mediaType: string;
  url: string;
};

type AddLinkFormData = {
  title: string;
  description: string;
  url: string;
};

const EMPTY_EDIT: EditFormData = {
  title: "",
  description: "",
  mediaType: "audio",
  url: "",
};
const EMPTY_ADD_LINK: AddLinkFormData = { title: "", description: "", url: "" };

// ─── Album track list ─────────────────────────────────────────────────────────

function AlbumTrackList({ albumId }: { albumId: string }) {
  const { data: tracks } = useAlbumTracks(albumId);
  const { mutateAsync: deleteTrack } = useDeleteAlbumTrack();
  const { uploadFile } = useFileUpload();
  const { mutateAsync: addTrack } = useAddAlbumTrack();

  const [showAddTrack, setShowAddTrack] = useState(false);
  const [trackFile, setTrackFile] = useState<File | null>(null);
  const [trackTitle, setTrackTitle] = useState("");
  const [isUploading, setIsUploading] = useState(false);

  const sorted = [...((tracks as StandaloneAlbumTrack[]) ?? [])].sort(
    (a, b) => a.trackNumber - b.trackNumber,
  );

  const handleAddTrack = async () => {
    if (!trackFile) {
      toast.error("Bitte Audiodatei auswählen");
      return;
    }
    if (!trackTitle.trim()) {
      toast.error("Bitte Titel eingeben");
      return;
    }
    setIsUploading(true);
    try {
      const path = `media/albums/${albumId}/${Date.now()}-${trackFile.name}`;
      const result = await uploadFile(path, trackFile);
      const nextNum =
        (sorted.length > 0 ? sorted[sorted.length - 1].trackNumber : 0) + 1;
      await addTrack({
        id: `track-${Date.now()}`,
        albumId,
        title: trackTitle,
        trackNumber: nextNum,
        filePath: result.path,
      });
      toast.success("Track hinzugefügt");
      setTrackFile(null);
      setTrackTitle("");
      setShowAddTrack(false);
    } catch (err: unknown) {
      toast.error(err instanceof Error ? err.message : "Fehler");
    } finally {
      setIsUploading(false);
    }
  };

  return (
    <div className="space-y-2 pl-1">
      {sorted.map((track) => (
        <div
          key={track.id}
          className="flex items-center gap-3 p-2 rounded-md bg-muted/30 border border-border/40"
        >
          <span className="text-xs text-muted-foreground w-5 text-right shrink-0">
            {track.trackNumber}.
          </span>
          <Music className="w-3.5 h-3.5 text-muted-foreground shrink-0" />
          <span className="flex-1 text-sm truncate">{track.title}</span>
          <Button
            variant="ghost"
            size="sm"
            className="h-6 w-6 p-0 shrink-0"
            onClick={() => deleteTrack({ id: track.id, albumId })}
            aria-label={`Track ${track.title} entfernen`}
          >
            <X className="h-3 w-3 text-destructive" />
          </Button>
        </div>
      ))}

      {showAddTrack ? (
        <Card className="p-3 space-y-3">
          <div className="space-y-2">
            <Label className="text-xs">Titel *</Label>
            <Input
              value={trackTitle}
              onChange={(e) => setTrackTitle(e.target.value)}
              placeholder="Track-Titel"
              className="h-8 text-sm"
            />
          </div>
          <div className="space-y-2">
            <Label className="text-xs">Audiodatei *</Label>
            <Input
              type="file"
              accept="audio/*"
              onChange={(e) => setTrackFile(e.target.files?.[0] ?? null)}
              className="h-8 text-xs"
            />
          </div>
          <div className="flex gap-2">
            <Button
              size="sm"
              onClick={handleAddTrack}
              disabled={isUploading}
              className="h-7"
            >
              {isUploading ? (
                <Loader2 className="mr-1 h-3 w-3 animate-spin" />
              ) : (
                <Save className="mr-1 h-3 w-3" />
              )}
              Hinzufügen
            </Button>
            <Button
              size="sm"
              variant="outline"
              className="h-7"
              onClick={() => {
                setShowAddTrack(false);
                setTrackFile(null);
                setTrackTitle("");
              }}
            >
              Abbrechen
            </Button>
          </div>
        </Card>
      ) : (
        <Button
          size="sm"
          variant="outline"
          className="h-7 text-xs"
          onClick={() => setShowAddTrack(true)}
          data-ocid="album-add-track"
        >
          <Plus className="mr-1 h-3 w-3" />
          Track hinzufügen
        </Button>
      )}
    </div>
  );
}

// ─── Album cover preview ──────────────────────────────────────────────────────

function AlbumCoverPreview({ path }: { path: string }) {
  const { data: url } = useFileUrl(path);
  if (!url)
    return (
      <div className="w-14 h-14 bg-muted rounded flex items-center justify-center">
        <Disc className="w-5 h-5 opacity-30" />
      </div>
    );
  return (
    <img src={url} alt="Cover" className="w-14 h-14 object-cover rounded" />
  );
}

// ─── Albums section ───────────────────────────────────────────────────────────

type AlbumFormData = {
  title: string;
  artist: string;
  releaseYear: string;
  description: string;
};

const EMPTY_ALBUM_FORM: AlbumFormData = {
  title: "",
  artist: "",
  releaseYear: "",
  description: "",
};

function AlbumsSection() {
  const { data: albums } = useStandaloneAlbums();
  const { mutateAsync: addAlbum, isPending: isAdding } = useAddAlbum();
  const { mutateAsync: updateAlbum, isPending: isUpdating } = useUpdateAlbum();
  const { mutateAsync: deleteAlbum } = useDeleteAlbum();
  const { uploadFile, isUploading } = useFileUpload();

  const [showAddForm, setShowAddForm] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [formData, setFormData] = useState<AlbumFormData>(EMPTY_ALBUM_FORM);
  const [coverFile, setCoverFile] = useState<File | null>(null);
  const [coverPreview, setCoverPreview] = useState<string | null>(null);
  const [expandedId, setExpandedId] = useState<string | null>(null);
  const fileRef = useRef<HTMLInputElement>(null);

  const resetForm = () => {
    setFormData(EMPTY_ALBUM_FORM);
    setCoverFile(null);
    setCoverPreview(null);
  };

  const handleCoverChange = (file: File | null) => {
    setCoverFile(file);
    setCoverPreview(file ? URL.createObjectURL(file) : null);
  };

  const handleSubmit = async () => {
    if (!formData.title.trim()) {
      toast.error("Titel eingeben");
      return;
    }
    if (!formData.artist.trim()) {
      toast.error("Künstler eingeben");
      return;
    }
    try {
      let coverPath: string | null = null;
      if (coverFile) {
        const path = `media/covers/${Date.now()}-${coverFile.name}`;
        const result = await uploadFile(path, coverFile);
        coverPath = result.path;
      } else if (editingId) {
        coverPath = albums?.find((a) => a.id === editingId)?.coverPath ?? null;
      }

      const albumPayload: StandaloneAlbum = {
        id: editingId ?? `album-${Date.now()}`,
        title: formData.title,
        artist: formData.artist,
        coverPath,
        description: formData.description || null,
        releaseYear: formData.releaseYear || null,
        order: albums?.length ?? 0,
      };

      if (editingId) {
        await updateAlbum(albumPayload);
        toast.success("Album aktualisiert");
        setEditingId(null);
      } else {
        await addAlbum(albumPayload);
        toast.success("Album erstellt");
        setShowAddForm(false);
      }
      resetForm();
    } catch (err: unknown) {
      toast.error(err instanceof Error ? err.message : "Fehler");
    }
  };

  const handleEdit = (album: StandaloneAlbum) => {
    setEditingId(album.id);
    setFormData({
      title: album.title,
      artist: album.artist,
      releaseYear: album.releaseYear ?? "",
      description: album.description ?? "",
    });
    setCoverFile(null);
    setCoverPreview(null);
    setShowAddForm(false);
  };

  const isBusy = isAdding || isUpdating || isUploading;

  const AlbumForm = ({ isNew }: { isNew: boolean }) => (
    <Card className="border-primary/50">
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <CardTitle className="text-base">
            {isNew ? "Neues Album" : "Album bearbeiten"}
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
        {/* Cover upload */}
        <div className="flex gap-4 items-start">
          <button
            type="button"
            className="border-2 border-dashed border-border rounded-lg overflow-hidden cursor-pointer hover:border-primary/50 transition-colors shrink-0"
            style={{ width: 80, height: 80 }}
            onClick={() => fileRef.current?.click()}
            aria-label="Cover auswählen"
          >
            {coverPreview ? (
              <img
                src={coverPreview}
                alt="Vorschau"
                className="w-full h-full object-cover"
              />
            ) : editingId &&
              albums?.find((a) => a.id === editingId)?.coverPath ? (
              <AlbumCoverPreview
                path={albums.find((a) => a.id === editingId)!.coverPath!}
              />
            ) : (
              <div className="flex flex-col items-center justify-center h-full text-muted-foreground gap-1">
                <Disc className="w-6 h-6 opacity-40" />
                <span className="text-[10px]">Cover</span>
              </div>
            )}
          </button>
          <input
            ref={fileRef}
            type="file"
            accept="image/*"
            className="sr-only"
            onChange={(e) => handleCoverChange(e.target.files?.[0] ?? null)}
          />
          <div className="flex-1 space-y-3">
            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-1">
                <Label className="text-xs">Albumtitel *</Label>
                <Input
                  value={formData.title}
                  onChange={(e) =>
                    setFormData({ ...formData, title: e.target.value })
                  }
                  placeholder="Albumtitel"
                  className="h-8 text-sm"
                />
              </div>
              <div className="space-y-1">
                <Label className="text-xs">Künstler *</Label>
                <Input
                  value={formData.artist}
                  onChange={(e) =>
                    setFormData({ ...formData, artist: e.target.value })
                  }
                  placeholder="Künstlername"
                  className="h-8 text-sm"
                />
              </div>
            </div>
            <div className="space-y-1">
              <Label className="text-xs">Erscheinungsjahr</Label>
              <Input
                value={formData.releaseYear}
                onChange={(e) =>
                  setFormData({ ...formData, releaseYear: e.target.value })
                }
                placeholder="2024"
                className="h-8 text-sm"
              />
            </div>
          </div>
        </div>
        <div className="space-y-1">
          <Label className="text-xs">Beschreibung (optional)</Label>
          <Textarea
            value={formData.description}
            onChange={(e) =>
              setFormData({ ...formData, description: e.target.value })
            }
            placeholder="Kurze Beschreibung des Albums..."
            rows={2}
            className="text-sm"
          />
        </div>
        <div className="flex gap-2">
          <Button
            onClick={handleSubmit}
            disabled={isBusy}
            size="sm"
            data-ocid="album-save"
          >
            {isBusy ? (
              <>
                <Loader2 className="mr-2 h-3 w-3 animate-spin" />
                Speichern...
              </>
            ) : (
              <>
                <Save className="mr-2 h-3 w-3" />
                Speichern
              </>
            )}
          </Button>
          <Button
            variant="outline"
            size="sm"
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
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <p className="text-sm text-muted-foreground">
          {albums?.length ?? 0} Album(s)
        </p>
        <Button
          onClick={() => {
            setShowAddForm(true);
            setEditingId(null);
            resetForm();
          }}
          disabled={showAddForm}
          data-ocid="album-add"
        >
          <Plus className="mr-2 h-4 w-4" />
          Neues Album
        </Button>
      </div>

      {showAddForm && <AlbumForm isNew />}

      <div className="space-y-3">
        {albums?.map((album) => (
          <div key={album.id}>
            {editingId === album.id ? (
              <AlbumForm isNew={false} />
            ) : (
              <Card className="overflow-hidden">
                <div className="flex items-start gap-3 p-4">
                  {album.coverPath ? (
                    <AlbumCoverPreview path={album.coverPath} />
                  ) : (
                    <div className="w-14 h-14 bg-muted rounded flex items-center justify-center shrink-0">
                      <Disc className="w-5 h-5 opacity-30" />
                    </div>
                  )}
                  <div className="flex-1 min-w-0">
                    <div className="flex items-start justify-between gap-2">
                      <div className="min-w-0">
                        <h3 className="font-semibold truncate">
                          {album.title}
                        </h3>
                        <p className="text-sm text-muted-foreground truncate">
                          {album.artist}
                        </p>
                        {album.releaseYear && (
                          <p className="text-xs text-muted-foreground">
                            {album.releaseYear}
                          </p>
                        )}
                      </div>
                      <div className="flex items-center gap-1 shrink-0">
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() =>
                            setExpandedId(
                              expandedId === album.id ? null : album.id,
                            )
                          }
                          aria-label="Tracks anzeigen"
                        >
                          {expandedId === album.id ? (
                            <ChevronUp className="h-4 w-4" />
                          ) : (
                            <ChevronDown className="h-4 w-4" />
                          )}
                        </Button>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => handleEdit(album)}
                          data-ocid="album-edit"
                          aria-label={`Album ${album.title} bearbeiten`}
                        >
                          <Pencil className="h-3.5 w-3.5" />
                        </Button>
                        <AlertDialog>
                          <AlertDialogTrigger asChild>
                            <Button
                              variant="ghost"
                              size="sm"
                              data-ocid="album-delete"
                              aria-label={`Album ${album.title} löschen`}
                            >
                              <Trash2 className="h-3.5 w-3.5 text-destructive" />
                            </Button>
                          </AlertDialogTrigger>
                          <AlertDialogContent>
                            <AlertDialogHeader>
                              <AlertDialogTitle>
                                Album löschen?
                              </AlertDialogTitle>
                              <AlertDialogDescription>
                                Bist du sicher, dass du{" "}
                                <strong>„{album.title}"</strong> und alle
                                zugehörigen Tracks löschen möchtest?
                              </AlertDialogDescription>
                            </AlertDialogHeader>
                            <AlertDialogFooter>
                              <AlertDialogCancel>Abbrechen</AlertDialogCancel>
                              <AlertDialogAction
                                onClick={() => deleteAlbum(album.id)}
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
                {expandedId === album.id && (
                  <div className="px-4 pb-4 border-t border-border/40 pt-3">
                    <p className="text-xs font-medium text-muted-foreground mb-2 uppercase tracking-wide">
                      Tracks
                    </p>
                    <AlbumTrackList albumId={album.id} />
                  </div>
                )}
              </Card>
            )}
          </div>
        ))}
      </div>

      {(!albums || albums.length === 0) && !showAddForm && (
        <div
          className="text-center py-12 text-muted-foreground"
          data-ocid="albums-empty"
        >
          <Disc className="w-10 h-10 mx-auto mb-3 opacity-30" />
          <p className="text-sm">
            Noch keine Alben. Erstelle dein erstes Album.
          </p>
        </div>
      )}
    </div>
  );
}

// ─── Individual media items section ──────────────────────────────────────────

function MediaItemsSection() {
  const { actor } = useActor();
  const queryClient = useQueryClient();
  const { uploadFile } = useFileUpload();

  const [editingId, setEditingId] = useState<bigint | null>(null);
  const [editFormData, setEditFormData] = useState<EditFormData>(EMPTY_EDIT);
  const [showAddForm, setShowAddForm] = useState(false);
  // addMediaType is lifted to component level — never reset by other state changes
  const [addMediaType, setAddMediaType] = useState("audio");
  const [uploadItems, setUploadItems] = useState<UploadItem[]>([]);
  const [uploadProgress, setUploadProgress] = useState<Record<string, number>>(
    {},
  );
  const [isBulkUploading, setIsBulkUploading] = useState(false);
  const [addLinkForm, setAddLinkForm] =
    useState<AddLinkFormData>(EMPTY_ADD_LINK);

  const { data: mediaItems } = useQuery({
    queryKey: ["media-items"],
    queryFn: async () => {
      if (!actor) return [];
      return actor.getMediaItems();
    },
    enabled: !!actor,
  });

  const addMutation = useMutation({
    mutationFn: async (item: MediaItem) => {
      if (!actor) throw new Error("Actor not available");
      await actor.addMediaItem(item);
    },
    onSuccess: () =>
      queryClient.invalidateQueries({ queryKey: ["media-items"] }),
    onError: (error: Error) => toast.error(`Fehler: ${error.message}`),
  });

  const updateMutation = useMutation({
    mutationFn: async (item: MediaItem) => {
      if (!actor) throw new Error("Actor not available");
      await actor.updateMediaItem(item);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["media-items"] });
      toast.success("Aktualisiert");
      setEditingId(null);
      setEditFormData(EMPTY_EDIT);
    },
    onError: (error: Error) => toast.error(`Fehler: ${error.message}`),
  });

  const deleteMutation = useMutation({
    mutationFn: async (id: bigint) => {
      if (!actor) throw new Error("Actor not available");
      await actor.deleteMediaItem(id);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["media-items"] });
      toast.success("Gelöscht");
    },
    onError: (error: Error) => toast.error(`Fehler: ${error.message}`),
  });

  const closeAddForm = () => {
    setShowAddForm(false);
    setUploadItems([]);
    setUploadProgress({});
    setAddLinkForm(EMPTY_ADD_LINK);
    // intentionally NOT resetting addMediaType
  };

  const handleEdit = (item: MediaItem) => {
    setEditingId(item.id);
    setEditFormData({
      title: item.title,
      description: item.description,
      mediaType: item.mediaType,
      url: item.url,
    });
  };

  const handleFilesSelected = (files: FileList | null) => {
    if (!files || files.length === 0) return;
    setUploadItems(
      Array.from(files).map((f) => ({
        file: f,
        thumbnail: null,
        title: f.name.replace(/\.[^/.]+$/, ""),
        description: "",
      })),
    );
  };

  const handleBulkUpload = async () => {
    if (uploadItems.length === 0) {
      toast.error("Bitte mindestens eine Datei auswählen");
      return;
    }
    setIsBulkUploading(true);
    let successCount = 0;
    let failCount = 0;

    for (const item of uploadItems) {
      try {
        const ts = Date.now();
        const mediaPath = `media/${ts}-${item.file.name}`;
        const mediaResult = await uploadFile(mediaPath, item.file, (p) => {
          setUploadProgress((prev) => ({ ...prev, [item.file.name]: p }));
        });
        let thumbnailPath: string | undefined;
        if (item.thumbnail) {
          const thumbResult = await uploadFile(
            `media/thumbnails/${ts}-${item.thumbnail.name}`,
            item.thumbnail,
          );
          thumbnailPath = thumbResult.path;
        }
        const mediaType = item.file.type.startsWith("audio/")
          ? "audio"
          : "video";
        await addMutation.mutateAsync({
          id: BigInt(Date.now() + successCount),
          title: item.title,
          description: item.description,
          mediaType,
          url: mediaResult.path,
          isAlbumTrack: false,
          thumbnailPath,
          waveformPath: undefined,
          albumId: undefined,
          trackNumber: undefined,
          albumCoverPath: undefined,
          albumTitle: undefined,
        });
        successCount++;
      } catch {
        failCount++;
      }
    }

    setIsBulkUploading(false);
    if (successCount > 0)
      toast.success(`${successCount} Datei(en) hochgeladen`);
    if (failCount > 0) toast.error(`${failCount} Datei(en) fehlgeschlagen`);
    closeAddForm();
  };

  const handleLinkSubmit = async () => {
    if (!addLinkForm.title.trim()) {
      toast.error("Titel eingeben");
      return;
    }
    if (!addLinkForm.url.trim()) {
      toast.error("URL eingeben");
      return;
    }
    await addMutation.mutateAsync({
      id: BigInt(Date.now()),
      title: addLinkForm.title,
      description: addLinkForm.description,
      mediaType: addMediaType,
      url: addLinkForm.url,
      isAlbumTrack: false,
      thumbnailPath: undefined,
      waveformPath: undefined,
      albumId: undefined,
      trackNumber: undefined,
      albumCoverPath: undefined,
      albumTitle: undefined,
    });
    toast.success("Hinzugefügt");
    closeAddForm();
  };

  const handleUpdateSubmit = () => {
    const existing = mediaItems?.find((i) => i.id === editingId);
    if (!existing) return;
    updateMutation.mutate({
      ...existing,
      title: editFormData.title,
      description: editFormData.description,
      url: editFormData.url,
    });
  };

  const isFileUpload = addMediaType === "audio" || addMediaType === "video";
  const isLinkBased = addMediaType === "spotify" || addMediaType === "youtube";

  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center">
        <p className="text-sm text-muted-foreground">
          {mediaItems?.length ?? 0} Einzel-Medien
        </p>
        <Button
          onClick={() => setShowAddForm(true)}
          disabled={showAddForm}
          data-ocid="media-add"
        >
          <Plus className="mr-2 h-4 w-4" />
          Neues Media-Item
        </Button>
      </div>

      {showAddForm && (
        <Card className="border-primary/50">
          <CardHeader>
            <CardTitle className="text-base">Neues Media-Item</CardTitle>
            <CardDescription>
              Datei hochladen oder externen Link hinzufügen
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            {/* Type selector — state is at component level, never reset */}
            <div className="space-y-2">
              <Label htmlFor="add-type">Typ</Label>
              <Select
                value={addMediaType}
                onValueChange={(value) => {
                  setAddMediaType(value);
                  setUploadItems([]);
                  setUploadProgress({});
                  setAddLinkForm(EMPTY_ADD_LINK);
                }}
              >
                <SelectTrigger id="add-type" data-ocid="media-type-select">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="audio">Audio (Datei-Upload)</SelectItem>
                  <SelectItem value="video">Video (Datei-Upload)</SelectItem>
                  <SelectItem value="spotify">Spotify (Link)</SelectItem>
                  <SelectItem value="youtube">YouTube (Link)</SelectItem>
                </SelectContent>
              </Select>
            </div>

            {isFileUpload && (
              <>
                <div className="space-y-2">
                  <Label htmlFor="add-files">Dateien (mehrere möglich)</Label>
                  <Input
                    id="add-files"
                    type="file"
                    accept={addMediaType === "audio" ? "audio/*" : "video/*"}
                    multiple
                    onChange={(e) => handleFilesSelected(e.target.files)}
                    data-ocid="media-file-input"
                  />
                  {uploadItems.length > 0 && (
                    <div className="space-y-3 mt-3">
                      <p className="text-sm font-medium">
                        {uploadItems.length} Datei(en)
                      </p>
                      {uploadItems.map((item, idx) => (
                        <Card
                          key={`upload-${item.file.name}-${idx}`}
                          className="p-3"
                        >
                          <div className="space-y-2">
                            <div className="flex items-center justify-between">
                              <span className="text-sm font-medium truncate flex-1">
                                {item.file.name}
                              </span>
                              <Button
                                variant="ghost"
                                size="sm"
                                onClick={() =>
                                  setUploadItems(
                                    uploadItems.filter((_, i) => i !== idx),
                                  )
                                }
                                aria-label="Entfernen"
                              >
                                <X className="h-4 w-4" />
                              </Button>
                            </div>
                            <Input
                              value={item.title}
                              onChange={(e) => {
                                const updated = [...uploadItems];
                                updated[idx] = {
                                  ...updated[idx],
                                  title: e.target.value,
                                };
                                setUploadItems(updated);
                              }}
                              placeholder="Titel"
                              className="h-8 text-sm"
                            />
                            <Input
                              type="file"
                              accept="image/*"
                              onChange={(e) => {
                                const updated = [...uploadItems];
                                updated[idx] = {
                                  ...updated[idx],
                                  thumbnail: e.target.files?.[0] ?? null,
                                };
                                setUploadItems(updated);
                              }}
                              className="h-8 text-xs"
                            />
                            {item.thumbnail && (
                              <p className="text-xs text-muted-foreground">
                                ✓ Thumbnail: {item.thumbnail.name}
                              </p>
                            )}
                            {uploadProgress[item.file.name] !== undefined && (
                              <Progress
                                value={uploadProgress[item.file.name]}
                              />
                            )}
                          </div>
                        </Card>
                      ))}
                    </div>
                  )}
                </div>
                <div className="flex gap-2">
                  <Button
                    onClick={handleBulkUpload}
                    disabled={isBulkUploading || uploadItems.length === 0}
                    data-ocid="media-bulk-upload"
                  >
                    {isBulkUploading ? (
                      <>
                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                        Hochladen...
                      </>
                    ) : (
                      <>
                        <Upload className="mr-2 h-4 w-4" />
                        Alle hochladen
                      </>
                    )}
                  </Button>
                  <Button variant="outline" onClick={closeAddForm}>
                    <X className="mr-2 h-4 w-4" />
                    Abbrechen
                  </Button>
                </div>
              </>
            )}

            {isLinkBased && (
              <>
                <div className="space-y-2">
                  <Label htmlFor="link-title">Titel *</Label>
                  <Input
                    id="link-title"
                    value={addLinkForm.title}
                    onChange={(e) =>
                      setAddLinkForm({ ...addLinkForm, title: e.target.value })
                    }
                    placeholder="z.B. Mein Song"
                    data-ocid="media-link-title"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="link-desc">Beschreibung</Label>
                  <Textarea
                    id="link-desc"
                    value={addLinkForm.description}
                    onChange={(e) =>
                      setAddLinkForm({
                        ...addLinkForm,
                        description: e.target.value,
                      })
                    }
                    rows={2}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="link-url">URL *</Label>
                  <Input
                    id="link-url"
                    value={addLinkForm.url}
                    onChange={(e) =>
                      setAddLinkForm({ ...addLinkForm, url: e.target.value })
                    }
                    placeholder={
                      addMediaType === "youtube"
                        ? "https://www.youtube.com/watch?v=..."
                        : "https://open.spotify.com/track/..."
                    }
                    data-ocid="media-link-url"
                  />
                </div>
                <div className="flex gap-2">
                  <Button
                    onClick={handleLinkSubmit}
                    disabled={addMutation.isPending}
                    data-ocid="media-link-save"
                  >
                    {addMutation.isPending ? (
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
                  <Button variant="outline" onClick={closeAddForm}>
                    <X className="mr-2 h-4 w-4" />
                    Abbrechen
                  </Button>
                </div>
              </>
            )}
          </CardContent>
        </Card>
      )}

      <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-3">
        {mediaItems?.map((item) => (
          <Card key={Number(item.id)} className="overflow-hidden">
            <CardHeader className="pb-2">
              <div className="flex justify-between items-start gap-2">
                <div className="flex-1 min-w-0">
                  <CardTitle className="text-sm truncate">
                    {item.title}
                  </CardTitle>
                  <CardDescription className="text-xs mt-0.5 capitalize">
                    {item.mediaType}
                  </CardDescription>
                </div>
                <div className="flex gap-1 shrink-0">
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => handleEdit(item)}
                    aria-label="Bearbeiten"
                  >
                    <Pencil className="h-3.5 w-3.5" />
                  </Button>
                  <AlertDialog>
                    <AlertDialogTrigger asChild>
                      <Button
                        variant="ghost"
                        size="sm"
                        disabled={deleteMutation.isPending}
                        aria-label="Löschen"
                      >
                        <Trash2 className="h-3.5 w-3.5 text-destructive" />
                      </Button>
                    </AlertDialogTrigger>
                    <AlertDialogContent>
                      <AlertDialogHeader>
                        <AlertDialogTitle>Löschen?</AlertDialogTitle>
                        <AlertDialogDescription>
                          <strong>„{item.title}"</strong> endgültig löschen?
                        </AlertDialogDescription>
                      </AlertDialogHeader>
                      <AlertDialogFooter>
                        <AlertDialogCancel>Abbrechen</AlertDialogCancel>
                        <AlertDialogAction
                          onClick={() => deleteMutation.mutate(item.id)}
                          className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                        >
                          Löschen
                        </AlertDialogAction>
                      </AlertDialogFooter>
                    </AlertDialogContent>
                  </AlertDialog>
                </div>
              </div>
            </CardHeader>

            {editingId === item.id ? (
              <CardContent className="space-y-2 pt-0">
                <Input
                  value={editFormData.title}
                  onChange={(e) =>
                    setEditFormData({ ...editFormData, title: e.target.value })
                  }
                  placeholder="Titel"
                  className="h-8 text-sm"
                />
                <Textarea
                  value={editFormData.description}
                  onChange={(e) =>
                    setEditFormData({
                      ...editFormData,
                      description: e.target.value,
                    })
                  }
                  rows={2}
                  className="text-sm"
                />
                {(editFormData.mediaType === "spotify" ||
                  editFormData.mediaType === "youtube") && (
                  <Input
                    value={editFormData.url}
                    onChange={(e) =>
                      setEditFormData({ ...editFormData, url: e.target.value })
                    }
                    placeholder="URL"
                    className="h-8 text-sm"
                  />
                )}
                <div className="flex gap-2">
                  <Button
                    onClick={handleUpdateSubmit}
                    disabled={updateMutation.isPending}
                    size="sm"
                  >
                    {updateMutation.isPending ? (
                      <Loader2 className="h-3 w-3 animate-spin" />
                    ) : (
                      <Save className="h-3 w-3" />
                    )}
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => {
                      setEditingId(null);
                      setEditFormData(EMPTY_EDIT);
                    }}
                  >
                    Abbrechen
                  </Button>
                </div>
              </CardContent>
            ) : (
              <CardContent className="pt-0">
                <p className="text-xs text-primary break-all truncate">
                  {item.url.startsWith("media/")
                    ? "Hochgeladene Datei"
                    : item.url}
                </p>
              </CardContent>
            )}
          </Card>
        ))}
      </div>

      {(!mediaItems || mediaItems.length === 0) && !showAddForm && (
        <div
          className="text-center py-12 text-muted-foreground"
          data-ocid="media-empty"
        >
          <ImageIcon className="w-8 h-8 mx-auto mb-2 opacity-30" />
          <p className="text-sm">Noch keine Medien.</p>
        </div>
      )}
    </div>
  );
}

// ─── Main export ──────────────────────────────────────────────────────────────

export default function AdminMedia() {
  return (
    <div className="space-y-4">
      <Tabs defaultValue="einzeln">
        <TabsList>
          <TabsTrigger value="einzeln">
            <Music className="mr-2 h-4 w-4" />
            Einzel-Medien
          </TabsTrigger>
          <TabsTrigger value="alben">
            <Disc className="mr-2 h-4 w-4" />
            Alben
          </TabsTrigger>
        </TabsList>
        <TabsContent value="einzeln" className="mt-4">
          <MediaItemsSection />
        </TabsContent>
        <TabsContent value="alben" className="mt-4">
          <AlbumsSection />
        </TabsContent>
      </Tabs>
    </div>
  );
}
