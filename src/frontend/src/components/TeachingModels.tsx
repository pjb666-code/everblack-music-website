import type { TeachingModel } from "@/backend";
import { useFileUrl } from "@/blob-storage/FileStorage";
import LazyImage from "@/components/LazyImage";
import ScrollReveal from "@/components/ScrollReveal";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { SkeletonCard } from "@/components/ui/skeleton-cards";
import { useTeachingModels } from "@/hooks/useQueries";
import { useNavigate } from "@tanstack/react-router";
import { ArrowRight, Check, MessageSquare, Users } from "lucide-react";

function ModelIcon({ title }: { title: string }) {
  const t = title.toLowerCase();
  if (t.includes("privat") || t.includes("einzel")) {
    return <Users className="icon-lg" />;
  }
  return <MessageSquare className="icon-lg" />;
}

function ModelCoverImage({ imagePath }: { imagePath?: string }) {
  const { data: imageUrl } = useFileUrl(imagePath || "");
  if (!imagePath || !imageUrl) return null;
  return (
    <div className="overflow-hidden rounded-t-lg -mx-6 -mt-6 mb-5 h-44 relative">
      <LazyImage
        src={imageUrl}
        alt="Unterrichtsmodell"
        className="w-full h-full object-cover"
        wrapperClassName="w-full h-full"
      />
      <div className="absolute inset-0 bg-gradient-to-b from-transparent to-card/80" />
    </div>
  );
}

function TeachingModelCard({
  model,
  index,
  isFeatured,
}: {
  model: TeachingModel;
  index: number;
  isFeatured: boolean;
}) {
  const navigate = useNavigate();
  const goToUnterricht = () => navigate({ to: "/unterricht" });

  const spacerIndices = new Set(
    model.features
      .map((f, i) => ({ f, i }))
      .filter(({ f }) => f === "")
      .map(({ i }) => i),
  );

  return (
    <ScrollReveal direction="up" duration={550} delay={index * 100}>
      <Card
        className="relative overflow-hidden border-border/50 hover:border-primary/40 transition-smooth hover:shadow-elevated hover:-translate-y-1 h-full flex flex-col group cursor-pointer"
        onClick={goToUnterricht}
        data-ocid={`teaching-card-${index}`}
      >
        {/* Decorative corner glow */}
        <div className="absolute top-0 right-0 w-28 h-28 bg-gradient-to-br from-primary/15 to-accent/10 rounded-bl-full opacity-0 group-hover:opacity-100 transition-opacity duration-400 pointer-events-none" />

        <CardHeader className="space-y-0 pb-0">
          <ModelCoverImage imagePath={model.imagePath} />

          {/* Icon + badge row */}
          <div className="flex items-start justify-between mb-4">
            <div className="p-2.5 rounded-xl bg-primary/10 text-primary">
              <ModelIcon title={model.title} />
            </div>
            {isFeatured && (
              <Badge
                variant="secondary"
                className="text-xs bg-primary/15 text-primary border-primary/20"
              >
                Beliebt
              </Badge>
            )}
          </div>

          <h3 className="text-heading text-foreground mb-0.5">{model.title}</h3>
          {model.subtitle && (
            <p className="text-xs text-muted-foreground mb-1 font-medium tracking-wide uppercase">
              {model.subtitle}
            </p>
          )}
          <div className="text-2xl font-bold text-primary mb-3">
            {model.price}
          </div>
          {model.description && (
            <p className="text-body-sm text-muted-foreground leading-relaxed mb-2">
              {model.description}
            </p>
          )}
        </CardHeader>

        <CardContent className="flex-1 flex flex-col pt-4 space-y-5">
          <ul className="space-y-2.5 flex-1">
            {model.features.map((feature, fi) =>
              spacerIndices.has(fi) ? (
                // biome-ignore lint/suspicious/noArrayIndexKey: spacer has no key
                <li key={fi} className="h-1" aria-hidden />
              ) : (
                <li key={feature} className="flex items-start gap-2.5">
                  <span className="mt-0.5 flex-shrink-0 w-5 h-5 rounded-full bg-primary/10 flex items-center justify-center">
                    <Check className="w-3 h-3 text-primary" />
                  </span>
                  <span className="text-body-sm text-muted-foreground">
                    {feature}
                  </span>
                </li>
              ),
            )}
          </ul>

          <Button
            onClick={(e) => {
              e.stopPropagation();
              goToUnterricht();
            }}
            className="w-full shadow-medium shadow-primary/15 font-semibold group/btn"
            data-ocid={`teaching-cta-${index}`}
          >
            Mehr erfahren
            <ArrowRight className="ml-2 w-4 h-4 transition-transform group-hover/btn:translate-x-1" />
          </Button>
        </CardContent>
      </Card>
    </ScrollReveal>
  );
}

export default function TeachingModels() {
  const { data: models, isLoading } = useTeachingModels();

  if (isLoading) {
    return (
      <section id="teaching" className="section-default py-24">
        <div className="container mx-auto px-4 max-w-6xl">
          <div className="text-center mb-14">
            <div className="h-10 w-64 bg-muted/40 rounded-md mx-auto mb-4 animate-pulse" />
            <div className="h-0.5 w-20 bg-muted/30 rounded-full mx-auto" />
          </div>
          <div className="grid md:grid-cols-2 gap-8">
            <SkeletonCard />
            <SkeletonCard />
          </div>
        </div>
      </section>
    );
  }

  // No data from backend — silent return; admin must seed from the panel
  if (!models || models.length === 0) return null;

  const displayModels = models.slice(0, 3);

  const colClass =
    displayModels.length === 1
      ? "max-w-md mx-auto"
      : displayModels.length >= 3
        ? "grid md:grid-cols-2 lg:grid-cols-3 gap-8"
        : "grid md:grid-cols-2 gap-8";

  return (
    <section id="teaching" className="section-default py-24 relative">
      <div className="absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-border/50 to-transparent" />

      <div className="container mx-auto px-4">
        <div className="max-w-6xl mx-auto">
          <ScrollReveal direction="up" duration={600}>
            <div className="text-center mb-14">
              <h2 className="text-display text-foreground mb-4">
                Unterrichtsmodelle
              </h2>
              <p className="text-body text-muted-foreground text-lg max-w-2xl mx-auto mb-6">
                Wähle das Modell, das am besten zu deinen Zielen passt.
              </p>
              <div className="w-20 h-0.5 bg-gradient-to-r from-primary to-accent mx-auto" />
            </div>
          </ScrollReveal>

          <div className={colClass}>
            {displayModels.map((model, index) => (
              <TeachingModelCard
                key={Number(model.id)}
                model={model}
                index={index}
                isFeatured={Boolean(model.featured) || index === 0}
              />
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
