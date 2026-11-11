import type { Metadata } from "next";
import { locales, type Locale } from "@/lib/i18n";
import { urlFor } from "@/lib/sanity/image";
import { t } from "@/lib/sanity/locale";
import type { SanityImage } from "@/lib/sanity/types";
import { siteName, siteUrl } from "@/lib/site";

const ogLocale: Record<Locale, string> = { es: "es_BO", en: "en_US" };

/** Open Graph por defecto (logo sobre azul noche) para páginas sin foto propia. */
export const DEFAULT_OG_IMAGE = { url: "/og-default.jpg", width: 1200, height: 630, alt: siteName } as const;

/**
 * Metadata común: canonical, hreflang (es, en, x-default → es) y Open Graph.
 * `path` es la ruta sin el idioma, por ejemplo "" (home) o "/galeria".
 * Las URLs relativas se resuelven con `metadataBase` del layout.
 */
export function pageMetadata({
  lang,
  path,
  title,
  description,
  image,
  absoluteTitle = false,
}: {
  lang: Locale;
  path: string;
  title: string;
  description?: string;
  image?: SanityImage | null;
  absoluteTitle?: boolean;
}): Metadata {
  const ogImage = image?.asset
    ? {
        url: urlFor(image).width(1200).height(630).fit("crop").auto("format").url(),
        width: 1200,
        height: 630,
        alt: t(image.alt, lang) ?? siteName,
      }
    : DEFAULT_OG_IMAGE;

  return {
    title: absoluteTitle ? { absolute: title } : title,
    description,
    alternates: {
      canonical: `/${lang}${path}`,
      languages: {
        ...Object.fromEntries(locales.map((l) => [l, `/${l}${path}`])),
        "x-default": `/es${path}`,
      },
    },
    openGraph: {
      type: "website",
      siteName,
      title,
      description,
      url: `/${lang}${path}`,
      locale: ogLocale[lang],
      alternateLocale: locales.filter((l) => l !== lang).map((l) => ogLocale[l]),
      images: [ogImage],
    },
    twitter: {
      card: "summary_large_image",
      title,
      description,
      images: [ogImage.url],
    },
  };
}

/**
 * JSON-LD `TouristTrip` del detalle de tour. Solo incluye datos existentes:
 * sin descripción, foto o precios, esas propiedades no se emiten.
 */
export function tourJsonLd({
  lang,
  slug,
  name,
  description,
  image,
  prices,
  telephone,
}: {
  lang: Locale;
  slug: string;
  name: string;
  description?: string;
  image?: SanityImage | null;
  /** Todos los precios por persona en USD (de todas las opciones). */
  prices: number[];
  telephone?: string | null;
}) {
  const url = `${siteUrl}/${lang}/tours/${slug}`;
  return {
    "@context": "https://schema.org",
    "@type": "TouristTrip",
    name,
    url,
    inLanguage: lang,
    ...(description && { description }),
    ...(image?.asset && { image: [urlFor(image).width(1200).height(630).fit("crop").auto("format").url()] }),
    ...(prices.length > 0 && {
      offers: {
        "@type": "AggregateOffer",
        priceCurrency: "USD",
        lowPrice: Math.min(...prices),
        highPrice: Math.max(...prices),
        url,
      },
    }),
    provider: {
      "@type": "TravelAgency",
      name: siteName,
      url: siteUrl,
      ...(telephone && { telephone }),
    },
  };
}

/**
 * JSON-LD de la organización (`TravelAgency`) para la home, con los datos de
 * contacto de "Ajustes del sitio". Solo emite lo que existe.
 */
export function organizationJsonLd({
  lang,
  description,
  phones,
  email,
  sameAs,
}: {
  lang: Locale;
  description?: string;
  phones: string[];
  email?: string | null;
  sameAs: string[];
}) {
  return {
    "@context": "https://schema.org",
    "@type": "TravelAgency",
    "@id": `${siteUrl}/#organization`,
    name: siteName,
    url: `${siteUrl}/${lang}`,
    logo: `${siteUrl}/logo.jpg`,
    image: `${siteUrl}${DEFAULT_OG_IMAGE.url}`,
    ...(description && { description }),
    ...(phones[0] && { telephone: phones[0] }),
    ...(email && { email }),
    address: {
      "@type": "PostalAddress",
      addressLocality: "Cochabamba",
      addressCountry: "BO",
    },
    areaServed: { "@type": "Country", name: "Bolivia" },
    // Idiomas de atención: solo español e inglés.
    availableLanguage: ["es", "en"],
    ...(phones.length > 0 && {
      contactPoint: phones.map((telephone) => ({
        "@type": "ContactPoint",
        telephone,
        contactType: "customer service",
        availableLanguage: ["Spanish", "English"],
      })),
    }),
    ...(sameAs.length > 0 && { sameAs }),
  };
}

/** `<script type="application/ld+json">` seguro (escapa `<` para no cerrar la etiqueta). */
export function jsonLdScript(data: object) {
  return { __html: JSON.stringify(data).replace(/</g, "\\u003c") };
}
