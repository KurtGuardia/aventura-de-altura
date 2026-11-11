import type { MetadataRoute } from "next";
import { locales } from "@/lib/i18n";
import { getSitemapData } from "@/lib/sanity/fetch";
import { siteUrl } from "@/lib/site";

/**
 * /sitemap.xml: home, galería (si tiene fotos) y todos los tours, en ES y EN,
 * cada URL con sus alternativas hreflang (es, en, x-default → es).
 */
export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const data = await getSitemapData();

  const pages: { path: string; lastModified?: string; priority: number }[] = [
    { path: "", lastModified: data?.home ?? undefined, priority: 1 },
    ...(data?.gallery?.count ? [{ path: "/galeria", lastModified: data.gallery._updatedAt, priority: 0.5 }] : []),
    ...(data?.tours ?? [])
      .filter((tour) => tour.slug)
      .map((tour) => ({ path: `/tours/${tour.slug}`, lastModified: tour._updatedAt, priority: 0.8 })),
  ];

  return pages.flatMap(({ path, lastModified, priority }) => {
    const languages = {
      ...Object.fromEntries(locales.map((l) => [l, `${siteUrl}/${l}${path}`])),
      "x-default": `${siteUrl}/es${path}`,
    };
    return locales.map((lang) => ({
      url: `${siteUrl}/${lang}${path}`,
      ...(lastModified && { lastModified }),
      priority,
      alternates: { languages },
    }));
  });
}
