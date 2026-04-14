import AdminColors from "@/components/admin/AdminColors";
import AdminFeatures from "@/components/admin/AdminFeatures";
import AdminImages from "@/components/admin/AdminImages";
import AdminLandingPage from "@/components/admin/AdminLandingPage";
import AdminLegal from "@/components/admin/AdminLegal";
import AdminMedia from "@/components/admin/AdminMedia";
import AdminProducts from "@/components/admin/AdminProducts";
import AdminSiteLogo from "@/components/admin/AdminSiteLogo";
import AdminStripe from "@/components/admin/AdminStripe";
import AdminStudioServices from "@/components/admin/AdminStudioServices";
import AdminTeachingModels from "@/components/admin/AdminTeachingModels";
import AdminTexts from "@/components/admin/AdminTexts";
import { Button } from "@/components/ui/button";
import { useActor } from "@/hooks/useActor";
import { useInternetIdentity } from "@/hooks/useInternetIdentity";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { useNavigate } from "@tanstack/react-router";
import {
  FileText,
  Globe,
  Image as ImageIcon,
  Layers,
  LayoutDashboard,
  Loader2,
  LogOut,
  Music,
  Package,
  Palette,
  Scale,
  ShoppingBag,
  Sparkles,
  X,
} from "lucide-react";
import { useEffect, useState } from "react";

type NavSection = {
  id: string;
  label: string;
  icon: React.ReactNode;
  group: string;
};

const navSections: NavSection[] = [
  {
    id: "texts",
    label: "Texte",
    icon: <FileText className="w-4 h-4" />,
    group: "Inhalte",
  },
  {
    id: "images",
    label: "Bilder",
    icon: <ImageIcon className="w-4 h-4" />,
    group: "Inhalte",
  },
  {
    id: "features",
    label: "Feature-Karten",
    icon: <Sparkles className="w-4 h-4" />,
    group: "Inhalte",
  },
  {
    id: "teaching",
    label: "Unterricht",
    icon: <Layers className="w-4 h-4" />,
    group: "Inhalte",
  },
  {
    id: "media",
    label: "Medien",
    icon: <Music className="w-4 h-4" />,
    group: "Medien",
  },
  {
    id: "studio",
    label: "Studio",
    icon: <Layers className="w-4 h-4" />,
    group: "Medien",
  },
  {
    id: "colors",
    label: "Farben",
    icon: <Palette className="w-4 h-4" />,
    group: "Erscheinungsbild",
  },
  {
    id: "logo",
    label: "Logo & Favicon",
    icon: <Globe className="w-4 h-4" />,
    group: "Erscheinungsbild",
  },
  {
    id: "landing",
    label: "Landing Page",
    icon: <LayoutDashboard className="w-4 h-4" />,
    group: "Erscheinungsbild",
  },
  {
    id: "products",
    label: "Produkte",
    icon: <ShoppingBag className="w-4 h-4" />,
    group: "Produkte & Shop",
  },
  {
    id: "stripe",
    label: "Stripe",
    icon: <Package className="w-4 h-4" />,
    group: "Produkte & Shop",
  },
  {
    id: "legal",
    label: "Rechtliches",
    icon: <Scale className="w-4 h-4" />,
    group: "Rechtliches",
  },
];

const groups = [
  "Inhalte",
  "Medien",
  "Erscheinungsbild",
  "Produkte & Shop",
  "Rechtliches",
];

export default function AdminDashboard() {
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const { clear, identity, isInitializing } = useInternetIdentity();
  const { actor, isFetching: actorFetching } = useActor();
  const [activeTab, setActiveTab] = useState("texts");
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  useEffect(() => {
    document.title = "Admin Dashboard - Everblack Music";
  }, []);

  const { data: isAdmin, isLoading: checkingAdmin } = useQuery({
    queryKey: ["is-admin", identity?.getPrincipal().toString()],
    queryFn: async () => {
      if (!actor || !identity) return false;
      return actor.isCallerAdmin();
    },
    enabled: !!actor && !!identity && !actorFetching,
    retry: false,
  });

  useEffect(() => {
    if (!isInitializing && !actorFetching && !checkingAdmin) {
      if (!identity || !isAdmin) {
        navigate({ to: "/admin/login" });
      }
    }
  }, [
    identity,
    isAdmin,
    isInitializing,
    actorFetching,
    checkingAdmin,
    navigate,
  ]);

  const handleLogout = async () => {
    await clear();
    queryClient.clear();
    navigate({ to: "/" });
  };

  if (isInitializing || actorFetching || checkingAdmin) {
    return (
      <section className="py-32 min-h-screen flex items-center justify-center">
        <div className="text-center">
          <Loader2 className="w-12 h-12 animate-spin text-primary mx-auto mb-4" />
          <p className="text-muted-foreground">Lade Admin-Panel...</p>
        </div>
      </section>
    );
  }

  if (!identity || !isAdmin) return null;

  const activeSection = navSections.find((s) => s.id === activeTab);

  const handleNav = (id: string) => {
    setActiveTab(id);
    setMobileMenuOpen(false);
  };

  return (
    <div className="min-h-screen bg-background flex flex-col">
      {/* Top Header Bar */}
      <header className="bg-card border-b border-border shadow-subtle sticky top-0 z-40">
        <div className="container mx-auto px-4">
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center gap-3">
              <LayoutDashboard className="w-5 h-5 text-primary" />
              <div>
                <span className="font-bold text-foreground font-display">
                  Admin Dashboard
                </span>
                <span className="hidden sm:inline text-muted-foreground text-sm ml-2">
                  — Everblack Music
                </span>
              </div>
            </div>
            <div className="flex items-center gap-2">
              {/* Mobile menu toggle */}
              <Button
                variant="outline"
                size="sm"
                className="lg:hidden"
                onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
                aria-label="Navigationsmenü öffnen"
              >
                {mobileMenuOpen ? (
                  <X className="w-4 h-4" />
                ) : (
                  <LayoutDashboard className="w-4 h-4" />
                )}
                <span className="ml-2 text-xs">{activeSection?.label}</span>
              </Button>
              <Button onClick={handleLogout} variant="outline" size="sm">
                <LogOut className="mr-2 h-4 w-4" />
                Abmelden
              </Button>
            </div>
          </div>
        </div>
      </header>

      {/* Mobile dropdown nav */}
      {mobileMenuOpen && (
        <div className="lg:hidden bg-card border-b border-border shadow-medium z-30">
          <div className="container mx-auto px-4 py-3 space-y-3">
            {groups.map((group) => {
              const items = navSections.filter((s) => s.group === group);
              return (
                <div key={group}>
                  <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-1">
                    {group}
                  </p>
                  <div className="grid grid-cols-2 gap-1">
                    {items.map((item) => (
                      <button
                        key={item.id}
                        type="button"
                        onClick={() => handleNav(item.id)}
                        className={`flex items-center gap-2 px-3 py-2 rounded-md text-sm transition-colors text-left ${
                          activeTab === item.id
                            ? "bg-primary text-primary-foreground"
                            : "hover:bg-muted text-foreground"
                        }`}
                      >
                        {item.icon}
                        {item.label}
                      </button>
                    ))}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* Main layout */}
      <div className="flex flex-1">
        {/* Sidebar — desktop only */}
        <aside className="hidden lg:flex flex-col w-56 bg-card border-r border-border shrink-0">
          <nav className="p-3 flex-1 overflow-y-auto">
            {groups.map((group) => {
              const items = navSections.filter((s) => s.group === group);
              return (
                <div key={group} className="mb-5">
                  <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider px-2 mb-1.5">
                    {group}
                  </p>
                  <div className="space-y-0.5">
                    {items.map((item) => (
                      <button
                        key={item.id}
                        type="button"
                        data-ocid={`admin-nav-${item.id}`}
                        onClick={() => setActiveTab(item.id)}
                        className={`w-full flex items-center gap-2.5 px-3 py-2 rounded-md text-sm transition-colors text-left ${
                          activeTab === item.id
                            ? "bg-primary text-primary-foreground font-medium"
                            : "text-muted-foreground hover:text-foreground hover:bg-muted"
                        }`}
                      >
                        {item.icon}
                        {item.label}
                      </button>
                    ))}
                  </div>
                </div>
              );
            })}
          </nav>
        </aside>

        {/* Content area */}
        <main className="flex-1 overflow-auto p-6">
          <div className="max-w-5xl mx-auto">
            <div className="mb-6">
              <h1 className="text-2xl font-bold text-foreground font-display">
                {activeSection?.label}
              </h1>
              <p className="text-muted-foreground text-sm mt-0.5">
                {activeSection?.group}
              </p>
            </div>

            {activeTab === "texts" && <AdminTexts />}
            {activeTab === "images" && <AdminImages />}
            {activeTab === "features" && <AdminFeatures />}
            {activeTab === "teaching" && <AdminTeachingModels />}
            {activeTab === "media" && <AdminMedia />}
            {activeTab === "studio" && <AdminStudioServices />}
            {activeTab === "colors" && <AdminColors />}
            {activeTab === "logo" && <AdminSiteLogo />}
            {activeTab === "landing" && <AdminLandingPage />}
            {activeTab === "products" && <AdminProducts />}
            {activeTab === "stripe" && <AdminStripe />}
            {activeTab === "legal" && <AdminLegal />}
          </div>
        </main>
      </div>
    </div>
  );
}
