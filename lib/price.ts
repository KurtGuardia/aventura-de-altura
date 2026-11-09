import type { Dictionary, Locale } from "@/lib/i18n";
import type { TourOptionSummary } from "@/lib/sanity/types";

const numberLocale: Record<Locale, string> = { es: "es-BO", en: "en-US" };

/**
 * Número con el formato de cada idioma ("5.030" en es, "5,030" en en).
 * Agrupa siempre los miles: en español Intl no agrupa los de 4 cifras.
 */
export function formatNumber(value: number, lang: Locale, decimals = 0): string {
  return new Intl.NumberFormat(numberLocale[lang], {
    minimumFractionDigits: decimals,
    maximumFractionDigits: decimals,
    // "always" no está en los tipos de ES2017 del proyecto, pero sí en todos los navegadores actuales.
    useGrouping: "always" as unknown as boolean,
  }).format(value);
}

/**
 * Mínimo de todos los precios por persona (p1–p5plus) de todas las opciones,
 * ignorando los vacíos. `null` si el tour no tiene ningún precio.
 */
export function minFromPrice(options: TourOptionSummary[] | null | undefined): number | null {
  const prices = (options ?? [])
    .flatMap((o) => Object.values(o.prices ?? {}))
    .filter((p): p is number => typeof p === "number" && p > 0);
  return prices.length ? Math.min(...prices) : null;
}

/**
 * "Desde USD 48" y, si hay tipo de cambio y el idioma es español,
 * "(≈ Bs 624)" redondeado a entero. `null` si el tour no tiene precio.
 */
export function fromPriceLabel(
  options: TourOptionSummary[] | null | undefined,
  lang: Locale,
  dict: Dictionary,
  exchangeRate?: number | null,
): { usd: string; bs?: string } | null {
  const min = minFromPrice(options);
  if (min == null) return null;
  const usd = `${dict.labels.from} USD ${formatNumber(min, lang)}`;
  const bs =
    lang === "es" && exchangeRate && exchangeRate > 0
      ? `(≈ Bs ${formatNumber(Math.round(min * exchangeRate), lang)})`
      : undefined;
  return { usd, bs };
}

/** "1 día", "3 días" o "1–3 días" según las opciones del tour. */
export function durationLabel(
  options: TourOptionSummary[] | null | undefined,
  dict: Dictionary,
): string | undefined {
  const days = (options ?? [])
    .map((o) => o.durationDays)
    .filter((d): d is number => typeof d === "number" && d > 0);
  if (!days.length) return undefined;
  const min = Math.min(...days);
  const max = Math.max(...days);
  const unit = max === 1 ? dict.labels.day : dict.labels.days;
  return min === max ? `${min} ${unit}` : `${min}–${max} ${unit}`;
}
