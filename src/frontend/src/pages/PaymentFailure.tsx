import { Button } from "@/components/ui/button";
import { useNavigate } from "@tanstack/react-router";
import { AlertCircle, ArrowLeft, Home } from "lucide-react";
import { useEffect } from "react";

export default function PaymentFailure() {
  const navigate = useNavigate();

  useEffect(() => {
    document.title = "Zahlung fehlgeschlagen – Everblack Music";
  }, []);

  return (
    <section className="min-h-[calc(100vh-80px)] flex items-center justify-center bg-background py-20">
      <div className="container mx-auto px-4">
        <div
          className="max-w-md mx-auto text-center bg-card border border-destructive/30 rounded-2xl p-10 shadow-elevated"
          data-ocid="payment-failure-panel"
        >
          {/* Icon */}
          <div className="mx-auto mb-6 w-20 h-20 rounded-full bg-destructive/10 border border-destructive/20 flex items-center justify-center">
            <AlertCircle className="w-10 h-10 text-destructive" aria-hidden />
          </div>

          {/* Headline */}
          <h1 className="text-3xl font-bold text-foreground mb-3 tracking-tight">
            Zahlung fehlgeschlagen
          </h1>
          <p className="text-lg text-muted-foreground mb-2">
            Die Zahlung konnte nicht abgeschlossen werden.
          </p>
          <p className="text-sm text-muted-foreground leading-relaxed mb-8">
            Bitte überprüfe deine Zahlungsdaten und versuche es erneut. Falls
            das Problem weiterhin besteht, wende dich an{" "}
            <a
              href="mailto:info@everblackmusic.com"
              className="text-primary hover:underline underline-offset-2"
            >
              info@everblackmusic.com
            </a>
            .
          </p>

          {/* Divider */}
          <div className="w-full h-px bg-border mb-8" />

          {/* Actions */}
          <div className="flex flex-col sm:flex-row gap-3 justify-center">
            <Button
              onClick={() => navigate({ to: "/shop" })}
              className="bg-primary text-primary-foreground hover:bg-primary/90"
              data-ocid="retry-shop-btn"
            >
              <ArrowLeft className="w-4 h-4 mr-2" aria-hidden />
              Erneut versuchen
            </Button>
            <Button
              variant="outline"
              onClick={() => navigate({ to: "/" })}
              className="border-border hover:bg-muted transition-colors"
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
