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
  /** Imagen decorativa: `alt=""` aunque Sanity tenga texto alternativo. */
  decorative?: boolean;
  /** Imagen principal (LCP): se carga sin lazy loading y con prioridad alta. */
  priority?: boolean;
  /**
   * Zoom-out en hover (regla global): la imagen reposa a scale(1.05) y vuelve
   * a 1 al pasar el ratón por el ancestro con la clase `zoom-trigger`. El
   * contenedor debe tener `overflow: hidden`. Sin efecto en táctil.
   */
  zoom?: boolean;
  className?: string;
};

/**
 * Imagen de Sanity con next/image en modo `fill`: el contenedor padre debe
 * tener `position: relative` y tamaño. Las URLs las genera el CDN de Sanity
 * (loader de next-sanity), así que no pasan por el optimizador de Next.
 * Usa el LQIP de Sanity como placeholder borroso mientras carga.
 */
export function SanityImage({
  image,
  lang,
  sizes,
  aspect,
  fallbackAlt,
  decorative,
  priority,
  zoom,
  className,
}: Props) {
  if (!image) return null;
  const src = imageSrc(image, aspect);
  if (!src) return null;

  return (
    <Image
      src={src}
      alt={decorative ? "" : (t(image.alt, lang) ?? fallbackAlt ?? "")}
      fill
      sizes={sizes}
      loading={priority ? "eager" : "lazy"}
      fetchPriority={priority ? "high" : undefined}
      placeholder={image.lqip ? "blur" : "empty"}
      blurDataURL={image.lqip ?? undefined}
      className={`object-cover ${zoom ? "zoom-img" : ""} ${className ?? ""}`}
      style={{ objectPosition: hotspotPosition(image) }}
    />
  );
}
