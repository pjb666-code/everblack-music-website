import type { Product, ShoppingItem } from "@/backend";
import { useMutation, useQuery } from "@tanstack/react-query";
import { useState } from "react";
import { toast } from "sonner";
import { useActor } from "./useActor";

export type CheckoutSession = {
  id: string;
  url: string;
};

export type CartEntry = { product: Product; quantity: number };

export function useCheckout() {
  const { actor } = useActor();
  const [cart, setCart] = useState<Map<bigint, CartEntry>>(new Map());

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
