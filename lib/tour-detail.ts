import { fill, type Dictionary, type Locale } from "@/lib/i18n";
import { durationLabel, formatNumber, fromPriceLabel, minFromPrice } from "@/lib/price";
import { t } from "@/lib/sanity/locale";
import type { LocaleListItem, SanityImage, TourDetail, TourOption, TourPrices } from "@/lib/sanity/types";

/**
 * Datos de la página de detalle ya resueltos por idioma. Todo es serializable:
 * las partes interactivas (opciones, precios, CTA de WhatsApp) son
 * componentes de cliente que reciben estos datos.
 */

/** Tramos de precio en orden, con el nº mínimo de personas de cada uno. */
export const PRICE_TIERS = [
  { tier: "p1", people: 1 },
  { tier: "p2", people: 2 },
  { tier: "p3", people: 3 },
  { tier: "p4", people: 4 },
  { tier: "p5plus", people: 5 },
] as const;

export type PriceTier = (typeof PRICE_TIERS)[number]["tier"];

/** Máximo de personas de la calculadora. */
export const MAX_PEOPLE = 10;

export type PriceRow = { tier: PriceTier; people: number; usd: number };

export type OptionView = {
  key: string;
  /** Valor de `?opcion=` en la URL (igual en los dos idiomas). */
  slug: string;
  label: string;
  lodging?: string;
  days: { key: string; day: number; items: { key: string; time?: string; text: string }[] }[];
  /** Solo los tramos con precio, en orden. */
  prices: PriceRow[];
};

export type HighlightView = { key: string; title: string; text?: string; image?: SanityImage | null };

export type TourDetailView = {
  slug: string;
  title: string;
  tagline?: string;
  description?: string;
  notes?: string;
  categories: string[];
  cover?: SanityImage | null;
  facts: {
    duration?: string;
    difficulty?: string;
    altitude?: number;
    departure?: string;
    languages?: string;
  };
  highlights: HighlightView[];
  options: OptionView[];
  includes: string[];
  excludes: string[];
  requirements: string[];
  /** "Desde USD X" de todo el tour (mínimo de todas las opciones). */
  fromPrice: { usd: string; bs?: string } | null;
  minPrice: number | null;
};

/** Nombre de la opción en la URL: "1-dia", "2-dias"… o "opcion-N" si se repite o no hay duración. */
function optionSlugs(options: TourOption[]): string[] {
  const bases = options.map((o) =>
    typeof o.durationDays === "number" && o.durationDays > 0
      ? `${o.durationDays}-${o.durationDays === 1 ? "dia" : "dias"}`
      : null,
  );
  return bases.map((base, i) =>
    base && bases.filter((b) => b === base).length === 1 ? base : `opcion-${i + 1}`,
  );
}

function priceRows(prices: TourPrices | null | undefined): PriceRow[] {
  return PRICE_TIERS.flatMap(({ tier, people }) => {
    const usd = prices?.[tier];
    return typeof usd === "number" && usd > 0 ? [{ tier, people, usd }] : [];
  });
}

function localeList(items: LocaleListItem[] | null | undefined, lang: Locale): string[] {
  return (items ?? []).map((item) => t(item, lang)?.replace(/\s*\n\s*/g, " ")).filter((s): s is string => !!s);
}

export function toTourDetailView(
  tour: TourDetail,
  lang: Locale,
  dict: Dictionary,
  exchangeRate?: number | null,
): TourDetailView | null {
  const title = t(tour.title, lang);
  if (!title) return null;

  const rawOptions = tour.options ?? [];
  const slugs = optionSlugs(rawOptions);
  const options: OptionView[] = rawOptions.map((option, i) => ({
    key: option._key,
    slug: slugs[i],
    // Sin nombre, la duración ("2 días") identifica la opción.
    label: t(option.label, lang) ?? durationLabel([option], dict) ?? fill(dict.tour.optionN, { n: i + 1 }),
    lodging: option.lodging?.trim() || undefined,
    days: (option.itinerary ?? [])
      .map((day, d) => ({
        key: day._key,
        day: day.day ?? d + 1,
        items: (day.items ?? []).flatMap((item) => {
          const text = t(item.text, lang);
          return text ? [{ key: item._key, time: item.time?.trim() || undefined, text }] : [];
        }),
      }))
      .filter((day) => day.items.length > 0)
      .sort((a, b) => a.day - b.day),
    prices: priceRows(option.prices),
  }));

  const facts = tour.quickFacts;
  const languages = (facts?.languages ?? [])
    .map((code) => dict.tour.languageNames[code as Locale])
    .filter(Boolean);

  return {
    slug: tour.slug,
    title,
    tagline: t(tour.tagline, lang)?.replace(/\s*\n\s*/g, " "),
    description: t(tour.description, lang),
    notes: t(tour.notes, lang),
    categories: (tour.categories ?? []).map((c) => t(c, lang)).filter((c): c is string => !!c),
    cover: tour.coverImage?.asset ? tour.coverImage : null,
    facts: {
      duration: durationLabel(rawOptions, dict),
      difficulty: facts?.difficulty ? dict.tour.difficultyLevels[facts.difficulty] : undefined,
      altitude: typeof facts?.altitude === "number" && facts.altitude > 0 ? facts.altitude : undefined,
      departure: facts?.departureCity?.trim() || undefined,
      languages: languages.length ? languages.join(" · ") : undefined,
    },
    highlights: (tour.highlights ?? []).flatMap((h) => {
      const hTitle = t(h.title, lang);
      return hTitle
        ? [{ key: h._key, title: hTitle, text: t(h.text, lang), image: h.image?.asset ? h.image : null }]
        : [];
    }),
    options,
    includes: localeList(tour.includes, lang),
    excludes: localeList(tour.excludes, lang),
    requirements: localeList(tour.requirements, lang),
    fromPrice: fromPriceLabel(rawOptions, lang, dict, exchangeRate),
    minPrice: minFromPrice(rawOptions),
  };
}

/* ── Utilidades puras que usan también los componentes de cliente ── */

/** Precio por persona para un grupo de `people` (5+ usa el tramo p5plus). `null` si ese tramo no tiene precio. */
export function priceForGroup(prices: PriceRow[], people: number): PriceRow | null {
  const tier: PriceTier = people >= 5 ? "p5plus" : (`p${people}` as PriceTier);
  return prices.find((row) => row.tier === tier) ?? null;
}

/** "USD 1.234" y, si hay tipo de cambio, "≈ Bs 16.042". */
export function formatPrice(usd: number, lang: Locale, exchangeRate?: number | null) {
  return {
    usd: `USD ${formatNumber(usd, lang)}`,
    bs: exchangeRate && exchangeRate > 0 ? `≈ Bs ${formatNumber(Math.round(usd * exchangeRate), lang)}` : undefined,
  };
}

export type WhatsAppTemplates = Pick<Dictionary["whatsapp"], "tour" | "tourOption" | "tourPeople" | "tourPeopleOne">;

/**
 * Mensaje prellenado de WhatsApp: nombre del tour, opción (si el tour tiene
 * varias) y nº de personas (si se usó la calculadora).
 */
export function tourWhatsAppMessage(
  templates: WhatsAppTemplates,
  { tour, option, people }: { tour: string; option?: string; people?: number | null },
): string {
  // "1 día (sin hospedaje)" → "1 día, sin hospedaje": sin paréntesis anidados en "(…)".
  const optionText = option?.replace(/\s*\(([^)]*)\)/g, ", $1").trim();
  const details = [
    optionText ? fill(templates.tourOption, { option: optionText }) : "",
    people ? (people === 1 ? templates.tourPeopleOne : fill(templates.tourPeople, { n: people })) : "",
  ].join("");
  return fill(templates.tour, { tour, details });
}
