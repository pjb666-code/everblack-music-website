import type { Product, ShoppingItem } from "@/backend";
import { useMutation, useQuery } from "@tanstack/react-query";
import { useEffect, useState } from "react";
import { toast } from "sonner";
import { useActor } from "./useActor";

export type CheckoutSession = {
  id: string;
  url: string;
};

export type CartEntry = { product: Product; quantity: number };

const CART_STORAGE_KEY = "everblack-cart";

function serializeCart(cart: Map<bigint, CartEntry>): string {
  const entries = Array.from(cart.entries()).map(([id, entry]) => ({
    id: id.toString(),
    product: {
      ...entry.product,
      id: entry.product.id.toString(),
      price: entry.product.price.toString(),
      inventory: entry.product.inventory.toString(),
    },
    quantity: entry.quantity,
  }));
  return JSON.stringify(entries);
}

function deserializeCart(raw: string): Map<bigint, CartEntry> {
  const map = new Map<bigint, CartEntry>();
  try {
    const entries = JSON.parse(raw) as Array<{
      id: string;
      product: Record<string, unknown>;
      quantity: number;
    }>;
    for (const entry of entries) {
      const id = BigInt(entry.id);
      const p = entry.product as unknown as Product;
      map.set(id, {
        product: {
          ...p,
          id,
          price: BigInt(String(p.price)),
          inventory: BigInt(String(p.inventory)),
        },
        quantity: entry.quantity,
      });
    }
  } catch {
    // ignore parse errors — return empty map
  }
  return map;
}

function loadCartFromStorage(): Map<bigint, CartEntry> {
  try {
    const raw = localStorage.getItem(CART_STORAGE_KEY);
    if (raw) return deserializeCart(raw);
  } catch {
    // ignore
  }
  return new Map();
}

export function useCheckout() {
  const { actor } = useActor();
  const [cart, setCart] = useState<Map<bigint, CartEntry>>(loadCartFromStorage);

  // Sync cart to localStorage on every change
  useEffect(() => {
    try {
      localStorage.setItem(CART_STORAGE_KEY, serializeCart(cart));
    } catch {
      // ignore storage errors
    }
  }, [cart]);

  const { data: isStripeConfigured } = useQuery({
    queryKey: ["stripe-configured"],
    queryFn: async () => {
      if (!actor) return false;
      return actor.isStripeConfigured();
    },
    enabled: !!actor,
  });

  const createCheckoutMutation = useMutation({
    mutationFn: async (items: ShoppingItem[]): Promise<CheckoutSession> => {
      if (!actor) throw new Error("Actor nicht verfügbar");
      const baseUrl = `${window.location.protocol}//${window.location.host}`;
      const successUrl = `${baseUrl}/payment-success`;
      const cancelUrl = `${baseUrl}/payment-failure`;
      const result = await actor.createCheckoutSession(
        items,
        successUrl,
        cancelUrl,
      );
      const session = JSON.parse(result) as CheckoutSession;
      return session;
    },
    onSuccess: (session) => {
      window.location.href = session.url;
    },
    onError: (error: Error) => {
      toast.error(`Checkout-Fehler: ${error.message}`);
    },
  });

  const addToCart = (product: Product) => {
    setCart((prev) => {
      const next = new Map(prev);
      const existing = next.get(product.id);
      next.set(product.id, {
        product,
        quantity: existing ? existing.quantity + 1 : 1,
      });
      return next;
    });
    toast.success(`${product.title} zum Warenkorb hinzugefügt`);
  };

  const removeFromCart = (productId: bigint) => {
    setCart((prev) => {
      const next = new Map(prev);
      next.delete(productId);
      return next;
    });
  };

  const updateQuantity = (productId: bigint, quantity: number) => {
    if (quantity <= 0) {
      removeFromCart(productId);
      return;
    }
    setCart((prev) => {
      const next = new Map(prev);
      const existing = next.get(productId);
      if (existing) next.set(productId, { ...existing, quantity });
      return next;
    });
  };

  const clearCart = () => setCart(new Map());

  const checkout = async () => {
    if (!isStripeConfigured) {
      toast.error("Stripe ist noch nicht konfiguriert");
      return;
    }

    const cartItems = Array.from(cart.values());
    if (cartItems.length === 0) {
      toast.error("Warenkorb ist leer");
      return;
    }

    const items: ShoppingItem[] = cartItems.map(({ product, quantity }) => ({
      productName: product.title,
      productDescription: product.description,
      priceInCents: product.price,
      quantity: BigInt(quantity),
      currency: "eur",
    }));

    await createCheckoutMutation.mutateAsync(items);
  };

  const cartItems = Array.from(cart.values());
  const totalPrice = cartItems.reduce(
    (sum, { product, quantity }) => sum + Number(product.price) * quantity,
    0,
  );
  const cartCount = cartItems.reduce((sum, { quantity }) => sum + quantity, 0);

  return {
    cart: cartItems,
    cartCount,
    addToCart,
    removeFromCart,
    updateQuantity,
    clearCart,
    checkout,
    totalPrice,
    isCheckingOut: createCheckoutMutation.isPending,
    isStripeConfigured: isStripeConfigured ?? false,
  };
}
