"use client";

import { useEffect } from "react";
import { setLenis } from "./lenis";
import { useReducedMotion } from "./useReducedMotion";

/**
 * Scroll suave con Lenis, importado de forma dinámica solo en el cliente.
 * Desactivado con "menos movimiento". Va en el layout de `[lang]`, así que
 * nunca se monta en el Studio.
 */
export function SmoothScroll() {
  const reduced = useReducedMotion();

  useEffect(() => {
    if (reduced) return;
    let cancelled = false;
    let instance: import("lenis").default | null = null;

    import("lenis").then(({ default: Lenis }) => {
      if (cancelled) return;
      // `anchors`: los enlaces "#seccion" de la misma página se desplazan con suavidad.
      instance = new Lenis({ autoRaf: true, anchors: true, lerp: 0.1 });
      setLenis(instance);
    });

    return () => {
      cancelled = true;
      instance?.destroy();
      setLenis(null);
    };
  }, [reduced]);

  return null;
}
