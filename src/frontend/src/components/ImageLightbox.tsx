import { Dialog, DialogClose, DialogContent } from "@/components/ui/dialog";
import { ChevronLeft, ChevronRight, X } from "lucide-react";
import { useEffect } from "react";

interface ImageLightboxProps {
  src: string;
  alt: string;
  isOpen: boolean;
  onClose: () => void;
  onPrev?: () => void;
  onNext?: () => void;
  /** Render prev/next arrows */
  hasNav?: boolean;
}

/**
 * Full-screen image lightbox.
 * - Keyboard: Escape → close, ArrowLeft → prev, ArrowRight → next
 * - Dark backdrop, turquoise close button
 * - Focus trapped by Dialog primitive
 */
export default function ImageLightbox({
  src,
  alt,
  isOpen,
  onClose,
  onPrev,
  onNext,
  hasNav = false,
}: ImageLightboxProps) {
  // Additional keyboard shortcuts beyond what Dialog provides
  useEffect(() => {
    if (!isOpen) return;
    const handleKey = (e: KeyboardEvent) => {
      if (e.key === "ArrowLeft" && onPrev) {
        e.preventDefault();
        onPrev();
      }
      if (e.key === "ArrowRight" && onNext) {
        e.preventDefault();
        onNext();
      }
    };
    document.addEventListener("keydown", handleKey);
    return () => document.removeEventListener("keydown", handleKey);
  }, [isOpen, onPrev, onNext]);

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent
        className="max-w-[95vw] max-h-[95vh] w-auto h-auto p-0 border border-border shadow-elevated bg-card/95 backdrop-blur-xl"
        aria-describedby="lightbox-desc"
      >
        <span id="lightbox-desc" className="sr-only">
          Vergrößerte Ansicht: {alt}
        </span>

        {/* Close button — turquoise accent */}
        <DialogClose
          className="absolute right-3 top-3 z-50 rounded-full p-1.5 bg-card/90 border border-border transition-colors hover:bg-muted focus:outline-none focus:ring-2 focus:ring-ring"
          aria-label="Schließen"
          style={{ color: "var(--accent-hex, #0D9488)" }}
        >
          <X className="h-5 w-5" />
        </DialogClose>

        {/* Prev arrow */}
        {hasNav && onPrev && (
          <button
            type="button"
            onClick={onPrev}
            className="absolute left-3 top-1/2 -translate-y-1/2 z-50 rounded-full bg-card/90 p-2 border border-border transition-colors hover:bg-muted focus:outline-none focus:ring-2 focus:ring-ring"
            aria-label="Vorheriges Bild"
          >
            <ChevronLeft className="h-5 w-5" />
          </button>
        )}

        {/* Next arrow */}
        {hasNav && onNext && (
          <button
            type="button"
            onClick={onNext}
            className="absolute right-12 top-1/2 -translate-y-1/2 z-50 rounded-full bg-card/90 p-2 border border-border transition-colors hover:bg-muted focus:outline-none focus:ring-2 focus:ring-ring"
            aria-label="Nächstes Bild"
          >
            <ChevronRight className="h-5 w-5" />
          </button>
        )}

        {/* Image */}
        <div className="flex items-center justify-center p-6">
          <img
            src={src}
            alt={alt}
            className="max-w-full max-h-[85vh] w-auto h-auto object-contain rounded-md"
            loading="eager"
            decoding="sync"
          />
        </div>
      </DialogContent>
    </Dialog>
  );
}
