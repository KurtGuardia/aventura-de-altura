import type { Dictionary, Locale } from "@/lib/i18n";
import { hotspotPosition, imageDimensions, imageSrc } from "@/lib/sanity/image";
import { t } from "@/lib/sanity/locale";
import type { GalleryImage } from "@/lib/sanity/types";

/** Foto de la galería ya resuelta en el servidor (serializable para el cliente). */
export type GalleryItemView = {
  key: string;
  /** Miniatura cuadrada, recortada en el hotspot. */
  thumb: string;
  /** Imagen completa (proporción original) para el masonry y el lightbox. */
  full: string;
  /** Dimensiones originales: reservan el espacio (sin CLS) y dan la proporción. */
  width: number;
  height: number;
  /** Placeholder borroso de Sanity. */
  lqip?: string;
  alt: string;
  position?: string;
  tour?: { title: string; href: string };
};

export function toGalleryItems(images: GalleryImage[], lang: Locale): GalleryItemView[] {
  return images.flatMap((image) => {
    const thumb = imageSrc(image, 1);
    const full = imageSrc(image);
    const size = imageDimensions(image);
    if (!thumb || !full || !size) return [];
    // Con recorte en el Studio, la proporción visible es la del recorte.
    const crop = image.crop;
    const width = crop ? size.width * (1 - crop.left - crop.right) : size.width;
    const height = crop ? size.height * (1 - crop.top - crop.bottom) : size.height;

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
        width: Math.round(width),
        height: Math.round(height),
        lqip: image.lqip ?? undefined,
        alt: t(image.alt, lang) ?? tour?.title ?? "",
        position: hotspotPosition(image),
        tour,
      },
    ];
  });
}

/** Textos de UI de la galería y el lightbox. */
export function galleryLabels(dict: Dictionary) {
  return {
    open: dict.gallery.open,
    close: dict.gallery.close,
    previous: dict.gallery.previous,
    next: dict.gallery.next,
    counter: dict.gallery.counter,
    dialog: dict.gallery.dialog,
    viewTour: dict.buttons.viewTour,
  };
}
