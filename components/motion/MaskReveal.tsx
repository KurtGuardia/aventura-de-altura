"use client";

import { m } from "motion/react";
import type { ReactNode } from "react";
import { DURATION, EASE } from "@/lib/motion";
import { useReducedMotion } from "./useReducedMotion";

/**
 * Revela una imagen con una cortina del color del fondo que se recoge hacia
 * arriba mientras la imagen se asienta (de scale 1.15 a 1). Solo anima
 * transform, no clip-path. Sin cortina con "menos movimiento".
 */
export function MaskReveal({
  children,
  className = "",
  /** Clase de color de la cortina: debe coincidir con el fondo de la sección. */
  curtain = "bg-sand-100",
  delay = 0,
}: {
  children: ReactNode;
  className?: string;
  curtain?: string;
  delay?: number;
}) {
  const reduced = useReducedMotion();
  const transition = { duration: DURATION.enterLong * 1.1, ease: EASE, delay };
  const viewport = { once: true, amount: 0.3 };

  return (
    <div className={`relative overflow-hidden ${className}`}>
      <m.div
        data-reveal=""
        className="absolute inset-0"
        initial={{ scale: 1.15 }}
        {...(reduced ? { animate: { scale: 1 } } : { whileInView: { scale: 1 }, viewport, transition })}
      >
        {children}
      </m.div>
      {!reduced && (
        <m.div
          aria-hidden="true"
          className={`absolute inset-0 z-10 origin-top ${curtain}`}
          initial={{ scaleY: 1 }}
          whileInView={{ scaleY: 0 }}
          viewport={viewport}
          transition={transition}
        />
      )}
    </div>
  );
}
