import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { Gallery } from "@/components/gallery/Gallery";
import { WhatsAppFloat } from "@/components/layout/WhatsAppFloat";
import { container } from "@/components/ui";
import { galleryLabels, toGalleryItems } from "@/lib/gallery";
import { getDictionary, isLocale } from "@/lib/i18n";
import { getGallery, getSiteSettings } from "@/lib/sanity/fetch";
import { pageMetadata } from "@/lib/seo";
import { whatsappHref } from "@/lib/site";

export async function generateMetadata({ params }: PageProps<"/[lang]/galeria">): Promise<Metadata> {
  const { lang } = await params;
  if (!isLocale(lang)) return {};
  const [dict, settings, gallery] = await Promise.all([getDictionary(lang), getSiteSettings(), getGallery()]);

  return pageMetadata({
    lang,
    path: "/galeria",
    title: dict.meta.galleryTitle,
    description: dict.meta.galleryDescription,
    // Open Graph con la foto del hero; si no hay, la primera de la galería.
    image: settings?.heroImage?.asset ? settings.heroImage : gallery[0],
  });
}

export default async function GalleryPage({ params }: PageProps<"/[lang]/galeria">) {
  const { lang } = await params;
  if (!isLocale(lang)) notFound();

  const [dict, settings, gallery] = await Promise.all([getDictionary(lang), getSiteSettings(), getGallery()]);
  const items = toGalleryItems(gallery, lang);
  if (items.length === 0) notFound();

  return (
    <>
      <div className={`${container} pb-20 pt-12 md:pb-28 md:pt-20`}>
        <h1 className="font-display text-5xl leading-none tracking-tight text-forest-950 md:text-7xl">
          {dict.sections.gallery}
        </h1>
        <div className="mt-10 md:mt-14">
          <Gallery items={items} variant="grid" labels={galleryLabels(dict)} />
        </div>
      </div>
      <WhatsAppFloat
        href={whatsappHref(settings?.whatsappPrimary, dict.whatsapp.general)}
        label={dict.buttons.contactWhatsApp}
      />
    </>
  );
}
