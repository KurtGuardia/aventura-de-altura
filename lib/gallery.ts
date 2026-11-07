import type { Dictionary, Locale } from "@/lib/i18n";
import { hotspotPosition, imageDimensions, imageSrc } from "@/lib/sanity/image";
import { t } from "@/lib/sanity/locale";
import type { GalleryImage } from "@/lib/sanity/types";

/** Foto de la galería ya resuelta en el servidor (serializable para el cliente). */
export type GalleryItemView = {
  key: string;
  /** Miniatura cuadrada, recortada en el hotspot. */
  thumb: string;
  /** Imagen completa (proporción original) para el lightbox. */
  full: string;
  alt: string;
  position?: string;
  tour?: { title: string; href: string };
};

export function toGalleryItems(images: GalleryImage[], lang: Locale): GalleryItemView[] {
  return images.flatMap((image) => {
    const thumb = imageSrc(image, 1);
    const full = imageSrc(image);
    if (!thumb || !full || !imageDimensions(image)) return [];

    const tourTitle = t(image.tour?.title, lang);
    const tour =
      tourTitle && image.tour?.slug
        ? { title: tourTitle, href: `/${lang}/tours/${image.tour.slug}` }
        : undefined;

    return [
      {
        key: image._key,
        thumb,
        full,
        alt: t(image.alt, lang) ?? tour?.title ?? "",
        position: hotspotPosition(image),
        tour,
      },
    ];
  });
}

/** Textos de UI de la galería y el lightbox. */
export function galleryLabels(dict: Dictionary) {
  return { ...dict.gallery, viewTour: dict.buttons.viewTour };
}
