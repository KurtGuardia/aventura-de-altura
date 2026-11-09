"use client";

import { m } from "motion/react";
import { useReducedMotion } from "@/components/motion/useReducedMotion";
import { EASE } from "@/lib/motion";

const PATHS = {
  check: ["M5 12.5l4.5 4.5L19 7.5"],
  cross: ["M7 7l10 10", "M17 7L7 17"],
};

/**
 * ✓ o ✕ que se dibuja (pathLength) al entrar en pantalla, como los íconos de
 * Seguridad. Decorativo: el significado lo da el título de la lista.
 */
export function DrawnMark({ kind, delay = 0, className = "" }: { kind: "check" | "cross"; delay?: number; className?: string }) {
  const reduced = useReducedMotion();
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth={2}
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
      className={className}
    >
      {PATHS[kind].map((d, i) => (
        <m.path
          key={d}
          d={d}
          initial={{ pathLength: reduced ? 1 : 0 }}
          whileInView={{ pathLength: 1 }}
          viewport={{ once: true, amount: 0.8 }}
          transition={reduced ? { duration: 0 } : { duration: 0.6, ease: EASE, delay: delay + i * 0.15 }}
        />
      ))}
    </svg>
  );
}
