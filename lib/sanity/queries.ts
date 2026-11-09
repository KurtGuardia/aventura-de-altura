import { defineQuery } from "next-sanity";

// `lqip`: miniatura borrosa en base64 que genera Sanity, para el placeholder.
const IMAGE = /* groq */ `asset, crop, hotspot, alt, "lqip": asset->metadata.lqip`;

export const SITE_SETTINGS_QUERY = defineQuery(`*[_id == "siteSettings"][0]{
  whatsappPrimary, whatsappSecondary, email, facebook, instagram, contactLanguages, exchangeRate,
  heroTitle, heroRotatingWords, heroSubtitle, heroCtaLabel,
  funFacts[]{_key, value, unit, place, text}, heroImage{${IMAGE}},
  safety{title, intro, items[]{_key, title, text}, image{${IMAGE}}},
  whyUs{title, items[]{_key, title, text}},
  about{title, text, image{${IMAGE}}},
  customTour{title, text, buttonLabel, image{${IMAGE}}},
  bookingPolicy,
  googleRating, googleReviewCount, googleReviewsUrl
}`);

// Proyección de la tarjeta de tour (home y "Otros tours" del detalle).
const TOUR_CARD = /* groq */ `
  _id,
  "slug": slug.current,
  title,
  tagline,
  coverImage{${IMAGE}},
  "categories": categories[]->title,
  "options": options[]{durationDays, prices}
`;

export const FEATURED_TOURS_QUERY = defineQuery(`*[
  _type == "tour" && featured == true && defined(slug.current)
] | order(order asc, title.es asc){${TOUR_CARD}}`);

/** Slugs de todos los tours publicados (generateStaticParams del detalle). */
export const TOUR_SLUGS_QUERY = defineQuery(`*[_type == "tour" && defined(slug.current)].slug.current`);

/**
 * Página de detalle: el tour por slug con todos sus campos y hasta 3 "otros
 * tours" (todos los demás, por orden).
 */
export const TOUR_PAGE_QUERY = defineQuery(`{
  "tour": *[_type == "tour" && slug.current == $slug][0]{
    _id,
    "slug": slug.current,
    title,
    tagline,
    description,
    coverImage{${IMAGE}},
    "categories": categories[]->title,
    quickFacts{difficulty, altitude, departureCity, languages},
    highlights[]{_key, title, text, image{${IMAGE}}},
    options[]{
      _key, label, durationDays, nights, lodging, prices,
      itinerary[]{_key, day, items[]{_key, time, text}}
    },
    includes,
    excludes,
    requirements,
    notes,
    gallery[defined(asset)]{_key, ${IMAGE}}
  },
  "others": *[
    _type == "tour" && defined(slug.current) && slug.current != $slug
  ] | order(order asc, title.es asc)[0...3]{${TOUR_CARD}}
}`);

export const TESTIMONIALS_QUERY = defineQuery(`*[_type == "testimonial"] | order(order asc, _createdAt desc){
  _id, name, country, rating, text, sourceUrl
}`);

// La referencia al tour es débil: si el tour se borró o no está publicado,
// `tour` llega como null y la foto se muestra sin enlace.
export const GALLERY_QUERY = defineQuery(`*[_id == "gallery"][0].images[defined(asset)]{
  _key,
  ${IMAGE},
  "tour": tour->{title, "slug": slug.current}
}`);
