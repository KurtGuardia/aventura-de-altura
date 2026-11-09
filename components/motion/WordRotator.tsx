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
 * Desplazamiento vertical de la palabra que entra (desde abajo) y de la que
 * sale (hacia arriba), en % de su alto. Es corto y va con fundido: el
 * rotador no recorta (sin overflow hidden), así que tildes y descendentes
 * nunca se cortan con el interlineado ajustado de los títulos display.
 */
const TRAVEL = "40%";

/**
 * Rota palabras con una transición vertical corta + fade. Reserva el ancho de
 * la palabra más larga para no mover el texto (sin CLS). Es decorativo
 * (`aria-hidden`): el texto accesible lo da el padre (`label` de
 * <SplitText>). Con "menos movimiento" muestra solo la primera.
 *
 * Dentro de <SplitText> va como `suffix`, cuya máscara deja margen de sobra
 * arriba y abajo para este recorrido.
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
    <span aria-hidden="true" className={`relative inline-grid align-top ${className}`}>
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
          initial={{ y: TRAVEL, opacity: 0 }}
          animate={{ y: "0%", opacity: 1, transition: { duration: 0.8, ease: EASE } }}
          // La que sale se desvanece antes de recorrer todo el tramo.
          exit={{ y: `-${TRAVEL}`, opacity: 0, transition: { duration: 0.45, ease: EASE } }}
        >
          {words[current]}
          {suffix}
        </m.span>
      </AnimatePresence>
    </span>
  );
}
