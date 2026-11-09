"use client";

import { m, type Variants } from "motion/react";
import { createContext, useContext, type ReactNode } from "react";
import { DURATION, EASE, REVEAL_Y, STAGGER } from "@/lib/motion";
import { useReducedMotion } from "./useReducedMotion";

type Tag = "div" | "ul" | "ol" | "li" | "dl" | "article";

const ReducedContext = createContext(false);

/**
 * Contenedor que hace entrar a sus <StaggerItem> de forma escalonada cuando
 * aparece en el viewport (una sola vez).
 */
export function Stagger({
  children,
  as = "div",
  className,
  stagger = STAGGER,
  delay = 0,
}: {
  children: ReactNode;
  as?: Tag;
  className?: string;
  /** Segundos entre un hijo y el siguiente. */
  stagger?: number;
  delay?: number;
}) {
  const reduced = useReducedMotion();
  const Comp = m[as] as typeof m.div;
  const variants: Variants = {
    hidden: {},
    show: { transition: reduced ? {} : { staggerChildren: stagger, delayChildren: delay } },
  };

  return (
    <ReducedContext.Provider value={reduced}>
      <Comp
        className={className}
        variants={variants}
        initial="hidden"
        {...(reduced ? { animate: "show" } : { whileInView: "show", viewport: { once: true, amount: 0.15 } })}
      >
        {children}
      </Comp>
    </ReducedContext.Provider>
  );
}

export function StaggerItem({
  children,
  as = "div",
  className,
  y = REVEAL_Y,
}: {
  children: ReactNode;
  as?: Tag;
  className?: string;
  y?: number;
}) {
  const reduced = useContext(ReducedContext);
  const Comp = m[as] as typeof m.div;
  const variants: Variants = {
    hidden: { opacity: 0, y },
    show: {
      opacity: 1,
      y: 0,
      transition: reduced ? { duration: 0 } : { duration: DURATION.enter, ease: EASE },
    },
  };

  return (
    <Comp data-reveal="" className={className} variants={variants}>
      {children}
    </Comp>
  );
}
