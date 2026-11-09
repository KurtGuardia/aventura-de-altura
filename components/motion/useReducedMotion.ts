"use client";

import { useMediaQuery } from "./useMediaQuery";

/**
 * Hook centralizado de "menos movimiento". Todas las primitivas de
 * components/motion lo consultan: si devuelve `true`, renderizan su estado
 * final sin animar. (Antes de hidratar, el CSS de `[data-reveal]` en
 * globals.css ya muestra el contenido visible.)
 */
export function useReducedMotion(): boolean {
  return useMediaQuery("(prefers-reduced-motion: reduce)");
}
