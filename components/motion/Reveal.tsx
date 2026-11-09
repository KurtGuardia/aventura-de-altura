"use client";

import { m } from "motion/react";
import type { ReactNode } from "react";
import { DURATION, EASE, REVEAL_Y } from "@/lib/motion";
import { useReducedMotion } from "./useReducedMotion";

export type RevealTag = "div" | "section" | "article" | "li" | "p" | "span" | "h2" | "h3" | "figure" | "blockquote";

type Props = {
  children: ReactNode;
  /** Retraso en segundos. */
  delay?: number;
  /** Desplazamiento inicial en px (hacia abajo). */
  y?: number;
  as?: RevealTag;
  className?: string;
  id?: string;
};

/**
 * Fade + translateY al entrar en el viewport, una sola vez.
 * Con "menos movimiento" se muestra directamente en su estado final.
 */
export function Reveal({ children, delay = 0, y = REVEAL_Y, as = "div", className, id }: Props) {
  const reduced = useReducedMotion();
  const Tag = m[as] as typeof m.div;
  const visible = { opacity: 1, y: 0 };

  return (
    <Tag
      id={id}
      data-reveal=""
      className={className}
      initial={{ opacity: 0, y }}
      {...(reduced
        ? { animate: visible, transition: { duration: 0 } }
        : {
            whileInView: visible,
            viewport: { once: true, amount: 0.15 },
            transition: { duration: DURATION.enter, ease: EASE, delay },
          })}
    >
      {children}
    </Tag>
  );
}
