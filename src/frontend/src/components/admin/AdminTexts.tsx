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
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Textarea } from "@/components/ui/textarea";
import { useActor } from "@/hooks/useActor";
import {
  type SiteTexts,
  useSiteTexts,
  useUpdateSiteTexts,
} from "@/hooks/useQueries";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { Image as ImageIcon, Info, Loader2, Save, Upload } from "lucide-react";
import { useEffect, useRef, useState } from "react";
import { toast } from "sonner";

// ─── Hero background image upload ────────────────────────────────────────────

function HeroBgUpload() {
  const { actor } = useActor();
  const { uploadFile, isUploading } = useFileUpload();
  const queryClient = useQueryClient();

  const { data: heroData } = useQuery({
    queryKey: ["hero-section"],
    queryFn: async () => {
      if (!actor) return null;
      return actor.getHeroSection();
    },
    enabled: !!actor,
  });

  const [file, setFile] = useState<File | null>(null);
  const [preview, setPreview] = useState<string | null>(null);
  const fileRef = useRef<HTMLInputElement>(null);
  const { data: existingBgUrl } = useFileUrl(
    heroData?.backgroundImageUrl ?? "",
  );

  const handleFileChange = (f: File | null) => {
    setFile(f);
    setPreview(f ? URL.createObjectURL(f) : null);
  };

  const handleUpload = async () => {
    if (!file || !actor) return;
    try {
      const path = `hero/${Date.now()}-${file.name}`;
      const result = await uploadFile(path, file);
      await actor.updateHeroSection({
        ...(heroData ?? {
          headline: "",
          subheadline: "",
          ctaPrimary: "",
          ctaSecondary: "",
        }),
        backgroundImageUrl: result.path,
      });
      queryClient.invalidateQueries({ queryKey: ["hero-section"] });
      toast.success("Hero-Hintergrundbild gespeichert");
      setFile(null);
      setPreview(null);
    } catch (err: unknown) {
      toast.error(err instanceof Error ? err.message : "Fehler beim Hochladen");
    }
  };

  const displaySrc = preview ?? existingBgUrl ?? null;

  return (
    <div className="space-y-3">
      <Label>Hero-Hintergrundbild (optional)</Label>
      <button
        type="button"
        className="w-full max-w-xs border-2 border-dashed border-border rounded-lg overflow-hidden cursor-pointer hover:border-primary/50 transition-colors"
        style={{ minHeight: 100 }}
        onClick={() => fileRef.current?.click()}
        aria-label="Hero-Hintergrundbild auswählen"
      >
        {displaySrc ? (
          <img
            src={displaySrc}
            alt="Hero-Hintergrund"
            className="w-full h-24 object-cover"
          />
        ) : (
          <div className="flex flex-col items-center justify-center h-24 text-muted-foreground gap-2">
            <ImageIcon className="w-6 h-6 opacity-40" />
            <span className="text-xs">Klicken zum Auswählen</span>
          </div>
        )}
      </button>
      <input
        ref={fileRef}
        type="file"
        accept="image/*"
        className="sr-only"
        onChange={(e) => handleFileChange(e.target.files?.[0] ?? null)}
      />
      {file && <p className="text-xs text-muted-foreground">✓ {file.name}</p>}
      <Button
        onClick={handleUpload}
        disabled={isUploading || !file}
        size="sm"
        data-ocid="texts-hero-bg-upload"
      >
        {isUploading ? (
          <>
            <Loader2 className="mr-2 h-3 w-3 animate-spin" />
            Hochladen...
          </>
        ) : (
          <>
            <Upload className="mr-2 h-3 w-3" />
            Hochladen
          </>
        )}
      </Button>
    </div>
  );
}

// ─── Landing tab ──────────────────────────────────────────────────────────────

function LandingTab() {
  const { actor } = useActor();
  const queryClient = useQueryClient();

  const { data: heroData } = useQuery({
    queryKey: ["hero-section"],
    queryFn: async () => {
      if (!actor) return null;
      return actor.getHeroSection();
    },
    enabled: !!actor,
  });

  const { data: aboutData } = useQuery({
    queryKey: ["about-section"],
    queryFn: async () => {
      if (!actor) return null;
      return actor.getAboutSection();
    },
    enabled: !!actor,
  });

  const { data: contactData } = useQuery({
    queryKey: ["contact-info"],
    queryFn: async () => {
      if (!actor) return null;
      return actor.getContactInfo();
    },
    enabled: !!actor,
  });

  const [heroHeadline, setHeroHeadline] = useState("");
  const [heroSubheadline, setHeroSubheadline] = useState("");
  const [heroCtaPrimary, setHeroCtaPrimary] = useState("");
  const [heroCtaSecondary, setHeroCtaSecondary] = useState("");
  const [aboutTitle, setAboutTitle] = useState("");
  const [aboutContent, setAboutContent] = useState("");
  const [contactEmail, setContactEmail] = useState("");
  const [contactAddress, setContactAddress] = useState("");

  useEffect(() => {
    if (heroData) {
      setHeroHeadline(heroData.headline ?? "");
      setHeroSubheadline(heroData.subheadline ?? "");
      setHeroCtaPrimary(heroData.ctaPrimary ?? "");
      setHeroCtaSecondary(heroData.ctaSecondary ?? "");
    }
  }, [heroData]);

  useEffect(() => {
    if (aboutData) {
      setAboutTitle(aboutData.title ?? "");
      setAboutContent(aboutData.content ?? "");
    }
  }, [aboutData]);

  useEffect(() => {
    if (contactData) {
      setContactEmail(contactData.email ?? "");
      setContactAddress(contactData.address ?? "");
    }
  }, [contactData]);

  const updateHeroMutation = useMutation({
    mutationFn: async () => {
      if (!actor) throw new Error("Actor not available");
      await actor.updateHeroSection({
        headline: heroHeadline,
        subheadline: heroSubheadline,
        ctaPrimary: heroCtaPrimary,
        ctaSecondary: heroCtaSecondary,
        backgroundImageUrl: heroData?.backgroundImageUrl,
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["hero-section"] });
      toast.success("Hero-Texte gespeichert");
    },
    onError: (e: Error) => toast.error(e.message),
  });

  const updateAboutMutation = useMutation({
    mutationFn: async () => {
      if (!actor) throw new Error("Actor not available");
      await actor.updateAboutSection({
        title: aboutTitle,
        content: aboutContent,
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["about-section"] });
      toast.success("Über-mich-Text gespeichert");
    },
    onError: (e: Error) => toast.error(e.message),
  });

  const updateContactMutation = useMutation({
    mutationFn: async () => {
      if (!actor) throw new Error("Actor not available");
      await actor.updateContactInfo({
        name: "Everblack Music",
        email: contactEmail,
        address: contactAddress,
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["contact-info"] });
      toast.success("Kontaktdaten gespeichert");
    },
    onError: (e: Error) => toast.error(e.message),
  });

  return (
    <div className="space-y-6">
      {/* Hero */}
      <Card>
        <CardHeader>
          <CardTitle>Hero-Bereich</CardTitle>
          <CardDescription>
            Hauptüberschrift und CTA-Buttons der Startseite
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid sm:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="hero-headline">Überschrift</Label>
              <Input
                id="hero-headline"
                value={heroHeadline}
                onChange={(e) => setHeroHeadline(e.target.value)}
                placeholder="Professioneller Gitarrenunterricht mit System!"
                data-ocid="texts-hero-headline"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="hero-sub">Untertitel</Label>
              <Input
                id="hero-sub"
                value={heroSubheadline}
                onChange={(e) => setHeroSubheadline(e.target.value)}
                placeholder="Gitarrenunterricht in Aachen & online"
                data-ocid="texts-hero-subheadline"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="hero-cta1">Button 1 (Primär)</Label>
              <Input
                id="hero-cta1"
                value={heroCtaPrimary}
                onChange={(e) => setHeroCtaPrimary(e.target.value)}
                placeholder="Jetzt anfragen"
                data-ocid="texts-hero-cta1"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="hero-cta2">Button 2 (Sekundär)</Label>
              <Input
                id="hero-cta2"
                value={heroCtaSecondary}
                onChange={(e) => setHeroCtaSecondary(e.target.value)}
                placeholder="Unterrichtsmodelle"
                data-ocid="texts-hero-cta2"
              />
            </div>
          </div>
          <HeroBgUpload />
          <Button
            onClick={() => updateHeroMutation.mutate()}
            disabled={updateHeroMutation.isPending}
            data-ocid="texts-hero-save"
          >
            {updateHeroMutation.isPending ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Speichern...
              </>
            ) : (
              <>
                <Save className="mr-2 h-4 w-4" />
                Texte speichern
              </>
            )}
          </Button>
        </CardContent>
      </Card>

      {/* About */}
      <Card>
        <CardHeader>
          <CardTitle>Über mich</CardTitle>
          <CardDescription>Biografie und Abschnittstitel</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="about-title">Titel</Label>
            <Input
              id="about-title"
              value={aboutTitle}
              onChange={(e) => setAboutTitle(e.target.value)}
              placeholder="Über mich"
              data-ocid="texts-about-title"
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="about-content">Inhalt / Biografie</Label>
            <Textarea
              id="about-content"
              value={aboutContent}
              onChange={(e) => setAboutContent(e.target.value)}
              placeholder="Deine Biografie..."
              rows={8}
              data-ocid="texts-about-content"
            />
          </div>
          <Button
            onClick={() => updateAboutMutation.mutate()}
            disabled={updateAboutMutation.isPending}
            data-ocid="texts-about-save"
          >
            {updateAboutMutation.isPending ? (
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

      {/* Contact */}
      <Card>
        <CardHeader>
          <CardTitle>Kontaktinformationen</CardTitle>
          <CardDescription>
            E-Mail und Adresse (keine Telefonnummer)
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="contact-email">E-Mail</Label>
            <Input
              id="contact-email"
              value={contactEmail}
              onChange={(e) => setContactEmail(e.target.value)}
              placeholder="info@everblackmusic.com"
              data-ocid="texts-contact-email"
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="contact-address">Adresse</Label>
            <Textarea
              id="contact-address"
              value={contactAddress}
              onChange={(e) => setContactAddress(e.target.value)}
              placeholder="Bergische Gasse 9, 52064 Aachen"
              rows={3}
              data-ocid="texts-contact-address"
            />
          </div>
          <Button
            onClick={() => updateContactMutation.mutate()}
            disabled={updateContactMutation.isPending}
            data-ocid="texts-contact-save"
          >
            {updateContactMutation.isPending ? (
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

// ─── Page-specific texts tab ──────────────────────────────────────────────────

type PageTextFields = {
  headline: keyof SiteTexts;
  intro: keyof SiteTexts;
  cta?: keyof SiteTexts;
  footerCopyright?: keyof SiteTexts;
};

const PAGE_CONFIGS: Record<
  string,
  {
    label: string;
    fields: PageTextFields;
    headlinePlaceholder: string;
    introPlaceholder: string;
    ctaPlaceholder?: string;
  }
> = {
  unterricht: {
    label: "Unterricht",
    fields: {
      headline: "unterrichtHeadline",
      intro: "unterrichtIntro",
      cta: "unterrichtCTA",
    },
    headlinePlaceholder: "Gitarrenunterricht",
    introPlaceholder: "Professioneller Gitarrenunterricht in Aachen & online.",
    ctaPlaceholder: "Jetzt Kontakt aufnehmen",
  },
  studio: {
    label: "Studio",
    fields: {
      headline: "studioHeadline",
      intro: "studioIntro",
      cta: "studioCTA",
    },
    headlinePlaceholder: "Studio Services",
    introPlaceholder: "Professionelle Aufnahmen, Mixing und Mastering.",
    ctaPlaceholder: "Jetzt anfragen",
  },
  media: {
    label: "Medien",
    fields: { headline: "mediaHeadline", intro: "mediaIntro", cta: "mediaCTA" },
    headlinePlaceholder: "Musik & Medien",
    introPlaceholder: "Projekte, Aufnahmen und Kollaborationen.",
    ctaPlaceholder: "",
  },
  shop: {
    label: "Shop",
    fields: { headline: "shopHeadline", intro: "shopIntro", cta: "shopCTA" },
    headlinePlaceholder: "Shop",
    introPlaceholder: "Digitale Produkte, Merchandise und mehr.",
    ctaPlaceholder: "Jetzt einkaufen",
  },
};

function PageTextsTab({ pageKey }: { pageKey: string }) {
  const config = PAGE_CONFIGS[pageKey];
  const { data: siteTexts } = useSiteTexts();
  const { mutateAsync: updateSiteTexts, isPending } = useUpdateSiteTexts();

  const [headline, setHeadline] = useState("");
  const [intro, setIntro] = useState("");
  const [cta, setCta] = useState("");
  const [footerCopyright, setFooterCopyright] = useState("");

  useEffect(() => {
    if (siteTexts) {
      setHeadline((siteTexts[config.fields.headline] as string) ?? "");
      setIntro((siteTexts[config.fields.intro] as string) ?? "");
      if (config.fields.cta)
        setCta((siteTexts[config.fields.cta] as string) ?? "");
      if (pageKey === "shop")
        setFooterCopyright((siteTexts.footerCopyright as string) ?? "");
    }
  }, [siteTexts, config, pageKey]);

  const handleSave = async () => {
    const updates: Partial<SiteTexts> = {
      [config.fields.headline]: headline,
      [config.fields.intro]: intro,
    };
    if (config.fields.cta) updates[config.fields.cta] = cta;
    if (pageKey === "shop") updates.footerCopyright = footerCopyright;
    try {
      await updateSiteTexts({ ...(siteTexts as SiteTexts), ...updates });
      toast.success(`${config.label}-Texte gespeichert`);
    } catch (e: unknown) {
      toast.error(e instanceof Error ? e.message : "Fehler beim Speichern");
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>{config.label}-Seite</CardTitle>
        <CardDescription>
          Texte für die dedizierte {config.label}-Seite
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="space-y-2">
          <Label>Überschrift</Label>
          <Input
            value={headline}
            onChange={(e) => setHeadline(e.target.value)}
            placeholder={config.headlinePlaceholder}
            data-ocid={`texts-${pageKey}-headline`}
          />
        </div>
        <div className="space-y-2">
          <Label>Einleitungstext</Label>
          <Textarea
            value={intro}
            onChange={(e) => setIntro(e.target.value)}
            placeholder={config.introPlaceholder}
            rows={4}
            data-ocid={`texts-${pageKey}-intro`}
          />
        </div>
        {config.fields.cta !== undefined && (
          <div className="space-y-2">
            <Label>CTA-Button Text</Label>
            <Input
              value={cta}
              onChange={(e) => setCta(e.target.value)}
              placeholder={config.ctaPlaceholder ?? "Button-Text"}
              data-ocid={`texts-${pageKey}-cta`}
            />
            <p className="text-xs text-muted-foreground">
              Text des Handlungsaufforderungs-Buttons. Leer lassen, um den
              Button auszublenden.
            </p>
          </div>
        )}
        {pageKey === "shop" && (
          <div className="space-y-2">
            <Label>Footer-Copyright-Text</Label>
            <Input
              value={footerCopyright}
              onChange={(e) => setFooterCopyright(e.target.value)}
              placeholder="Everblack Music"
              data-ocid="texts-footer-copyright"
            />
            <p className="text-xs text-muted-foreground">
              Erscheint im Footer als "© 2025 [Text]"
            </p>
          </div>
        )}
        <Button
          onClick={handleSave}
          disabled={isPending}
          data-ocid={`texts-${pageKey}-save`}
        >
          {isPending ? (
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
  );
}

// ─── Main export ──────────────────────────────────────────────────────────────

export default function AdminTexts() {
  return (
    <div className="space-y-4">
      <div className="flex items-start gap-3 p-4 rounded-lg bg-primary/5 border border-primary/20 text-sm">
        <Info className="w-4 h-4 text-primary mt-0.5 shrink-0" />
        <p className="text-muted-foreground">
          Alle Texte der Website können hier angepasst werden. Wähle den
          entsprechenden Tab für die jeweilige Seite.
        </p>
      </div>

      <Tabs defaultValue="landing">
        <TabsList className="w-full flex-wrap h-auto gap-1">
          <TabsTrigger value="landing">Landing</TabsTrigger>
          <TabsTrigger value="unterricht">Unterricht</TabsTrigger>
          <TabsTrigger value="studio">Studio</TabsTrigger>
          <TabsTrigger value="media">Medien</TabsTrigger>
          <TabsTrigger value="shop">Shop</TabsTrigger>
        </TabsList>

        <TabsContent value="landing" className="mt-4">
          <LandingTab />
        </TabsContent>
        <TabsContent value="unterricht" className="mt-4">
          <PageTextsTab pageKey="unterricht" />
        </TabsContent>
        <TabsContent value="studio" className="mt-4">
          <PageTextsTab pageKey="studio" />
        </TabsContent>
        <TabsContent value="media" className="mt-4">
          <PageTextsTab pageKey="media" />
        </TabsContent>
        <TabsContent value="shop" className="mt-4">
          <PageTextsTab pageKey="shop" />
        </TabsContent>
      </Tabs>
    </div>
  );
}
