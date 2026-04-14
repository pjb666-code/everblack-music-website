import type { StudioService } from "@/backend";
import { useFileUrl } from "@/blob-storage/FileStorage";
import LazyImage from "@/components/LazyImage";
import ScrollReveal from "@/components/ScrollReveal";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { SkeletonCard } from "@/components/ui/skeleton-cards";
import { useStudioServices } from "@/hooks/useQueries";
import { useNavigate } from "@tanstack/react-router";
import {
  ArrowRight,
  Disc,
  ExternalLink,
  Mic,
  Music,
  Play,
  Sliders,
  Zap,
} from "lucide-react";
import { useState } from "react";

function getServiceIcon(title: string) {
  const t = title.toLowerCase();
  if (t.includes("recording") || t.includes("aufnahme"))
    return <Mic className="w-6 h-6" />;
  if (t.includes("mixing") || t.includes("mix"))
    return <Sliders className="w-6 h-6" />;
  if (t.includes("mastering")) return <Disc className="w-6 h-6" />;
  if (t.includes("produktion") || t.includes("production"))
    return <Music className="w-6 h-6" />;
  return <Zap className="w-6 h-6" />;
}

const CARD_GRADIENTS = [
  "from-primary/20 via-primary/10 to-card",
  "from-primary/15 via-primary/8 to-card",
  "from-primary/25 via-primary/12 to-card",
  "from-primary/18 via-primary/9 to-card",
];

function ServiceCoverImage({
  imagePath,
  title,
  index,
}: {
  imagePath?: string;
  title: string;
  index: number;
}) {
  const { data: imageUrl } = useFileUrl(imagePath || "");
  const gradient = CARD_GRADIENTS[index % CARD_GRADIENTS.length];

  if (imagePath && imageUrl) {
    return (
      <div className="overflow-hidden rounded-t-lg -mx-6 -mt-6 mb-5 h-44 relative">
        <LazyImage
          src={imageUrl}
          alt={title}
          className="w-full h-full object-cover"
          wrapperClassName="w-full h-full"
        />
        <div className="absolute inset-0 bg-gradient-to-b from-transparent to-card/90" />
      </div>
    );
  }

  return (
    <div
      className={`-mx-6 -mt-6 mb-5 h-36 relative flex items-center justify-center overflow-hidden rounded-t-lg bg-gradient-to-b ${gradient}`}
    >
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,_var(--tw-gradient-stops))] from-primary/12 via-transparent to-transparent" />
      <div className="absolute w-28 h-28 rounded-full border border-primary/10" />
      <div className="absolute w-16 h-16 rounded-full border border-primary/15" />
      <div className="relative z-10 p-3.5 rounded-2xl bg-primary/15 text-primary border border-primary/20 shadow-lg group-hover:scale-110 transition-transform duration-300">
        {getServiceIcon(title)}
      </div>
    </div>
  );
}

function MediaSamplePreview({ url }: { url: string }) {
  const isYoutube = url.includes("youtube.com") || url.includes("youtu.be");
  const isSpotify = url.includes("spotify.com");
  const isAudio = /\.(mp3|wav|ogg|flac|aac)$/i.test(url);

  if (isAudio) {
    return (
      // biome-ignore lint/a11y/useMediaCaption: decorative sample preview
      <audio
        controls
        src={url}
        className="w-full h-9 opacity-80 hover:opacity-100 transition-opacity"
        aria-label="Audio-Probe"
      />
    );
  }

  if (isYoutube || isSpotify) {
    const label = isYoutube ? "YouTube" : "Spotify";
    return (
      <a
        href={url}
        target="_blank"
        rel="noopener noreferrer"
        className="flex items-center gap-2 text-xs text-muted-foreground hover:text-primary transition-colors py-1"
        aria-label={`${label}-Probe anhören`}
      >
        <ExternalLink className="w-3.5 h-3.5 flex-shrink-0" />
        <span>Probe auf {label} anhören</span>
      </a>
    );
  }

  return null;
}

function StudioServiceCard({
  service,
  index,
}: {
  service: StudioService;
  index: number;
}) {
  const [showSamples, setShowSamples] = useState(false);
  const scrollToContact = () => {
    document.getElementById("contact")?.scrollIntoView({ behavior: "smooth" });
  };

  const hasSamples = service.mediaSamples.length > 0;

  return (
    <ScrollReveal direction="up" duration={550} delay={index * 90}>
      <Card
        className="group relative overflow-hidden border-border/60 hover:border-primary/40 hover:shadow-xl hover:shadow-primary/10 transition-all duration-300 hover:-translate-y-1 h-full flex flex-col"
        data-ocid={`studio-card-${index}`}
      >
        <div className="absolute top-0 right-0 w-24 h-24 bg-gradient-to-br from-primary/10 to-accent/5 rounded-bl-full opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none" />

        <CardHeader className="pb-0">
          <ServiceCoverImage
            imagePath={service.imagePath}
            title={service.title}
            index={index}
          />

          <h3 className="text-lg font-bold text-foreground mb-1 leading-snug">
            {service.title}
          </h3>

          {service.price ? (
            <div className="text-xl font-extrabold text-primary mb-1">
              {service.price}
            </div>
          ) : (
            <div className="text-sm text-muted-foreground italic mb-1">
              Preis auf Anfrage
            </div>
          )}
        </CardHeader>

        <CardContent className="flex-1 flex flex-col space-y-4 pt-3">
          <p className="text-sm text-muted-foreground leading-relaxed flex-1">
            {service.description}
          </p>

          {hasSamples && (
            <div className="space-y-2">
              <button
                type="button"
                onClick={() => setShowSamples((v) => !v)}
                className="flex items-center gap-1.5 text-xs text-primary/70 hover:text-primary transition-colors font-medium"
                data-ocid={`studio-samples-toggle-${index}`}
                aria-expanded={showSamples}
              >
                <Play className="w-3.5 h-3.5" />
                {showSamples
                  ? "Proben ausblenden"
                  : `${service.mediaSamples.length} Hörprobe${service.mediaSamples.length > 1 ? "n" : ""} ansehen`}
              </button>
              {showSamples && (
                <div className="space-y-2 pt-1">
                  {service.mediaSamples.map((url) => (
                    <MediaSamplePreview key={url} url={url} />
                  ))}
                </div>
              )}
            </div>
          )}

          <Button
            onClick={scrollToContact}
            className="w-full bg-primary text-primary-foreground hover:bg-primary/90 shadow-md shadow-primary/15 font-semibold transition-all duration-200"
            data-ocid={`studio-cta-${index}`}
          >
            Anfragen
          </Button>
        </CardContent>
      </Card>
    </ScrollReveal>
  );
}

export default function StudioServices() {
  const navigate = useNavigate();
  const { data: services, isLoading } = useStudioServices();

  if (isLoading) {
    return (
      <section id="studio" className="section-alt py-24">
        <div className="container mx-auto px-4 max-w-6xl">
          <div className="text-center mb-14">
            <div className="h-10 w-64 bg-muted/40 rounded-md mx-auto mb-4 animate-pulse" />
            <div className="h-0.5 w-20 bg-muted/30 rounded-full mx-auto" />
          </div>
          <div className="grid md:grid-cols-3 gap-6">
            <SkeletonCard />
            <SkeletonCard />
            <SkeletonCard />
          </div>
        </div>
      </section>
    );
  }

  if (!services || services.length === 0) return null;

  const displayServices = services.slice(0, 3);

  return (
    <section id="studio" className="section-alt py-24 relative">
      <div className="absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-border/50 to-transparent" />

      <div className="container mx-auto px-4">
        <div className="max-w-6xl mx-auto">
          <ScrollReveal direction="up" duration={600}>
            <div className="text-center mb-14">
              <h2 className="text-display text-foreground mb-4">
                Studio Services
              </h2>
              <p className="text-body text-muted-foreground text-lg max-w-2xl mx-auto mb-6">
                Professionelle Aufnahme- und Produktionsdienstleistungen für
                Musiker aller Genres.
              </p>
              <div className="w-20 h-0.5 bg-gradient-to-r from-primary to-accent mx-auto" />
            </div>
          </ScrollReveal>

          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {displayServices.map((service, index) => (
              <StudioServiceCard
                key={Number(service.id)}
                service={service}
                index={index}
              />
            ))}
          </div>

          {/* "Studio ansehen" CTA */}
          <ScrollReveal direction="up" duration={500} delay={200}>
            <div className="text-center mt-10">
              <Button
                variant="outline"
                size="lg"
                onClick={() => navigate({ to: "/studio" })}
                className="border-primary/30 hover:border-primary/60 hover:bg-primary/5 transition-smooth font-medium"
                data-ocid="studio-preview-cta"
              >
                Studio ansehen
                <ArrowRight className="ml-2 w-4 h-4" />
              </Button>
            </div>
          </ScrollReveal>
        </div>
      </div>
    </section>
  );
}
