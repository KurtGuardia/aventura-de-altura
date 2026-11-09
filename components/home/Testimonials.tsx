import { AnimatedStars } from "@/components/AnimatedStars";
import { ArrowRight } from "@/components/icons";
import { CountUp } from "@/components/motion/CountUp";
import { Reveal } from "@/components/motion/Reveal";
import { button, container, SectionHeading } from "@/components/ui";
import { fill, type Dictionary, type Locale } from "@/lib/i18n";
import { formatNumber } from "@/lib/price";
import { t } from "@/lib/sanity/locale";
import type { SiteSettings, Testimonial } from "@/lib/sanity/types";
import { TestimonialsCarousel } from "./TestimonialsCarousel";

type Props = {
  lang: Locale;
  dict: Dictionary;
  settings: SiteSettings | null;
  testimonials: Testimonial[];
};

type Item = Testimonial & { body: string };

/**
 * Testimonios: sello de Google (calificación, estrellas, nº de reseñas y
 * enlace) y reseñas curadas a mano. Con más de una, carrusel en fade con
 * autoplay; con una sola, tarjeta estática sin controles.
 */
export function Testimonials({ lang, dict, settings, testimonials }: Props) {
  const items = testimonials
    .map((item) => ({ ...item, body: t(item.text, lang) }))
    .filter((item): item is Item => !!item.body);
  const rating = settings?.googleRating;
  const count = settings?.googleReviewCount;
  const googleUrl = settings?.googleReviewsUrl;
  if (items.length === 0 && !rating) return null;

  const ratingText = rating ? formatNumber(rating, lang, 1) : null;

  return (
    <section id="testimonios" className="overflow-hidden bg-white py-section">
      <div className={container}>
        <div className="flex flex-col gap-10 lg:flex-row lg:items-end lg:justify-between">
          <SectionHeading title={dict.sections.testimonials} />

          {(rating || googleUrl) && (
            <Reveal delay={0.1} className="flex flex-wrap items-center gap-x-8 gap-y-5">
              {rating && ratingText && (
                <div className="flex items-center gap-4">
                  <span className="font-display text-7xl leading-none text-navy-950">
                    <CountUp value={rating} decimals={1} lang={lang} duration={1.6} />
                  </span>
                  <div>
                    <span className="sr-only">{fill(dict.labels.ratingOutOf5, { rating: ratingText })}</span>
                    <AnimatedStars rating={rating} />
                    {count != null && count > 0 && (
                      <p className="label-mono mt-2 text-stone-600">
                        {fill(dict.labels.reviewsOnGoogle, { count: formatNumber(count, lang) })}
                      </p>
                    )}
                  </div>
                </div>
              )}
              {googleUrl && (
                <a href={googleUrl} target="_blank" rel="noopener noreferrer" className={`${button.base} ${button.outline}`}>
                  {dict.buttons.viewAllGoogle}
                  <ArrowRight className="size-4" />
                </a>
              )}
            </Reveal>
          )}
        </div>

        {items.length === 1 && (
          <Reveal className="mt-16 md:mt-20">
            <TestimonialCard item={items[0]} dict={dict} />
          </Reveal>
        )}
        {items.length > 1 && (
          <Reveal className="mt-16 md:mt-20">
            <TestimonialsCarousel
              labels={dict.testimonials}
              slides={items.map((item) => ({ key: item._id, node: <TestimonialCard item={item} dict={dict} /> }))}
            />
          </Reveal>
        )}
      </div>
    </section>
  );
}

function TestimonialCard({ item, dict }: { item: Item; dict: Dictionary }) {
  return (
    <figure className="relative max-w-5xl pl-0 md:pl-28">
      <span
        aria-hidden="true"
        className="pointer-events-none absolute -top-10 left-0 font-display text-[9rem] leading-none text-ember-400/60 md:-top-6 md:text-[12rem]"
      >
        “
      </span>
      <div className="relative pt-14 md:pt-0">
        {item.rating != null && (
          <>
            <span className="sr-only">{fill(dict.labels.ratingOutOf5, { rating: item.rating })}</span>
            <AnimatedStars rating={item.rating} className="size-4" />
          </>
        )}
        <blockquote className="mt-6 text-[clamp(1.35rem,2.4vw,2.1rem)] font-medium leading-snug text-navy-950 text-pretty">
          <p>{item.body}</p>
        </blockquote>
        <figcaption className="mt-8 flex flex-wrap items-center gap-x-6 gap-y-3 border-t border-navy-950/10 pt-6">
          <div>
            <p className="font-semibold text-navy-950">{item.name}</p>
            {item.country && <p className="label-mono mt-1 text-stone-500">{item.country}</p>}
          </div>
          {item.sourceUrl && (
            <a
              href={item.sourceUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="ml-auto inline-flex items-center gap-1.5 text-sm font-semibold text-forest-700 underline-offset-4 hover:underline"
            >
              {dict.buttons.readReview}
              <ArrowRight className="size-4" />
            </a>
          )}
        </figcaption>
      </div>
    </figure>
  );
}
