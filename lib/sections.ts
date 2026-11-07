import type { Locale } from "@/lib/i18n";
import { t } from "@/lib/sanity/locale";
import type { FeatureItem, SiteSettings } from "@/lib/sanity/types";

/**
 * Qué secciones de la home tienen contenido. Lo usan la home (para no
 * renderizar secciones vacías) y el header (para no enlazar anclas que no existen).
 */

export function featureItems(items: FeatureItem[] | null | undefined, lang: Locale) {
  return (items ?? [])
    .map((item) => ({ key: item._key, title: t(item.title, lang), text: t(item.text, lang) }))
    .filter((item): item is { key: string; title: string; text: string | undefined } => !!item.title);
}

export function hasSafety(s: SiteSettings | null, lang: Locale) {
  return featureItems(s?.safety?.items, lang).length > 0 || !!t(s?.safety?.intro, lang);
}

export function hasWhyUs(s: SiteSettings | null, lang: Locale) {
  return featureItems(s?.whyUs?.items, lang).length > 0;
}

export function hasAbout(s: SiteSettings | null, lang: Locale) {
  return !!t(s?.about?.text, lang);
}

export function hasCustomTour(s: SiteSettings | null, lang: Locale) {
  return !!(t(s?.customTour?.title, lang) || t(s?.customTour?.text, lang));
}
