"use client";

import { animate, useInView } from "motion/react";
import { useEffect, useRef } from "react";
import type { Locale } from "@/lib/i18n";
import { EASE } from "@/lib/motion";
import { formatNumber } from "@/lib/price";
import { useReducedMotion } from "./useReducedMotion";

type Props = {
  value: number;
  lang: Locale;
  /** Decimales a mostrar (por ejemplo, 1 para "4,9"). */
  decimals?: number;
  /** Valor inicial del conteo. */
  from?: number;
  /** Duración en segundos. */
  duration?: number;
  className?: string;
};

/**
 * Contador animado al entrar en el viewport, con el formato numérico del
 * idioma. El HTML del servidor trae el valor final (SEO, sin JavaScript y
 * "menos movimiento"); los lectores de pantalla leen siempre el valor final.
 * Termina siempre exactamente en `value`: `onComplete` y la limpieza del
 * efecto escriben el valor final aunque el último frame no llegue a él.
 */
export function CountUp({ value, lang, decimals = 0, from = 0, duration = 2, className = "" }: Props) {
  const ref = useRef<HTMLSpanElement>(null);
  const inView = useInView(ref, { once: true, amount: 0.5 });
  const reduced = useReducedMotion();
  const final = formatNumber(value, lang, decimals);

  // Tras hidratar, vuelve al valor inicial a la espera de entrar en pantalla.
  // Con "menos movimiento" (también si cambia después de hidratar) fija el final.
  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    el.textContent = reduced ? final : formatNumber(from, lang, decimals);
  }, [reduced, final, from, lang, decimals]);

  useEffect(() => {
    const el = ref.current;
    if (!inView || reduced || !el) return;
    const showFinal = () => {
      el.textContent = final;
    };
    const controls = animate(from, value, {
      duration,
      ease: EASE,
      onUpdate: (v) => {
        el.textContent = formatNumber(v, lang, decimals);
      },
      // El último frame fija el valor exacto (los intermedios pueden quedarse cortos).
      onComplete: showFinal,
    });
    // Respaldo: si el navegador pausa requestAnimationFrame (pestaña en segundo
    // plano), onComplete no llega; el temporizador fija el final igualmente.
    const fallback = window.setTimeout(() => {
      controls.stop();
      showFinal();
    }, duration * 1000 + 150);
    // Si la animación se interrumpe (desmontaje, cambio de props), nunca queda a medias.
    return () => {
      window.clearTimeout(fallback);
      controls.stop();
      showFinal();
    };
  }, [inView, reduced, from, value, final, duration, lang, decimals]);

  return (
    <span className={`inline-grid tabular-nums ${className}`}>
      {/* Reserva el ancho del valor final para que el texto no salte. */}
      <span aria-hidden="true" className="invisible col-start-1 row-start-1">
        {final}
      </span>
      <span ref={ref} aria-hidden="true" className="col-start-1 row-start-1">
        {final}
      </span>
      <span className="sr-only">{final}</span>
    </span>
  );
}
