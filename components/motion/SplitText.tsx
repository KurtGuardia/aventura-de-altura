"use client";

import { m, type Variants } from "motion/react";
import type { ReactNode } from "react";
import { DURATION, EASE, STAGGER } from "@/lib/motion";
import { useReducedMotion } from "./useReducedMotion";

type Props = {
  text: string;
  as?: "h1" | "h2" | "h3" | "p";
  className?: string;
  /** Retraso inicial en segundos. */
  delay?: number;
  /** `mount`: al cargar (hero). `view`: al entrar en el viewport. */
  trigger?: "mount" | "view";
  /** Nodo que se revela tras la última palabra (por ejemplo, un <WordRotator>). */
  suffix?: ReactNode;
  /** Texto accesible completo si `suffix` cambia el texto visible. */
  label?: string;
};

// Cada palabra sube desde detrás de una máscara (overflow hidden). El relleno
// vertical evita recortar tildes y descendentes con interlineados ajustados.
const MASK = "inline-block overflow-hidden pt-[0.14em] -mt-[0.14em] pb-[0.08em] -mb-[0.08em] align-top";
// Máscara del sufijo (por ejemplo, la palabra rotativa del hero): deja margen
// de sobra para que la palabra que entra o sale no se corte. El padding y el
// margen negativo se compensan, así que no cambia el layout.
const SUFFIX_MASK = "inline-block overflow-hidden pt-[0.5em] -mt-[0.5em] pb-[0.5em] -mb-[0.5em] align-top";

/**
 * Título revelado palabra por palabra.
 *
 * Accesibilidad (regla común a las primitivas que duplican texto): hay una
 * sola versión legible, el texto completo en `sr-only` (o `label`), y las
 * copias visuales animadas van con `aria-hidden`.
 */
export function SplitText({ text, as = "h2", className, delay = 0, trigger = "view", suffix, label }: Props) {
  const reduced = useReducedMotion();
  const Tag = as;
  const words = text.split(/\s+/).filter(Boolean);

  const container: Variants = {
    hidden: {},
    show: { transition: reduced ? {} : { staggerChildren: STAGGER, delayChildren: delay } },
  };
  const word: Variants = {
    hidden: { y: "110%" },
    show: { y: "0%", transition: reduced ? { duration: 0 } : { duration: DURATION.enterLong, ease: EASE } },
  };

  const play = reduced
    ? { animate: "show" }
    : trigger === "mount"
      ? { animate: "show" }
      : { whileInView: "show", viewport: { once: true, amount: 0.4 } };

  return (
    <Tag className={className}>
      <span className="sr-only">{label ?? text}</span>
      <m.span aria-hidden="true" variants={container} initial="hidden" {...play}>
        {words.map((w, i) => (
          <span key={i}>
            <span className={MASK}>
              <m.span data-reveal="" className="inline-block" variants={word}>
                {w}
              </m.span>
            </span>{" "}
          </span>
        ))}
        {suffix && (
          <span className={SUFFIX_MASK}>
            <m.span data-reveal="" className="inline-block" variants={word}>
              {suffix}
            </m.span>
          </span>
        )}
      </m.span>
    </Tag>
  );
}
