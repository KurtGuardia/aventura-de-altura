import type { Metadata } from "next";
import { locales, type Locale } from "@/lib/i18n";
import { urlFor } from "@/lib/sanity/image";
import { t } from "@/lib/sanity/locale";
import type { SanityImage } from "@/lib/sanity/types";
import { siteName } from "@/lib/site";

const ogLocale: Record<Locale, string> = { es: "es_BO", en: "en_US" };

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
    : undefined;

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
      images: ogImage ? [ogImage] : undefined,
    },
    twitter: {
      card: ogImage ? "summary_large_image" : "summary",
      title,
      description,
      images: ogImage ? [ogImage.url] : undefined,
    },
  };
}
