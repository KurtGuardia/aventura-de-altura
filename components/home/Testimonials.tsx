import { ArrowRight } from "@/components/icons";
import { button, container, SectionHeading, sectionY, Stars } from "@/components/ui";
import { fill, type Dictionary, type Locale } from "@/lib/i18n";
import { formatNumber } from "@/lib/price";
import { t } from "@/lib/sanity/locale";
import type { SiteSettings, Testimonial } from "@/lib/sanity/types";

type Props = {
  lang: Locale;
  dict: Dictionary;
  settings: SiteSettings | null;
  testimonials: Testimonial[];
};

export function Testimonials({ lang, dict, settings, testimonials }: Props) {
  const items = testimonials
    .map((item) => ({ ...item, body: t(item.text, lang) }))
    .filter((item) => item.body);
  const rating = settings?.googleRating;
  const count = settings?.googleReviewCount;
  const googleUrl = settings?.googleReviewsUrl;
  if (items.length === 0 && !rating) return null;

  const ratingText = rating ? rating.toLocaleString(lang === "es" ? "es-BO" : "en-US", { minimumFractionDigits: 1 }) : null;

  return (
    <section id="testimonios" className={`overflow-hidden bg-white ${sectionY}`}>
      <div className={container}>
        <div className="flex flex-col gap-8 md:flex-row md:items-end md:justify-between">
          <SectionHeading title={dict.sections.testimonials} />

          {(rating || googleUrl) && (
            <div className="flex flex-wrap items-center gap-x-6 gap-y-4">
              {ratingText && rating && (
                <div className="flex items-center gap-3">
                  <span className="font-display text-5xl leading-none text-forest-950">{ratingText}</span>
                  <div>
                    <span className="sr-only">{fill(dict.labels.ratingOutOf5, { rating: ratingText })}</span>
                    <Stars rating={rating} />
                    {count != null && count > 0 && (
                      <p className="mt-1 text-sm text-stone-600">
                        {fill(dict.labels.reviewsOnGoogle, { count: formatNumber(count, lang) })}
                      </p>
                    )}
                  </div>
                </div>
              )}
              {googleUrl && (
                <a
                  href={googleUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className={`${button.base} ${button.outline} text-forest-900`}
                >
                  {dict.buttons.viewAllGoogle}
                  <ArrowRight className="size-4" />
                </a>
              )}
            </div>
          )}
        </div>

        {items.length > 0 && (
          // Móvil: carrusel deslizable con scroll-snap (sin JS). Escritorio: cuadrícula.
          <ul className="no-scrollbar -mx-5 mt-12 flex snap-x snap-mandatory gap-4 overflow-x-auto scroll-px-5 px-5 pb-2 md:mx-0 md:grid md:grid-cols-2 md:gap-6 md:overflow-visible md:px-0 lg:grid-cols-3">
            {items.map((item) => (
              <li
                key={item._id}
                className="flex w-[85%] shrink-0 snap-start flex-col rounded-sm bg-sand-50 p-7 ring-1 ring-stone-900/5 md:w-auto"
              >
                {item.rating != null && (
                  <>
                    <span className="sr-only">{fill(dict.labels.ratingOutOf5, { rating: item.rating })}</span>
                    <Stars rating={item.rating} />
                  </>
                )}
                <blockquote className="mt-5 flex-1 text-[1.05rem] leading-relaxed text-stone-700">
                  <p>“{item.body}”</p>
                </blockquote>
                <footer className="mt-6 flex items-end justify-between gap-4 border-t border-stone-900/10 pt-5">
                  <div>
                    <p className="font-semibold text-forest-950">{item.name}</p>
                    {item.country && <p className="text-sm text-stone-500">{item.country}</p>}
                  </div>
                  {item.sourceUrl && (
                    <a
                      href={item.sourceUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-sm font-medium text-forest-700 underline-offset-4 hover:underline"
                    >
                      {dict.buttons.readReview}
                    </a>
                  )}
                </footer>
              </li>
            ))}
          </ul>
        )}
      </div>
    </section>
  );
}
