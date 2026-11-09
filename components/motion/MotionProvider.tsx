"use client";

import { LazyMotion, MotionConfig } from "motion/react";
import type { ReactNode } from "react";

const loadFeatures = () => import("./features").then((mod) => mod.default);

/**
 * Proveedor de motion para todo el sitio. `LazyMotion` mantiene pequeño el
 * bundle inicial: los componentes usan `m.*` (no `motion.*`) y las funciones
 * de animación se descargan después del primer render. `reducedMotion="user"`
 * desactiva transformaciones si el sistema pide menos movimiento.
 */
export function MotionProvider({ children }: { children: ReactNode }) {
  return (
    <LazyMotion features={loadFeatures} strict>
      <MotionConfig reducedMotion="user">{children}</MotionConfig>
    </LazyMotion>
  );
}
