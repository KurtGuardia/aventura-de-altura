"use client";

import Autoplay from "embla-carousel-autoplay";
import Fade from "embla-carousel-fade";
import useEmblaCarousel from "embla-carousel-react";
import { useEffect, useMemo, useState, type ReactNode } from "react";
import { ChevronLeft, ChevronRight } from "@/components/icons";
import { useReducedMotion } from "@/components/motion/useReducedMotion";
import { fill } from "@/lib/i18n";

type Props = {
  slides: { key: string; node: ReactNode }[];
  labels: { carousel: string; previous: string; next: string; goTo: string; slide: string };
};

const AUTOPLAY_MS = 7000;

/**
 * Carrusel de testimonios con transición en fade y autoplay, que se pausa con
 * el ratón encima o con el foco dentro. Sin autoplay con "menos movimiento".
 * Controles operables por teclado.
 */
export function TestimonialsCarousel({ slides, labels }: Props) {
  const reduced = useReducedMotion();
  const plugins = useMemo(
    () => [
      Fade(),
      ...(reduced
        ? []
        : [Autoplay({ delay: AUTOPLAY_MS, stopOnMouseEnter: true, stopOnFocusIn: true, stopOnInteraction: false })]),
    ],
    [reduced],
  );
  const [emblaRef, embla] = useEmblaCarousel({ loop: true, duration: 30 }, plugins);
  const [selected, setSelected] = useState(0);

  useEffect(() => {
    if (!embla) return;
    const sync = () => setSelected(embla.selectedScrollSnap());
    sync();
    embla.on("select", sync).on("reInit", sync);
    return () => {
      embla.off("select", sync).off("reInit", sync);
    };
  }, [embla]);

  return (
    <div role="region" aria-roledescription="carousel" aria-label={labels.carousel}>
      <div ref={emblaRef} className="overflow-hidden">
        <div className="flex">
          {slides.map((slide, i) => (
            <div
              key={slide.key}
              role="group"
              aria-roledescription="slide"
              aria-label={fill(labels.slide, { current: i + 1, total: slides.length })}
              aria-hidden={i === selected ? undefined : true}
              className="min-w-0 shrink-0 grow-0 basis-full"
            >
              {slide.node}
            </div>
          ))}
        </div>
      </div>

      <div className="mt-10 flex items-center justify-between gap-6">
        <div className="flex gap-1">
          {slides.map((slide, i) => (
            <button
              key={slide.key}
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
        <div className="flex gap-2">
          <button
            type="button"
            onClick={() => embla?.scrollPrev()}
            aria-label={labels.previous}
            className="flex size-12 items-center justify-center rounded-full border border-navy-950/20 text-navy-950 transition-colors hover:bg-navy-950 hover:text-white"
          >
            <ChevronLeft className="size-5" />
          </button>
          <button
            type="button"
            onClick={() => embla?.scrollNext()}
            aria-label={labels.next}
            className="flex size-12 items-center justify-center rounded-full border border-navy-950/20 text-navy-950 transition-colors hover:bg-navy-950 hover:text-white"
          >
            <ChevronRight className="size-5" />
          </button>
        </div>
      </div>
    </div>
  );
}
