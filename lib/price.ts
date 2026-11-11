import type { Dictionary, Locale } from "@/lib/i18n";
import type { DurationUnit, TourDuration, TourOptionSummary } from "@/lib/sanity/types";

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

/** Duración válida (cantidad > 0 y unidad conocida) o `null`. */
function validDuration(d: TourDuration | null | undefined): { value: number; unit: DurationUnit } | null {
  return d && typeof d.value === "number" && d.value > 0 && (d.unit === "horas" || d.unit === "dias")
    ? { value: d.value, unit: d.unit }
    : null;
}

/** Unidad en singular o plural ("1 día", "1,5 horas", "3 días"). */
function unitLabel(unit: DurationUnit, value: number, dict: Dictionary) {
  const forms = dict.labels.units[unit];
  return value === 1 ? forms.one : forms.other;
}

/** "4 horas", "1 día"… con el formato numérico del idioma (hasta 1 decimal). */
export function formatDuration(d: TourDuration | null | undefined, lang: Locale, dict: Dictionary): string | undefined {
  const valid = validDuration(d);
  if (!valid) return undefined;
  return `${formatDurationValue(valid.value, lang)} ${unitLabel(valid.unit, valid.value, dict)}`;
}

function formatDurationValue(value: number, lang: Locale) {
  return formatNumber(value, lang, Number.isInteger(value) ? 0 : 1);
}

/**
 * Duración del tour según sus opciones: "4 horas", "1 día", "1–3 días" (misma
 * unidad, plural según el máximo) o "4 horas – 2 días" (unidades distintas).
 */
export function durationLabel(
  options: TourOptionSummary[] | null | undefined,
  lang: Locale,
  dict: Dictionary,
): string | undefined {
  const durations = (options ?? [])
    .map((o) => validDuration(o.duration))
    .filter((d): d is { value: number; unit: DurationUnit } => !!d)
    // Para ordenar, todo en horas (un día = 24 h).
    .sort((a, b) => toHours(a) - toHours(b));
  if (!durations.length) return undefined;
  const min = durations[0];
  const max = durations[durations.length - 1];
  if (min.unit === max.unit) {
    const unit = unitLabel(max.unit, max.value, dict);
    return min.value === max.value
      ? `${formatDurationValue(min.value, lang)} ${unit}`
      : `${formatDurationValue(min.value, lang)}–${formatDurationValue(max.value, lang)} ${unit}`;
  }
  return `${formatDuration(min, lang, dict)} – ${formatDuration(max, lang, dict)}`;
}

function toHours(d: { value: number; unit: DurationUnit }) {
  return d.unit === "horas" ? d.value : d.value * 24;
}
