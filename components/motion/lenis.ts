import type Lenis from "lenis";

/**
 * Instancia activa de Lenis (o `null` si el scroll suave está desactivado).
 * La usan los overlays (menú móvil, lightbox) para detener el scroll de fondo.
 */
let current: Lenis | null = null;

export function setLenis(lenis: Lenis | null) {
  current = lenis;
}

export function getLenis(): Lenis | null {
  return current;
}

/** Bloquea (o libera) el scroll de la página detrás de un overlay. */
export function lockScroll(locked: boolean) {
  document.documentElement.style.overflow = locked ? "hidden" : "";
  if (locked) current?.stop();
  else current?.start();
}
