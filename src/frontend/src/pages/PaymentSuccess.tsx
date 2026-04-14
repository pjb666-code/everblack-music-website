import { Button } from "@/components/ui/button";
import { useNavigate } from "@tanstack/react-router";
import { CheckCircle2, Home, ShoppingBag } from "lucide-react";
import { useEffect } from "react";

export default function PaymentSuccess() {
  const navigate = useNavigate();

  useEffect(() => {
    document.title = "Zahlung erfolgreich – Everblack Music";
  }, []);

  return (
    <section className="min-h-[calc(100vh-80px)] flex items-center justify-center bg-background py-20">
      <div className="container mx-auto px-4">
        <div
          className="max-w-md mx-auto text-center bg-card border border-primary/30 rounded-2xl p-10 shadow-elevated"
          data-ocid="payment-success-panel"
        >
          {/* Icon */}
          <div className="mx-auto mb-6 w-20 h-20 rounded-full bg-primary/10 border border-primary/20 flex items-center justify-center">
            <CheckCircle2 className="w-10 h-10 text-primary" aria-hidden />
          </div>

          {/* Headline */}
          <h1 className="text-3xl font-bold text-foreground mb-3 tracking-tight">
            Vielen Dank!
          </h1>
          <p className="text-lg text-muted-foreground mb-2">
            Deine Bestellung war erfolgreich.
          </p>
          <p className="text-sm text-muted-foreground leading-relaxed mb-8">
            Du erhältst in Kürze eine Bestätigungs-E-Mail. Bei digitalen
            Produkten findest du darin deinen Download-Link. Physische Produkte
            werden schnellstmöglich versendet.
          </p>

          {/* Divider */}
          <div className="w-full h-px bg-border mb-8" />

          {/* Actions */}
          <div className="flex flex-col sm:flex-row gap-3 justify-center">
            <Button
              variant="outline"
              onClick={() => navigate({ to: "/shop" })}
              className="border-primary/40 text-primary hover:bg-primary/10 transition-colors"
              data-ocid="back-to-shop-btn"
            >
              <ShoppingBag className="w-4 h-4 mr-2" aria-hidden />
              Zurück zum Shop
            </Button>
            <Button
              onClick={() => navigate({ to: "/" })}
              className="bg-primary text-primary-foreground hover:bg-primary/90"
              data-ocid="back-to-home-btn"
            >
              <Home className="w-4 h-4 mr-2" aria-hidden />
              Zur Startseite
            </Button>
          </div>
        </div>
      </div>
    </section>
  );
}
