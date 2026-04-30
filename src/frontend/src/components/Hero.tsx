import { useFileList, useFileUrl } from "@/blob-storage/FileStorage";
import ScrollReveal from "@/components/ScrollReveal";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { useHeroSection } from "@/hooks/useQueries";
import { useNavigate } from "@tanstack/react-router";
import { ChevronDown } from "lucide-react";

// Resolves the first hero/ folder image to a URL for background use
function HeroBlobBackground() {
  const { data: fileList } = useFileList();
  const heroFile = (fileList ?? []).find(
    (f) =>
      f.path.startsWith("hero/") && /\.(jpg|jpeg|png|webp|gif)$/i.test(f.path),
  );
  const { data: heroImageUrl } = useFileUrl(heroFile?.path ?? "");

  if (!heroImageUrl) return null;

  return (
    <div
      className="absolute inset-0 bg-cover bg-center bg-no-repeat"
      style={{ backgroundImage: `url(${heroImageUrl})` }}
      aria-hidden="true"
    >
      <div className="absolute inset-0 bg-background/65" />
      <div className="absolute inset-0 bg-gradient-to-b from-transparent via-background/20 to-background" />
    </div>
  );
}

export default function Hero() {
  const navigate = useNavigate();
  const { data: heroData, isLoading } = useHeroSection();

  const scrollToSection = (id: string) => {
    document.getElementById(id)?.scrollIntoView({ behavior: "smooth" });
  };

  if (isLoading) {
    return (
      <section className="relative min-h-screen flex items-center justify-center bg-background -mt-20 pt-20">
        <div className="relative z-10 text-center space-y-6 px-4 w-full max-w-3xl mx-auto">
          <Skeleton className="h-5 w-48 mx-auto rounded-md" />
          <Skeleton className="h-16 w-full mx-auto rounded-md" />
          <Skeleton className="h-6 w-80 mx-auto rounded-md" />
          <div className="flex gap-4 justify-center pt-4">
            <Skeleton className="h-12 w-44 rounded-md" />
            <Skeleton className="h-12 w-44 rounded-md" />
          </div>
        </div>
      </section>
    );
  }

  return (
    <section
      className="relative min-h-screen flex items-center justify-center overflow-hidden -mt-20"
      data-ocid="hero-section"
    >
      {/* Default background — overridden by blob image if one exists in hero/ */}
      <div
        className="absolute inset-0 bg-cover bg-center bg-no-repeat"
        style={{
          backgroundImage: "url(/assets/Landingpage%20Version%202.5.jpg)",
        }}
        aria-hidden="true"
      >
        <div className="absolute inset-0 bg-background/65" />
        <div className="absolute inset-0 bg-gradient-to-b from-transparent via-background/20 to-background" />
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_60%_50%_at_50%_40%,oklch(var(--primary)/0.12),transparent)]" />
      </div>

      {/* Blob image overrides default if admin uploads to hero/ */}
      <HeroBlobBackground />

      {/* Content — pt-32 to clear the fixed header plus breathing room */}
      <div className="relative z-10 container mx-auto px-4 text-center pt-32 pb-32">
        <div className="max-w-3xl mx-auto">
          <ScrollReveal direction="up" duration={700} delay={100}>
            {/* Eyebrow */}
            <p
              className="text-subheading text-primary/80 uppercase tracking-widest mb-6 font-semibold text-sm"
              data-ocid="hero-eyebrow"
            >
              Gitarrenunterricht · Aachen
            </p>

            {/* Main headline */}
            <h1
              className="text-display-lg text-foreground leading-[1.1] mb-6"
              data-ocid="hero-headline"
            >
              {heroData?.headline || "Gitarre lernen mit System."}
            </h1>

            {/* Subline */}
            <p
              className="text-body text-muted-foreground text-lg md:text-xl max-w-xl mx-auto mb-10 leading-relaxed"
              data-ocid="hero-subline"
            >
              {heroData?.subheadline ??
                "Professioneller Unterricht für Anfänger bis Fortgeschrittene — individuell, praxisnah und in Aachen."}
            </p>

            {/* CTAs */}
            <div
              className="flex flex-col sm:flex-row gap-4 justify-center items-center"
              data-ocid="hero-cta-group"
            >
              <Button
                onClick={() => navigate({ to: "/unterricht" })}
                size="lg"
                className="text-base px-8 py-5 h-auto shadow-elevated shadow-primary/20 font-semibold transition-smooth"
                data-ocid="hero-cta-primary"
              >
                {heroData?.ctaPrimary ?? "Unterrichtsmodelle"}
              </Button>
              <Button
                onClick={() => scrollToSection("contact")}
                size="lg"
                variant="outline"
                className="text-base px-8 py-5 h-auto bg-white/10 border-white/30 text-white hover:bg-white/20 backdrop-blur-sm font-medium transition-smooth"
                data-ocid="hero-cta-secondary"
              >
                {heroData?.ctaSecondary ?? "Kontakt aufnehmen"}
              </Button>
            </div>
          </ScrollReveal>
        </div>
      </div>

      {/* Scroll indicator */}
      <button
        type="button"
        aria-label="Weiter scrollen"
        onClick={() => scrollToSection("about")}
        className="absolute bottom-8 left-1/2 -translate-x-1/2 z-10 text-muted-foreground/60 hover:text-primary transition-colors duration-200 focus:outline-none focus-visible:ring-2 focus-visible:ring-ring"
        data-ocid="hero-scroll-indicator"
      >
        <ChevronDown className="w-6 h-6 animate-bounce" />
      </button>
    </section>
  );
}
