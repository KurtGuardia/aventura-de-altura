"use client";

import { AnimatePresence, m } from "motion/react";
import { useId } from "react";
import { Minus, Plus, Users, WhatsApp } from "@/components/icons";
import { useReducedMotion } from "@/components/motion/useReducedMotion";
import { button } from "@/components/ui";
import { fill, type Locale } from "@/lib/i18n";
import { EASE } from "@/lib/motion";
import { formatPrice, MAX_PEOPLE, priceForGroup, type OptionView, type PriceTier } from "@/lib/tour-detail";
import { BookingWhatsAppLink, useTourBooking } from "./TourBooking";

type Labels = {
  pricesFor: string;
  groupSize: string;
  pricePerPerson: string;
  perPerson: string;
  tiers: Record<PriceTier, string>;
  bestPrice: string;
  pricesNote: string;
  noPrices: string;
  calculator: string;
  people: string;
  fewerPeople: string;
  morePeople: string;
  total: string;
  calculatorNoPrice: string;
  peopleCount: string;
  peopleCountOne: string;
  checkAvailability: string;
};

/**
 * Precios de la opción elegida: tabla por tamaño de grupo (solo tramos con
 * precio, el más bajo resaltado) y una mini calculadora (1–10 personas) con
 * precio por persona y total. El nº de personas elegido pasa al mensaje de
 * WhatsApp. Sin ningún precio: solo el CTA de consulta.
 * En `/es`, con tipo de cambio, se añade "≈ Bs".
 */
export function TourPrices({
  options,
  lang,
  exchangeRate,
  labels,
}: {
  options: OptionView[];
  lang: Locale;
  exchangeRate?: number | null;
  labels: Labels;
}) {
  const { selected, people, setPeople } = useTourBooking();
  const reduced = useReducedMotion();
  const calcId = useId();
  const option = options[selected] ?? options[0];
  const rows = option?.prices ?? [];
  const rate = lang === "es" ? exchangeRate : null;

  const cta = (
    <BookingWhatsAppLink className={`${button.base} ${button.large} ${button.accent}`}>
      <WhatsApp className="size-5" />
      {labels.checkAvailability}
    </BookingWhatsAppLink>
  );

  if (!option || rows.length === 0) {
    return (
      <div>
        <p className="mb-6 max-w-md text-lg leading-relaxed text-stone-700">{labels.noPrices}</p>
        {cta}
      </div>
    );
  }

  const best = Math.min(...rows.map((r) => r.usd));
  // Sin elegir: el primer tramo con precio.
  const count = people ?? rows[0].people;
  const match = priceForGroup(rows, count);
  const countLabel = count === 1 ? labels.peopleCountOne : fill(labels.peopleCount, { n: count });
  const fade = reduced
    ? { initial: false as const }
    : {
        initial: { opacity: 0, y: 10 },
        animate: { opacity: 1, y: 0, transition: { duration: 0.45, ease: EASE } },
        exit: { opacity: 0, transition: { duration: 0.15 } },
      };

  return (
    <div>
      {options.length > 1 && (
        <p className="label-mono mb-6 text-sand-700">{fill(labels.pricesFor, { option: option.label })}</p>
      )}

      <div className="grid gap-8 md:grid-cols-[minmax(0,1fr)_17rem] xl:grid-cols-[minmax(0,1fr)_19rem]">
        <AnimatePresence mode="wait" initial={false}>
          <m.table key={option.key} {...fade} className="w-full border-collapse text-left">
            <thead>
              <tr className="label-mono text-sand-700">
                <th scope="col" className="pb-3 font-normal">
                  {labels.groupSize}
                </th>
                <th scope="col" className="pb-3 text-right font-normal">
                  {labels.pricePerPerson}
                </th>
              </tr>
            </thead>
            <tbody>
              {rows.map((row) => {
                const price = formatPrice(row.usd, lang, rate);
                const isBest = rows.length > 1 && row.usd === best;
                return (
                  <tr
                    key={row.tier}
                    className={`border-t border-navy-950/10 ${isBest ? "bg-forest-50" : ""}`}
                  >
                    <th scope="row" className={`py-4 font-medium text-navy-950 ${isBest ? "pl-4" : ""}`}>
                      {labels.tiers[row.tier]}
                      {isBest && (
                        <span className="label-mono mt-1.5 block text-forest-700">{labels.bestPrice}</span>
                      )}
                    </th>
                    <td className={`py-4 text-right font-mono ${isBest ? "pr-4" : ""}`}>
                      <span className={`block text-lg ${isBest ? "text-forest-800" : "text-navy-950"}`}>{price.usd}</span>
                      {price.bs && <span className="block text-sm text-stone-600">{price.bs}</span>}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </m.table>
        </AnimatePresence>

        {/* Calculadora. */}
        <div className="tone-dark self-start rounded-card bg-navy-950 p-6 text-white md:p-8">
          <p id={`${calcId}-label`} className="label-mono flex items-center gap-2 text-ember-300">
            <Users className="size-4" />
            {labels.calculator}
          </p>
          <div className="mt-5 flex items-center justify-between gap-4">
            <span className="text-white/75">{labels.people}</span>
            <div role="group" aria-labelledby={`${calcId}-label`} className="flex items-center gap-1">
              <button
                type="button"
                onClick={() => setPeople(Math.max(1, count - 1))}
                disabled={count <= 1}
                aria-label={labels.fewerPeople}
                className="flex size-11 items-center justify-center rounded-full border border-white/25 transition-colors hover:border-white disabled:opacity-35"
              >
                <Minus className="size-5" />
              </button>
              <output className="min-w-12 text-center font-mono text-2xl tabular-nums">
                {count}
              </output>
              <button
                type="button"
                onClick={() => setPeople(Math.min(MAX_PEOPLE, count + 1))}
                disabled={count >= MAX_PEOPLE}
                aria-label={labels.morePeople}
                className="flex size-11 items-center justify-center rounded-full border border-white/25 transition-colors hover:border-white disabled:opacity-35"
              >
                <Plus className="size-5" />
              </button>
            </div>
          </div>

          <div aria-live="polite" className="mt-6 border-t border-white/12 pt-6">
            {match ? (
              <dl className="space-y-3 font-mono">
                <div className="flex items-baseline justify-between gap-4">
                  <dt className="label-mono text-white/60">{labels.perPerson}</dt>
                  <dd className="text-right">{formatPrice(match.usd, lang, rate).usd}</dd>
                </div>
                <div className="border-t border-white/12 pt-3">
                  <dt className="label-mono text-white/60">
                    {labels.total} · {countLabel}
                  </dt>
                  <dd className="mt-2">
                    <span className="block text-3xl text-ember-300">{formatPrice(match.usd * count, lang, rate).usd}</span>
                    {rate && (
                      <span className="block text-sm text-white/60">{formatPrice(match.usd * count, lang, rate).bs}</span>
                    )}
                  </dd>
                </div>
              </dl>
            ) : (
              <p className="leading-relaxed text-white/80">{fill(labels.calculatorNoPrice, { n: countLabel })}</p>
            )}
          </div>
          <div className="mt-6 [&_a]:w-full">{cta}</div>
        </div>
      </div>

      <p className="mt-8 max-w-2xl text-sm leading-relaxed text-stone-600">{labels.pricesNote}</p>
    </div>
  );
}
