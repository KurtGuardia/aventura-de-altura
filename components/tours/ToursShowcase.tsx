"use client";

import useEmblaCarousel from "embla-carousel-react";
import { useEffect, useRef, useState, type ReactNode } from "react";
import { fill } from "@/lib/i18n";
import { DESKTOP_QUERY } from "@/lib/motion";

type Props = {
  heading: ReactNode;
  /** Tarjetas ya renderizadas en el servidor. */
  cards: { key: string; node: ReactNode }[];
  labels: { carousel: string; goTo: string; slide: string };
};

/**
 * Tours destacados.
 * - Escritorio (≥1024px): sección fija con scroll horizontal (GSAP
 *   ScrollTrigger, importado de forma dinámica). El título va a la izquierda,
 *   las tarjetas desfilan y una barra fina marca el progreso.
 * - Móvil/tablet: carrusel embla con snap, tarjetas al ~85% e indicadores.
 * - "Menos movimiento" en escritorio: cuadrícula estática (solo CSS).
 */
export function ToursShowcase({ heading, cards, labels }: Props) {
  const sectionRef = useRef<HTMLElement>(null);
  const trackRef = useRef<HTMLDivElement>(null);
  const barRef = useRef<HTMLSpanElement>(null);

  const [emblaRef, embla] = useEmblaCarousel({
    align: "start",
    containScroll: "trimSnaps",
    breakpoints: { [DESKTOP_QUERY]: { active: false } },
  });
  const [selected, setSelected] = useState(0);
  const [snaps, setSnaps] = useState<number[]>([]);

  useEffect(() => {
    if (!embla) return;
    const sync = () => {
      setSnaps(embla.scrollSnapList());
      setSelected(embla.selectedScrollSnap());
    };
    sync();
    embla.on("select", sync).on("reInit", sync);
    return () => {
      embla.off("select", sync).off("reInit", sync);
    };
  }, [embla]);

  // Scroll horizontal fijo: solo escritorio y sin "menos movimiento".
  useEffect(() => {
    let cancelled = false;
    let revert: (() => void) | undefined;

    Promise.all([import("gsap"), import("gsap/ScrollTrigger")]).then(([{ gsap }, { ScrollTrigger }]) => {
      if (cancelled) return;
      gsap.registerPlugin(ScrollTrigger);
      const mm = gsap.matchMedia();
      mm.add(`${DESKTOP_QUERY} and (prefers-reduced-motion: no-preference)`, () => {
        const section = sectionRef.current;
        const track = trackRef.current;
        if (!section || !track) return;
        const distance = () => Math.max(0, track.scrollWidth - window.innerWidth);
        if (distance() <= 0) return;

        gsap.to(track, {
          x: () => -distance(),
          ease: "none",
          scrollTrigger: {
            trigger: section,
            start: "top top",
            end: () => `+=${distance()}`,
            pin: true,
            scrub: 0.6,
            invalidateOnRefresh: true,
            onUpdate: (self) => {
              if (barRef.current) barRef.current.style.transform = `scaleX(${self.progress})`;
            },
          },
        });
      });
      // revert() deshace el pin, el tween y los ScrollTrigger del contexto.
      revert = () => mm.revert();
    });

    return () => {
      cancelled = true;
      revert?.();
    };
  }, []);

  return (
    <section
      ref={sectionRef}
      id="tours"
      className="relative overflow-hidden bg-cream py-section lg:motion-safe:flex lg:motion-safe:h-svh lg:motion-safe:items-center lg:motion-safe:py-0"
    >
      <div
        ref={trackRef}
        className="lg:motion-safe:flex lg:motion-safe:w-max lg:motion-safe:items-center lg:motion-safe:gap-10 lg:motion-safe:pr-gutter lg:motion-safe:pl-[max(var(--spacing-gutter),calc((100vw-90rem)/2+var(--spacing-gutter)))] lg:motion-safe:will-change-transform"
      >
        <div className="px-gutter lg:motion-safe:w-[34vw] lg:motion-safe:shrink-0 lg:motion-safe:px-0 lg:motion-safe:pr-6 lg:motion-reduce:mx-auto lg:motion-reduce:max-w-[90rem]">
          {heading}
        </div>

        {/* Embla en móvil (viewport con overflow oculto); fila o cuadrícula en escritorio. */}
        <div
          ref={emblaRef}
          role="region"
          aria-label={labels.carousel}
          className="mt-12 overflow-hidden px-gutter lg:mt-0 lg:overflow-visible lg:motion-safe:px-0 lg:motion-reduce:mx-auto lg:motion-reduce:mt-14 lg:motion-reduce:max-w-[90rem]"
        >
          <ul className="flex gap-4 lg:motion-safe:gap-8 lg:motion-reduce:grid lg:motion-reduce:grid-cols-3 lg:motion-reduce:gap-8">
            {cards.map((card, i) => (
              <li
                key={card.key}
                aria-label={fill(labels.slide, { current: i + 1, total: cards.length })}
                aria-roledescription="slide"
                className="min-w-0 shrink-0 basis-[85%] sm:basis-[58%] md:basis-[44%] lg:motion-safe:w-[min(30vw,calc((100svh-9rem)*0.75))] lg:motion-safe:basis-auto"
              >
                {card.node}
              </li>
            ))}
          </ul>
        </div>
      </div>

      {/* Indicadores del carrusel (móvil/tablet). */}
      {snaps.length > 1 && (
        <div className="mt-8 flex justify-center gap-1 lg:hidden">
          {snaps.map((_, i) => (
            <button
              key={i}
              type="button"
              onClick={() => embla?.scrollTo(i)}
              aria-label={fill(labels.goTo, { n: i + 1 })}
              aria-current={i === selected ? "true" : undefined}
              className="group flex size-8 items-center justify-center"
            >
              <span
                className={`block h-1 w-7 rounded-full transition-[scale,background-color] duration-500 ease-cinematic ${
                  i === selected ? "bg-navy-950" : "scale-x-[0.35] bg-navy-950/25 group-hover:bg-navy-950/50"
                }`}
              />
            </button>
          ))}
        </div>
      )}

      {/* Barra de progreso del scroll horizontal (escritorio). */}
      <div
        aria-hidden="true"
        className="absolute inset-x-gutter bottom-10 hidden h-px bg-navy-950/15 lg:motion-safe:block"
      >
        <span ref={barRef} className="block h-full origin-left scale-x-0 bg-navy-950" />
      </div>
    </section>
  );
}
