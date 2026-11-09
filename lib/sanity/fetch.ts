import { cacheLife, cacheTag } from "next/cache";
import type { QueryParams } from "next-sanity";
import { client as baseClient } from "@/sanity/lib/client";
import { FEATURED_TOURS_QUERY, GALLERY_QUERY, SITE_SETTINGS_QUERY, TESTIMONIALS_QUERY } from "./queries";
import type { GalleryImage, SiteSettings, Testimonial, TourCard } from "./types";

// Sin CDN: tras una revalidación on-demand se quiere el contenido recién
// publicado, no una copia en caché del CDN de Sanity.
const client = baseClient.withConfig({ useCdn: false });

/**
 * Tags de caché por tipo de documento. El webhook de Sanity podrá llamar a
 * `revalidateTag(<_type>)` para refrescar solo lo que cambió.
 */
export const TAGS = {
  siteSettings: "siteSettings",
  tour: "tour",
  tourCategory: "tourCategory",
  testimonial: "testimonial",
  gallery: "gallery",
} as const;

type Tag = (typeof TAGS)[keyof typeof TAGS];

async function sanityFetch<T>(query: string, tags: Tag[], params: QueryParams = {}): Promise<T> {
  "use cache";
  cacheTag(...tags);
  // Sin expiración por tiempo: el contenido solo cambia cuando el cliente publica.
  cacheLife("max");
  return client.fetch<T>(query, params);
}

export function getSiteSettings() {
  return sanityFetch<SiteSettings | null>(SITE_SETTINGS_QUERY, [TAGS.siteSettings]);
}

export async function getFeaturedTours() {
  return (await sanityFetch<TourCard[] | null>(FEATURED_TOURS_QUERY, [TAGS.tour, TAGS.tourCategory])) ?? [];
}


export async function getTestimonials() {
  return (await sanityFetch<Testimonial[] | null>(TESTIMONIALS_QUERY, [TAGS.testimonial])) ?? [];
}

export async function getGallery() {
  return (await sanityFetch<GalleryImage[] | null>(GALLERY_QUERY, [TAGS.gallery, TAGS.tour])) ?? [];
}
