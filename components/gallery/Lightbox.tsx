"use client";

import Link from "next/link";
import { Image } from "next-sanity/image";
import { useEffect, useRef } from "react";
import { ArrowRight, ChevronLeft, ChevronRight, Close } from "@/components/icons";
import type { GalleryItemView } from "@/lib/gallery";

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
  onIndexChange: (index: number | null) => void;
  labels: LightboxLabels;
};

const SWIPE_THRESHOLD = 50;

/**
 * Visor a pantalla completa sobre <dialog> nativo (foco atrapado, Esc cierra
 * y el foco vuelve a la miniatura). Flechas del teclado y botones en
 * escritorio; deslizar en móvil.
 */
export function Lightbox({ items, index, onIndexChange, labels }: Props) {
  const dialogRef = useRef<HTMLDialogElement>(null);
  const touchX = useRef<number | null>(null);
  const open = index !== null;
  const item = open ? items[index] : null;

  useEffect(() => {
    const dialog = dialogRef.current;
    if (!dialog) return;
    if (open && !dialog.open) dialog.showModal();
    if (!open && dialog.open) dialog.close();

    // Evita que la página de fondo se desplace mientras el visor está abierto.
    document.documentElement.style.overflow = open ? "hidden" : "";
    return () => {
      document.documentElement.style.overflow = "";
    };
  }, [open]);

  const go = (delta: number) => {
    if (index === null) return;
    onIndexChange((index + delta + items.length) % items.length);
  };

  const onKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "ArrowLeft") go(-1);
    if (e.key === "ArrowRight") go(1);
  };

  const onTouchStart = (e: React.TouchEvent) => {
    touchX.current = e.touches[0]?.clientX ?? null;
  };
  const onTouchEnd = (e: React.TouchEvent) => {
    const start = touchX.current;
    const end = e.changedTouches[0]?.clientX;
    touchX.current = null;
    if (start == null || end == null) return;
    const dx = end - start;
    if (Math.abs(dx) > SWIPE_THRESHOLD) go(dx < 0 ? 1 : -1);
  };

  const counter =
    index !== null
      ? labels.counter.replace("{current}", String(index + 1)).replace("{total}", String(items.length))
      : "";

  return (
    <dialog
      ref={dialogRef}
      aria-label={labels.dialog}
      onClose={() => onIndexChange(null)}
      onKeyDown={onKeyDown}
      className="fixed inset-0 m-0 h-dvh max-h-none w-screen max-w-none bg-black/95 p-0 text-white backdrop:bg-black/80"
    >
      {item && (
        <div className="flex h-full flex-col">
          <div className="flex items-center justify-between px-4 py-3 md:px-6">
            <p className="text-sm tabular-nums text-white/70" aria-live="polite">
              {counter}
            </p>
            <button
              type="button"
              onClick={() => onIndexChange(null)}
              aria-label={labels.close}
              autoFocus
              className="-mr-2 flex size-11 items-center justify-center rounded-full text-white/90 hover:bg-white/10"
            >
              <Close className="size-6" />
            </button>
          </div>

          <div
            className="relative flex-1 touch-pan-y select-none"
            onTouchStart={onTouchStart}
            onTouchEnd={onTouchEnd}
          >
            <Image
              key={item.key}
              src={item.full}
              alt={item.alt}
              fill
              sizes="100vw"
              className="object-contain"
            />

            {items.length > 1 && (
              <>
                <button
                  type="button"
                  onClick={() => go(-1)}
                  aria-label={labels.previous}
                  className="absolute left-4 top-1/2 hidden size-12 -translate-y-1/2 items-center justify-center rounded-full bg-black/40 hover:bg-black/70 md:flex"
                >
                  <ChevronLeft className="size-6" />
                </button>
                <button
                  type="button"
                  onClick={() => go(1)}
                  aria-label={labels.next}
                  className="absolute right-4 top-1/2 hidden size-12 -translate-y-1/2 items-center justify-center rounded-full bg-black/40 hover:bg-black/70 md:flex"
                >
                  <ChevronRight className="size-6" />
                </button>
              </>
            )}
          </div>

          <div className="min-h-16 px-4 pb-[max(1rem,env(safe-area-inset-bottom))] pt-3 md:px-6">
            {item.tour ? (
              <div className="mx-auto flex max-w-3xl items-center justify-between gap-4 border-t border-white/15 pt-3">
                <p className="font-display text-lg leading-tight">{item.tour.title}</p>
                <Link
                  href={item.tour.href}
                  className="inline-flex shrink-0 items-center gap-2 rounded-full bg-sand-100 px-4 py-2.5 text-sm font-semibold text-forest-900 hover:bg-white"
                >
                  {labels.viewTour}
                  <ArrowRight className="size-4" />
                </Link>
              </div>
            ) : (
              item.alt && <p className="mx-auto max-w-3xl text-center text-sm text-white/70">{item.alt}</p>
            )}
          </div>
        </div>
      )}
    </dialog>
  );
}
