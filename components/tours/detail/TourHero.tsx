import Link from "next/link";
import { ViewTransition } from "react";
import { WhatsApp } from "@/components/icons";
import { MagneticButton } from "@/components/motion/MagneticButton";
import { ParallaxImage } from "@/components/motion/ParallaxImage";
import { Reveal } from "@/components/motion/Reveal";
import { SplitText } from "@/components/motion/SplitText";
import { MountainDivider } from "@/components/MountainDivider";
import { SanityImage } from "@/components/SanityImage";
import { button, container } from "@/components/ui";
import type { Dictionary, Locale } from "@/lib/i18n";
import type { TourDetailView } from "@/lib/tour-detail";
import { tourImageTransitionName } from "@/lib/tours";
import { BookingWhatsAppLink } from "./TourBooking";

/** Id del hero: la barra móvil aparece cuando sale de pantalla. */
export const TOUR_HERO_ID = "portada";

/**
 * Portada del tour (~85svh): foto en parallax con la misma View Transition
 * que la tarjeta (la foto de la tarjeta se expande hasta aquí), migas de pan,
 * categorías, nombre gigante, frase, CTA de WhatsApp y precio "desde".
 *
 * La portada se renderiza en el mismo commit que la navegación (los enlaces
 * de <TourCard> precargan la página completa), condición para el morph.
 */
export function TourHero({ tour, lang, dict }: { tour: TourDetailView; lang: Locale; dict: Dictionary }) {
  return (
    <section
      id={TOUR_HERO_ID}
      className="tone-dark grain relative isolate flex min-h-[85svh] flex-col overflow-hidden bg-navy-950"
    >
      {tour.cover && (
        <ViewTransition name={tourImageTransitionName(tour.slug)} share="tour-morph" default="none">
          <ParallaxImage strength={8} className="absolute inset-0 -z-10">
            <SanityImage image={tour.cover} lang={lang} sizes="100vw" priority fallbackAlt={tour.title} />
          </ParallaxImage>
        </ViewTransition>
      )}
      {/* Degradado: contraste AA del texto sobre cualquier foto. */}
      <div
        aria-hidden="true"
        className="absolute inset-0 -z-10 bg-[linear-gradient(to_top,rgb(7_14_25/0.94)_0%,rgb(7_14_25/0.6)_42%,rgb(7_14_25/0.2)_72%,rgb(7_14_25/0.55)_100%)]"
      />

      <div className={`${container} flex flex-1 flex-col pb-[clamp(6rem,11vw,9rem)] pt-24 md:pt-28`}>
        <nav aria-label={dict.nav.breadcrumb}>
          <ol className="label-mono flex flex-wrap items-center gap-x-2 gap-y-1 text-white/70">
            <li>
              <Link href={`/${lang}`} className="py-2 transition-colors hover:text-white">
                {dict.nav.home}
              </Link>
            </li>
            <li aria-hidden="true">/</li>
            <li>
              <Link href={`/${lang}#tours`} className="py-2 transition-colors hover:text-white">
                {dict.nav.tours}
              </Link>
            </li>
            <li aria-hidden="true">/</li>
            <li aria-current="page" className="text-ember-300">
              {tour.title}
            </li>
          </ol>
        </nav>

        <div className="mt-auto pt-16">
          {tour.categories.length > 0 && (
            <Reveal>
              <ul className="mb-6 flex flex-wrap gap-2">
                {tour.categories.map((c) => (
                  <li key={c} className="label-mono rounded-full border border-white/35 bg-navy-950/40 px-3 py-1.5 backdrop-blur-sm">
                    {c}
                  </li>
                ))}
              </ul>
            </Reveal>
          )}

          <SplitText
            as="h1"
            trigger="mount"
            delay={0.15}
            text={tour.title}
            className="max-w-[14ch] font-display text-display-xl uppercase tracking-display text-balance"
          />

          {tour.tagline && (
            <Reveal delay={0.5}>
              <p className="mt-6 max-w-xl text-lg leading-relaxed text-white/85 md:text-xl">{tour.tagline}</p>
            </Reveal>
          )}

          <Reveal delay={0.65} className="mt-10 flex flex-wrap items-center gap-x-8 gap-y-5">
            <MagneticButton>
              <BookingWhatsAppLink className={`${button.base} ${button.large} ${button.accent}`}>
                <WhatsApp className="size-5" />
                {dict.buttons.checkAvailability}
              </BookingWhatsAppLink>
            </MagneticButton>
            {tour.fromPrice && (
              <p className="font-mono text-sm uppercase tracking-wider">
                <span className="text-ember-300">{tour.fromPrice.usd}</span>
                {tour.fromPrice.bs && <span className="ml-2 text-white/65">{tour.fromPrice.bs}</span>}
              </p>
            )}
          </Reveal>
        </div>
      </div>
      <MountainDivider className="text-cream" />
    </section>
  );
}
