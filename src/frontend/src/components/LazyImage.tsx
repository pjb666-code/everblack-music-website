import { Skeleton } from "@/components/ui/skeleton";
import { useEffect, useRef, useState } from "react";

interface LazyImageProps {
  src: string;
  alt: string;
  className?: string;
  onClick?: () => void;
  wrapperClassName?: string;
  /** Optional fallback src if primary src fails */
  fallbackSrc?: string;
}

/**
 * Lazy-loaded image component with:
 * - IntersectionObserver: loads only when within 200px of viewport
 * - Skeleton placeholder while loading
 * - Smooth fade-in on load
 * - Click / keyboard support for lightbox
 * - Graceful fallback on error
 */
export default function LazyImage({
  src,
  alt,
  className = "",
  onClick,
  wrapperClassName = "",
  fallbackSrc = "/assets/images/placeholder.svg",
}: LazyImageProps) {
  const [isLoaded, setIsLoaded] = useState(false);
  const [isInView, setIsInView] = useState(false);
  const [imgSrc, setImgSrc] = useState(src);
  const containerRef = useRef<HTMLDivElement>(null);

  // Reset when src changes
  useEffect(() => {
    setIsLoaded(false);
    setImgSrc(src);
  }, [src]);

  useEffect(() => {
    const el = containerRef.current;
    if (!el) return;

    const observer = new IntersectionObserver(
      (entries) => {
        for (const entry of entries) {
          if (entry.isIntersecting) {
            setIsInView(true);
            observer.disconnect();
          }
        }
      },
      { rootMargin: "200px" },
    );

    observer.observe(el);
    return () => observer.disconnect();
  }, []);

  const isClickable = !!onClick;

  return (
    <div
      ref={containerRef}
      className={`relative overflow-hidden ${wrapperClassName}`}
    >
      {/* Skeleton shown until image loads */}
      {!isLoaded && <Skeleton className={`absolute inset-0 ${className}`} />}

      {isInView && (
        <img
          src={imgSrc}
          alt={alt}
          className={[
            className,
            "transition-opacity duration-500",
            isLoaded ? "opacity-100" : "opacity-0",
            isClickable
              ? "cursor-pointer hover:opacity-90 active:opacity-80"
              : "",
          ]
            .filter(Boolean)
            .join(" ")}
          onLoad={() => setIsLoaded(true)}
          onError={() => {
            if (imgSrc !== fallbackSrc) {
              setImgSrc(fallbackSrc);
            }
          }}
          onClick={onClick}
          onKeyDown={
            onClick
              ? (e) => {
                  if (e.key === "Enter" || e.key === " ") onClick();
                }
              : undefined
          }
          role={onClick ? "button" : undefined}
          tabIndex={onClick ? 0 : undefined}
          loading="lazy"
          decoding="async"
        />
      )}
    </div>
  );
}
