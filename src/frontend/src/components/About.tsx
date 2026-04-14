import { useFileList, useFileUrl } from "@/blob-storage/FileStorage";
import ImageLightbox from "@/components/ImageLightbox";
import LazyImage from "@/components/LazyImage";
import ScrollReveal from "@/components/ScrollReveal";
import { Card, CardContent } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { useAboutSection, useFeatureCards } from "@/hooks/useQueries";
import {
  Award,
  Guitar,
  Heart,
  ImageOff,
  MapPin,
  Mic,
  Music,
  Target,
} from "lucide-react";
import { useEffect, useRef, useState } from "react";

// ─── Gallery settings (persisted in localStorage) ────────────────────────────

const GALLERY_SETTINGS_KEY = "everblack-about-gallery-settings";

type GalleryLayout = "grid" | "masonry";
type GalleryObjectFit = "cover" | "contain";
type GalleryAspectRatio = "square" | "landscape" | "portrait";

export interface GallerySettings {
  layout: GalleryLayout;
  objectFit: GalleryObjectFit;
  aspectRatio: GalleryAspectRatio;
}

const DEFAULT_GALLERY_SETTINGS: GallerySettings = {
  layout: "grid",
  objectFit: "cover",
  aspectRatio: "square",
};

export function loadGallerySettings(): GallerySettings {
  try {
    const raw = localStorage.getItem(GALLERY_SETTINGS_KEY);
    if (!raw) return DEFAULT_GALLERY_SETTINGS;
    return { ...DEFAULT_GALLERY_SETTINGS, ...JSON.parse(raw) };
  } catch {
    return DEFAULT_GALLERY_SETTINGS;
  }
}

const ASPECT_RATIO_CLASS: Record<GalleryAspectRatio, string> = {
  square: "aspect-square",
  landscape: "aspect-[4/3]",
  portrait: "aspect-[3/4]",
};

const DEFAULT_ABOUT = {
  title: "Über mich",
  content:
    "Ich bin Sebastian, Gitarrenlehrer aus Aachen mit über 10 Jahren Erfahrung. Ich unterrichte alle Levels — vom absoluten Anfänger bis zum fortgeschrittenen Spieler — sowohl vor Ort in Aachen als auch online. Mein Unterricht ist individuell auf dich zugeschnitten: Technik, Theorie und die Songs, die du wirklich spielen möchtest.",
};

const DEFAULT_FEATURE_CARDS = [
  {
    id: 1n,
    title: "10+ Jahre Erfahrung",
    subtitle: "Professioneller Unterricht",
    icon: "award",
    color: "#0D9488",
    order: 0n,
  },
  {
    id: 2n,
    title: "Individuell & Flexibel",
    subtitle: "Angepasst an dein Level",
    icon: "target",
    color: "#0D9488",
    order: 1n,
  },
  {
    id: 3n,
    title: "Alle Levels",
    subtitle: "Anfänger bis Fortgeschrittene",
    icon: "guitar",
    color: "#0D9488",
    order: 2n,
  },
  {
    id: 4n,
    title: "Aachen & Umgebung",
    subtitle: "Vor Ort und online",
    icon: "mappin",
    color: "#0D9488",
    order: 3n,
  },
];

const iconMap = {
  guitar: Guitar,
  award: Award,
  heart: Heart,
  target: Target,
  microphone: Mic,
  musicnote: Music,
  mappin: MapPin,
};

function FeatureCardIcon({
  iconType,
  customSvgPath,
  iconColor,
}: {
  iconType: string;
  customSvgPath?: string;
  iconColor: string;
}) {
  const { data: customIconUrl } = useFileUrl(customSvgPath || "");

  if (customSvgPath && customIconUrl) {
    return (
      <img
        src={customIconUrl}
        alt="Icon"
        className="w-8 h-8 mb-3"
        style={{ filter: `brightness(0) saturate(100%) ${iconColor}` }}
      />
    );
  }

  const IconComponent = iconMap[iconType as keyof typeof iconMap] ?? Guitar;
  return (
    <IconComponent
      className="icon-xl mb-3 flex-shrink-0"
      style={{ color: iconColor }}
    />
  );
}

type GalleryImage = { path: string };

function GalleryItem({
  path,
  index,
  onOpen,
  settings,
}: {
  path: string;
  index: number;
  onOpen: (i: number) => void;
  settings: GallerySettings;
}) {
  const { data: url } = useFileUrl(path);
  const alt =
    path
      .split("/")
      .pop()
      ?.replace(/\.[^.]+$/, "") ?? "Foto";
  if (!url) return null;

  const aspectClass = ASPECT_RATIO_CLASS[settings.aspectRatio];
  const fitClass =
    settings.objectFit === "contain" ? "object-contain" : "object-cover";

  return (
    <div
      className={`relative overflow-hidden rounded-lg border border-border/50 group cursor-pointer focus-within:ring-2 focus-within:ring-ring ${aspectClass}`}
    >
      <LazyImage
        src={url}
        alt={alt}
        className={`w-full h-full ${fitClass} transition-transform duration-500 group-hover:scale-105`}
        onClick={() => onOpen(index)}
        wrapperClassName="w-full h-full"
      />
      <div className="absolute inset-0 bg-primary/0 group-hover:bg-primary/10 transition-colors duration-300 pointer-events-none rounded-lg" />
    </div>
  );
}

function GalleryGrid({
  images,
  onOpen,
  settings,
}: {
  images: GalleryImage[];
  onOpen: (i: number) => void;
  settings: GallerySettings;
}) {
  if (images.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center gap-3 py-10 text-muted-foreground border border-dashed border-border/50 rounded-lg mb-14">
        <ImageOff className="w-8 h-8 opacity-40" />
        <p className="text-sm">
          Fotos können im Admin-Panel hinzugefügt werden
        </p>
      </div>
    );
  }

  const gridClass =
    settings.layout === "masonry"
      ? "columns-2 md:columns-4 gap-3 space-y-3 mb-14"
      : "grid grid-cols-2 md:grid-cols-4 gap-3 mb-14";

  if (settings.layout === "masonry") {
    return (
      <div className={gridClass} data-ocid="about-gallery">
        {images.map((image, index) => (
          <div key={image.path} className="break-inside-avoid">
            <GalleryItem
              path={image.path}
              index={index}
              onOpen={onOpen}
              settings={settings}
            />
          </div>
        ))}
      </div>
    );
  }

  return (
    <div className={gridClass} data-ocid="about-gallery">
      {images.map((image, index) => (
        <GalleryItem
          key={image.path}
          path={image.path}
          index={index}
          onOpen={onOpen}
          settings={settings}
        />
      ))}
    </div>
  );
}

function LightboxResolver({
  path,
  total,
  onClose,
  onPrev,
  onNext,
}: {
  path: string;
  total: number;
  onClose: () => void;
  onPrev: () => void;
  onNext: () => void;
}) {
  const { data: url } = useFileUrl(path);
  const alt =
    path
      .split("/")
      .pop()
      ?.replace(/\.[^.]+$/, "") ?? "Foto";
  if (!url) return null;
  return (
    <ImageLightbox
      src={url}
      alt={alt}
      isOpen={true}
      onClose={onClose}
      onPrev={onPrev}
      onNext={onNext}
      hasNav={total > 1}
    />
  );
}

export default function About() {
  const [lightboxIndex, setLightboxIndex] = useState<number | null>(null);
  // Fallback: after 8s always show content regardless of loading state
  const [timedOut, setTimedOut] = useState(false);
  const timeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  // Load gallery display settings from localStorage (set by admin panel)
  const [gallerySettings] = useState<GallerySettings>(() =>
    loadGallerySettings(),
  );

  const { data: aboutData, isLoading: aboutLoading } = useAboutSection();
  const { data: featureCards, isLoading: cardsLoading } = useFeatureCards();

  // Gallery loads INDEPENDENTLY — never blocks main content
  const { data: fileList, isLoading: galleryLoading } = useFileList();

  // Primary loading gate: only about + cards, NOT gallery
  const isLoadingPrimary = aboutLoading || cardsLoading;

  // Start fallback timer when loading begins
  useEffect(() => {
    if (isLoadingPrimary && !timedOut) {
      timeoutRef.current = setTimeout(() => setTimedOut(true), 8000);
    }
    return () => {
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
        timeoutRef.current = null;
      }
    };
  }, [isLoadingPrimary, timedOut]);

  // Clear timeout once data arrives
  useEffect(() => {
    if (!isLoadingPrimary && timeoutRef.current) {
      clearTimeout(timeoutRef.current);
      timeoutRef.current = null;
    }
  }, [isLoadingPrimary]);

  const displayAbout = aboutData ?? DEFAULT_ABOUT;
  const displayCards =
    featureCards && featureCards.length > 0
      ? featureCards
      : DEFAULT_FEATURE_CARDS;

  const aboutFiles = (fileList ?? [])
    .filter(
      (f) =>
        f.path.startsWith("about/") &&
        /\.(jpg|jpeg|png|webp|gif)$/i.test(f.path),
    )
    .map((f) => ({ path: f.path }));

  const openLightbox = (index: number) => setLightboxIndex(index);
  const closeLightbox = () => setLightboxIndex(null);
  const prevImage = () =>
    setLightboxIndex((i) =>
      i !== null ? (i - 1 + aboutFiles.length) % aboutFiles.length : null,
    );
  const nextImage = () =>
    setLightboxIndex((i) => (i !== null ? (i + 1) % aboutFiles.length : null));

  // Show skeleton only if still loading AND not yet timed out
  if (isLoadingPrimary && !timedOut) {
    return (
      <section id="about" className="section-alt py-24">
        <div className="container mx-auto px-4 max-w-5xl">
          <Skeleton className="h-10 w-56 mx-auto mb-4 rounded-md" />
          <Skeleton className="h-1 w-24 mx-auto mb-12 rounded-full" />
          <Skeleton className="h-28 w-full rounded-md mb-8" />
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {Array.from({ length: 4 }).map((_, i) => (
              // biome-ignore lint/suspicious/noArrayIndexKey: stable skeleton
              <Skeleton key={i} className="h-32 w-full rounded-lg" />
            ))}
          </div>
        </div>
      </section>
    );
  }

  return (
    <section id="about" className="section-alt py-24 relative overflow-hidden">
      {/* Subtle top border highlight */}
      <div className="absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-primary/30 to-transparent" />

      <div className="container mx-auto px-4">
        <div className="max-w-5xl mx-auto">
          {/* Section heading */}
          <ScrollReveal direction="up" duration={600}>
            <div className="text-center mb-14">
              <h2 className="text-display text-foreground mb-4">
                {displayAbout.title || "Über mich"}
              </h2>
              <div
                className="w-20 h-0.5 mx-auto rounded-full"
                style={{
                  background:
                    "linear-gradient(to right, var(--gradient-start, #0D9488), var(--gradient-end, #06b6d4))",
                }}
              />
            </div>
          </ScrollReveal>

          {/* Bio text */}
          {displayAbout.content && (
            <ScrollReveal direction="up" duration={600} delay={100}>
              <p
                className="text-body text-muted-foreground text-lg leading-relaxed text-center max-w-3xl mx-auto mb-14"
                data-ocid="about-bio"
              >
                {displayAbout.content}
              </p>
            </ScrollReveal>
          )}

          {/* Photo gallery — loads independently, shows skeleton only for itself */}
          <ScrollReveal direction="up" duration={600} delay={150}>
            {galleryLoading ? (
              <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-14">
                {/* biome-ignore lint/suspicious/noArrayIndexKey: static skeleton placeholders */}
                {["sk-0", "sk-1", "sk-2", "sk-3"].map((k) => (
                  <Skeleton
                    key={k}
                    className="h-36 md:h-44 w-full rounded-lg"
                  />
                ))}
              </div>
            ) : (
              <GalleryGrid
                images={aboutFiles}
                onOpen={openLightbox}
                settings={gallerySettings}
              />
            )}
          </ScrollReveal>

          {/* Feature cards — NO blinking animations */}
          {displayCards.length > 0 && (
            <div
              className="grid grid-cols-2 md:grid-cols-4 gap-4"
              data-ocid="about-feature-cards"
            >
              {displayCards.map((card, index) => (
                <ScrollReveal
                  key={Number(card.id)}
                  direction="up"
                  duration={500}
                  delay={index * 80}
                >
                  <Card className="card-hover h-full border-border/40 hover:border-primary/30 hover:shadow-medium">
                    <CardContent className="p-5 flex flex-col items-center text-center">
                      <FeatureCardIcon
                        iconType={card.icon}
                        iconColor={card.color}
                      />
                      <h3 className="text-subheading text-foreground mb-1 text-sm font-semibold leading-snug">
                        {card.title}
                      </h3>
                      <p className="text-body-sm text-muted-foreground text-xs leading-relaxed">
                        {card.subtitle}
                      </p>
                    </CardContent>
                  </Card>
                </ScrollReveal>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Lightbox */}
      {lightboxIndex !== null && aboutFiles[lightboxIndex] && (
        <LightboxResolver
          path={aboutFiles[lightboxIndex].path}
          total={aboutFiles.length}
          onClose={closeLightbox}
          onPrev={prevImage}
          onNext={nextImage}
        />
      )}
    </section>
  );
}
