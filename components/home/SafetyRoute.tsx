"use client";

import { m, useScroll, type Variants } from "motion/react";
import { useRef } from "react";
import { useReducedMotion } from "@/components/motion/useReducedMotion";
import { DURATION, EASE } from "@/lib/motion";

type Item = { key: string; title: string; text?: string };

// Íconos lineales que se dibujan (pathLength) al entrar en pantalla. El
// esquema no tiene campo de ícono: se asignan por posición.
const draw: Variants = {
  hidden: { pathLength: 0, opacity: 0 },
  show: { pathLength: 1, opacity: 1, transition: { duration: 1.4, ease: EASE } },
};
const ICONS = [
  // Escudo
  <>
    <m.path variants={draw} d="M12 3l8 3v6c0 4.5-3.4 8.3-8 9-4.6-.7-8-4.5-8-9V6z" />
    <m.path variants={draw} d="M8.5 12l2.5 2.5 4.5-5" />
  </>,
  // Botiquín
  <>
    <m.rect variants={draw} x="3" y="6" width="18" height="14" rx="2" />
    <m.path variants={draw} d="M9 6V4h6v2M12 10v6M9 13h6" />
  </>,
  // Montaña
  <>
    <m.path variants={draw} d="M3 20l6.5-11 4 6.5L16 12l5 8z" />
    <m.path variants={draw} d="M8 11.5l1.5 1 1.5-1" />
  </>,
  // Brújula
  <>
    <m.circle variants={draw} cx="12" cy="12" r="9" />
    <m.path variants={draw} d="M15.5 8.5l-2 5-5 2 2-5z" />
  </>,
];

/**
 * Puntos de seguridad como una ruta de montaña: una línea vertical que se
 * "dibuja" con el scroll conecta los marcadores, y cada ícono se traza al
 * aparecer. La línea solo anima transform (scaleY).
 */
export function SafetyRoute({ items }: { items: Item[] }) {
  const ref = useRef<HTMLOListElement>(null);
  const reduced = useReducedMotion();
  const { scrollYProgress } = useScroll({ target: ref, offset: ["start 75%", "end 60%"] });

  return (
    <ol ref={ref} className="relative space-y-14 md:space-y-20">
      {/* Ruta: trazo base tenue y trazo que avanza con el scroll. */}
      <span aria-hidden="true" className="absolute bottom-6 left-[1.6875rem] top-6 w-px bg-white/12" />
      <m.span
        aria-hidden="true"
        className="absolute bottom-6 left-[1.6875rem] top-6 w-px origin-top bg-ember-400"
        style={{ scaleY: reduced ? 1 : scrollYProgress }}
      />

      {items.map((item, i) => (
        <m.li
          key={item.key}
          className="relative grid grid-cols-[3.5rem_1fr] gap-6 md:gap-8"
          initial="hidden"
          {...(reduced ? { animate: "show" } : { whileInView: "show", viewport: { once: true, amount: 0.6 } })}
        >
          <span className="relative z-10 flex size-14 items-center justify-center rounded-full bg-navy-950 text-ember-300 ring-1 ring-white/20">
            <svg
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth={1.5}
              strokeLinecap="round"
              strokeLinejoin="round"
              aria-hidden="true"
              className="size-6"
            >
              {ICONS[i % ICONS.length]}
            </svg>
          </span>
          <m.div
            data-reveal=""
            variants={{
              hidden: { opacity: 0, y: 24 },
              show: { opacity: 1, y: 0, transition: reduced ? { duration: 0 } : { duration: DURATION.enter, ease: EASE } },
            }}
            className="pt-1"
          >
            <p className="label-mono text-white/45">{String(i + 1).padStart(2, "0")}</p>
            <h3 className="mt-2 font-display text-[clamp(1.75rem,3vw,2.5rem)] uppercase leading-none tracking-display">
              {item.title}
            </h3>
            {item.text && <p className="mt-3 max-w-lg leading-relaxed text-white/70">{item.text}</p>}
          </m.div>
        </m.li>
      ))}
    </ol>
  );
}
