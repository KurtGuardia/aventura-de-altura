import { defineQuery } from "next-sanity";

const IMAGE = /* groq */ `asset, crop, hotspot, alt`;

export const SITE_SETTINGS_QUERY = defineQuery(`*[_id == "siteSettings"][0]{
  whatsappPrimary, whatsappSecondary, email, facebook, contactLanguages, exchangeRate,
  heroTitle, heroSubtitle, heroCtaLabel, heroImage{${IMAGE}},
  safety{title, intro, items[]{_key, title, text}, image{${IMAGE}}},
  whyUs{title, items[]{_key, title, text}},
  about{title, text, image{${IMAGE}}},
  customTour{title, text, buttonLabel, image{${IMAGE}}},
  bookingPolicy,
  googleRating, googleReviewCount, googleReviewsUrl
}`);

export const FEATURED_TOURS_QUERY = defineQuery(`*[
  _type == "tour" && featured == true && defined(slug.current)
] | order(order asc, title.es asc){
  _id,
  "slug": slug.current,
  title,
  tagline,
  coverImage{${IMAGE}},
  "categories": categories[]->title,
  "options": options[]{durationDays, prices}
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
