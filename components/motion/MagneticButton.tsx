"use client";

import { m, useMotionValue, useSpring } from "motion/react";
import { useEffect, useRef, type ReactNode } from "react";
import { FINE_POINTER_QUERY } from "@/lib/motion";
import { useMediaQuery } from "./useMediaQuery";
import { useReducedMotion } from "./useReducedMotion";

const SPRING = { stiffness: 150, damping: 15, mass: 0.6 };

/**
 * Envoltorio "magnético": el botón se inclina siempre levemente hacia el
 * cursor, esté donde esté de la pantalla. El tirón crece con la distancia de
 * forma suave y nunca pasa de `max` px, así el botón no "huye" del clic.
 * Solo en dispositivos con ratón, con el botón en pantalla y sin "menos movimiento".
 */
export function MagneticButton({
  children,
  reach = 260,
  max = 6,
  className = "",
}: {
  children: ReactNode;
  /** Distancia (px) a la que el tirón llega a ~63 % del máximo. */
  reach?: number;
  /** Desplazamiento máximo en px. */
  max?: number;
  className?: string;
}) {
  const ref = useRef<HTMLSpanElement>(null);
  const fine = useMediaQuery(FINE_POINTER_QUERY);
  const reduced = useReducedMotion();
  const enabled = fine && !reduced;
  const x = useSpring(useMotionValue(0), SPRING);
  const y = useSpring(useMotionValue(0), SPRING);

  useEffect(() => {
    const el = ref.current;
    if (!enabled || !el) return;

    let frame = 0;
    let pointer: { x: number; y: number } | null = null;

    const update = () => {
      frame = 0;
      if (!pointer) return;
      // Medimos sin el desplazamiento actual para que no se retroalimente.
      const rect = el.getBoundingClientRect();
      const cx = rect.left + rect.width / 2 - x.get();
      const cy = rect.top + rect.height / 2 - y.get();
      const dx = pointer.x - cx;
      const dy = pointer.y - cy;
      const distance = Math.hypot(dx, dy);
      if (distance < 1) {
        x.set(0);
        y.set(0);
        return;
      }
      // Hacia el cursor, con una curva que se satura en `max`.
      const pull = max * (1 - Math.exp(-distance / reach));
      x.set((dx / distance) * pull);
      y.set((dy / distance) * pull);
    };
    const onMove = (e: PointerEvent) => {
      if (e.pointerType !== "mouse") return;
      pointer = { x: e.clientX, y: e.clientY };
      if (!frame) frame = requestAnimationFrame(update);
    };
    // Al hacer scroll el botón se mueve bajo el cursor quieto: recalcula.
    const onScroll = () => {
      if (pointer && !frame) frame = requestAnimationFrame(update);
    };
    const onLeave = () => {
      pointer = null;
      x.set(0);
      y.set(0);
    };

    // Solo escucha el ratón mientras el botón está en pantalla.
    const observer = new IntersectionObserver(([entry]) => {
      if (entry.isIntersecting) {
        window.addEventListener("pointermove", onMove, { passive: true });
        window.addEventListener("scroll", onScroll, { passive: true });
        document.documentElement.addEventListener("pointerleave", onLeave);
      } else {
        window.removeEventListener("pointermove", onMove);
        window.removeEventListener("scroll", onScroll);
        document.documentElement.removeEventListener("pointerleave", onLeave);
        onLeave();
      }
    });
    observer.observe(el);

    return () => {
      observer.disconnect();
      window.removeEventListener("pointermove", onMove);
      window.removeEventListener("scroll", onScroll);
      document.documentElement.removeEventListener("pointerleave", onLeave);
      cancelAnimationFrame(frame);
    };
  }, [enabled, reach, max, x, y]);

  return (
    <m.span ref={ref} className={`inline-block ${className}`} style={{ x, y }}>
      {children}
    </m.span>
  );
}
