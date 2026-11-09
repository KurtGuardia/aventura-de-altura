import Link from "next/link";
import { ViewTransition } from "react";
import { ArrowRight } from "@/components/icons";
import { SanityImage } from "@/components/SanityImage";
import type { Locale } from "@/lib/i18n";
import { tourImageTransitionName, type TourCardView } from "@/lib/tours";

/**
 * Tarjeta de tour reutilizable (home y "Otros tours" del detalle). Formato
 * alto 3:4, foto a sangre con zoom-out en hover, categorías arriba y nombre,
 * duración y precio abajo. En escritorio, la frase gancho y la flecha suben al
 * pasar el ratón; en táctil están siempre visibles. Toda la tarjeta es un enlace.
 *
 * La foto lleva una View Transition con nombre único por slug: al abrir el
 * detalle se expande hacia su portada (si el navegador lo soporta).
 *
 * `prefetch`: con Partial Prefetching, un enlace normal solo precarga el App
 * Shell de la ruta, y el contenido del tour (que depende del slug) llegaría
 * después, detrás del Suspense: sin morph. La precarga por enlace trae la
 * página del tour (estática, servida desde caché) antes del clic.
 */
export function TourCard({ tour, lang, sizes }: { tour: TourCardView; lang: Locale; sizes: string }) {
  return (
    <Link
      href={tour.href}
      prefetch
      className="zoom-trigger group relative block aspect-[3/4] overflow-hidden rounded-card bg-navy-900 text-white shadow-card"
    >
      <ViewTransition name={tourImageTransitionName(tour.slug)} share="tour-morph" default="none">
        <div className="absolute inset-0">
          <SanityImage image={tour.image} lang={lang} aspect={3 / 4} sizes={sizes} fallbackAlt={tour.title} zoom />
        </div>
      </ViewTransition>

      {/* Degradados: legibilidad de las etiquetas (arriba) y del texto (abajo). */}
      <div
        aria-hidden="true"
        className="absolute inset-0 bg-[linear-gradient(to_bottom,rgb(7_14_25/0.45)_0%,transparent_22%,transparent_40%,rgb(7_14_25/0.9)_100%)]"
      />

      {tour.categories.length > 0 && (
        <ul className="absolute left-5 right-5 top-5 flex flex-wrap gap-2">
          {tour.categories.map((c) => (
            <li
              key={c}
              className="label-mono rounded-full border border-white/35 bg-navy-950/40 px-3 py-1.5 backdrop-blur-sm"
            >
              {c}
            </li>
          ))}
        </ul>
      )}

      <div className="absolute inset-x-0 bottom-0 p-6 md:p-7">
        {/* En escritorio el bloque baja la altura de la frase y sube en hover. */}
        <div className="transition-transform duration-700 ease-cinematic can-hover:translate-y-[5.5rem] can-hover:group-hover:translate-y-0 can-hover:group-focus-visible:translate-y-0">
          <h3 className="font-display text-display-md uppercase tracking-display text-balance">{tour.title}</h3>
          {(tour.duration || tour.price) && (
            <p className="mt-3 flex flex-wrap gap-x-3 gap-y-1 font-mono text-[0.8rem] uppercase tracking-wider text-white/85">
              {tour.duration && <span>{tour.duration}</span>}
              {tour.duration && tour.price && <span aria-hidden="true">·</span>}
              {tour.price && (
                <span>
                  <span className="text-ember-300">{tour.price.usd}</span>
                  {tour.price.bs && <span className="ml-1.5 text-white/60">{tour.price.bs}</span>}
                </span>
              )}
            </p>
          )}
          <div className="mt-4 flex h-[4.5rem] items-start justify-between gap-4 transition-opacity duration-500 ease-cinematic can-hover:opacity-0 can-hover:group-hover:opacity-100 can-hover:group-focus-visible:opacity-100">
            {tour.tagline && <p className="line-clamp-3 text-sm leading-6 text-white/85">{tour.tagline}</p>}
            <span
              aria-hidden="true"
              className="ml-auto flex size-11 shrink-0 items-center justify-center rounded-full bg-ember-400 text-navy-950"
            >
              <ArrowRight className="size-5" />
            </span>
          </div>
        </div>
      </div>
    </Link>
  );
}
