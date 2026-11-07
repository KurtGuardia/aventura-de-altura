// Tipos de las proyecciones de lib/sanity/queries.ts (escritos a mano: el
// proyecto no usa TypeGen). Todo lo que viene de Sanity puede faltar.

export type LocaleValue = { es?: string | null; en?: string | null };

export type SanityImage = {
  asset?: { _ref: string } | null;
  crop?: { top: number; bottom: number; left: number; right: number } | null;
  hotspot?: { x: number; y: number; width: number; height: number } | null;
  alt?: LocaleValue | null;
};

export type FeatureItem = { _key: string; title?: LocaleValue | null; text?: LocaleValue | null };

export type SiteSettings = {
  whatsappPrimary?: string | null;
  whatsappSecondary?: string | null;
  email?: string | null;
  facebook?: string | null;
  contactLanguages?: LocaleValue | null;
  exchangeRate?: number | null;
  heroTitle?: LocaleValue | null;
  heroSubtitle?: LocaleValue | null;
  heroCtaLabel?: LocaleValue | null;
  heroImage?: SanityImage | null;
  safety?: {
    title?: LocaleValue | null;
    intro?: LocaleValue | null;
    items?: FeatureItem[] | null;
    image?: SanityImage | null;
  } | null;
  whyUs?: { title?: LocaleValue | null; items?: FeatureItem[] | null } | null;
  about?: {
    title?: LocaleValue | null;
    text?: LocaleValue | null;
    images?: (SanityImage & { _key: string })[] | null;
  } | null;
  customTour?: {
    title?: LocaleValue | null;
    text?: LocaleValue | null;
    image?: SanityImage | null;
    buttonLabel?: LocaleValue | null;
  } | null;
  bookingPolicy?: LocaleValue | null;
  googleRating?: number | null;
  googleReviewCount?: number | null;
  googleReviewsUrl?: string | null;
};

export type TourOptionSummary = { durationDays?: number | null; p5plus?: number | null };

export type TourCard = {
  _id: string;
  slug: string;
  title?: LocaleValue | null;
  tagline?: LocaleValue | null;
  coverImage?: SanityImage | null;
  categories?: (LocaleValue | null)[] | null;
  options?: TourOptionSummary[] | null;
};

export type Testimonial = {
  _id: string;
  name: string;
  country?: string | null;
  rating?: number | null;
  text?: LocaleValue | null;
  sourceUrl?: string | null;
};

export type GalleryImage = SanityImage & {
  _key: string;
  tour?: { title?: LocaleValue | null; slug?: string | null } | null;
};
