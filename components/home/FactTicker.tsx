"use client";

import { AnimatePresence, m } from "motion/react";
import { useEffect, useState } from "react";
import { useReducedMotion } from "@/components/motion/useReducedMotion";
import type { FactView } from "@/lib/facts";
import type { Locale } from "@/lib/i18n";
import { EASE } from "@/lib/motion";
import { formatNumber } from "@/lib/price";

const INTERVAL_MS = 5200;

/**
 * Datos curiosos de Bolivia que se alternan en la portada. Reserva el alto del
 * dato más largo (sin saltos). Con "menos movimiento" se queda en el primero.
 *
 * Es decorativo para lectores de pantalla (`aria-hidden`): los mismos datos
 * están completos y sin animación en la lista accesible de "Bolivia en
 * cifras" (<FactsGrid>), que se renderiza siempre que hay datos. Así no se
 * leen dos veces ni cambian mientras se leen.
 */
export function FactTicker({ facts, lang, label }: { facts: FactView[]; lang: Locale; label: string }) {
  const reduced = useReducedMotion();
  const [index, setIndex] = useState(0);

  useEffect(() => {
    if (reduced || facts.length < 2) return;
    const id = window.setInterval(() => setIndex((i) => (i + 1) % facts.length), INTERVAL_MS);
    return () => window.clearInterval(id);
  }, [reduced, facts.length]);

  const fact = facts[reduced ? 0 : index];
  if (!fact) return null;

  const body = (f: FactView) => (
    <>
      <span className="block font-mono text-xl text-white md:text-2xl">
        {formatNumber(f.value, lang, f.decimals)}
        {f.unit && <span className="text-white/70"> {f.unit}</span>}
      </span>
      <span className="mt-1 block max-w-[34ch] text-sm leading-snug text-white/70">
        <span className="font-semibold text-white">{f.place}</span> · {f.text}
      </span>
    </>
  );

  return (
    <div aria-hidden="true" className="min-w-0">
      <p className="label-mono flex items-center gap-2 text-ember-300">
        <span aria-hidden="true" className="size-1.5 rounded-full bg-ember-400" />
        {label}
      </p>
      <div className="relative mt-2 grid overflow-hidden">
        {/* Reservan el alto del dato más largo. */}
        {facts.map((f) => (
          <p key={f.key} className="invisible col-start-1 row-start-1">
            {body(f)}
          </p>
        ))}
        <AnimatePresence initial={false} mode="popLayout">
          <m.p
            key={fact.key}
            className="col-start-1 row-start-1"
            initial={{ y: "60%", opacity: 0 }}
            animate={{ y: "0%", opacity: 1 }}
            exit={{ y: "-60%", opacity: 0 }}
            transition={{ duration: 0.7, ease: EASE }}
          >
            {body(fact)}
          </m.p>
        </AnimatePresence>
      </div>
    </div>
  );
}
