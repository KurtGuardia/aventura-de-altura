"use client";

import { m } from "motion/react";
import { Star } from "@/components/icons";
import { useReducedMotion } from "@/components/motion/useReducedMotion";
import { EASE } from "@/lib/motion";

/**
 * Estrellas de calificación que se llenan una a una al aparecer. Decorativas:
 * la etiqueta accesible ("4,9 de 5 estrellas") la pone el padre.
 */
export function AnimatedStars({ rating, className = "size-5" }: { rating: number; className?: string }) {
  const reduced = useReducedMotion();
  const filled = Math.round(rating);

  return (
    <m.span
      aria-hidden="true"
      className="inline-flex gap-1"
      initial="hidden"
      {...(reduced ? { animate: "show" } : { whileInView: "show", viewport: { once: true, amount: 0.8 } })}
      variants={{ hidden: {}, show: { transition: { staggerChildren: reduced ? 0 : 0.12, delayChildren: 0.2 } } }}
    >
      {Array.from({ length: 5 }, (_, i) => (
        <span key={i} className="relative inline-flex">
          <Star className={`${className} text-stone-300`} />
          {i < filled && (
            <m.span
              className="absolute inset-0"
              variants={{
                hidden: { opacity: 0, scale: 0.3 },
                show: { opacity: 1, scale: 1, transition: { duration: reduced ? 0 : 0.5, ease: EASE } },
              }}
            >
              <Star className={`${className} text-ember-400`} />
            </m.span>
          )}
        </span>
      ))}
    </m.span>
  );
}
