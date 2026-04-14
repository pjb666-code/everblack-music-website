import { useInView } from "@/hooks/useInView";
import type { CSSProperties, ReactNode } from "react";

// Evaluate once at module level — avoids re-checking on every render
const prefersReducedMotion =
  typeof window !== "undefined" &&
  window.matchMedia("(prefers-reduced-motion: reduce)").matches;

interface ScrollRevealProps {
  children: ReactNode;
  className?: string;
  /** Delay before animation starts (ms) */
  delay?: number;
  /** Direction of entry animation */
  direction?: "up" | "down" | "left" | "right" | "none";
  /** Translation distance in px */
  distance?: number;
  /** Animation duration in ms */
  duration?: number;
  /** IntersectionObserver threshold (0–1) */
  threshold?: number;
  /** Fire only once (default true) */
  once?: boolean;
}

/**
 * Wraps children with a fade + translate reveal animation on scroll.
 * Uses IntersectionObserver. Respects prefers-reduced-motion.
 * No blinking — animates only opacity and transform.
 */
export default function ScrollReveal({
  children,
  className = "",
  delay = 0,
  direction = "up",
  distance = 24,
  duration = 600,
  threshold = 0.1,
  once = true,
}: ScrollRevealProps) {
  const { ref, inView } = useInView<HTMLDivElement>({ threshold, once });

  if (prefersReducedMotion) {
    return <div className={className}>{children}</div>;
  }

  const translateMap: Record<string, string> = {
    up: `translateY(${distance}px)`,
    down: `translateY(-${distance}px)`,
    left: `translateX(${distance}px)`,
    right: `translateX(-${distance}px)`,
    none: "none",
  };

  const hiddenStyle: CSSProperties = {
    opacity: 0,
    transform: translateMap[direction] ?? "none",
    transition: `opacity ${duration}ms cubic-bezier(0.4, 0, 0.2, 1) ${delay}ms, transform ${duration}ms cubic-bezier(0.4, 0, 0.2, 1) ${delay}ms`,
    willChange: "opacity, transform",
  };

  const visibleStyle: CSSProperties = {
    opacity: 1,
    transform: "none",
    transition: `opacity ${duration}ms cubic-bezier(0.4, 0, 0.2, 1) ${delay}ms, transform ${duration}ms cubic-bezier(0.4, 0, 0.2, 1) ${delay}ms`,
  };

  return (
    <div
      ref={ref}
      className={className}
      style={inView ? visibleStyle : hiddenStyle}
    >
      {children}
    </div>
  );
}
