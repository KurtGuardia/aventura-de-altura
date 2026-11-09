"use client";

import { AnimatePresence, m } from "motion/react";
import { useEffect, useState } from "react";
import { WhatsApp } from "@/components/icons";
import { useReducedMotion } from "@/components/motion/useReducedMotion";
import { button } from "@/components/ui";
import { fill, type Locale } from "@/lib/i18n";
import { EASE } from "@/lib/motion";
import { formatPrice, type OptionView } from "@/lib/tour-detail";
import { BookingWhatsAppLink, useTourBooking } from "./TourBooking";

type Labels = {
  from: string;
  selectedOption: string;
  people: string;
  peopleCount: string;
  peopleCountOne: string;
  checkAvailability: string;
};

/** "Desde USD X" de la opción elegida (o del tour, si la opción no tiene precios). */
function useFromPrice(options: OptionView[], lang: Locale, exchangeRate: number | null | undefined, fallback: number | null) {
  const { selected } = useTourBooking();
  const prices = options[selected]?.prices ?? [];
  const min = prices.length ? Math.min(...prices.map((p) => p.usd)) : fallback;
  return min == null ? null : formatPrice(min, lang, lang === "es" ? exchangeRate : null);
}

/**
 * Tarjeta lateral fija (escritorio, columna derecha): precio "desde" de la
 * opción elegida, la opción, las personas (si se usó la calculadora) y el
 * CTA. Va en la columna que acompaña desde la descripción hasta los precios.
 */
export function TourStickyCard({
  tourTitle,
  options,
  lang,
  exchangeRate,
  minPrice,
  labels,
}: {
  tourTitle: string;
  options: OptionView[];
  lang: Locale;
  exchangeRate?: number | null;
  minPrice: number | null;
  labels: Labels;
}) {
  const { selected, people, whatsapp } = useTourBooking();
  const price = useFromPrice(options, lang, exchangeRate, minPrice);
  if (!whatsapp && !price) return null;
  const option = options.length > 1 ? options[selected] : undefined;

  return (
    <div className="tone-dark sticky top-24 rounded-card bg-navy-950 p-7 text-white shadow-card">
      <p className="font-display text-2xl uppercase leading-none tracking-display">{tourTitle}</p>
      {price && (
        <p className="mt-5 font-mono">
          <span className="label-mono block text-white/55">{labels.from}</span>
          <span className="mt-1 block text-3xl text-ember-300">{price.usd}</span>
          {price.bs && <span className="block text-sm text-white/60">{price.bs}</span>}
        </p>
      )}
      {(option || people) && (
        <dl className="mt-5 space-y-2 border-t border-white/12 pt-5 text-sm">
          {option && (
            <div>
              <dt className="label-mono text-white/55">{labels.selectedOption}</dt>
              <dd className="mt-1 font-medium">{option.label}</dd>
            </div>
          )}
          {people && (
            <div>
              <dt className="label-mono text-white/55">{labels.people}</dt>
              <dd className="mt-1 font-medium">
                {people === 1 ? labels.peopleCountOne : fill(labels.peopleCount, { n: people })}
              </dd>
            </div>
          )}
        </dl>
      )}
      <BookingWhatsAppLink className={`${button.base} ${button.accent} mt-6 w-full`}>
        <WhatsApp className="size-5" />
        {labels.checkAvailability}
      </BookingWhatsAppLink>
    </div>
  );
}

/**
 * Barra fija inferior (móvil y tablet): precio "desde" a la izquierda y
 * "Consultar disponibilidad" a la derecha. Aparece al dejar atrás la portada
 * (`heroId`) y respeta el safe-area. En esta página reemplaza al botón
 * flotante genérico de WhatsApp.
 */
export function TourMobileBar({
  heroId,
  options,
  lang,
  exchangeRate,
  minPrice,
  labels,
}: {
  heroId: string;
  options: OptionView[];
  lang: Locale;
  exchangeRate?: number | null;
  minPrice: number | null;
  labels: Labels;
}) {
  const { whatsapp } = useTourBooking();
  const price = useFromPrice(options, lang, exchangeRate, minPrice);
  const reduced = useReducedMotion();
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    const hero = document.getElementById(heroId);
    if (!hero) return;
    const observer = new IntersectionObserver(([entry]) => setVisible(!entry.isIntersecting), {
      // Franja superior del 10 % de la pantalla: visible cuando la portada ya salió por arriba.
      rootMargin: "0px 0px -90% 0px",
    });
    observer.observe(hero);
    return () => observer.disconnect();
  }, [heroId]);

  if (!whatsapp) return null;

  return (
    <div data-bottom-bar="" className="lg:hidden">
      <AnimatePresence>
        {visible && (
          <m.div
            initial={reduced ? { opacity: 0 } : { y: "100%" }}
            animate={reduced ? { opacity: 1 } : { y: 0 }}
            exit={reduced ? { opacity: 0 } : { y: "100%" }}
            transition={{ duration: 0.45, ease: EASE }}
            className="tone-dark fixed inset-x-0 bottom-0 z-30 border-t border-white/10 bg-navy-950/95 pb-[max(0.75rem,env(safe-area-inset-bottom))] pt-3 text-white backdrop-blur-md"
          >
            <div className="mx-auto flex max-w-[90rem] items-center justify-between gap-3 px-gutter">
              {price ? (
                <p className="min-w-0 font-mono leading-tight">
                  <span className="label-mono block text-white/55">{labels.from}</span>
                  <span className="block whitespace-nowrap text-lg text-ember-300">{price.usd}</span>
                </p>
              ) : (
                <span />
              )}
              <BookingWhatsAppLink className={`${button.base} ${button.accent} shrink-0 gap-2 px-4 text-[0.8125rem]`}>
                <WhatsApp className="size-5" />
                {labels.checkAvailability}
              </BookingWhatsAppLink>
            </div>
          </m.div>
        )}
      </AnimatePresence>
    </div>
  );
}
