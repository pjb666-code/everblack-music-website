import { Separator } from "@/components/ui/separator";
import { useSiteTexts } from "@/hooks/useQueries";
import { Link } from "@tanstack/react-router";
import { Mail, MapPin, Music } from "lucide-react";

const LEGAL_LINKS = [
  { label: "Impressum", to: "/impressum" },
  { label: "Datenschutzerklärung", to: "/datenschutz" },
  { label: "Nutzungsbedingungen", to: "/nutzungsbedingungen" },
] as const;

const NAV_LINKS = [
  { label: "Unterricht", to: "/unterricht" },
  { label: "Studio", to: "/studio" },
  { label: "Media", to: "/media" },
  { label: "Shop", to: "/shop" },
] as const;

export default function Footer() {
  const hostname =
    typeof window !== "undefined"
      ? encodeURIComponent(window.location.hostname)
      : "";
  const { data: siteTexts } = useSiteTexts();
  const year = new Date().getFullYear();
  const copyright =
    siteTexts?.footerCopyright ??
    `© ${year} Everblack Music. Alle Rechte vorbehalten.`;

  return (
    <footer className="bg-card border-t border-border" data-ocid="site-footer">
      <div className="container mx-auto px-4 py-12">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-10">
          {/* Brand column */}
          <div className="space-y-4">
            <div className="flex items-center gap-2">
              <Music className="w-5 h-5 text-primary" />
              <span
                className="font-semibold text-foreground"
                style={{ fontFamily: "var(--font-display)" }}
              >
                Everblack Music
              </span>
            </div>
            <p className="text-sm leading-relaxed text-muted-foreground max-w-xs">
              Professioneller Gitarrenunterricht &amp; Studiodienstleistungen in
              Aachen.
            </p>
            <div className="space-y-2 pt-1">
              <a
                href="mailto:info@everblackmusic.com"
                className="flex items-center gap-2 text-sm text-muted-foreground hover:text-primary transition-colors duration-200"
              >
                <Mail className="w-4 h-4 shrink-0" />
                <span className="min-w-0 break-words">
                  info@everblackmusic.com
                </span>
              </a>
              <div className="flex items-start gap-2 text-sm text-muted-foreground">
                <MapPin className="w-4 h-4 shrink-0 mt-0.5" />
                <span>Bergische Gasse 9, 52064 Aachen</span>
              </div>
            </div>
          </div>

          {/* Navigation column */}
          <div className="space-y-4">
            <h3 className="text-sm font-semibold text-foreground uppercase tracking-wider">
              Navigation
            </h3>
            <nav className="flex flex-col gap-2">
              {NAV_LINKS.map(({ label, to }) => (
                <Link
                  key={to}
                  to={to}
                  className="text-sm text-muted-foreground hover:text-primary transition-colors duration-200 w-fit"
                  data-ocid={`footer-nav-${label.toLowerCase()}`}
                >
                  {label}
                </Link>
              ))}
            </nav>
          </div>

          {/* Legal column */}
          <div className="space-y-4">
            <h3 className="text-sm font-semibold text-foreground uppercase tracking-wider">
              Rechtliches
            </h3>
            <nav className="flex flex-col gap-2">
              {LEGAL_LINKS.map(({ label, to }) => (
                <Link
                  key={to}
                  to={to}
                  className="text-sm text-muted-foreground hover:text-primary transition-colors duration-200 w-fit"
                  data-ocid={`footer-legal-${to.replace("/", "")}`}
                >
                  {label}
                </Link>
              ))}
            </nav>
          </div>
        </div>

        <Separator className="my-8 bg-border" />

        <div className="flex flex-col sm:flex-row items-center justify-between gap-4 text-sm text-muted-foreground">
          <span data-ocid="footer-copyright">{copyright}</span>
          <span className="flex items-center gap-1">
            Built with love using{" "}
            <a
              href={`https://caffeine.ai?utm_source=caffeine-footer&utm_medium=referral&utm_content=${hostname}`}
              target="_blank"
              rel="noopener noreferrer"
              className="text-primary hover:underline font-medium"
            >
              caffeine.ai
            </a>
          </span>
        </div>
      </div>
    </footer>
  );
}
