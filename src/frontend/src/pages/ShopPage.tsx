import type { Product, ShoppingItem } from "@/backend";
import { useFileUrl } from "@/blob-storage/FileStorage";
import LazyImage from "@/components/LazyImage";
import ScrollReveal from "@/components/ScrollReveal";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet";
import { Skeleton } from "@/components/ui/skeleton";
import { useActor } from "@/hooks/useActor";
import { useCheckout } from "@/hooks/useCheckout";
import { useSiteTexts } from "@/hooks/useQueries";
import { useQuery } from "@tanstack/react-query";
import {
  AlertTriangle,
  Download,
  Minus,
  Music,
  Package,
  Plus,
  ShoppingBag,
  ShoppingCart,
  Trash2,
  X,
} from "lucide-react";
import { useEffect, useState } from "react";

// ─── Helpers ─────────────────────────────────────────────────────────────────

function formatEur(cents: bigint | number): string {
  const value = (Number(cents) / 100).toFixed(2).replace(".", ",");
  return `€\u202F${value}`;
}

// ─── Product Image ────────────────────────────────────────────────────────────

function ProductImage({
  imageUrl,
  title,
}: { imageUrl?: string; title: string }) {
  if (!imageUrl) {
    return (
      <div className="w-full h-full flex flex-col items-center justify-center bg-muted gap-2">
        <Music className="w-12 h-12 text-muted-foreground/50" aria-hidden />
      </div>
    );
  }
  return (
    <LazyImage
      src={imageUrl}
      alt={title}
      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
      wrapperClassName="w-full h-full"
    />
  );
}

// ─── Product Card ─────────────────────────────────────────────────────────────

function ProductCard({ product, index }: { product: Product; index: number }) {
  const { data: imageUrl } = useFileUrl(product.imageUrl);
  const { addToCart, isStripeConfigured } = useCheckout();
  const soldOut = Number(product.inventory) === 0 && !product.isDigital;

  return (
    <ScrollReveal direction="up" delay={index * 80} threshold={0.08}>
      <article
        className="group relative bg-card border border-border rounded-2xl overflow-hidden flex flex-col transition-all duration-300 hover:border-primary/50 hover:shadow-elevated hover:-translate-y-1"
        data-ocid="shop-product-card"
      >
        {/* Image area */}
        <div className="relative aspect-[4/3] overflow-hidden bg-muted">
          <ProductImage imageUrl={imageUrl} title={product.title} />

          {/* Badges */}
          <div className="absolute top-3 left-3 z-10 flex gap-2">
            <Badge
              className={[
                "text-xs font-semibold shadow-medium border-0",
                product.isDigital
                  ? "bg-primary text-primary-foreground"
                  : "bg-card/90 text-foreground backdrop-blur-sm",
              ].join(" ")}
            >
              {product.isDigital ? (
                <>
                  <Download className="w-3 h-3 mr-1" aria-hidden />
                  Digital
                </>
              ) : (
                <>
                  <Package className="w-3 h-3 mr-1" aria-hidden />
                  Merch
                </>
              )}
            </Badge>
          </div>

          {soldOut && (
            <div className="absolute inset-0 bg-background/75 flex items-center justify-center backdrop-blur-sm">
              <span className="text-sm font-semibold text-muted-foreground bg-card px-4 py-1.5 rounded-full border border-border">
                Ausverkauft
              </span>
            </div>
          )}

          {/* Hover: quick-add overlay */}
          {!soldOut && isStripeConfigured && (
            <div className="absolute inset-0 bg-background/50 backdrop-blur-[2px] opacity-0 group-hover:opacity-100 transition-all duration-300 flex items-end p-4">
              <Button
                onClick={() => addToCart(product)}
                className="w-full bg-primary text-primary-foreground hover:bg-primary/90 font-semibold shadow-elevated translate-y-3 group-hover:translate-y-0 transition-transform duration-300"
                data-ocid="add-to-cart-btn"
                aria-label={`${product.title} in den Warenkorb`}
              >
                <ShoppingCart className="w-4 h-4 mr-2" aria-hidden />
                In den Warenkorb
              </Button>
            </div>
          )}
        </div>

        {/* Card body */}
        <div className="flex flex-col flex-1 p-5 gap-3">
          <div>
            <h3 className="font-semibold text-lg text-foreground leading-snug line-clamp-2 mb-1">
              {product.title}
            </h3>
            <p className="text-sm text-muted-foreground leading-relaxed line-clamp-3">
              {product.description}
            </p>
          </div>

          <div className="flex items-center justify-between mt-auto pt-3 border-t border-border/50">
            <span className="text-2xl font-bold text-primary">
              {formatEur(product.price)}
            </span>
            {!soldOut && isStripeConfigured && (
              <Button
                size="sm"
                variant="outline"
                onClick={() => addToCart(product)}
                className="md:hidden border-primary/40 text-primary hover:bg-primary hover:text-primary-foreground transition-colors"
                aria-label={`${product.title} hinzufügen`}
              >
                <ShoppingCart className="w-4 h-4" aria-hidden />
              </Button>
            )}
          </div>
        </div>
      </article>
    </ScrollReveal>
  );
}

// ─── Cart Item Image ──────────────────────────────────────────────────────────

function CartItemImage({ product }: { product: Product }) {
  const { data: imageUrl } = useFileUrl(product.imageUrl);
  if (!imageUrl) {
    return (
      <div className="w-full h-full flex items-center justify-center bg-muted">
        <Package className="w-5 h-5 text-muted-foreground" aria-hidden />
      </div>
    );
  }
  return (
    <img
      src={imageUrl}
      alt={product.title}
      className="w-full h-full object-cover"
      loading="lazy"
    />
  );
}

// ─── Cart Sidebar ─────────────────────────────────────────────────────────────

function CartSidebar() {
  const {
    cart,
    cartCount,
    totalPrice,
    removeFromCart,
    updateQuantity,
    checkout,
    isCheckingOut,
    clearCart,
    isStripeConfigured,
  } = useCheckout();

  return (
    <Sheet>
      <SheetTrigger asChild>
        <Button
          variant="outline"
          className="relative border-border hover:border-primary/60 hover:bg-primary/5 transition-all"
          aria-label="Warenkorb öffnen"
          data-ocid="cart-trigger"
        >
          <ShoppingCart className="w-4 h-4" aria-hidden />
          <span className="ml-2 font-medium">Warenkorb</span>
          {cartCount > 0 && (
            <span className="absolute -top-2 -right-2 bg-primary text-primary-foreground text-xs font-bold rounded-full w-5 h-5 flex items-center justify-center shadow-medium">
              {cartCount}
            </span>
          )}
        </Button>
      </SheetTrigger>

      <SheetContent
        side="right"
        className="w-full sm:w-[420px] bg-card border-l border-border flex flex-col gap-0 p-0"
      >
        <SheetHeader className="px-6 py-5 border-b border-border">
          <SheetTitle className="flex items-center gap-2 text-lg font-semibold">
            <ShoppingCart className="w-5 h-5 text-primary" aria-hidden />
            Warenkorb
            {cartCount > 0 && (
              <Badge className="ml-1 bg-primary text-primary-foreground">
                {cartCount}
              </Badge>
            )}
          </SheetTitle>
        </SheetHeader>

        {cart.length === 0 ? (
          <div className="flex-1 flex flex-col items-center justify-center gap-5 p-8 text-center">
            <div className="p-6 rounded-2xl bg-muted">
              <ShoppingBag
                className="w-10 h-10 text-muted-foreground"
                aria-hidden
              />
            </div>
            <div>
              <p className="font-semibold text-foreground">Warenkorb leer</p>
              <p className="text-sm text-muted-foreground mt-1">
                Füge Produkte aus dem Shop hinzu.
              </p>
            </div>
          </div>
        ) : (
          <>
            <div className="flex-1 overflow-y-auto px-6 py-4 space-y-4">
              {cart.map(({ product, quantity }) => (
                <div
                  key={Number(product.id)}
                  className="flex gap-3 items-start"
                  data-ocid="cart-item"
                >
                  <div className="w-16 h-16 rounded-xl bg-muted overflow-hidden flex-shrink-0 border border-border">
                    <CartItemImage product={product} />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-semibold text-foreground truncate">
                      {product.title}
                    </p>
                    <p className="text-sm text-primary font-bold mt-0.5">
                      {formatEur(product.price)}
                    </p>
                    <div className="flex items-center gap-2 mt-2">
                      <button
                        type="button"
                        onClick={() => updateQuantity(product.id, quantity - 1)}
                        className="w-6 h-6 rounded-md border border-border flex items-center justify-center hover:bg-muted transition-colors"
                        aria-label="Menge verringern"
                        data-ocid="cart-qty-minus"
                      >
                        <Minus className="w-3 h-3" aria-hidden />
                      </button>
                      <span className="text-sm font-medium w-5 text-center tabular-nums">
                        {quantity}
                      </span>
                      <button
                        type="button"
                        onClick={() => updateQuantity(product.id, quantity + 1)}
                        className="w-6 h-6 rounded-md border border-border flex items-center justify-center hover:bg-muted transition-colors"
                        aria-label="Menge erhöhen"
                        data-ocid="cart-qty-plus"
                      >
                        <Plus className="w-3 h-3" aria-hidden />
                      </button>
                    </div>
                  </div>
                  <button
                    type="button"
                    onClick={() => removeFromCart(product.id)}
                    className="text-muted-foreground hover:text-destructive transition-colors flex-shrink-0 p-1 rounded-md hover:bg-destructive/10"
                    aria-label={`${product.title} entfernen`}
                    data-ocid="cart-remove"
                  >
                    <X className="w-4 h-4" aria-hidden />
                  </button>
                </div>
              ))}
            </div>

            <div className="px-6 py-5 border-t border-border space-y-4">
              <div className="flex justify-between items-center">
                <span className="text-sm text-muted-foreground">
                  Zwischensumme
                </span>
                <span className="text-xl font-bold text-foreground tabular-nums">
                  {formatEur(totalPrice)}
                </span>
              </div>
              <p className="text-xs text-muted-foreground">
                Inkl. MwSt. · Versandkosten werden beim Checkout berechnet
              </p>
              <Separator />

              {!isStripeConfigured ? (
                <div className="flex items-start gap-2 rounded-xl bg-destructive/10 border border-destructive/30 p-3">
                  <AlertTriangle
                    className="w-4 h-4 text-destructive mt-0.5 flex-shrink-0"
                    aria-hidden
                  />
                  <p className="text-xs text-destructive">
                    Stripe ist noch nicht konfiguriert. Bitte im Admin-Panel
                    einrichten.
                  </p>
                </div>
              ) : (
                <Button
                  className="w-full font-semibold bg-primary text-primary-foreground hover:bg-primary/90"
                  onClick={checkout}
                  disabled={isCheckingOut}
                  data-ocid="checkout-btn"
                >
                  {isCheckingOut ? (
                    <>
                      <span className="w-4 h-4 mr-2 border-2 border-current/30 border-t-current rounded-full animate-spin" />
                      Wird weitergeleitet…
                    </>
                  ) : (
                    "Zur Kasse →"
                  )}
                </Button>
              )}

              <button
                type="button"
                onClick={clearCart}
                className="w-full text-xs text-muted-foreground hover:text-destructive transition-colors flex items-center justify-center gap-1.5 py-1"
                data-ocid="cart-clear"
              >
                <Trash2 className="w-3 h-3" aria-hidden />
                Warenkorb leeren
              </button>
            </div>
          </>
        )}
      </SheetContent>
    </Sheet>
  );
}

// ─── Category Filter ──────────────────────────────────────────────────────────

type Category = "all" | "digital" | "merch";

const CATEGORIES: { value: Category; label: string }[] = [
  { value: "all", label: "Alle" },
  { value: "digital", label: "Digital" },
  { value: "merch", label: "Merch" },
];

function CategoryFilter({
  active,
  onChange,
}: {
  active: Category;
  onChange: (c: Category) => void;
}) {
  return (
    <fieldset
      className="flex items-center gap-1 bg-card border border-border rounded-xl p-1"
      aria-label="Produktkategorie filtern"
      data-ocid="shop-category-filter"
    >
      {CATEGORIES.map((cat) => (
        <button
          key={cat.value}
          type="button"
          onClick={() => onChange(cat.value)}
          className={[
            "px-4 py-2 rounded-lg text-sm font-medium transition-all duration-200",
            active === cat.value
              ? "bg-primary text-primary-foreground shadow-subtle"
              : "text-muted-foreground hover:text-foreground hover:bg-muted",
          ].join(" ")}
          aria-pressed={active === cat.value}
          data-ocid={`category-${cat.value}`}
        >
          {cat.label}
        </button>
      ))}
    </fieldset>
  );
}

// ─── Skeletons ────────────────────────────────────────────────────────────────

function ShopSkeletons() {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
      {["s1", "s2", "s3", "s4", "s5", "s6"].map((k) => (
        <div
          key={k}
          className="bg-card border border-border rounded-2xl overflow-hidden"
        >
          <Skeleton className="aspect-[4/3] w-full rounded-none" />
          <div className="p-5 space-y-3">
            <Skeleton className="h-5 w-3/4" />
            <Skeleton className="h-4 w-full" />
            <Skeleton className="h-4 w-2/3" />
            <div className="pt-2 flex justify-between items-center">
              <Skeleton className="h-7 w-20" />
            </div>
          </div>
        </div>
      ))}
    </div>
  );
}

// ─── Empty State ──────────────────────────────────────────────────────────────

function EmptyState({ category }: { category: Category }) {
  const msg =
    category === "all"
      ? "Momentan sind keine Produkte verfügbar. Schau bald wieder vorbei!"
      : category === "digital"
        ? "Keine digitalen Produkte verfügbar."
        : "Kein Merch verfügbar.";

  return (
    <div
      className="flex flex-col items-center justify-center py-28 gap-6 text-center"
      data-ocid="shop-empty-state"
    >
      <div className="relative">
        <div className="p-7 rounded-2xl bg-muted">
          <ShoppingBag
            className="w-14 h-14 text-muted-foreground"
            aria-hidden
          />
        </div>
        <div className="absolute -bottom-1 -right-1 w-6 h-6 bg-primary rounded-full flex items-center justify-center">
          <span className="text-primary-foreground text-xs font-bold">0</span>
        </div>
      </div>
      <div className="space-y-2 max-w-xs">
        <p className="text-lg font-semibold text-foreground">{msg}</p>
        <p className="text-sm text-muted-foreground leading-relaxed">
          Schau bald wieder vorbei — neue Produkte kommen demnächst!
        </p>
      </div>
    </div>
  );
}

// ─── Main Page ────────────────────────────────────────────────────────────────

export default function ShopPage() {
  const { actor, isFetching } = useActor();
  const [category, setCategory] = useState<Category>("all");
  const { data: siteTexts } = useSiteTexts();

  useEffect(() => {
    document.title = "Shop – Everblack Music";
  }, []);

  const { data: products, isLoading } = useQuery({
    queryKey: ["products"],
    queryFn: async () => {
      if (!actor) return [];
      return actor.getProducts();
    },
    enabled: !!actor && !isFetching,
  });

  const filtered = (products ?? []).filter((p) => {
    if (category === "digital") return p.isDigital;
    if (category === "merch") return !p.isDigital;
    return true;
  });

  const shopHeadline = siteTexts?.shopHeadline ?? "Digitale Produkte & Merch";
  const shopIntro =
    siteTexts?.shopIntro ??
    "Unterrichtsmaterialien, Sample Packs und exklusives Merch von Everblack Music.";

  return (
    <section className="min-h-screen bg-background">
      {/* Page Hero */}
      <div className="bg-card border-b border-border py-16 md:py-20">
        <div className="container mx-auto px-4 max-w-7xl">
          <ScrollReveal direction="up" delay={0}>
            <div className="text-center">
              <div className="inline-flex items-center gap-2 bg-primary/10 border border-primary/20 rounded-full px-4 py-1.5 text-sm font-medium text-primary mb-5">
                <ShoppingBag className="w-4 h-4" aria-hidden />
                Everblack Shop
              </div>
              <h1 className="text-4xl md:text-5xl font-bold text-foreground tracking-tight mb-4">
                {shopHeadline}
              </h1>
              <p className="text-lg text-muted-foreground max-w-xl mx-auto leading-relaxed">
                {shopIntro}
              </p>
              <div className="w-16 h-1 bg-primary mx-auto mt-6 rounded-full" />
            </div>
          </ScrollReveal>
        </div>
      </div>

      {/* Products Section */}
      <div className="py-14">
        <div className="container mx-auto px-4 max-w-7xl">
          {/* Toolbar */}
          <ScrollReveal direction="up" delay={80}>
            <div className="flex flex-wrap items-center justify-between gap-4 mb-10">
              <CategoryFilter active={category} onChange={setCategory} />
              <CartSidebar />
            </div>
          </ScrollReveal>

          {/* Grid */}
          {isLoading ? (
            <ShopSkeletons />
          ) : filtered.length === 0 ? (
            <EmptyState category={category} />
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {filtered.map((product, index) => (
                <ProductCard
                  key={Number(product.id)}
                  product={product}
                  index={index}
                />
              ))}
            </div>
          )}
        </div>
      </div>
    </section>
  );
}
