/**
 * Tokens de movimiento para JavaScript (motion y GSAP). Replican los de
 * app/globals.css (`--ease-cinematic`, `--duration-*`): si se cambian allí,
 * cambiarlos también aquí.
 */

/** Easing cinematográfico por defecto: arranque rápido, frenado largo. */
export const EASE = [0.22, 1, 0.36, 1] as const;

/** Mismo easing para GSAP (no acepta arrays). */
export const GSAP_EASE = "power3.out";

export const DURATION = {
  /** Entradas al viewport. */
  enter: 0.9,
  /** Entradas largas (títulos, máscaras). */
  enterLong: 1.2,
  /** Hovers y cambios de estado. */
  hover: 0.4,
} as const;

/** Escalonado entre hijos de <Stagger> y palabras de <SplitText>. */
export const STAGGER = 0.08;

/** Desplazamiento vertical por defecto de <Reveal>, en px. */
export const REVEAL_Y = 32;

/** Breakpoint de escritorio (lg de Tailwind): scroll horizontal fijo y parallax completo. */
export const DESKTOP_QUERY = "(min-width: 1024px)";

/** Dispositivos con ratón (hover fino): efectos magnéticos y de hover. */
export const FINE_POINTER_QUERY = "(hover: hover) and (pointer: fine)";
