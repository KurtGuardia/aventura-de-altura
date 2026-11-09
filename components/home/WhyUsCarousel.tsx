"use client";

import Autoplay from "embla-carousel-autoplay";
import useEmblaCarousel from "embla-carousel-react";
import { useEffect, useMemo, useState } from "react";
import { useReducedMotion } from "@/components/motion/useReducedMotion";
import { fill } from "@/lib/i18n";

type Item = { key: string; title: string; text?: string };

const AUTOPLAY_MS = 3800;

/** Tonos que se alternan entre tarjetas para dar ritmo (claro, arena, verde). */
const TONES = [
  { card: "bg-white text-navy-950 ring-1 ring-navy-950/10", number: "text-sand-700", text: "text-stone-600" },
  { card: "bg-sand-100 text-navy-950", number: "text-forest-700", text: "text-stone-700" },
  { card: "tone-dark bg-forest-800 text-white", number: "text-ember-300", text: "text-white/75" },
];

/**
 * Razones de "Por qué elegirnos" en un carrusel automático sin botones: avanza
 * solo, se puede arrastrar y se pausa con el ratón encima o con el foco
 * dentro. Con "menos movimiento" no avanza solo.
 */
export function WhyUsCarousel({ items, labels }: { items: Item[]; labels: { carousel: string; slide: string } }) {
  const reduced = useReducedMotion();
  const plugins = useMemo(
    () =>
      reduced
        ? []
        : [Autoplay({ delay: AUTOPLAY_MS, stopOnMouseEnter: true, stopOnFocusIn: true, stopOnInteraction: false })],
    [reduced],
  );
  const [emblaRef, embla] = useEmblaCarousel({ loop: true, align: "start", duration: 38 }, plugins);
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
      <div ref={emblaRef} className="cursor-grab overflow-hidden active:cursor-grabbing">
        <div className="-ml-4 flex touch-pan-y md:-ml-6">
          {items.map((item, i) => {
            const tone = TONES[i % TONES.length];
            return (
              <div
                key={item.key}
                role="group"
                aria-roledescription="slide"
                aria-label={fill(labels.slide, { current: i + 1, total: items.length })}
                className="min-w-0 shrink-0 grow-0 basis-[85%] pl-4 sm:basis-1/2 md:pl-6 lg:basis-1/3"
              >
                <article
                  className={`flex h-full min-h-[22rem] flex-col rounded-card p-8 md:min-h-[26rem] md:p-10 ${tone.card}`}
                >
                  <span aria-hidden="true" className={`font-mono text-6xl font-medium tabular-nums md:text-7xl ${tone.number}`}>
                    {String(i + 1).padStart(2, "0")}
                  </span>
                  <h3 className="mt-auto pt-10 font-display text-[clamp(1.85rem,2.6vw,2.5rem)] uppercase leading-none tracking-display text-balance">
                    {item.title}
                  </h3>
                  {item.text && <p className={`mt-4 leading-relaxed ${tone.text}`}>{item.text}</p>}
                </article>
              </div>
            );
          })}
        </div>
      </div>

      {/* Indicador de avance (decorativo, sin controles). */}
      <div aria-hidden="true" className="mt-10 flex items-center gap-5">
        <span className="label-mono tabular-nums text-navy-950">
          {String(selected + 1).padStart(2, "0")}
          <span className="text-navy-950/40"> / {String(items.length).padStart(2, "0")}</span>
        </span>
        <span className="flex flex-1 gap-1.5">
          {items.map((item, i) => (
            <span key={item.key} className="relative h-0.5 flex-1 overflow-hidden rounded-full bg-navy-950/12">
              <span
                className={`absolute inset-0 origin-left bg-navy-950 transition-transform duration-700 ease-cinematic ${
                  i === selected ? "scale-x-100" : "scale-x-0"
                }`}
              />
            </span>
          ))}
        </span>
      </div>
    </div>
  );
}
