import { Skeleton } from "@/components/ui/skeleton";
import { usePrivacyPolicy } from "@/hooks/useQueries";
import { Link } from "@tanstack/react-router";
import { ArrowLeft, Calendar, Info, ShieldCheck } from "lucide-react";
import { useEffect } from "react";

function LegalSkeleton() {
  return (
    <div className="space-y-4 animate-pulse">
      <Skeleton className="h-6 w-48 bg-muted" />
      <Skeleton className="h-4 w-full bg-muted" />
      <Skeleton className="h-4 w-5/6 bg-muted" />
      <Skeleton className="h-4 w-full bg-muted" />
      <Skeleton className="h-4 w-3/4 bg-muted" />
      <Skeleton className="h-4 w-full bg-muted" />
      <Skeleton className="h-4 w-4/5 bg-muted" />
    </div>
  );
}

function formatDate(timestamp: bigint): string {
  const date = new Date(Number(timestamp) / 1_000_000);
  return date.toLocaleDateString("de-DE", {
    year: "numeric",
    month: "long",
    day: "numeric",
  });
}

function formatContent(content: string) {
  const lines = content.split("\n");
  return lines.map((line, i) => {
    const key = `${i}-${line.substring(0, 12)}`;
    return (
      <span key={key}>
        {line || "\u00A0"}
        {i < lines.length - 1 && <br />}
      </span>
    );
  });
}

export default function PrivacyPolicyPage() {
  const { data, isLoading } = usePrivacyPolicy();

  useEffect(() => {
    document.title = "Datenschutzerklärung – Everblack Music";
  }, []);

  const hasContent = data?.content?.trim().length;
  const hasTimestamp = data?.lastUpdated && data.lastUpdated > 0n;

  return (
    <div className="min-h-screen bg-background">
      {/* Page header band */}
      <div className="bg-card border-b border-border">
        <div className="container mx-auto px-4 py-8 md:py-12">
          <Link
            to="/"
            className="inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-primary transition-colors duration-200 mb-6 group"
            data-ocid="privacy-back-home"
          >
            <ArrowLeft className="w-4 h-4 group-hover:-translate-x-0.5 transition-transform duration-200" />
            Zurück zur Startseite
          </Link>

          <div className="flex items-start gap-4">
            <div
              className="w-12 h-12 rounded-xl flex items-center justify-center shrink-0"
              style={{
                background:
                  "color-mix(in oklch, var(--primary) 15%, transparent)",
              }}
            >
              <ShieldCheck className="w-6 h-6 text-primary" />
            </div>
            <div>
              <h1
                className="text-3xl md:text-4xl font-bold text-foreground tracking-tight"
                style={{ fontFamily: "var(--font-display)" }}
              >
                Datenschutzerklärung
              </h1>
              {hasTimestamp ? (
                <div className="flex items-center gap-1.5 mt-2 text-sm text-muted-foreground">
                  <Calendar className="w-3.5 h-3.5" />
                  <span>
                    Zuletzt aktualisiert: {formatDate(data!.lastUpdated)}
                  </span>
                </div>
              ) : null}
            </div>
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="container mx-auto px-4 py-12">
        <div className="max-w-3xl mx-auto">
          {isLoading ? (
            <div className="bg-card rounded-xl border border-border p-8">
              <LegalSkeleton />
            </div>
          ) : hasContent ? (
            <div
              className="bg-card rounded-xl border border-border p-8 md:p-10"
              data-ocid="privacy-content"
            >
              {/* Turquoise accent bar */}
              <div
                className="w-12 h-1 rounded-full mb-6"
                style={{ background: "var(--primary)" }}
              />
              <div className="text-foreground leading-relaxed text-base space-y-2">
                {formatContent(data!.content)}
              </div>
            </div>
          ) : (
            <div
              className="bg-card rounded-xl border border-border p-12 text-center"
              data-ocid="privacy-empty"
            >
              <Info className="w-10 h-10 text-muted-foreground mx-auto mb-4" />
              <p className="text-muted-foreground text-sm">
                Kein Inhalt verfügbar. Der Administrator hat noch keine
                Datenschutzerklärung hinterlegt.
              </p>
            </div>
          )}

          <div className="mt-10 pt-6 border-t border-border">
            <Link
              to="/"
              className="inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-primary transition-colors duration-200 group"
            >
              <ArrowLeft className="w-4 h-4 group-hover:-translate-x-0.5 transition-transform duration-200" />
              Zurück zur Startseite
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
