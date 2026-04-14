import { useFileUpload, useFileUrl } from "@/blob-storage/FileStorage";
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
import {
  applyFaviconToDocument,
  useFaviconUrl,
  useLogoSizePercent,
  useSiteLogoUrl,
  useUpdateFaviconUrl,
  useUpdateLogoSizePercent,
  useUpdateSiteLogoUrl,
} from "@/hooks/useQueries";
import { Globe, Image as ImageIcon, Loader2, Save, Upload } from "lucide-react";
import { useEffect, useRef, useState } from "react";
import { toast } from "sonner";

// ─── Preview helpers ──────────────────────────────────────────────────────────

function LogoPreview({ url }: { url: string }) {
  const { data: blobUrl } = useFileUrl(url);
  const displayUrl = blobUrl ?? (url.startsWith("http") ? url : null);
  if (!displayUrl) return null;
  return (
    <div className="border border-border rounded-lg p-3 bg-muted/30 w-fit">
      <img
        src={displayUrl}
        alt="Aktuelles Logo"
        className="h-16 w-auto object-contain"
      />
    </div>
  );
}

function FaviconPreview({ url }: { url: string }) {
  const { data: blobUrl } = useFileUrl(url.startsWith("http") ? "" : url);
  const displayUrl = blobUrl ?? (url.startsWith("http") ? url : null) ?? url;
  if (!displayUrl) return null;
  return (
    <div className="border border-border rounded-lg p-2 bg-muted/30 w-fit">
      <img
        src={displayUrl}
        alt="Aktuelles Favicon"
        className="w-8 h-8 object-contain"
        style={{ imageRendering: "pixelated" }}
      />
    </div>
  );
}

// ─── Header Logo section ──────────────────────────────────────────────────────

function HeaderLogoSection() {
  const { data: currentUrl, isLoading } = useSiteLogoUrl();
  const { data: logoSizePct, isLoading: sizeLoading } = useLogoSizePercent();
  const { uploadFile, isUploading } = useFileUpload();
  const { mutateAsync: updateLogoUrl, isPending: isSaving } =
    useUpdateSiteLogoUrl();
  const { mutateAsync: updateLogoSize, isPending: isSavingSize } =
    useUpdateLogoSizePercent();

  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [preview, setPreview] = useState<string | null>(null);
  const [sizeValue, setSizeValue] = useState<number>(100);
  const fileRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (logoSizePct !== undefined) setSizeValue(Number(logoSizePct));
  }, [logoSizePct]);

  const handleFileChange = (file: File | null) => {
    setSelectedFile(file);
    setPreview(file ? URL.createObjectURL(file) : null);
  };

  const handleUpload = async () => {
    if (!selectedFile) return;
    try {
      const path = `logo/${Date.now()}-${selectedFile.name}`;
      const result = await uploadFile(path, selectedFile);
      await updateLogoUrl(result.path);
      toast.success("Header-Logo erfolgreich gespeichert");
      setSelectedFile(null);
      setPreview(null);
    } catch (err: unknown) {
      toast.error(err instanceof Error ? err.message : "Fehler beim Hochladen");
    }
  };

  const handleSaveSize = async () => {
    try {
      await updateLogoSize(BigInt(sizeValue));
      toast.success(`Logo-Größe auf ${sizeValue}% gesetzt`);
    } catch (err: unknown) {
      toast.error(err instanceof Error ? err.message : "Fehler");
    }
  };

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center gap-2">
          <Globe className="w-5 h-5 text-primary" />
          <CardTitle>Header Logo</CardTitle>
        </div>
        <CardDescription>
          Erscheint links im Header der Website. Empfohlen: PNG oder SVG,
          breites Format (z.B. 400×100px).
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Current logo */}
        {isLoading ? (
          <div className="flex items-center gap-2 text-muted-foreground text-sm">
            <Loader2 className="w-4 h-4 animate-spin" /> Lade Logo…
          </div>
        ) : currentUrl ? (
          <div className="space-y-2">
            <p className="text-sm font-medium">Aktuelles Logo</p>
            <LogoPreview url={currentUrl} />
          </div>
        ) : (
          <p className="text-sm text-muted-foreground">
            Noch kein Logo hochgeladen.
          </p>
        )}

        {/* Upload */}
        <div className="space-y-3">
          <p className="text-sm font-medium">Neues Logo hochladen</p>
          <button
            type="button"
            className="w-full max-w-xs border-2 border-dashed border-border rounded-xl overflow-hidden cursor-pointer hover:border-primary/50 transition-colors"
            style={{ minHeight: 100 }}
            onClick={() => fileRef.current?.click()}
            aria-label="Logo auswählen"
          >
            {preview ? (
              <img
                src={preview}
                alt="Vorschau"
                className="w-full h-24 object-contain p-2"
              />
            ) : (
              <div className="flex flex-col items-center justify-center h-24 text-muted-foreground gap-2">
                <Upload className="w-6 h-6 opacity-40" />
                <span className="text-sm">Klicken zum Auswählen</span>
                <span className="text-xs opacity-60">PNG, SVG, WebP, ICO</span>
              </div>
            )}
          </button>
          <input
            ref={fileRef}
            type="file"
            accept="image/*"
            className="sr-only"
            onChange={(e) => handleFileChange(e.target.files?.[0] ?? null)}
            data-ocid="logo-file-input"
          />
          {selectedFile && (
            <p className="text-xs text-muted-foreground">
              ✓ {selectedFile.name} ({(selectedFile.size / 1024).toFixed(1)} KB)
            </p>
          )}
          <Button
            onClick={handleUpload}
            disabled={isUploading || isSaving || !selectedFile}
            data-ocid="logo-upload-btn"
          >
            {isUploading || isSaving ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Hochladen…
              </>
            ) : (
              <>
                <Upload className="mr-2 h-4 w-4" />
                Hochladen & speichern
              </>
            )}
          </Button>
        </div>

        <Separator />

        {/* Size control */}
        <div className="space-y-3">
          <p className="text-sm font-medium">Logo-Größe im Header</p>
          {sizeLoading ? (
            <div className="flex items-center gap-2 text-muted-foreground text-sm">
              <Loader2 className="w-4 h-4 animate-spin" /> Lade Einstellung…
            </div>
          ) : (
            <div className="space-y-3">
              <div className="space-y-2">
                <Label htmlFor="logo-size">
                  Größe:{" "}
                  <span className="text-primary font-bold">{sizeValue}%</span>
                </Label>
                <div className="flex items-center gap-3">
                  <Input
                    id="logo-size"
                    type="range"
                    min={20}
                    max={200}
                    step={5}
                    value={sizeValue}
                    onChange={(e) => setSizeValue(Number(e.target.value))}
                    className="flex-1 h-2 p-0 border-0 cursor-pointer"
                    data-ocid="logo-size-slider"
                  />
                  <Input
                    type="number"
                    min={20}
                    max={200}
                    value={sizeValue}
                    onChange={(e) =>
                      setSizeValue(
                        Math.min(200, Math.max(20, Number(e.target.value))),
                      )
                    }
                    className="w-20 text-center"
                    data-ocid="logo-size-input"
                  />
                  <span className="text-sm text-muted-foreground">%</span>
                </div>
                <p className="text-xs text-muted-foreground">
                  Bereich: 20%–200% · Max. Breite:{" "}
                  {Math.round((sizeValue / 100) * 200)}px
                </p>
              </div>
              <Button
                onClick={handleSaveSize}
                disabled={isSavingSize}
                variant="outline"
                data-ocid="logo-size-save"
              >
                {isSavingSize ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Speichern…
                  </>
                ) : (
                  <>
                    <Save className="mr-2 h-4 w-4" />
                    Größe speichern
                  </>
                )}
              </Button>
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
}

// ─── Favicon section ──────────────────────────────────────────────────────────

function FaviconSection() {
  const { data: currentUrl } = useFaviconUrl();
  const { uploadFile, isUploading } = useFileUpload();
  const { mutateAsync: updateFaviconUrl, isPending: isSaving } =
    useUpdateFaviconUrl();

  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [preview, setPreview] = useState<string | null>(null);
  const fileRef = useRef<HTMLInputElement>(null);

  // Apply favicon from storage on mount
  useEffect(() => {
    if (currentUrl) applyFaviconToDocument(currentUrl);
  }, [currentUrl]);

  const handleFileChange = (file: File | null) => {
    setSelectedFile(file);
    setPreview(file ? URL.createObjectURL(file) : null);
  };

  const handleUpload = async () => {
    if (!selectedFile) return;
    try {
      const path = `favicon/${Date.now()}-${selectedFile.name}`;
      const result = await uploadFile(path, selectedFile);
      await updateFaviconUrl(result.path);
      applyFaviconToDocument(result.path);
      toast.success("Favicon erfolgreich gespeichert");
      setSelectedFile(null);
      setPreview(null);
    } catch (err: unknown) {
      toast.error(err instanceof Error ? err.message : "Fehler beim Hochladen");
    }
  };

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center gap-2">
          <ImageIcon className="w-5 h-5 text-primary" />
          <CardTitle>Browser Favicon</CardTitle>
        </div>
        <CardDescription>
          Erscheint als kleines Icon im Browser-Tab und in Lesezeichen.
          Empfohlen: quadratisches PNG oder ICO (z.B. 64×64px oder 32×32px).
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-5">
        {/* Current favicon */}
        {currentUrl ? (
          <div className="space-y-2">
            <p className="text-sm font-medium">Aktuelles Favicon</p>
            <div className="flex items-center gap-4">
              <FaviconPreview url={currentUrl} />
              <div className="text-xs text-muted-foreground">
                <p>Vorschau (32×32px)</p>
                <p className="opacity-60 mt-0.5 font-mono truncate max-w-48">
                  {currentUrl}
                </p>
              </div>
            </div>
          </div>
        ) : (
          <p className="text-sm text-muted-foreground">
            Noch kein Favicon hochgeladen. Es wird das Standard-Favicon
            verwendet.
          </p>
        )}

        {/* Upload */}
        <div className="space-y-3">
          <p className="text-sm font-medium">Neues Favicon hochladen</p>
          <button
            type="button"
            className="border-2 border-dashed border-border rounded-lg overflow-hidden cursor-pointer hover:border-primary/50 transition-colors"
            style={{ width: 80, height: 80 }}
            onClick={() => fileRef.current?.click()}
            aria-label="Favicon auswählen"
          >
            {preview ? (
              <img
                src={preview}
                alt="Vorschau"
                className="w-full h-full object-contain p-1"
                style={{ imageRendering: "pixelated" }}
              />
            ) : (
              <div className="flex flex-col items-center justify-center w-full h-full text-muted-foreground gap-1">
                <Upload className="w-5 h-5 opacity-40" />
                <span className="text-[10px] text-center leading-tight">
                  PNG / ICO
                </span>
              </div>
            )}
          </button>
          <input
            ref={fileRef}
            type="file"
            accept="image/png,image/x-icon,image/svg+xml,image/webp"
            className="sr-only"
            onChange={(e) => handleFileChange(e.target.files?.[0] ?? null)}
            data-ocid="favicon-file-input"
          />
          {selectedFile && (
            <p className="text-xs text-muted-foreground">
              ✓ {selectedFile.name} ({(selectedFile.size / 1024).toFixed(1)} KB)
            </p>
          )}
          <Button
            onClick={handleUpload}
            disabled={isUploading || isSaving || !selectedFile}
            data-ocid="favicon-upload-btn"
          >
            {isUploading || isSaving ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Hochladen…
              </>
            ) : (
              <>
                <Upload className="mr-2 h-4 w-4" />
                Hochladen & speichern
              </>
            )}
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}

// ─── Main export ──────────────────────────────────────────────────────────────

export default function AdminSiteLogo() {
  return (
    <div className="space-y-6">
      <HeaderLogoSection />
      <FaviconSection />
    </div>
  );
}
