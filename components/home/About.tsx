import { MaskReveal } from "@/components/motion/MaskReveal";
import { ParallaxImage } from "@/components/motion/ParallaxImage";
import { Reveal } from "@/components/motion/Reveal";
import { SanityImage } from "@/components/SanityImage";
import { TopoLines } from "@/components/TopoLines";
import { container, Eyebrow, Paragraphs, SectionHeading, Stars } from "@/components/ui";
import { fill, type Dictionary, type Locale } from "@/lib/i18n";
import { formatNumber } from "@/lib/price";
import { paragraphs, t } from "@/lib/sanity/locale";
import type { SiteSettings } from "@/lib/sanity/types";
import { hasAbout } from "@/lib/sections";
import { CompassBadge } from "./CompassBadge";

/** Separa la primera frase (entradilla grande) del resto del texto. */
function splitLead(text: string[]) {
  const [first = "", ...rest] = text;
  const [lead, ...others] = first.split(/(?<=[.!?])\s+/);
  const tail = others.join(" ");
  return { lead, rest: tail ? [tail, ...rest] : rest };
}

/**
 * Nosotros: textura de curvas de nivel, foto revelada por máscara con
 * parallax y un marco desplazado, sello-brújula que gira con el scroll,
 * coordenadas de Cochabamba, entradilla grande y la nota de Google.
 */
export function About({ lang, dict, settings }: { lang: Locale; dict: Dictionary; settings: SiteSettings | null }) {
  if (!hasAbout(settings, lang)) return null;

  const section = settings?.about;
  const title = t(section?.title, lang) ?? dict.sections.about;
  const { lead, rest } = splitLead(paragraphs(t(section?.text, lang)));
  const image = section?.image?.asset ? section.image : null;
  const rating = settings?.googleRating;
  const reviews = settings?.googleReviewCount;

  const ratingChip = rating ? (
    <p className="inline-flex flex-wrap items-center gap-x-3 gap-y-1 rounded-full bg-cream px-5 py-3 text-sm text-navy-950 ring-1 ring-navy-950/10">
      <Stars rating={rating} />
      <span className="font-mono font-medium">{formatNumber(rating, lang, 1)}</span>
      {reviews ? <span className="text-stone-600">{fill(dict.about.reviews, { count: reviews })}</span> : null}
    </p>
  ) : null;

  const copy = (
    <div>
      <Reveal>
        <Eyebrow className="mb-6 flex items-center gap-3 text-sand-700">
          <span aria-hidden="true" className="relative flex size-2.5">
            <span className="absolute inset-0 rounded-full bg-ember-500 motion-safe:animate-ping motion-safe:opacity-60" />
            <span className="relative size-2.5 rounded-full bg-ember-500" />
          </span>
          {dict.about.coordinates}
        </Eyebrow>
      </Reveal>
      <SectionHeading title={title} size="xl" />
      <Reveal delay={0.1}>
        <p className="mt-10 text-2xl font-medium leading-snug text-navy-950 text-pretty md:text-3xl md:leading-snug">
          {lead}
        </p>
      </Reveal>
      {rest.length > 0 && (
        <Reveal delay={0.2}>
          <Paragraphs items={rest} className="mt-6 max-w-xl text-lg leading-relaxed text-stone-700" />
        </Reveal>
      )}
      {ratingChip && (
        <Reveal delay={0.3} className="mt-10">
          {settings?.googleReviewsUrl ? (
            <a href={settings.googleReviewsUrl} target="_blank" rel="noopener noreferrer" className="inline-block rounded-full">
              {ratingChip}
            </a>
          ) : (
            ratingChip
          )}
        </Reveal>
      )}
    </div>
  );

  return (
    <section id="nosotros" className="grain relative isolate overflow-hidden bg-sand-100 py-section">
      <ParallaxImage strength={6} className="absolute inset-0 -z-10">
        <TopoLines className="text-sand-400/60" />
      </ParallaxImage>

      {image ? (
        <div className={`${container} grid items-center gap-16 md:grid-cols-12 md:gap-10`}>
          <div className="relative mx-auto w-full max-w-md md:col-span-6 md:max-w-none lg:col-span-5">
            {/* Marco desplazado, como una foto apoyada sobre otra. */}
            <Reveal delay={0.4} y={0} className="absolute inset-0 translate-x-4 translate-y-4 md:translate-x-6 md:translate-y-6">
              <span aria-hidden="true" className="absolute inset-0 rounded-card border border-sand-500/70" />
            </Reveal>
            <MaskReveal curtain="bg-sand-100" className="aspect-[4/5] rounded-card shadow-card">
              <ParallaxImage strength={8} className="absolute inset-0">
                <SanityImage image={image} lang={lang} aspect={4 / 5} sizes="(min-width: 768px) 45vw, 100vw" />
              </ParallaxImage>
            </MaskReveal>
            <CompassBadge
              text={dict.about.badge}
              className="absolute -bottom-12 -right-3 z-10 size-32 md:-right-12 md:size-40"
            />
          </div>
          <div className="md:col-span-6 lg:col-span-6 lg:col-start-7">{copy}</div>
        </div>
      ) : (
        <div className={`${container} relative`}>
          <CompassBadge text={dict.about.badge} className="relative mb-12 size-28 md:absolute md:right-gutter md:top-0 md:mb-0 md:size-40" />
          <div className="max-w-4xl">{copy}</div>
        </div>
      )}
    </section>
  );
}
