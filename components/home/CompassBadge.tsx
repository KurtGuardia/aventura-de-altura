"use client";

import { m, useScroll, useTransform } from "motion/react";
import Image from "next/image";
import { useId, useRef } from "react";
import { useReducedMotion } from "@/components/motion/useReducedMotion";

/**
 * Sello circular con el logo (una brújula) y un anillo de texto que gira con
 * el scroll, como si la brújula buscara el norte. Decorativo. Con "menos
 * movimiento" queda quieto.
 */
export function CompassBadge({
  text,
  className = "relative",
}: {
  text: string;
  /** Debe incluir el posicionamiento (`relative` por defecto, o `absolute …`). */
  className?: string;
}) {
  const ref = useRef<HTMLDivElement>(null);
  const id = useId();
  const reduced = useReducedMotion();
  const { scrollYProgress } = useScroll({ target: ref, offset: ["start end", "end start"] });
  const ring = useTransform(scrollYProgress, [0, 1], [-90, 270]);
  // El logo oscila apenas, en sentido contrario: la aguja "se asienta".
  const needle = useTransform(scrollYProgress, [0, 0.5, 1], [-14, 0, 10]);

  return (
    <div ref={ref} aria-hidden="true" className={`rounded-full bg-cream shadow-float ${className}`}>
      <m.svg
        viewBox="0 0 200 200"
        className="absolute inset-0 size-full text-navy-950"
        style={reduced ? undefined : { rotate: ring }}
      >
        <defs>
          <path id={id} d="M100,100 m-80,0 a80,80 0 1,1 160,0 a80,80 0 1,1 -160,0" />
        </defs>
        <text className="font-mono uppercase" fontSize="12.5" fill="currentColor">
          <textPath href={`#${id}`} textLength="500" lengthAdjust="spacing">
            {text}
          </textPath>
        </text>
      </m.svg>
      <m.div
        className="absolute inset-[23%] overflow-hidden rounded-full"
        style={reduced ? undefined : { rotate: needle }}
      >
        <Image src="/logo-mark.png" alt="" fill sizes="10rem" className="object-cover" />
      </m.div>
    </div>
  );
}
