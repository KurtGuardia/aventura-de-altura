"use client";

import Link from "next/link";
import { Image } from "next-sanity/image";
import { useState } from "react";
import { ArrowRight } from "@/components/icons";
import type { GalleryItemView } from "@/lib/gallery";
import { Lightbox, type LightboxLabels } from "./Lightbox";

type Props = {
  items: GalleryItemView[];
  /** `mosaic`: vista previa de la home (1 grande + 5). `grid`: página de galería. */
  variant: "mosaic" | "grid";
  labels: LightboxLabels & { open: string; viewTour: string };
};

const layouts = {
  // Móvil: la primera ocupa todo el ancho, la última también (2 columnas, 6 fotos).
  // Escritorio: 3 columnas, la primera ocupa 2×2.
  mosaic: {
    grid: "grid grid-cols-2 gap-2 md:grid-cols-3 md:gap-3",
    tile: (i: number) =>
      i === 0
        ? "col-span-2 aspect-square md:row-span-2"
        : i === 5
          ? "col-span-2 aspect-[2/1] md:col-span-1 md:aspect-square"
          : "aspect-square",
    sizes: (i: number) =>
      i === 0 ? "(min-width: 768px) 66vw, 100vw" : i === 5 ? "(min-width: 768px) 33vw, 100vw" : "(min-width: 768px) 33vw, 50vw",
  },
  grid: {
    grid: "grid grid-cols-2 gap-2 md:grid-cols-3 md:gap-3 lg:grid-cols-4",
    tile: () => "aspect-square",
    sizes: () => "(min-width: 1024px) 25vw, (min-width: 768px) 33vw, 50vw",
  },
};

export function Gallery({ items, variant, labels }: Props) {
  const [index, setIndex] = useState<number | null>(null);
  const layout = layouts[variant];

  return (
    <>
      <ul className={layout.grid}>
        {items.map((item, i) => (
          <li key={item.key} className={`group relative overflow-hidden rounded-sm bg-sand-200 ${layout.tile(i)}`}>
            <button
              type="button"
              onClick={() => setIndex(i)}
              aria-label={item.alt ? `${labels.open}: ${item.alt}` : labels.open}
              className="absolute inset-0 cursor-zoom-in focus-visible:outline-3 focus-visible:-outline-offset-3 focus-visible:outline-sand-300"
            >
              <Image
                src={item.thumb}
                alt=""
                fill
                sizes={layout.sizes(i)}
                loading="lazy"
                className="object-cover transition-transform duration-500 ease-out group-hover:scale-[1.03]"
                style={{ objectPosition: item.position }}
              />
            </button>

            {/* Chip al tour: solo con ratón (hover) o teclado. En táctil no se muestra
                ni recibe toques, así tocar la foto solo abre el lightbox. */}
            {item.tour && (
              <Link
                href={item.tour.href}
                className="pointer-events-none absolute bottom-3 left-3 inline-flex items-center gap-1.5 rounded-full bg-white/95 px-3 py-1.5 text-xs font-semibold text-forest-900 opacity-0 shadow-sm transition-opacity group-hover:pointer-events-auto group-hover:opacity-100 focus-visible:pointer-events-auto focus-visible:opacity-100"
              >
                {item.tour.title}
                <ArrowRight className="size-3.5" />
              </Link>
            )}
          </li>
        ))}
      </ul>

      <Lightbox
        items={items}
        index={index}
        onIndexChange={setIndex}
        labels={labels}
      />
    </>
  );
}
