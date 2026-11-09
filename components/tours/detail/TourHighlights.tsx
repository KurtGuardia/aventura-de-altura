"use client";

import useEmblaCarousel from "embla-carousel-react";
import { useEffect, useRef, useState, type ReactNode } from "react";
import { useMediaQuery } from "@/components/motion/useMediaQuery";
import { fill } from "@/lib/i18n";
import { DESKTOP_QUERY } from "@/lib/motion";

type Item = {
  key: string;
  title: string;
  text?: string;
  /** Foto de la tarjeta móvil, ya renderizada en el servidor (<SanityImage> en modo fill). */
  image: ReactNode;
  /** La misma foto para el panel fijo de escritorio (otro `sizes`, decorativa). */
  still: ReactNode;
};

type Labels = { carousel: string; slide: string; goTo: string };

/**
 * "Lo mejor del tour". Una sola lista (el texto existe una vez en el DOM):
 * - Escritorio (≥1024px): los atractivos a la izquierda, uno por pantalla; a
 *   la derecha, una foto fija (sticky) que cambia con crossfade según el
 *   atractivo activo en el scroll. Solo anima opacity.
 * - Móvil/tablet: carrusel embla de tarjetas con foto, título y texto.
 * Con "menos movimiento", el cambio de foto es instantáneo (CSS).
 */
export function TourHighlights({ heading, items, labels }: { heading: ReactNode; items: Item[]; labels: Labels }) {
  const desktop = useMediaQuery(DESKTOP_QUERY);
  const [active, setActive] = useState(0);
  const itemRefs = useRef<(HTMLLIElement | null)[]>([]);

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

  // Escritorio: el atractivo activo es el que cruza la franja central de la pantalla.
  useEffect(() => {
    if (!desktop) return;
    const observer = new IntersectionObserver(
      (entries) => {
        for (const entry of entries) {
          if (entry.isIntersecting) setActive(Number((entry.target as HTMLElement).dataset.index));
        }
      },
      { rootMargin: "-45% 0px -45% 0px" },
    );
    itemRefs.current.forEach((el) => el && observer.observe(el));
    return () => observer.disconnect();
  }, [desktop, items.length]);

  return (
    <div className="lg:grid lg:grid-cols-[minmax(0,5fr)_minmax(0,6fr)] lg:gap-20">
      <div>
        {heading}
        <div
          ref={emblaRef}
          role="region"
          aria-label={labels.carousel}
          className="-mx-gutter mt-12 overflow-hidden px-gutter lg:mx-0 lg:mt-6 lg:overflow-visible lg:px-0"
        >
          <ol className="flex gap-4 lg:block">
            {items.map((item, i) => (
              <li
                key={item.key}
                ref={(el) => {
                  itemRefs.current[i] = el;
                }}
                data-index={i}
                aria-roledescription={desktop ? undefined : "slide"}
                aria-label={desktop ? undefined : fill(labels.slide, { current: i + 1, total: items.length })}
                className="min-w-0 shrink-0 basis-[82%] sm:basis-[55%] lg:flex lg:min-h-[50svh] lg:items-center"
              >
                <article
                  className={`flex h-full flex-col overflow-hidden rounded-card bg-navy-900 lg:bg-transparent lg:transition-opacity lg:duration-700 lg:ease-cinematic ${
                    active === i ? "lg:opacity-100" : "lg:opacity-35"
                  }`}
                >
                  {/* Foto de la tarjeta (solo móvil/tablet). */}
                  <div className="relative aspect-[4/3] lg:hidden">{item.image}</div>
                  <div className="flex flex-1 flex-col p-6 lg:p-0">
                    <p className="label-mono text-ember-300">{String(i + 1).padStart(2, "0")}</p>
                    <h3 className="mt-3 font-display text-display-md uppercase tracking-display text-balance lg:text-[clamp(2.25rem,3.6vw,3.75rem)] lg:leading-[0.95]">
                      {item.title}
                    </h3>
                    {item.text && <p className="mt-4 max-w-md leading-relaxed text-white/75 lg:text-lg">{item.text}</p>}
                  </div>
                </article>
              </li>
            ))}
          </ol>
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
                    i === selected ? "bg-ember-400" : "scale-x-[0.35] bg-white/30 group-hover:bg-white/55"
                  }`}
                />
              </button>
            ))}
          </div>
        )}
      </div>

      {/* Foto fija con crossfade (escritorio). Decorativa: las fotos se describen en el carrusel móvil. */}
      <div aria-hidden="true" className="hidden lg:block">
        <div className="sticky top-[12svh] h-[76svh] overflow-hidden rounded-card bg-navy-900 shadow-card">
          {items.map((item, i) => (
            <div
              key={item.key}
              className={`absolute inset-0 transition-opacity duration-700 ease-cinematic motion-reduce:transition-none ${
                active === i ? "opacity-100" : "opacity-0"
              }`}
            >
              {item.still}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
