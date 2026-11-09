"use client";

import { m, useScroll, useTransform } from "motion/react";
import { useEffect, useRef, useState, type ReactNode } from "react";
import { useReducedMotion } from "@/components/motion/useReducedMotion";

/** Milisegundos que se ve cada foto (el Ken Burns dura algo más, ver globals.css). */
const SLIDE_MS = 7000;

/**
 * Fondo del hero: slideshow en crossfade con zoom lento (Ken Burns) y
 * parallax ligero (el texto sube más rápido que la foto).
 * La primera foto llega en el HTML con prioridad; el resto se monta cuando el
 * navegador está libre tras el primer render. Con "menos movimiento": una
 * sola foto fija, sin Ken Burns ni parallax.
 */
export function HeroScene({
  slides,
  children,
  after,
  className = "",
}: {
  /** Fotos ya renderizadas en el servidor (<SanityImage> en modo fill). */
  slides: ReactNode[];
  children: ReactNode;
  /** Contenido fijo al borde de la sección, fuera del parallax (separador). */
  after?: ReactNode;
  className?: string;
}) {
  const ref = useRef<HTMLElement>(null);
  const reduced = useReducedMotion();
  const [ready, setReady] = useState(false);
  // Número de cambios de foto: de él salen la foto activa y la anterior.
  const [step, setStep] = useState(0);
  const active = step % slides.length;
  const previous = step > 0 ? (step - 1) % slides.length : null;

  const { scrollYProgress } = useScroll({ target: ref, offset: ["start start", "end start"] });
  const imageY = useTransform(scrollYProgress, [0, 1], ["0%", reduced ? "0%" : "18%"]);
  const contentY = useTransform(scrollYProgress, [0, 1], ["0%", reduced ? "0%" : "-40%"]);
  const contentOpacity = useTransform(scrollYProgress, [0, 0.75], [1, reduced ? 1 : 0]);

  // Carga diferida del resto de fotos.
  useEffect(() => {
    if (slides.length < 2) return;
    const idle = window.requestIdleCallback ?? ((cb: () => void) => window.setTimeout(cb, 1200));
    const cancel = window.cancelIdleCallback ?? window.clearTimeout;
    const id = idle(() => setReady(true));
    return () => cancel(id);
  }, [slides.length]);

  useEffect(() => {
    if (!ready || reduced || slides.length < 2) return;
    const id = window.setInterval(() => setStep((s) => s + 1), SLIDE_MS);
    return () => window.clearInterval(id);
  }, [ready, reduced, slides.length]);

  return (
    <section ref={ref} id="inicio" className={`tone-dark grain relative isolate overflow-hidden bg-navy-950 ${className}`}>
      <m.div className="absolute inset-0 -z-10" style={{ y: imageY }}>
        {slides.map((slide, i) =>
          i === 0 || ready ? (
            <div
              key={i}
              aria-hidden={i === active ? undefined : true}
              className={`absolute inset-0 transition-opacity duration-[1600ms] ease-in-out ${
                i === active ? "opacity-100" : "opacity-0"
              }`}
            >
              {/* La animación se reinicia cada vez que la foto vuelve a estar activa. */}
              <div
                className={`absolute inset-0 ${
                  !reduced && (i === active || i === previous) ? "animate-kenburns" : ""
                }`}
              >
                {slide}
              </div>
            </div>
          ) : null,
        )}
      </m.div>

      {/* Degradado oscuro: contraste AA del texto sobre cualquier foto. */}
      <div
        aria-hidden="true"
        className="absolute inset-0 -z-10 bg-[linear-gradient(to_top,rgb(7_14_25/0.92)_0%,rgb(7_14_25/0.55)_45%,rgb(7_14_25/0.2)_75%,rgb(7_14_25/0.45)_100%)]"
      />

      <m.div className="relative h-full" style={{ y: contentY, opacity: contentOpacity }}>
        {children}
      </m.div>
      {after}
    </section>
  );
}
