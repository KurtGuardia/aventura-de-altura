"use client";

import { AnimatePresence, m, type PanInfo } from "motion/react";
import Link from "next/link";
import { Image } from "next-sanity/image";
import { useEffect, useRef, useState } from "react";
import { createPortal } from "react-dom";
import { ArrowRight, ChevronLeft, ChevronRight, Close } from "@/components/icons";
import { lockScroll } from "@/components/motion/lenis";
import { useReducedMotion } from "@/components/motion/useReducedMotion";
import { useFocusTrap } from "@/components/useFocusTrap";
import { useIsClient } from "@/components/useIsClient";
import type { GalleryItemView } from "@/lib/gallery";
import { fill } from "@/lib/i18n";
import { EASE } from "@/lib/motion";

export type LightboxLabels = {
  dialog: string;
  close: string;
  previous: string;
  next: string;
  /** Con marcadores {current} y {total}. */
  counter: string;
  viewTour: string;
};

type Props = {
  items: GalleryItemView[];
  index: number | null;
  /** Foto desde la que se abrió: su miniatura se expande hacia el visor. */
  origin: string | null;
  onIndexChange: (index: number | null) => void;
  labels: LightboxLabels;
};

/** Píxeles de arrastre para cambiar de foto o cerrar. */
const SWIPE_X = 70;
const SWIPE_DOWN = 110;

/**
 * Visor a pantalla completa, compartido por la home y la página de galería.
 * - Se abre con una layout animation desde la miniatura (layoutId de motion).
 * - Deslizar a los lados cambia de foto; hacia abajo, cierra. Flechas del
 *   teclado y botones en escritorio; Esc o la X cierran.
 * - Foco atrapado y devuelto a la miniatura al cerrar.
 * - Precarga la foto anterior y la siguiente.
 */
export function Lightbox({ items, index, origin, onIndexChange, labels }: Props) {
  const panelRef = useRef<HTMLDivElement>(null);
  const isClient = useIsClient();
  const reduced = useReducedMotion();
  const [direction, setDirection] = useState(0);
  const open = index !== null;
  const item = open ? items[index] : null;

  const close = () => onIndexChange(null);
  const go = (delta: number) => {
    if (index === null || items.length < 2) return;
    setDirection(delta);
    onIndexChange((index + delta + items.length) % items.length);
  };

  useFocusTrap(panelRef, open, close);

  useEffect(() => {
    if (!open) return;
    lockScroll(true);
    return () => lockScroll(false);
  }, [open]);

  // Flechas del teclado.
  const goRef = useRef(go);
  useEffect(() => {
    goRef.current = go;
  });
  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "ArrowLeft") goRef.current(-1);
      if (e.key === "ArrowRight") goRef.current(1);
    };
    document.addEventListener("keydown", onKey);
    return () => document.removeEventListener("keydown", onKey);
  }, [open]);

  const onDragEnd = (_: unknown, info: PanInfo) => {
    const { x, y } = info.offset;
    if (y > SWIPE_DOWN && Math.abs(y) > Math.abs(x)) close();
    else if (Math.abs(x) > SWIPE_X) go(x < 0 ? 1 : -1);
  };

  const neighbours =
    index !== null && items.length > 1
      ? [items[(index + 1) % items.length], items[(index - 1 + items.length) % items.length]]
      : [];

  const slide = reduced ? 0 : 80;

  const panel = (
    <AnimatePresence>
      {item && index !== null && (
        <m.div
          ref={panelRef}
          role="dialog"
          aria-modal="true"
          aria-label={labels.dialog}
          data-lenis-prevent=""
          className="tone-dark fixed inset-0 z-50 flex flex-col bg-navy-950/97"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: reduced ? 0 : 0.35, ease: EASE }}
        >
          <div className="flex shrink-0 items-center justify-between px-gutter py-3">
            <p className="label-mono tabular-nums text-white/70" aria-live="polite">
              {fill(labels.counter, { current: index + 1, total: items.length })}
            </p>
            <button
              type="button"
              onClick={close}
              aria-label={labels.close}
              data-autofocus=""
              className="-mr-2 flex size-11 items-center justify-center rounded-full hover:bg-white/10"
            >
              <Close className="size-6" />
            </button>
          </div>

          {/* Escenario: la foto ocupa el máximo posible manteniendo su proporción. */}
          <div className="relative min-h-0 flex-1 [container-type:size]">
            <AnimatePresence initial={false} custom={direction} mode="popLayout">
              <m.div
                key={item.key}
                layoutId={item.key === origin ? `photo-${item.key}` : undefined}
                custom={direction}
                drag={items.length > 1 ? true : "y"}
                dragSnapToOrigin
                dragElastic={0.5}
                onDragEnd={onDragEnd}
                initial={{ opacity: 0, x: direction * slide }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -direction * slide }}
                transition={{ duration: reduced ? 0 : 0.5, ease: EASE }}
                className="absolute inset-0 m-auto cursor-grab touch-none overflow-hidden active:cursor-grabbing"
                style={{
                  aspectRatio: `${item.width} / ${item.height}`,
                  width: `min(100cqw, calc(100cqh * ${item.width / item.height}))`,
                  height: "auto",
                }}
              >
                <Image
                  src={item.full}
                  alt={item.alt}
                  fill
                  sizes="100vw"
                  draggable={false}
                  placeholder={item.lqip ? "blur" : "empty"}
                  blurDataURL={item.lqip}
                  className="pointer-events-none select-none object-cover"
                />
              </m.div>
            </AnimatePresence>

            {items.length > 1 && (
              <>
                <button
                  type="button"
                  onClick={() => go(-1)}
                  aria-label={labels.previous}
                  className="absolute left-4 top-1/2 hidden size-12 -translate-y-1/2 items-center justify-center rounded-full bg-navy-950/60 ring-1 ring-white/15 backdrop-blur-sm hover:bg-navy-950 md:flex"
                >
                  <ChevronLeft className="size-6" />
                </button>
                <button
                  type="button"
                  onClick={() => go(1)}
                  aria-label={labels.next}
                  className="absolute right-4 top-1/2 hidden size-12 -translate-y-1/2 items-center justify-center rounded-full bg-navy-950/60 ring-1 ring-white/15 backdrop-blur-sm hover:bg-navy-950 md:flex"
                >
                  <ChevronRight className="size-6" />
                </button>
              </>
            )}

            {/* Precarga de la foto siguiente y la anterior (mismo srcset que el visor). */}
            <div aria-hidden="true" className="pointer-events-none invisible absolute size-px overflow-hidden">
              {neighbours.map((n) => (
                <Image key={n.key} src={n.full} alt="" fill sizes="100vw" loading="eager" />
              ))}
            </div>
          </div>

          <div className="min-h-16 shrink-0 px-gutter pb-[max(1rem,env(safe-area-inset-bottom))] pt-3">
            {item.tour ? (
              <div className="mx-auto flex max-w-3xl items-center justify-between gap-4 border-t border-white/15 pt-3">
                <p className="font-display text-xl uppercase leading-tight tracking-display">{item.tour.title}</p>
                <Link
                  href={item.tour.href}
                  className="inline-flex shrink-0 items-center gap-2 rounded-full bg-ember-400 px-5 py-2.5 text-sm font-semibold text-navy-950 hover:bg-ember-300"
                >
                  {labels.viewTour}
                  <ArrowRight className="size-4" />
                </Link>
              </div>
            ) : (
              item.alt && <p className="mx-auto max-w-3xl text-center text-sm text-white/70">{item.alt}</p>
            )}
          </div>
        </m.div>
      )}
    </AnimatePresence>
  );

  return isClient ? createPortal(panel, document.body) : null;
}
