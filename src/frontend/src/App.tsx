import { useFileUrl } from "@/blob-storage/FileStorage";
import { Toaster } from "@/components/ui/sonner";
import { useActor } from "@/hooks/useActor";
import { useFaviconUrl, useSiteLogoUrl } from "@/hooks/useQueries";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import {
  Outlet,
  RouterProvider,
  createRootRoute,
  createRoute,
  createRouter,
  useRouterState,
} from "@tanstack/react-router";
import { ThemeProvider } from "next-themes";
import { useEffect } from "react";
import Footer from "./components/Footer";
import Header from "./components/Header";
import AdminDashboard from "./pages/AdminDashboard";
import AdminLogin from "./pages/AdminLogin";
import AdminSetup from "./pages/AdminSetup";
import ImprintPage from "./pages/ImprintPage";
import LandingPage from "./pages/LandingPage";
import MediaPage from "./pages/MediaPage";
import PaymentFailure from "./pages/PaymentFailure";
import PaymentSuccess from "./pages/PaymentSuccess";
import PrivacyPolicyPage from "./pages/PrivacyPolicyPage";
import ShopPage from "./pages/ShopPage";
import StudioPage from "./pages/StudioPage";
import TermsOfServicePage from "./pages/TermsOfServicePage";
import UnterrichtPage from "./pages/UnterrichtPage";

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      // Default staleTime: keep data fresh for 10 minutes
      // Individual queries override this where needed (Infinity for static data)
      staleTime: 10 * 60 * 1000,
      gcTime: 60 * 60 * 1000,
      retry: 0,
      refetchOnWindowFocus: false,
      refetchOnMount: false,
    },
  },
});

/**
 * Dynamically updates the browser favicon.
 * Priority: faviconUrl (separate favicon field) → siteLogoUrl (header logo) → /favicon.ico
 */
function DynamicFavicon() {
  // Separate favicon (new field) — falls back to site logo path if not set
  const { data: faviconPath } = useFaviconUrl();
  const { data: logoPath } = useSiteLogoUrl();

  // Resolve whichever path is set to a blob URL
  const activePath = faviconPath || logoPath || "";
  const { data: blobUrl } = useFileUrl(activePath);

  useEffect(() => {
    const existing = document.querySelector(
      "link[rel~='icon']",
    ) as HTMLLinkElement | null;
    const link =
      existing ??
      (() => {
        const el = document.createElement("link");
        el.rel = "icon";
        document.head.appendChild(el);
        return el;
      })();

    if (blobUrl) {
      link.href = blobUrl;
    } else if (activePath.startsWith("http")) {
      link.href = activePath;
    } else {
      link.href = "/favicon.ico";
    }
  }, [activePath, blobUrl]);

  return null;
}

/**
 * Fetches the backend ColorScheme once and applies it as CSS variables on :root.
 * The accent color is ALWAYS applied from backend — never hardcoded in CSS.
 */
function ColorSchemeApplier() {
  const { actor, isFetching } = useActor();

  useEffect(() => {
    if (!actor || isFetching) return;

    actor
      .getColorScheme()
      .then((scheme) => {
        const root = document.documentElement;
        if (scheme.primaryColor) {
          root.style.setProperty("--accent-hex", scheme.primaryColor);
          root.style.setProperty("--primary-hex", scheme.primaryColor);
        }
        if (scheme.gradientStartColor) {
          root.style.setProperty("--gradient-start", scheme.gradientStartColor);
        }
        if (scheme.gradientEndColor) {
          root.style.setProperty("--gradient-end", scheme.gradientEndColor);
        }
      })
      .catch(() => {
        // Keep default CSS variables from index.css on error
      });
  }, [actor, isFetching]);

  return null;
}

// Scrolls to the top of the page on every route change
function ScrollToTop() {
  const pathname = useRouterState({ select: (s) => s.location.pathname });
  // biome-ignore lint/correctness/useExhaustiveDependencies: pathname is the intentional trigger
  useEffect(() => {
    window.scrollTo({ top: 0, left: 0, behavior: "instant" });
  }, [pathname]);
  return null;
}

// Layout component with Header and Footer
function Layout() {
  return (
    <div className="min-h-screen bg-background flex flex-col">
      <ScrollToTop />
      <ColorSchemeApplier />
      <DynamicFavicon />
      <Header />
      {/* pt-20 provides clearance for the fixed header (min height ~80px at rest) */}
      <main className="flex-1 pt-20">
        <Outlet />
      </main>
      <Footer />
    </div>
  );
}

// Root route with layout
const rootRoute = createRootRoute({
  component: Layout,
});

const indexRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: "/",
  component: LandingPage,
});

const unterrichtRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: "/unterricht",
  component: UnterrichtPage,
});

const studioRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: "/studio",
  component: StudioPage,
});

const mediaRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: "/media",
  component: MediaPage,
});

const shopRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: "/shop",
  component: ShopPage,
});

const paymentSuccessRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: "/payment-success",
  component: PaymentSuccess,
});

const paymentFailureRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: "/payment-failure",
  component: PaymentFailure,
});

const adminLoginRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: "/admin/login",
  component: AdminLogin,
});

const adminSetupRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: "/admin/setup",
  component: AdminSetup,
});

const adminDashboardRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: "/admin",
  component: AdminDashboard,
});

const imprintRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: "/impressum",
  component: ImprintPage,
});

const privacyPolicyRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: "/datenschutz",
  component: PrivacyPolicyPage,
});

const termsOfServiceRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: "/nutzungsbedingungen",
  component: TermsOfServicePage,
});

const routeTree = rootRoute.addChildren([
  indexRoute,
  unterrichtRoute,
  studioRoute,
  mediaRoute,
  shopRoute,
  paymentSuccessRoute,
  paymentFailureRoute,
  adminLoginRoute,
  adminSetupRoute,
  adminDashboardRoute,
  imprintRoute,
  privacyPolicyRoute,
  termsOfServiceRoute,
]);

const router = createRouter({ routeTree });

function App() {
  return (
    <ThemeProvider attribute="class" defaultTheme="dark" enableSystem={false}>
      <QueryClientProvider client={queryClient}>
        <RouterProvider router={router} />
        <Toaster />
      </QueryClientProvider>
    </ThemeProvider>
  );
}

export default App;
