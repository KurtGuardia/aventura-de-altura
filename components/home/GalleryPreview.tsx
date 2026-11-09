import Link from "next/link";
import { Gallery } from "@/components/gallery/Gallery";
import { ArrowRight } from "@/components/icons";
import { MagneticButton } from "@/components/motion/MagneticButton";
import { Reveal } from "@/components/motion/Reveal";
import { button, container, SectionHeading } from "@/components/ui";
import { galleryLabels, type GalleryItemView } from "@/lib/gallery";
import type { Dictionary, Locale } from "@/lib/i18n";

export const PREVIEW_COUNT = 6;

/** Vista previa de la galería: mosaico asimétrico (1 grande + 5) y "Ver galería" al final. */
export function GalleryPreview({ lang, dict, items }: { lang: Locale; dict: Dictionary; items: GalleryItemView[] }) {
  if (items.length === 0) return null;

  const viewAll = (
    <Link href={`/${lang}/galeria`} className={`${button.base} ${button.large} ${button.primary}`}>
      {dict.buttons.viewGallery}
      <ArrowRight className="size-5" />
    </Link>
  );

  return (
    <section id="galeria" className="bg-cream py-section">
      <div className={container}>
        <SectionHeading title={dict.sections.gallery} />
        <div className="mt-14">
          <Gallery items={items.slice(0, PREVIEW_COUNT)} variant="mosaic" labels={galleryLabels(dict)} />
        </div>
        {/* "Ver galería" al final del mosaico: a lo ancho en móvil, centrado en escritorio. */}
        <Reveal className="mt-12 flex justify-center md:mt-16 [&_a]:w-full sm:[&_a]:w-auto">
          <MagneticButton className="w-full sm:w-auto">{viewAll}</MagneticButton>
        </Reveal>
      </div>
    </section>
  );
}
