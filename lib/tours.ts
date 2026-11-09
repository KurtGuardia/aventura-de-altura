import type { Dictionary, Locale } from "@/lib/i18n";
import { durationLabel, fromPriceLabel } from "@/lib/price";
import { t } from "@/lib/sanity/locale";
import type { SanityImage, TourCard } from "@/lib/sanity/types";

/** Datos de una tarjeta de tour ya resueltos por idioma (props de <TourCard>). */
export type TourCardView = {
  id: string;
  slug: string;
  href: string;
  title: string;
  tagline?: string;
  categories: string[];
  duration?: string;
  price: { usd: string; bs?: string } | null;
  image?: SanityImage | null;
};

export function toTourCardView(
  tour: TourCard,
  lang: Locale,
  dict: Dictionary,
  exchangeRate?: number | null,
): TourCardView | null {
  const title = t(tour.title, lang);
  if (!title) return null;
  return {
    id: tour._id,
    slug: tour.slug,
    href: `/${lang}/tours/${tour.slug}`,
    title,
    tagline: t(tour.tagline, lang),
    categories: (tour.categories ?? []).map((c) => t(c, lang)).filter((c): c is string => !!c),
    duration: durationLabel(tour.options, dict),
    price: fromPriceLabel(tour.options, lang, dict, exchangeRate),
    image: tour.coverImage,
  };
}

/**
 * Nombre único de la View Transition de la foto de un tour. La portada del
 * detalle (`/[lang]/tours/[slug]`) debe usar el mismo nombre para que la foto
 * de la tarjeta se expanda hacia ella.
 */
export function tourImageTransitionName(slug: string) {
  return `tour-image-${slug}`;
}
