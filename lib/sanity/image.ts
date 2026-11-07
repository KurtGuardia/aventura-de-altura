import { urlFor } from "@/sanity/lib/image";
import type { SanityImage } from "./types";

export { urlFor };

/** Ancho de referencia de la URL; el loader de next-sanity lo sustituye por el de cada srcset. */
const BASE_WIDTH = 1600;

/** Dimensiones originales a partir del id del asset: image-<hash>-<W>x<H>-<ext>. */
export function imageDimensions(image: SanityImage): { width: number; height: number } | null {
  const match = image.asset?._ref.match(/-(\d+)x(\d+)-\w+$/);
  if (!match) return null;
  return { width: Number(match[1]), height: Number(match[2]) };
}

/**
 * URL del CDN de Sanity lista para el loader de `next-sanity/image`.
 * Con `aspect` (ancho/alto) se recorta a esa proporción centrando el hotspot;
 * sin `aspect` se respeta la proporción original (con el recorte del Studio).
 */
export function imageSrc(image: SanityImage, aspect?: number): string | null {
  if (!image.asset?._ref) return null;
  const builder = urlFor(image).width(BASE_WIDTH);
  return aspect
    ? builder.height(Math.round(BASE_WIDTH / aspect)).fit("crop").url()
    : builder.url();
}

/**
 * `object-position` según el hotspot, por si el contenedor recorta la imagen
 * con una proporción distinta a la pedida en `imageSrc`.
 */
export function hotspotPosition(image: SanityImage): string | undefined {
  const h = image.hotspot;
  if (!h) return undefined;
  return `${(h.x * 100).toFixed(1)}% ${(h.y * 100).toFixed(1)}%`;
}
