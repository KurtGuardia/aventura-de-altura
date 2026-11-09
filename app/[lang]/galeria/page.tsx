import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { Gallery } from "@/components/gallery/Gallery";
import { WhatsAppFloat } from "@/components/layout/WhatsAppFloat";
import { SplitText } from "@/components/motion/SplitText";
import { MountainDivider } from "@/components/MountainDivider";
import { container } from "@/components/ui";
import { galleryLabels, toGalleryItems } from "@/lib/gallery";
import { fill, getDictionary, isLocale } from "@/lib/i18n";
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

  const count = items.length === 1 ? dict.gallery.photoCountOne : fill(dict.gallery.photoCount, { count: items.length });

  return (
    <>
      {/* Cabecera oscura: el header transparente se apoya en ella. */}
      <header className="tone-dark grain relative bg-navy-950 pb-[clamp(5rem,10vw,8rem)] pt-36 md:pt-44">
        <div className={`${container} flex flex-wrap items-end justify-between gap-6`}>
          <SplitText
            as="h1"
            trigger="mount"
            text={dict.sections.gallery}
            className="font-display text-display-hero uppercase tracking-display"
          />
          <p className="label-mono pb-3 text-ember-300">{count}</p>
        </div>
        <MountainDivider className="text-cream" />
      </header>
      <div className={`${container} pb-section pt-10 md:pt-14`}>
        <Gallery items={items} variant="masonry" labels={galleryLabels(dict)} />
      </div>
      <WhatsAppFloat
        href={whatsappHref(settings?.whatsappPrimary, dict.whatsapp.general)}
        label={dict.buttons.contactWhatsApp}
      />
    </>
  );
}
