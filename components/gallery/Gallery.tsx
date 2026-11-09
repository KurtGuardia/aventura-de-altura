"use client";

import { m, type Variants } from "motion/react";
import Link from "next/link";
import { Image } from "next-sanity/image";
import { useLayoutEffect, useRef, useState } from "react";
import { ArrowRight } from "@/components/icons";
import { useReducedMotion } from "@/components/motion/useReducedMotion";
import type { GalleryItemView } from "@/lib/gallery";
import { DURATION, EASE, REVEAL_Y, STAGGER } from "@/lib/motion";
import { Lightbox, type LightboxLabels } from "./Lightbox";

type Props = {
  items: GalleryItemView[];
  /** `mosaic`: vista previa de la home (1 grande + 5). `masonry`: página de galería. */
  variant: "mosaic" | "masonry";
  labels: LightboxLabels & { open: string };
};

const layouts = {
  // Móvil: 2 columnas, la primera y la última a todo el ancho.
  // Escritorio: 3 columnas, la primera ocupa 2×2.
  mosaic: {
    list: "grid grid-cols-2 gap-2 md:grid-cols-3 md:gap-3",
    tile: (i: number) =>
      i === 0
        ? "col-span-2 aspect-square md:row-span-2"
        : i === 5
          ? "col-span-2 aspect-[2/1] md:col-span-1 md:aspect-square"
          : "aspect-square",
    sizes: (i: number) =>
      i === 0 ? "(min-width: 768px) 66vw, 100vw" : i === 5 ? "(min-width: 768px) 33vw, 100vw" : "(min-width: 768px) 33vw, 50vw",
  },
  // Columnas CSS: cada foto con su proporción original.
  masonry: {
    list: "columns-2 gap-2 md:columns-3 md:gap-3 xl:columns-4",
    tile: () => "mb-2 break-inside-avoid md:mb-3",
    sizes: () => "(min-width: 1280px) 25vw, (min-width: 768px) 33vw, 50vw",
  },
};

/**
 * Galería con lightbox compartido. Las miniaturas entran escalonadas al
 * aparecer, tienen zoom-out en hover y, si la foto tiene tour, un chip
 * enlazado (solo con ratón o teclado: en táctil, tocar solo abre el lightbox).
 */
export function Gallery({ items, variant, labels }: Props) {
  const [index, setIndex] = useState<number | null>(null);
  const [origin, setOrigin] = useState<string | null>(null);
  const reduced = useReducedMotion();
  const layout = layouts[variant];

  const tileVariants: Variants = {
    // Instantáneo: las fotos que se ocultan tras hidratar están fuera de pantalla.
    hidden: { opacity: 0, y: REVEAL_Y, transition: { duration: 0 } },
    show: (i: number) => ({
      opacity: 1,
      y: 0,
      transition: reduced
        ? { duration: 0 }
        : // Mosaico: escalonado por posición. Masonry: cada foto al entrar en pantalla.
          { duration: DURATION.enter, ease: EASE, delay: variant === "mosaic" ? i * STAGGER : (i % 4) * 0.05 },
    }),
  };

  // Masonry: el servidor envía todas las fotos visibles (la primera pantalla
  // es el LCP y no debe esperar a una animación). Tras hidratar, y antes de
  // pintar, las que están fuera de pantalla pasan a ocultas y entran al hacer
  // scroll. En CSS columns el orden va por columnas: se mide, no se adivina.
  const listRef = useRef<HTMLUListElement>(null);
  const [deferred, setDeferred] = useState<Set<number>>(new Set());
  const [revealed, setRevealed] = useState<Set<number>>(new Set());
  useLayoutEffect(() => {
    if (variant !== "masonry" || reduced || !listRef.current) return;
    const tiles = Array.from(listRef.current.children);
    const below = tiles.flatMap((el, i) => (el.getBoundingClientRect().top > window.innerHeight ? [i] : []));
    setDeferred(new Set(below));
  }, [variant, reduced]);
  const eager = (i: number) => variant === "masonry" && i < 8;

  const open = (i: number) => {
    setOrigin(items[i].key);
    setIndex(i);
  };

  return (
    <>
      <ul ref={listRef} className={layout.list}>
        {items.map((item, i) => (
          <m.li
            key={item.key}
            custom={i}
            data-reveal=""
            variants={tileVariants}
            {...(variant === "masonry"
              ? {
                  initial: false,
                  animate: deferred.has(i) && !revealed.has(i) ? "hidden" : "show",
                  viewport: { once: true, amount: 0.2 },
                  onViewportEnter: () => setRevealed((r) => (r.has(i) ? r : new Set(r).add(i))),
                }
              : {
                  initial: "hidden",
                  ...(reduced ? { animate: "show" } : { whileInView: "show", viewport: { once: true, amount: 0.2 } }),
                })}
            className={`zoom-trigger group relative overflow-hidden rounded-card bg-sand-200 ${layout.tile(i)}`}
            style={variant === "masonry" ? { aspectRatio: `${item.width} / ${item.height}` } : undefined}
          >
            <button
              type="button"
              onClick={() => open(i)}
              aria-label={item.alt ? `${labels.open}: ${item.alt}` : labels.open}
              className="absolute inset-0 cursor-zoom-in focus-visible:outline-offset-[-3px]"
            >
              <m.span layoutId={`photo-${item.key}`} className="absolute inset-0 block overflow-hidden">
                <Image
                  src={variant === "masonry" ? item.full : item.thumb}
                  alt=""
                  fill
                  sizes={layout.sizes(i)}
                  loading={eager(i) ? "eager" : "lazy"}
                  placeholder={item.lqip ? "blur" : "empty"}
                  blurDataURL={item.lqip}
                  className="zoom-img object-cover"
                  style={{ objectPosition: item.position }}
                />
              </m.span>
            </button>

            {item.tour && (
              <Link
                href={item.tour.href}
                className="label-mono pointer-events-none absolute bottom-3 left-3 inline-flex translate-y-2 items-center gap-1.5 rounded-full bg-cream px-3 py-2 text-navy-950 opacity-0 shadow-float transition-[opacity,translate] duration-500 ease-cinematic can-hover:group-hover:pointer-events-auto can-hover:group-hover:translate-y-0 can-hover:group-hover:opacity-100 focus-visible:pointer-events-auto focus-visible:translate-y-0 focus-visible:opacity-100"
              >
                {item.tour.title}
                <ArrowRight className="size-3.5" />
              </Link>
            )}
          </m.li>
        ))}
      </ul>

      <Lightbox items={items} index={index} origin={origin} onIndexChange={setIndex} labels={labels} />
    </>
  );
}
