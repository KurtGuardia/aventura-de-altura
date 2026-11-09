"use client";

import { AnimatePresence, m, useScroll } from "motion/react";
import { useId, useRef, useState, type KeyboardEvent } from "react";
import { Bed, ChevronDown, WhatsApp } from "@/components/icons";
import { useMediaQuery } from "@/components/motion/useMediaQuery";
import { useReducedMotion } from "@/components/motion/useReducedMotion";
import { button } from "@/components/ui";
import { fill } from "@/lib/i18n";
import { DESKTOP_QUERY, EASE } from "@/lib/motion";
import type { OptionView } from "@/lib/tour-detail";
import { BookingWhatsAppLink, useTourBooking } from "./TourBooking";

type Labels = {
  options: string;
  itinerary: string;
  day: string;
  lodging: string;
  noItinerary: string;
  checkAvailability: string;
};

/**
 * Opciones del tour + itinerario.
 * - Con más de una opción: control segmentado accesible (tabs ARIA, flechas,
 *   Inicio/Fin). La opción va a la URL (`?opcion=2-dias`) y actualiza
 *   itinerario, alojamiento y precios con un fundido.
 * - Itinerario: línea de tiempo vertical por día (el patrón de "ruta" de la
 *   sección Seguridad: la línea se dibuja con el scroll). En móvil cada día es
 *   un acordeón (el primero abierto); en escritorio todos están abiertos.
 * - Opción sin itinerario: aviso amable con CTA de WhatsApp, nunca un hueco.
 */
export function TourItinerary({ options, labels }: { options: OptionView[]; labels: Labels }) {
  const { selected, select } = useTourBooking();
  const reduced = useReducedMotion();
  const tabsId = useId();
  const tabRefs = useRef<(HTMLButtonElement | null)[]>([]);
  const option = options[selected] ?? options[0];
  if (!option) return null;
  const multiple = options.length > 1;

  const onKeyDown = (e: KeyboardEvent<HTMLDivElement>) => {
    const keys: Record<string, number> = {
      ArrowRight: selected + 1,
      ArrowDown: selected + 1,
      ArrowLeft: selected - 1,
      ArrowUp: selected - 1,
      Home: 0,
      End: options.length - 1,
    };
    if (!(e.key in keys)) return;
    e.preventDefault();
    const next = (keys[e.key] + options.length) % options.length;
    select(next);
    tabRefs.current[next]?.focus();
  };

  const panelId = `${tabsId}-panel`;
  const fade = reduced
    ? { initial: false as const }
    : {
        initial: { opacity: 0, y: 14 },
        animate: { opacity: 1, y: 0, transition: { duration: 0.5, ease: EASE } },
        exit: { opacity: 0, transition: { duration: 0.2 } },
      };

  return (
    <div>
      {multiple && (
        <div className="mb-10">
          <p id={`${tabsId}-label`} className="label-mono mb-4 text-sand-700">
            {labels.options}
          </p>
          <div
            role="tablist"
            aria-labelledby={`${tabsId}-label`}
            onKeyDown={onKeyDown}
            className="inline-flex max-w-full flex-wrap gap-1 rounded-[1.75rem] bg-sand-100 p-1.5"
          >
            {options.map((o, i) => (
              <button
                key={o.key}
                ref={(el) => {
                  tabRefs.current[i] = el;
                }}
                type="button"
                role="tab"
                id={`${tabsId}-tab-${i}`}
                aria-selected={i === selected}
                aria-controls={panelId}
                tabIndex={i === selected ? 0 : -1}
                onClick={() => select(i)}
                className={`min-h-11 rounded-full px-5 text-sm font-semibold transition-colors duration-300 ease-cinematic ${
                  i === selected ? "bg-navy-950 text-white shadow-float" : "text-navy-950/70 hover:bg-white hover:text-navy-950"
                }`}
              >
                {o.label}
              </button>
            ))}
          </div>
        </div>
      )}

      <div
        id={panelId}
        {...(multiple ? { role: "tabpanel", "aria-labelledby": `${tabsId}-tab-${selected}` } : {})}
      >
        <AnimatePresence mode="wait" initial={false}>
          <m.div key={option.key} {...fade}>
            {option.lodging && (
              <p className="mb-8 flex items-start gap-3 rounded-card border border-navy-950/10 bg-white/60 p-4 text-navy-950">
                <Bed className="mt-0.5 size-5 shrink-0 text-forest-600" />
                <span>
                  <span className="label-mono block text-sand-700">{labels.lodging}</span>
                  <span className="mt-1 block font-medium">{option.lodging}</span>
                </span>
              </p>
            )}
            {option.days.length > 0 ? (
              <Timeline option={option} labels={labels} />
            ) : (
              <div className="rounded-card border border-dashed border-navy-950/20 bg-sand-50 p-6 md:p-8">
                <p className="max-w-md text-lg leading-relaxed text-navy-950">{labels.noItinerary}</p>
                <BookingWhatsAppLink className={`${button.base} ${button.primary} mt-6`}>
                  <WhatsApp className="size-5" />
                  {labels.checkAvailability}
                </BookingWhatsAppLink>
              </div>
            )}
          </m.div>
        </AnimatePresence>
      </div>
    </div>
  );
}

function Timeline({ option, labels }: { option: OptionView; labels: Labels }) {
  const ref = useRef<HTMLOListElement>(null);
  const reduced = useReducedMotion();
  const desktop = useMediaQuery(DESKTOP_QUERY);
  const baseId = useId();
  // Móvil: acordeón con el primer día abierto.
  const [open, setOpen] = useState<Set<number>>(() => new Set([0]));
  const { scrollYProgress } = useScroll({ target: ref, offset: ["start 75%", "end 60%"] });
  const single = option.days.length === 1;

  const toggle = (i: number) =>
    setOpen((current) => {
      const next = new Set(current);
      if (next.has(i)) next.delete(i);
      else next.add(i);
      return next;
    });

  return (
    <ol ref={ref} className="relative space-y-4 lg:space-y-12">
      {/* Ruta: trazo base tenue y trazo que avanza con el scroll (solo transform). */}
      <span aria-hidden="true" className="absolute bottom-4 left-4.75 top-4 w-px bg-navy-950/12" />
      <m.span
        aria-hidden="true"
        className="absolute bottom-4 left-4.75 top-4 w-px origin-top bg-ember-500"
        style={{ scaleY: reduced ? 1 : scrollYProgress }}
      />

      {option.days.map((day, i) => {
        const title = fill(labels.day, { n: day.day });
        const panelId = `${baseId}-day-${i}`;
        // En escritorio (o con un solo día) no hay acordeón: todo abierto.
        const collapsible = !desktop && !single;
        const expanded = !collapsible || open.has(i);
        const marker = (
          <span className="relative z-10 flex size-10 shrink-0 items-center justify-center rounded-full bg-navy-950 font-mono text-sm text-ember-300">
            {String(day.day).padStart(2, "0")}
          </span>
        );

        return (
          <li key={day.key} className="relative">
            <h3 className="font-display text-display-md uppercase tracking-display text-navy-950">
              {collapsible ? (
                <button
                  type="button"
                  aria-expanded={expanded}
                  aria-controls={panelId}
                  onClick={() => toggle(i)}
                  className="flex w-full items-center gap-5 py-1 text-left"
                >
                  {marker}
                  <span className="flex-1">{title}</span>
                  <ChevronDown
                    className={`size-6 text-navy-950/60 transition-transform duration-300 ease-cinematic ${expanded ? "rotate-180" : ""}`}
                  />
                </button>
              ) : (
                <span className="flex items-center gap-5 py-1">
                  {marker}
                  {title}
                </span>
              )}
            </h3>
            {/* Cerrado solo en móvil: en escritorio el CSS lo muestra siempre (sin saltos al hidratar). */}
            <div id={panelId} className={expanded ? "block" : "hidden lg:block"}>
              <ul className="space-y-4 pb-4 pl-15 pt-5">
                {day.items.map((item) => (
                  <li key={item.key} className="grid gap-1 sm:grid-cols-[4.5rem_1fr] sm:gap-4">
                    {item.time ? (
                      <span className="font-mono text-sm text-sand-700 sm:pt-0.5">{item.time}</span>
                    ) : (
                      <span aria-hidden="true" className="hidden sm:block" />
                    )}
                    <span className="leading-relaxed text-stone-700">{item.text}</span>
                  </li>
                ))}
              </ul>
            </div>
          </li>
        );
      })}
    </ol>
  );
}
