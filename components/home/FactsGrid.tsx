"use client";

import { AnimatePresence, m, useInView } from "motion/react";
import { useEffect, useRef, useState } from "react";
import { CountUp } from "@/components/motion/CountUp";
import { useReducedMotion } from "@/components/motion/useReducedMotion";
import type { FactView } from "@/lib/facts";
import type { Locale } from "@/lib/i18n";
import { EASE } from "@/lib/motion";
import { formatNumber } from "@/lib/price";
import { SmokeBurst } from "./SmokeBurst";

/** Celdas visibles a la vez. */
const SLOTS = 6;
/** Cada cuánto se cambia algún dato (ms). Mayor que la duración del humo (~2 s): las bocanadas no se pisan. */
const TICK_MS = 2600;
/** Tiempo mínimo que un dato permanece en su celda antes de volver a cambiarla (ms). */
const MIN_DWELL_MS = 8000;

type Slot = { fact: number; version: number; changedAt: number };

/**
 * Cuadrícula de datos curiosos que se van turnando: cada 2,6 s una (a veces dos)
 * celdas (nunca todas) se desvanecen, sueltan una bocanada de humo blanco y
 * muestran el siguiente dato de la cola. Se pausa fuera de pantalla y no
 * cambia la celda que tiene el ratón encima. Con "menos movimiento" queda fija.
 * Los lectores de pantalla reciben la lista completa, sin animación.
 */
export function FactsGrid({ facts, lang }: { facts: FactView[]; lang: Locale }) {
  const ref = useRef<HTMLDivElement>(null);
  const inView = useInView(ref, { amount: 0.2 });
  const reduced = useReducedMotion();
  const visible = Math.min(SLOTS, facts.length);
  const [slots, setSlots] = useState<Slot[]>(() =>
    Array.from({ length: visible }, (_, i) => ({ fact: i, version: 0, changedAt: 0 })),
  );
  // Copia de `slots` para calcular el siguiente estado fuera del updater (que
  // React puede ejecutar dos veces) sin desordenar la cola.
  const slotsRef = useRef(slots);
  // Datos ocultos, en el orden en que volverán a salir.
  const queue = useRef<number[]>(facts.map((_, i) => i).slice(visible));
  const hovered = useRef<number | null>(null);
  const lastPicked = useRef<number[]>([]);

  const rotating = !reduced && inView && facts.length > visible;

  useEffect(() => {
    if (!rotating) return;
    const id = window.setInterval(() => {
      const now = Date.now();
      const current = slotsRef.current;
      const candidates = current
        .map((slot, i) => ({ slot, i }))
        .filter(
          ({ slot, i }) =>
            i !== hovered.current && !lastPicked.current.includes(i) && now - slot.changedAt >= MIN_DWELL_MS,
        )
        .map(({ i }) => i);
      if (candidates.length === 0 || queue.current.length === 0) return;

      // Una o dos celdas por vez, al azar.
      const count = Math.min(candidates.length, queue.current.length, Math.random() < 0.2 ? 2 : 1);
      const picked: number[] = [];
      while (picked.length < count) {
        const i = candidates[Math.floor(Math.random() * candidates.length)];
        if (!picked.includes(i)) picked.push(i);
      }
      lastPicked.current = picked;

      const next = [...current];
      for (const i of picked) {
        // El primero de la cola cuyo lugar no esté ya en pantalla (dos datos
        // del mismo lugar, como el Titicaca, no se muestran a la vez).
        const onScreen = new Set(next.filter((_, j) => j !== i).map((slot) => facts[slot.fact].place));
        const at = queue.current.findIndex((f) => !onScreen.has(facts[f].place));
        if (at === -1) continue;
        const [incoming] = queue.current.splice(at, 1);
        queue.current.push(next[i].fact);
        next[i] = { fact: incoming, version: next[i].version + 1, changedAt: now };
      }
      slotsRef.current = next;
      setSlots(next);
    }, TICK_MS);
    return () => window.clearInterval(id);
  }, [rotating, facts]);

  return (
    <div ref={ref}>
      {/* Versión accesible: todos los datos, sin animación. */}
      <ul className="sr-only">
        {facts.map((fact) => (
          <li key={fact.key}>
            {fact.place}: {formatNumber(fact.value, lang, fact.decimals)}
            {fact.unit ? ` ${fact.unit}` : ""}. {fact.text}
          </li>
        ))}
      </ul>

      <div aria-hidden="true" className="grid border-l border-t border-white/12 sm:grid-cols-2 lg:grid-cols-3">
        {slots.map((slot, i) => {
          const fact = facts[slot.fact];
          return (
            <div
              key={i}
              onPointerEnter={() => (hovered.current = i)}
              onPointerLeave={() => (hovered.current = null)}
              className="group relative min-h-[15rem] overflow-hidden border-b border-r border-white/12 transition-colors duration-500 ease-cinematic before:absolute before:inset-x-0 before:-top-px before:h-px before:origin-left before:scale-x-0 before:bg-ember-400 before:transition-transform before:duration-700 before:ease-cinematic md:min-h-[18rem] can-hover:hover:bg-white/[0.03] can-hover:hover:before:scale-x-100"
            >
              <AnimatePresence initial={false} mode="wait">
                <m.div
                  key={fact.key}
                  className="flex h-full flex-col p-6 md:p-8 lg:p-10"
                  initial={{ opacity: 0, y: 14, scale: 0.98 }}
                  animate={{ opacity: 1, y: 0, scale: 1, transition: { duration: 0.7, delay: 0.2, ease: EASE } }}
                  exit={{ opacity: 0, scale: 0.96, transition: { duration: 0.3, ease: EASE } }}
                >
                  <div className="label-mono flex items-baseline justify-between gap-4 text-white/50">
                    <span>{fact.place}</span>
                    <span className="tabular-nums">{String(slot.fact + 1).padStart(2, "0")}</span>
                  </div>
                  <p className="mt-auto flex flex-wrap items-baseline gap-x-3 pt-8">
                    <span className="font-display text-[clamp(3.25rem,5.5vw,6rem)] leading-[0.85] tracking-display transition-colors duration-500 ease-cinematic can-hover:group-hover:text-ember-300">
                      <CountUp value={fact.value} decimals={fact.decimals} lang={lang} duration={slot.version ? 1.1 : 2.2} />
                    </span>
                    {fact.unit && <span className="font-mono text-lg text-white/70 md:text-xl">{fact.unit}</span>}
                  </p>
                  <p className="mt-4 max-w-[30ch] text-lg leading-snug text-white/80">{fact.text}</p>
                </m.div>
              </AnimatePresence>

              {/* Bocanada de humo entre la salida y la entrada; se desmonta al terminar. */}
              {slot.version > 0 && (
                <span className="pointer-events-none absolute left-[32%] top-[60%]">
                  <SmokeBurst key={slot.version} />
                </span>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}
