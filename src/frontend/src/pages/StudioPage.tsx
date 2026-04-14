import { useFileUrl } from "@/blob-storage/FileStorage";
import LazyImage from "@/components/LazyImage";
import ScrollReveal from "@/components/ScrollReveal";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { SkeletonCard } from "@/components/ui/skeleton-cards";
import {
  useSiteTexts,
  useStudioServices,
  useStudioStats,
} from "@/hooks/useQueries";
import type { StudioService } from "@/types";
import {
  Award,
  Calendar,
  CheckCircle2,
  Clock,
  Disc,
  Headphones,
  Mic,
  Music,
  Music2,
  PlayCircle,
  Sliders,
  Star,
  Users,
  Zap,
} from "lucide-react";
import { useEffect, useState } from "react";

// ─── Stat icon map ─────────────────────────────────────────────────────────────

const STAT_ICON_MAP: Record<string, React.ReactElement> = {
  Calendar: <Calendar className="w-4 h-4" />,
  CheckCircle2: <CheckCircle2 className="w-4 h-4" />,
  Headphones: <Headphones className="w-4 h-4" />,
  Zap: <Zap className="w-4 h-4" />,
  Music: <Music className="w-4 h-4" />,
  Music2: <Music2 className="w-4 h-4" />,
  Star: <Star className="w-4 h-4" />,
  Award: <Award className="w-4 h-4" />,
  Users: <Users className="w-4 h-4" />,
  Clock: <Clock className="w-4 h-4" />,
  Mic: <Mic className="w-4 h-4" />,
  Disc: <Disc className="w-4 h-4" />,
};

function getStatIcon(iconName: string): React.ReactElement {
  return STAT_ICON_MAP[iconName] ?? <Zap className="w-4 h-4" />;
}

// Default fallback stats (shown when backend returns empty)
const DEFAULT_STATS = [
  { id: "d0", icon: "Calendar", statLabel: "10+ Jahre Erfahrung", order: 0n },
  { id: "d1", icon: "CheckCircle2", statLabel: "200+ Projekte", order: 1n },
  { id: "d2", icon: "Headphones", statLabel: "Pro Equipment", order: 2n },
  { id: "d3", icon: "Zap", statLabel: "Flexibel Terminbuchung", order: 3n },
];

// ─── Service icon map ──────────────────────────────────────────────────────────

const SERVICE_ICONS: Record<string, React.ReactNode> = {
  recording: <Mic className="w-7 h-7" />,
  aufnahme: <Mic className="w-7 h-7" />,
  mixing: <Sliders className="w-7 h-7" />,
  mix: <Sliders className="w-7 h-7" />,
  mastering: <Disc className="w-7 h-7" />,
  produktion: <Music className="w-7 h-7" />,
  production: <Music className="w-7 h-7" />,
};

function getServiceIcon(title: string) {
  const t = title.toLowerCase();
  for (const [key, icon] of Object.entries(SERVICE_ICONS)) {
    if (t.includes(key)) return icon;
  }
  return <Zap className="w-7 h-7" />;
}

const CARD_GRADIENTS = [
  "from-primary/20 via-primary/10 to-background",
  "from-primary/15 via-primary/8 to-background",
  "from-primary/25 via-primary/12 to-background",
];

// ─── Media Sample Player ───────────────────────────────────────────────────────

function MediaSamplePlayer({
  samplePath,
  label,
}: { samplePath: string; label?: string }) {
  const { data: sampleUrl } = useFileUrl(samplePath);
  const [expanded, setExpanded] = useState(false);

  if (!sampleUrl) return null;

  const isAudio = /\.(mp3|wav|ogg|m4a|aac|flac)$/i.test(samplePath);
  const isVideo = /\.(mp4|mov|webm|mkv)$/i.test(samplePath);
  const isYoutube =
    samplePath.includes("youtube.com") || samplePath.includes("youtu.be");
  const isSpotify = samplePath.includes("spotify.com");

  const fileName =
    label ??
    samplePath
      .split("/")
      .pop()
      ?.replace(/\.[^.]+$/, "") ??
    "Sample";

  if (isYoutube) {
    const videoId = samplePath.match(/(?:v=|youtu\.be\/)([^&?/]+)/)?.[1];
    if (!videoId) return null;
    return (
      <div className="rounded-lg overflow-hidden border border-border">
        <div className="flex items-center gap-2 p-2.5 text-xs text-muted-foreground font-medium border-b border-border bg-muted/30">
          <PlayCircle className="w-3.5 h-3.5 text-primary flex-shrink-0" />
          <span className="truncate">{fileName}</span>
        </div>
        <div className="relative aspect-video">
          <iframe
            src={`https://www.youtube-nocookie.com/embed/${videoId}`}
            title={fileName}
            allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
            allowFullScreen
            className="absolute inset-0 w-full h-full"
          />
        </div>
      </div>
    );
  }

  if (isSpotify) {
    const trackMatch = samplePath.match(/track\/([a-zA-Z0-9]+)/);
    const albumMatch = samplePath.match(/album\/([a-zA-Z0-9]+)/);
    const embedId = trackMatch?.[1] ?? albumMatch?.[1];
    const embedType = trackMatch ? "track" : "album";
    if (!embedId) {
      return (
        <a
          href={samplePath}
          target="_blank"
          rel="noopener noreferrer"
          className="flex items-center gap-2 text-xs text-primary hover:underline p-2 rounded border border-border bg-muted/30"
        >
          <Music className="w-3.5 h-3.5" />
          Auf Spotify anhören
        </a>
      );
    }
    return (
      <div className="rounded-lg overflow-hidden border border-border">
        <iframe
          src={`https://open.spotify.com/embed/${embedType}/${embedId}?utm_source=generator&theme=0`}
          title={fileName}
          allow="autoplay; clipboard-write; encrypted-media; fullscreen; picture-in-picture"
          className="w-full"
          height="80"
        />
      </div>
    );
  }

  if (isAudio) {
    return (
      <div className="rounded-lg bg-muted/50 border border-border p-3 space-y-2">
        <div className="flex items-center gap-2 text-xs text-muted-foreground font-medium">
          <PlayCircle className="w-4 h-4 text-primary flex-shrink-0" />
          <span className="truncate">{fileName}</span>
        </div>
        {/* biome-ignore lint/a11y/useMediaCaption: studio audio samples */}
        <audio
          controls
          className="w-full h-8"
          preload="metadata"
          style={{ colorScheme: "dark" }}
        >
          <source src={sampleUrl} />
          Dein Browser unterstützt kein Audio.
        </audio>
      </div>
    );
  }

  if (isVideo) {
    return (
      <div className="rounded-lg overflow-hidden border border-border bg-muted/30">
        <button
          type="button"
          onClick={() => setExpanded((p) => !p)}
          className="w-full flex items-center gap-2 p-3 text-xs text-muted-foreground font-medium hover:text-foreground transition-colors"
          aria-expanded={expanded}
        >
          <PlayCircle className="w-4 h-4 text-primary flex-shrink-0" />
          <span className="truncate flex-1 text-left">{fileName}</span>
          <span className="text-primary/70 text-xs">
            {expanded ? "Schließen" : "Abspielen"}
          </span>
        </button>
        {expanded && (
          // biome-ignore lint/a11y/useMediaCaption: studio video samples
          <video controls className="w-full" preload="metadata">
            <source src={sampleUrl} />
            Dein Browser unterstützt kein Video.
          </video>
        )}
      </div>
    );
  }

  return null;
}

// ─── Service Card ──────────────────────────────────────────────────────────────

function StudioServiceCard({
  service,
  index,
}: { service: StudioService; index: number }) {
  const { data: imageUrl } = useFileUrl(service.imagePath ?? "");
  const hasSamples = service.mediaSamples.length > 0;
  const icon = getServiceIcon(service.title);
  const gradient = CARD_GRADIENTS[index % CARD_GRADIENTS.length];

  const handleContact = () => {
    window.location.href = `mailto:info@everblackmusic.com?subject=Anfrage%20Studio%20Service%3A%20${encodeURIComponent(service.title)}`;
  };

  return (
    <ScrollReveal delay={index * 120} direction="up">
      <div
        data-ocid={`studio-service-card-${service.id}`}
        className="group flex flex-col h-full rounded-2xl border border-border bg-card hover:border-primary/50 hover:shadow-xl hover:shadow-primary/10 transition-all duration-300 overflow-hidden"
      >
        {/* Card Visual Header */}
        {service.imagePath && imageUrl ? (
          <div className="relative h-52 overflow-hidden flex-shrink-0">
            <LazyImage
              src={imageUrl}
              alt={service.title}
              className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
              wrapperClassName="w-full h-full"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-card/95 via-card/20 to-transparent" />
            {hasSamples && (
              <div className="absolute bottom-3 left-3">
                <Badge
                  variant="secondary"
                  className="bg-background/80 backdrop-blur text-xs font-medium border border-border flex items-center gap-1"
                >
                  <Headphones className="w-3 h-3" />
                  Hörbeispiele
                </Badge>
              </div>
            )}
          </div>
        ) : (
          <div
            className={`relative h-44 flex-shrink-0 bg-gradient-to-b ${gradient} flex items-center justify-center overflow-hidden`}
          >
            <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,_var(--tw-gradient-stops))] from-primary/15 via-transparent to-transparent" />
            <div className="absolute w-32 h-32 rounded-full border border-primary/10" />
            <div className="absolute w-20 h-20 rounded-full border border-primary/15" />
            <div className="relative z-10 p-4 rounded-2xl bg-primary/15 text-primary border border-primary/20 shadow-lg group-hover:scale-110 transition-transform duration-300">
              {icon}
            </div>
            {hasSamples && (
              <div className="absolute bottom-3 left-3">
                <Badge
                  variant="secondary"
                  className="bg-background/80 backdrop-blur text-xs font-medium border border-border flex items-center gap-1"
                >
                  <Headphones className="w-3 h-3" />
                  Hörbeispiele
                </Badge>
              </div>
            )}
          </div>
        )}

        {/* Card Body */}
        <div className="flex flex-col flex-1 p-6 gap-4">
          {service.imagePath && imageUrl && (
            <div className="p-2.5 rounded-xl w-fit bg-primary/10 text-primary transition-transform duration-300 group-hover:scale-110">
              {icon}
            </div>
          )}

          <div>
            <h3 className="text-xl font-bold text-foreground mb-2 leading-tight">
              {service.title}
            </h3>
            <p className="text-sm text-muted-foreground leading-relaxed">
              {service.description}
            </p>
          </div>

          {/* Media samples */}
          {hasSamples ? (
            <div className="space-y-2">
              <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider flex items-center gap-1.5">
                <Headphones className="w-3.5 h-3.5 text-primary" />
                Hörbeispiele
              </p>
              <div className="space-y-2">
                {service.mediaSamples.map((path) => (
                  <MediaSamplePlayer key={path} samplePath={path} />
                ))}
              </div>
            </div>
          ) : (
            <div className="rounded-lg border border-dashed border-border bg-muted/20 px-4 py-3 text-xs text-muted-foreground flex items-center gap-2">
              <Headphones className="w-3.5 h-3.5 text-muted-foreground/50 flex-shrink-0" />
              Kein Demo verfügbar
            </div>
          )}

          <div className="flex-1" />

          {/* Price + CTA */}
          <div className="border-t border-border pt-4 flex items-center justify-between gap-3">
            <div>
              <span className="text-xl font-extrabold text-primary leading-none">
                {service.price || "Auf Anfrage"}
              </span>
            </div>
            <Button
              data-ocid={`cta-anfragen-${service.id}`}
              onClick={handleContact}
              size="sm"
              className="bg-primary text-primary-foreground hover:bg-primary/90 shadow-md shadow-primary/20 font-semibold shrink-0 transition-all duration-200"
            >
              Anfragen
            </Button>
          </div>
        </div>
      </div>
    </ScrollReveal>
  );
}

// ─── Process Steps ─────────────────────────────────────────────────────────────

const PROCESS_STEPS = [
  {
    step: "01",
    icon: <Mic className="w-5 h-5" />,
    title: "Kontakt aufnehmen",
    desc: "Beschreib mir dein Projekt, deine Ideen und Vorstellungen. Keine Vorkenntnisse nötig.",
  },
  {
    step: "02",
    icon: <Sliders className="w-5 h-5" />,
    title: "Aufnahme & Produktion",
    desc: "Wir nehmen gemeinsam auf, mixen und mastern deinen Sound mit professionellem Equipment.",
  },
  {
    step: "03",
    icon: <CheckCircle2 className="w-5 h-5" />,
    title: "Fertiges Ergebnis",
    desc: "Du erhältst hochwertige Dateien in Studioqualität, ready to publish.",
  },
];

// ─── Page ──────────────────────────────────────────────────────────────────────

export default function StudioPage() {
  const { data: studioServices, isLoading } = useStudioServices();
  const { data: studioStats, isLoading: statsLoading } = useStudioStats();
  const { data: siteTexts } = useSiteTexts();

  // Use backend stats if available; fall back to defaults
  const displayStats =
    studioStats && studioStats.length > 0
      ? [...studioStats].sort((a, b) => Number(a.order) - Number(b.order))
      : DEFAULT_STATS;

  useEffect(() => {
    document.title = "Studio – Everblack Music";
  }, []);

  const studioHeadline =
    siteTexts?.studioHeadline ?? "Dein Sound. Professionell.";
  const studioIntro =
    siteTexts?.studioIntro ??
    "Von der Aufnahme bis zum fertigen Mastering — ich begleite dein Projekt mit professionellem Equipment und musikalischem Verständnis.";
  const studioCTA = siteTexts?.studioCTA ?? "Jetzt Kontakt aufnehmen";

  return (
    <div className="min-h-screen bg-background">
      {/* ── Hero ──────────────────────────────────────────────────────────── */}
      <section className="relative overflow-hidden bg-card border-b border-border pt-28 pb-20 px-4">
        <div className="pointer-events-none absolute -top-40 right-1/4 w-[600px] h-[500px] rounded-full bg-primary/6 blur-3xl" />
        <div className="pointer-events-none absolute bottom-0 left-1/4 w-[400px] h-[300px] rounded-full bg-primary/4 blur-3xl" />

        <ScrollReveal direction="up">
          <div className="relative z-10 max-w-3xl mx-auto text-center">
            <div className="inline-flex items-center gap-2 bg-primary/10 border border-primary/25 text-primary text-xs font-semibold rounded-full px-4 py-1.5 mb-6 uppercase tracking-wider">
              <Mic className="w-3.5 h-3.5" />
              Professionelles Studio in Aachen
            </div>
            <h1 className="text-5xl md:text-6xl font-extrabold text-foreground mb-5 leading-tight tracking-tight">
              {studioHeadline}
            </h1>
            <p className="text-lg text-muted-foreground max-w-xl mx-auto leading-relaxed">
              {studioIntro}
            </p>
          </div>
        </ScrollReveal>

        {/* Stats — dynamic from backend */}
        <ScrollReveal delay={200} direction="up">
          <div className="relative z-10 max-w-3xl mx-auto mt-12 grid grid-cols-2 sm:grid-cols-4 gap-3">
            {statsLoading
              ? ["sk1", "sk2", "sk3", "sk4"].map((k) => (
                  <div
                    key={k}
                    className="flex flex-col items-center text-center rounded-xl border border-border bg-background/60 py-4 px-3 gap-2"
                  >
                    <Skeleton className="h-4 w-4 rounded" />
                    <Skeleton className="h-4 w-20 rounded" />
                  </div>
                ))
              : displayStats.map((stat) => (
                  <div
                    key={stat.id}
                    data-ocid={`studio-stat-${stat.id}`}
                    className="flex flex-col items-center text-center rounded-xl border border-border bg-background/60 backdrop-blur py-4 px-3 hover:border-primary/30 transition-colors duration-200"
                  >
                    <div className="text-primary mb-1.5 opacity-80">
                      {getStatIcon(stat.icon)}
                    </div>
                    <div className="text-sm font-semibold text-foreground leading-snug">
                      {stat.statLabel}
                    </div>
                  </div>
                ))}
          </div>
        </ScrollReveal>
      </section>

      {/* ── Services Grid ─────────────────────────────────────────────────── */}
      <section className="py-20 px-4 bg-background">
        <div className="max-w-6xl mx-auto">
          <ScrollReveal direction="up">
            <div className="text-center mb-12">
              <h2 className="text-3xl md:text-4xl font-bold text-foreground mb-3">
                Studio Services
              </h2>
              <p className="text-muted-foreground max-w-xl mx-auto">
                Professionelle Dienstleistungen für dein Musikprojekt — vom
                ersten Take bis zur fertigen Produktion.
              </p>
              <div className="accent-divider mx-auto mt-5" />
            </div>
          </ScrollReveal>

          {isLoading ? (
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
              {["sk1", "sk2", "sk3"].map((k) => (
                <SkeletonCard key={k} />
              ))}
            </div>
          ) : !studioServices || studioServices.length === 0 ? (
            <ScrollReveal direction="up">
              <div
                data-ocid="studio-services-empty"
                className="text-center py-20 rounded-2xl border border-dashed border-border bg-card"
              >
                <Music className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
                <p className="text-muted-foreground font-medium">
                  Noch keine Studio-Services verfügbar.
                </p>
                <p className="text-sm text-muted-foreground/60 mt-1">
                  Services können im Admin-Panel hinzugefügt werden.
                </p>
              </div>
            </ScrollReveal>
          ) : (
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
              {studioServices.map((service, i) => (
                <StudioServiceCard
                  key={Number(service.id)}
                  service={service}
                  index={i}
                />
              ))}
            </div>
          )}
        </div>
      </section>

      {/* ── Process Steps ─────────────────────────────────────────────────── */}
      <section className="py-16 px-4 bg-card border-t border-b border-border">
        <div className="max-w-4xl mx-auto">
          <ScrollReveal direction="up">
            <div className="text-center mb-10">
              <h2 className="text-2xl md:text-3xl font-bold text-foreground mb-2">
                Wie läuft ein Projekt ab?
              </h2>
              <p className="text-muted-foreground text-sm max-w-md mx-auto">
                Vom ersten Kontakt bis zur fertigen Veröffentlichung — so
                einfach geht's.
              </p>
              <div className="accent-divider mx-auto mt-4" />
            </div>
          </ScrollReveal>

          <div className="grid sm:grid-cols-3 gap-6 relative">
            <div className="hidden sm:block absolute top-[3.25rem] left-1/6 right-1/6 h-px bg-gradient-to-r from-transparent via-border to-transparent" />
            {PROCESS_STEPS.map(({ step, icon, title, desc }, i) => (
              <ScrollReveal key={step} delay={i * 120} direction="up">
                <div className="relative text-center rounded-2xl border border-border bg-background p-6 hover:border-primary/30 hover:bg-card transition-all duration-200">
                  <div className="absolute -top-3.5 left-1/2 -translate-x-1/2 bg-primary text-primary-foreground text-xs font-bold rounded-full w-7 h-7 flex items-center justify-center shadow-md shadow-primary/25">
                    {step}
                  </div>
                  <div className="inline-flex items-center justify-center rounded-xl bg-primary/10 text-primary p-3 mb-4 mt-2">
                    {icon}
                  </div>
                  <h4 className="font-semibold text-foreground mb-2 text-base">
                    {title}
                  </h4>
                  <p className="text-sm text-muted-foreground leading-relaxed">
                    {desc}
                  </p>
                </div>
              </ScrollReveal>
            ))}
          </div>
        </div>
      </section>

      {/* ── CTA Band ──────────────────────────────────────────────────────── */}
      <section className="py-16 px-4 bg-background">
        <ScrollReveal direction="up">
          <div className="max-w-2xl mx-auto text-center">
            <div className="inline-flex items-center justify-center rounded-full bg-primary/10 p-4 mb-5 border border-primary/20">
              <Headphones className="w-6 h-6 text-primary" />
            </div>
            <h2 className="text-2xl md:text-3xl font-bold text-foreground mb-3">
              Bereit für dein nächstes Projekt?
            </h2>
            <p className="text-muted-foreground mb-8 max-w-md mx-auto">
              Kontaktiere mich für ein unverbindliches Gespräch über dein
              Musikprojekt — ich freue mich auf deine Ideen.
            </p>
            <Button
              data-ocid="studio-cta-contact"
              size="lg"
              className="bg-primary text-primary-foreground hover:bg-primary/90 shadow-lg shadow-primary/25 font-semibold px-8 transition-all duration-200"
              onClick={() => {
                window.location.href =
                  "mailto:info@everblackmusic.com?subject=Studio%20Anfrage";
              }}
            >
              {studioCTA}
            </Button>
          </div>
        </ScrollReveal>
      </section>
    </div>
  );
}
