import Link from "next/link";
import { Gallery } from "@/components/gallery/Gallery";
import { ArrowRight } from "@/components/icons";
import { button, container, SectionHeading, sectionY } from "@/components/ui";
import { galleryLabels, type GalleryItemView } from "@/lib/gallery";
import type { Dictionary, Locale } from "@/lib/i18n";

export const PREVIEW_COUNT = 6;

export function GalleryPreview({ lang, dict, items }: { lang: Locale; dict: Dictionary; items: GalleryItemView[] }) {
  if (items.length === 0) return null;

  return (
    <section id="galeria" className={`bg-sand-50 ${sectionY}`}>
      <div className={container}>
        <div className="flex flex-wrap items-end justify-between gap-6">
          <SectionHeading title={dict.sections.gallery} />
          {/* En móvil el botón va debajo del mosaico. */}
          <div className="hidden md:block">
            <Link href={`/${lang}/galeria`} className={`${button.base} ${button.outline} text-forest-900`}>
              {dict.buttons.viewGallery}
              <ArrowRight className="size-4" />
            </Link>
          </div>
        </div>
        <div className="mt-12">
          <Gallery items={items.slice(0, PREVIEW_COUNT)} variant="mosaic" labels={galleryLabels(dict)} />
        </div>
        <Link href={`/${lang}/galeria`} className={`${button.base} ${button.primary} mt-8 w-full md:hidden`}>
          {dict.buttons.viewGallery}
          <ArrowRight className="size-4" />
        </Link>
      </div>
    </section>
  );
}
