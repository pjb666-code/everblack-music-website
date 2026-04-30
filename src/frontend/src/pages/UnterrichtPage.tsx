import type { TeachingModel } from "@/backend";
import { useFileUrl } from "@/blob-storage/FileStorage";
import LazyImage from "@/components/LazyImage";
import ScrollReveal from "@/components/ScrollReveal";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { useActor } from "@/hooks/useActor";
import { useFeatureCards, useSiteTexts } from "@/hooks/useQueries";
import { useQuery } from "@tanstack/react-query";
import { useNavigate } from "@tanstack/react-router";
import {
  Check,
  Clock,
  GraduationCap,
  Mail,
  Music,
  Star,
  Users,
} from "lucide-react";
import { useEffect } from "react";

// ─── Teaching Model Card ─────────────────────────────────────────────────────

function TeachingModelCardImage({ imagePath }: { imagePath: string }) {
  const { data: imageUrl } = useFileUrl(imagePath);
  if (!imageUrl) return null;
  return (
    <div className="relative h-56 overflow-hidden">
      <LazyImage
        src={imageUrl}
        alt="Unterrichtsmodell"
        className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
      />
      <div className="absolute inset-0 bg-gradient-to-t from-card/90 to-transparent" />
    </div>
  );
}

function TeachingModelCard({
  model,
  index,
}: {
  model: TeachingModel;
  index: number;
}) {
  const navigate = useNavigate();
  const isFeatured =
    model.title.toLowerCase().includes("privat") || index === 0;

  const handleContact = () => {
    navigate({ to: "/" });
    setTimeout(() => {
      document
        .getElementById("contact")
        ?.scrollIntoView({ behavior: "smooth" });
    }, 120);
  };

  return (
    <ScrollReveal delay={index * 130} direction="up">
      <div
        data-ocid={`teaching-model-card-${model.id}`}
        className={`relative flex flex-col h-full rounded-2xl border transition-all duration-300 overflow-hidden group
          ${
            isFeatured
              ? "border-primary/60 bg-gradient-to-b from-primary/10 to-card shadow-lg shadow-primary/10 hover:shadow-xl hover:shadow-primary/20 hover:border-primary"
              : "border-border bg-card hover:border-primary/40 hover:shadow-lg hover:shadow-primary/10"
          }`}
      >
        {/* Featured badge */}
        {isFeatured && (
          <div className="absolute top-4 right-4 z-10">
            <Badge className="bg-primary text-primary-foreground font-semibold px-3 py-1.5 flex items-center gap-1.5 shadow-md">
              <Star className="w-3 h-3 fill-current" />
              Beliebt
            </Badge>
          </div>
        )}

        {/* Cover image */}
        {model.imagePath && (
          <TeachingModelCardImage imagePath={model.imagePath} />
        )}

        {/* Content */}
        <div className="flex flex-col flex-1 p-7 gap-6">
          {/* Icon + Title + Description */}
          <div>
            <div
              className={`p-3 rounded-xl w-fit mb-4 transition-transform duration-300 group-hover:scale-110
                ${isFeatured ? "bg-primary/20 text-primary" : "bg-muted text-muted-foreground group-hover:text-primary"}`}
            >
              <GraduationCap className="w-6 h-6" />
            </div>
            <h3 className="text-2xl font-extrabold text-foreground mb-1 tracking-tight">
              {model.title}
            </h3>
            {model.subtitle && (
              <p className="text-xs text-primary/80 font-semibold uppercase tracking-widest mb-2">
                {model.subtitle}
              </p>
            )}
            <p className="text-sm text-muted-foreground leading-relaxed">
              {model.description}
            </p>
          </div>

          {/* Price — prominent */}
          <div
            className={`rounded-xl px-5 py-4 border
              ${isFeatured ? "bg-primary/10 border-primary/30" : "bg-muted/40 border-border"}`}
          >
            <p className="text-xs uppercase tracking-widest text-muted-foreground mb-1 font-semibold">
              Preis
            </p>
            <span
              className={`text-4xl font-extrabold tracking-tight ${isFeatured ? "text-primary" : "text-foreground"}`}
            >
              {model.price}
            </span>
          </div>

          {/* Divider */}
          <div className="h-px bg-border" />

          {/* Features */}
          <ul className="space-y-3 flex-1">
            {model.features
              .filter((f) => f.trim() !== "")
              .map((feature) => (
                <li key={feature} className="flex items-start gap-3">
                  <span
                    className={`mt-0.5 flex-shrink-0 rounded-full p-0.5
                      ${isFeatured ? "bg-primary/20" : "bg-muted"}`}
                  >
                    <Check
                      className={`w-3.5 h-3.5 ${isFeatured ? "text-primary" : "text-muted-foreground"}`}
                    />
                  </span>
                  <span className="text-sm text-foreground/80 leading-relaxed">
                    {feature}
                  </span>
                </li>
              ))}
          </ul>

          {/* CTA */}
          <Button
            data-ocid={`cta-anfragen-${model.id}`}
            onClick={handleContact}
            size="lg"
            className={`w-full font-semibold transition-all duration-300 mt-2
              ${
                isFeatured
                  ? "bg-primary hover:bg-primary/90 text-primary-foreground shadow-md shadow-primary/30 hover:shadow-lg hover:shadow-primary/40"
                  : "bg-secondary text-secondary-foreground hover:bg-primary hover:text-primary-foreground border border-border hover:border-primary"
              }`}
          >
            Jetzt anfragen
          </Button>
        </div>
      </div>
    </ScrollReveal>
  );
}

// ─── Loading Skeleton ────────────────────────────────────────────────────────

function ModelSkeleton() {
  return (
    <div className="rounded-2xl border border-border bg-card p-7 flex flex-col gap-5 h-full">
      <div className="flex flex-col gap-3">
        <Skeleton className="w-12 h-12 rounded-xl" />
        <Skeleton className="w-3/4 h-7 rounded-lg" />
        <Skeleton className="w-1/2 h-4 rounded" />
      </div>
      <Skeleton className="w-full h-20 rounded-xl" />
      <div className="h-px bg-border" />
      <div className="flex flex-col gap-2.5">
        {[1, 2, 3].map((i) => (
          <div key={i} className="flex items-center gap-3">
            <Skeleton className="w-5 h-5 rounded-full flex-shrink-0" />
            <Skeleton
              className="h-4 rounded"
              style={{ width: `${60 + i * 8}%` }}
            />
          </div>
        ))}
      </div>
      <Skeleton className="w-full h-11 rounded-lg mt-auto" />
    </div>
  );
}

// ─── Benefit Pills ────────────────────────────────────────────────────────────

const BENEFITS = [
  { icon: Clock, label: "Flexible Zeiten" },
  { icon: Users, label: "Alle Niveaus" },
  { icon: Music, label: "Alle Stile" },
  { icon: GraduationCap, label: "10+ Jahre Erfahrung" },
];

// ─── Page ─────────────────────────────────────────────────────────────────────

export default function UnterrichtPage() {
  const { actor, isFetching } = useActor();
  const { data: siteTexts } = useSiteTexts();
  const { data: featureCards } = useFeatureCards();

  useEffect(() => {
    document.title = "Unterricht – Everblack Music";
  }, []);

  const {
    data: teachingModels,
    isLoading,
    isError,
  } = useQuery<TeachingModel[]>({
    queryKey: ["teaching-models"],
    queryFn: async () => {
      if (!actor) return [];
      return actor.getTeachingModels();
    },
    enabled: !!actor && !isFetching,
  });

  const headline = siteTexts?.unterrichtHeadline ?? "Dein Weg zur Gitarre";
  const intro =
    siteTexts?.unterrichtIntro ??
    "Ob Anfänger oder Fortgeschrittener — maßgeschneiderter Unterricht, der sich deinem Tempo und Stil anpasst. Persönlich, professionell und leidenschaftlich.";
  const ctaText = siteTexts?.unterrichtCTA ?? "Kontakt aufnehmen";

  return (
    <div className="min-h-screen bg-background">
      {/* ── Hero header ───────────────────────────────────────────────────── */}
      <section className="relative overflow-hidden bg-card border-b border-border pt-12 pb-20 px-4">
        {/* Decorative radial glow */}
        <div
          className="pointer-events-none absolute -top-40 left-1/2 -translate-x-1/2 w-[700px] h-[480px] rounded-full blur-3xl opacity-60"
          style={{
            background:
              "radial-gradient(ellipse, oklch(var(--primary) / 0.12) 0%, transparent 70%)",
          }}
          aria-hidden
        />

        <ScrollReveal direction="up">
          <div className="relative z-10 max-w-3xl mx-auto text-center">
            {/* Eyebrow tag */}
            <div className="inline-flex items-center gap-2 bg-primary/10 border border-primary/20 text-primary text-xs font-semibold rounded-full px-4 py-1.5 mb-6 uppercase tracking-wider">
              <GraduationCap className="w-3.5 h-3.5" />
              Gitarrenunterricht in Aachen
            </div>

            <h1 className="text-5xl md:text-6xl font-extrabold text-foreground mb-5 leading-tight tracking-tight">
              {headline}
            </h1>

            <p className="text-lg text-muted-foreground max-w-xl mx-auto leading-relaxed">
              {intro}
            </p>

            {/* Benefit pills */}
            <div className="flex flex-wrap justify-center gap-3 mt-8">
              {(featureCards && featureCards.length > 0
                ? featureCards.map((card) => ({
                    icon: Star,
                    label: card.title,
                  }))
                : BENEFITS
              ).map(({ icon: Icon, label }) => (
                <span
                  key={label}
                  className="flex items-center gap-1.5 bg-muted/60 text-muted-foreground text-sm px-3.5 py-1.5 rounded-full border border-border"
                >
                  <Icon className="w-3.5 h-3.5 text-primary" />
                  {label}
                </span>
              ))}
            </div>
          </div>
        </ScrollReveal>
      </section>

      {/* ── Models grid ───────────────────────────────────────────────────── */}
      <section className="py-20 px-4 bg-background">
        <div className="max-w-5xl mx-auto">
          <ScrollReveal direction="up">
            <div className="text-center mb-14">
              <h2 className="text-3xl md:text-4xl font-bold text-foreground mb-3">
                Unterrichtsmodelle
              </h2>
              <p className="text-muted-foreground max-w-lg mx-auto">
                Wähle das Modell, das am besten zu dir und deinen Zielen passt.
              </p>
              <div className="mx-auto mt-5 h-0.5 w-16 rounded-full bg-primary" />
            </div>
          </ScrollReveal>

          {/* Loading state */}
          {(isLoading || isFetching) && (
            <div className="grid md:grid-cols-2 gap-6">
              <ModelSkeleton />
              <ModelSkeleton />
            </div>
          )}

          {/* Error state */}
          {isError && !isLoading && (
            <ScrollReveal direction="up">
              <div
                data-ocid="teaching-models-error"
                className="text-center py-20 rounded-2xl border border-dashed border-destructive/40 bg-destructive/5"
              >
                <GraduationCap className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
                <p className="text-muted-foreground text-sm">
                  Fehler beim Laden der Unterrichtsmodelle. Bitte versuche es
                  später noch einmal.
                </p>
              </div>
            </ScrollReveal>
          )}

          {/* Empty state */}
          {!isLoading &&
            !isError &&
            teachingModels &&
            teachingModels.length === 0 && (
              <ScrollReveal direction="up">
                <div
                  data-ocid="teaching-models-empty"
                  className="text-center py-20 rounded-2xl border border-dashed border-border bg-card"
                >
                  <GraduationCap className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
                  <p className="text-muted-foreground text-sm">
                    Noch keine Unterrichtsmodelle verfügbar.
                  </p>
                </div>
              </ScrollReveal>
            )}

          {/* Cards */}
          {!isLoading && teachingModels && teachingModels.length > 0 && (
            <div
              className={`grid gap-6 ${
                teachingModels.length === 1
                  ? "max-w-md mx-auto"
                  : teachingModels.length === 2
                    ? "md:grid-cols-2 max-w-3xl mx-auto"
                    : "md:grid-cols-2 lg:grid-cols-3"
              }`}
            >
              {teachingModels.map((model, i) => (
                <TeachingModelCard
                  key={Number(model.id)}
                  model={model}
                  index={i}
                />
              ))}
            </div>
          )}
        </div>
      </section>

      {/* ── Divider with decorative rule ─────────────────────────────────── */}
      <div className="px-4">
        <div className="max-w-5xl mx-auto h-px bg-gradient-to-r from-transparent via-border to-transparent" />
      </div>

      {/* ── Contact CTA ───────────────────────────────────────────────────── */}
      <section
        className="py-20 px-4 bg-muted/30"
        data-ocid="contact-cta-section"
      >
        <ScrollReveal direction="up">
          <div className="max-w-2xl mx-auto text-center">
            {/* Icon */}
            <div className="inline-flex items-center justify-center w-14 h-14 rounded-2xl bg-primary/15 border border-primary/25 mb-6">
              <Mail className="w-6 h-6 text-primary" />
            </div>

            <h2 className="text-3xl font-bold text-foreground mb-3">
              Fragen? Schreib uns!
            </h2>
            <p className="text-muted-foreground mb-8 leading-relaxed max-w-md mx-auto">
              Unsicher welches Modell passt? Melde dich einfach — die erste
              Probestunde ist{" "}
              <span className="text-primary font-semibold">kostenlos</span>.
            </p>

            <a
              href="mailto:info@everblackmusic.com"
              data-ocid="cta-email-contact"
              className="inline-flex items-center gap-2.5 bg-primary text-primary-foreground font-semibold px-8 py-3.5 rounded-xl shadow-lg shadow-primary/25 hover:bg-primary/90 hover:shadow-primary/40 transition-all duration-300 text-base"
            >
              <Mail className="w-4.5 h-4.5" />
              {ctaText}
            </a>

            <p className="mt-6 text-xs text-muted-foreground">
              Everblack Music · Bergische Gasse 9 · 52064 Aachen
            </p>
          </div>
        </ScrollReveal>
      </section>
    </div>
  );
}
