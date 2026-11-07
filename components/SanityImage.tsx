import { Image } from "next-sanity/image";
import type { Locale } from "@/lib/i18n";
import { hotspotPosition, imageSrc } from "@/lib/sanity/image";
import { t } from "@/lib/sanity/locale";
import type { SanityImage as SanityImageType } from "@/lib/sanity/types";

type Props = {
  image: SanityImageType | null | undefined;
  lang: Locale;
  /** Atributo `sizes` de next/image: cuánto ocupa la imagen en pantalla. */
  sizes: string;
  /** Proporción ancho/alto del recorte (centrado en el hotspot). Sin ella, proporción original. */
  aspect?: number;
  /** Texto alternativo si la imagen no trae el suyo. */
  fallbackAlt?: string;
  /** Imagen principal (LCP): se carga sin lazy loading y con prioridad alta. */
  priority?: boolean;
  className?: string;
};

/**
 * Imagen de Sanity con next/image en modo `fill`: el contenedor padre debe
 * tener `position: relative` y tamaño. Las URLs las genera el CDN de Sanity
 * (loader de next-sanity), así que no pasan por el optimizador de Next.
 */
export function SanityImage({ image, lang, sizes, aspect, fallbackAlt, priority, className }: Props) {
  if (!image) return null;
  const src = imageSrc(image, aspect);
  if (!src) return null;

  return (
    <Image
      src={src}
      alt={t(image.alt, lang) ?? fallbackAlt ?? ""}
      fill
      sizes={sizes}
      loading={priority ? "eager" : "lazy"}
      fetchPriority={priority ? "high" : undefined}
      className={`object-cover ${className ?? ""}`}
      style={{ objectPosition: hotspotPosition(image) }}
    />
  );
}
