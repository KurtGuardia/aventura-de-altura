"use client";

import { m, useScroll, useTransform } from "motion/react";
import { useRef, type ReactNode } from "react";
import { DESKTOP_QUERY } from "@/lib/motion";
import { useMediaQuery } from "./useMediaQuery";
import { useReducedMotion } from "./useReducedMotion";

/** En móvil el parallax se reduce a esta fracción de la fuerza. */
const MOBILE_FACTOR = 0.35;

/**
 * Desplazamiento vertical de una imagen ligado al scroll. El hijo (normalmente
 * un <SanityImage> en modo fill) se extiende `strength`% por arriba y por
 * abajo del contenedor para no dejar huecos al moverse. Solo anima transform.
 * Sin parallax con "menos movimiento".
 */
export function ParallaxImage({
  children,
  strength = 12,
  className = "relative",
}: {
  children: ReactNode;
  /** Porcentaje de la altura del contenedor que se desplaza en cada sentido. */
  strength?: number;
  /** Debe incluir el posicionamiento (`relative` por defecto, o `absolute inset-0`). */
  className?: string;
}) {
  const ref = useRef<HTMLDivElement>(null);
  const reduced = useReducedMotion();
  const desktop = useMediaQuery(DESKTOP_QUERY, true);
  const { scrollYProgress } = useScroll({ target: ref, offset: ["start end", "end start"] });

  const effective = reduced ? 0 : desktop ? strength : strength * MOBILE_FACTOR;
  // Desplazamiento relativo a la capa interior, que mide (100 + 2·strength)% del contenedor.
  const shift = (effective / (100 + 2 * strength)) * 100;
  const y = useTransform(scrollYProgress, [0, 1], [`-${shift}%`, `${shift}%`]);

  return (
    <div ref={ref} className={`overflow-hidden ${className}`}>
      <m.div
        className="absolute inset-x-0 will-change-transform"
        style={{ y, top: `-${strength}%`, bottom: `-${strength}%` }}
      >
        {children}
      </m.div>
    </div>
  );
}
