import { useFileUrl } from "@/blob-storage/FileStorage";
import { Button } from "@/components/ui/button";
import { useActor } from "@/hooks/useActor";
import { useLogoSizePercent, useSiteLogoUrl } from "@/hooks/useQueries";
import { useQuery } from "@tanstack/react-query";
import { useNavigate, useRouterState } from "@tanstack/react-router";
import { Menu, X } from "lucide-react";
import { useEffect, useState } from "react";

const NAV_ITEMS = [
  { label: "Unterricht", path: "/unterricht" },
  { label: "Studio", path: "/studio" },
  { label: "Media", path: "/media" },
  { label: "Shop", path: "/shop" },
] as const;

function LogoImage(_: { scrolled: boolean }) {
  const { data: logoPath } = useSiteLogoUrl();
  const { data: logoSizePct } = useLogoSizePercent();
  // Convert blob path to actual URL
  const { data: blobLogoUrl } = useFileUrl(logoPath ?? "");

  // Use blob URL if available; fall back to asset path from header section
  const { actor, isFetching } = useActor();
  const { data: headerData } = useQuery({
    queryKey: ["header-section"],
    queryFn: async () => {
      if (!actor) return null;
      return actor.getHeaderSection();
    },
    enabled: !!actor && !isFetching,
    staleTime: Number.POSITIVE_INFINITY,
  });

  const logoSrc =
    blobLogoUrl ??
    (logoPath?.startsWith("http") ? logoPath : null) ??
    `/assets/${headerData?.logoPath ?? "Transparent Background-white.png"}`;

  const sizePercent = logoSizePct !== undefined ? Number(logoSizePct) : 100;
  // sizePercent 20–200 maps to 40px–400px width; at 100% = 200px
  const logoWidth = Math.round((sizePercent / 100) * 200);
  const logoHeight = Math.round((sizePercent / 100) * 64);

  return (
    <div
      style={{
        maxWidth: `${logoWidth}px`,
        maxHeight: `${logoHeight}px`,
        width: "100%",
        flexShrink: 0,
      }}
    >
      <img
        src={logoSrc}
        alt="Everblack Music Logo"
        className="object-contain w-full h-full transition-all duration-300"
      />
    </div>
  );
}

export default function Header() {
  const navigate = useNavigate();
  const routerState = useRouterState();
  const { actor, isFetching } = useActor();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);

  const { data: colorScheme } = useQuery({
    queryKey: ["color-scheme"],
    queryFn: async () => {
      if (!actor) return null;
      return actor.getColorScheme();
    },
    enabled: !!actor && !isFetching,
    staleTime: Number.POSITIVE_INFINITY,
    gcTime: Number.POSITIVE_INFINITY,
  });

  // Apply accent color from backend as inline CSS override
  useEffect(() => {
    if (!colorScheme) return;
    const root = document.documentElement;
    if (colorScheme.primaryColor) {
      root.style.setProperty("--accent-hex", colorScheme.primaryColor);
      root.style.setProperty("--primary-hex", colorScheme.primaryColor);
    }
    if (colorScheme.gradientStartColor) {
      root.style.setProperty(
        "--gradient-start",
        colorScheme.gradientStartColor,
      );
    }
    if (colorScheme.gradientEndColor) {
      root.style.setProperty("--gradient-end", colorScheme.gradientEndColor);
    }
  }, [colorScheme]);

  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 40);
    window.addEventListener("scroll", handleScroll, { passive: true });
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  const currentPath = routerState.location.pathname;

  const handleNavigation = (path: string) => {
    navigate({ to: path });
    setMobileMenuOpen(false);
  };

  const scrollToContact = () => {
    if (currentPath !== "/") {
      navigate({ to: "/" });
      setTimeout(() => {
        document
          .getElementById("contact")
          ?.scrollIntoView({ behavior: "smooth" });
      }, 200);
    } else {
      document
        .getElementById("contact")
        ?.scrollIntoView({ behavior: "smooth" });
    }
    setMobileMenuOpen(false);
  };

  const hasGradient = !!(
    colorScheme?.gradientStartColor && colorScheme?.gradientEndColor
  );
  const primaryColor = colorScheme?.primaryColor ?? "#0D9488";

  const ctaStyle = hasGradient
    ? {
        background: `linear-gradient(to right, ${colorScheme!.gradientStartColor}, ${colorScheme!.gradientEndColor})`,
        color: "#fff",
        border: "none",
      }
    : { background: primaryColor, color: "#fff", border: "none" };

  const getNavLinkClass = (path: string) => {
    const isActive = currentPath === path;
    const base =
      "relative text-sm font-medium transition-colors duration-200 focus-ring rounded-sm pb-0.5";
    if (isActive) {
      return `${base} text-foreground after:absolute after:bottom-0 after:left-0 after:right-0 after:h-0.5 after:rounded-full`;
    }
    return `${base} text-muted-foreground hover:text-foreground`;
  };

  return (
    <header
      className={`fixed top-0 left-0 right-0 z-50 border-b border-border transition-all duration-300 ${
        scrolled
          ? "bg-card/98 backdrop-blur-xl shadow-medium"
          : "bg-card/90 backdrop-blur-md"
      }`}
      data-ocid="main-header"
    >
      <div className="container mx-auto px-4">
        <nav
          className={`flex items-center justify-between transition-all duration-300 ${
            scrolled ? "py-2" : "py-4"
          }`}
        >
          {/* Logo */}
          <button
            type="button"
            onClick={() => handleNavigation("/")}
            className="flex items-center cursor-pointer focus-ring rounded-sm shrink-0 w-fit"
            aria-label="Zur Startseite"
          >
            <LogoImage scrolled={scrolled} />
          </button>

          {/* Mobile menu toggle */}
          <button
            type="button"
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="md:hidden p-2 text-foreground focus-ring rounded-md"
            aria-label={mobileMenuOpen ? "Menü schließen" : "Menü öffnen"}
            aria-expanded={mobileMenuOpen}
          >
            {mobileMenuOpen ? (
              <X className="w-6 h-6" />
            ) : (
              <Menu className="w-6 h-6" />
            )}
          </button>

          {/* Desktop navigation */}
          <div className="hidden md:flex items-center gap-7">
            {NAV_ITEMS.map(({ label, path }) => (
              <button
                key={path}
                type="button"
                onClick={() => handleNavigation(path)}
                className={getNavLinkClass(path)}
                data-ocid={`nav-${label.toLowerCase()}`}
                style={
                  currentPath === path
                    ? ({
                        "--active-color": primaryColor,
                      } as React.CSSProperties)
                    : undefined
                }
              >
                {label}
                {currentPath === path && (
                  <span
                    className="absolute bottom-0 left-0 right-0 h-0.5 rounded-full"
                    style={{ background: primaryColor }}
                    aria-hidden
                  />
                )}
              </button>
            ))}
            <Button
              type="button"
              onClick={scrollToContact}
              size="sm"
              style={ctaStyle}
              className="font-semibold rounded-md hover:opacity-90 active:opacity-80 transition-opacity"
              data-ocid="nav-kontakt"
            >
              Kontakt
            </Button>
          </div>
        </nav>

        {/* Mobile menu */}
        {mobileMenuOpen && (
          <div className="md:hidden border-t border-border pt-3 pb-4 space-y-1 animate-slide-in-down">
            {NAV_ITEMS.map(({ label, path }) => (
              <button
                key={path}
                type="button"
                onClick={() => handleNavigation(path)}
                className={`block w-full text-left px-4 py-2.5 rounded-md ${getNavLinkClass(path)}`}
                data-ocid={`mobile-nav-${label.toLowerCase()}`}
              >
                {label}
              </button>
            ))}
            <div className="px-4 pt-2">
              <Button
                type="button"
                onClick={scrollToContact}
                size="sm"
                style={ctaStyle}
                className="w-full font-semibold rounded-md hover:opacity-90 transition-opacity"
                data-ocid="mobile-nav-kontakt"
              >
                Kontakt
              </Button>
            </div>
          </div>
        )}
      </div>
    </header>
  );
}
