"use client";

import { AnimatePresence, m } from "motion/react";
import { useEffect, useState } from "react";
import { EASE } from "@/lib/motion";
import { useReducedMotion } from "./useReducedMotion";

type Props = {
  /** Palabras a rotar; la primera es la que se ve al cargar y sin JavaScript. */
  words: string[];
  /** Texto pegado a cada palabra (por ejemplo, el punto final). */
  suffix?: string;
  /** Milisegundos que permanece cada palabra. */
  interval?: number;
  className?: string;
};

/**
 * Rota palabras con una transición vertical + fade. Reserva el ancho de la
 * palabra más larga para no mover el texto (sin CLS). Es decorativo: el texto
 * accesible lo da el padre. Con "menos movimiento" muestra solo la primera.
 */
export function WordRotator({ words, suffix = "", interval = 2600, className = "" }: Props) {
  const reduced = useReducedMotion();
  const [index, setIndex] = useState(0);

  useEffect(() => {
    if (reduced || words.length < 2) return;
    const id = window.setInterval(() => setIndex((i) => (i + 1) % words.length), interval);
    return () => window.clearInterval(id);
  }, [reduced, words.length, interval]);

  const current = reduced ? 0 : index;

  return (
    <span aria-hidden="true" className={`relative inline-grid overflow-hidden align-top ${className}`}>
      {/* Ocupan espacio, invisibles: el ancho es el de la palabra más larga. */}
      {words.map((w) => (
        <span key={w} className="invisible col-start-1 row-start-1">
          {w}
          {suffix}
        </span>
      ))}
      <AnimatePresence initial={false} mode="popLayout">
        <m.span
          key={words[current]}
          className="col-start-1 row-start-1"
          initial={{ y: "100%", opacity: 0 }}
          animate={{ y: "0%", opacity: 1 }}
          exit={{ y: "-100%", opacity: 0 }}
          transition={{ duration: 0.8, ease: EASE }}
        >
          {words[current]}
          {suffix}
        </m.span>
      </AnimatePresence>
    </span>
  );
}
