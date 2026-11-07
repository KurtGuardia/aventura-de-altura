import Link from "next/link";
import { ArrowRight, Clock } from "@/components/icons";
import { SanityImage } from "@/components/SanityImage";
import { container, SectionHeading, sectionY } from "@/components/ui";
import type { Dictionary, Locale } from "@/lib/i18n";
import { durationLabel, fromPriceLabel } from "@/lib/price";
import { t } from "@/lib/sanity/locale";
import type { TourCard as TourCardType } from "@/lib/sanity/types";

type Props = {
  lang: Locale;
  dict: Dictionary;
  tours: TourCardType[];
  exchangeRate?: number | null;
};

export function FeaturedTours({ lang, dict, tours, exchangeRate }: Props) {
  if (tours.length === 0) return null;

  return (
    <section id="tours" className={`bg-sand-50 ${sectionY}`}>
      <div className={container}>
        <SectionHeading title={dict.sections.tours} />
        <ul className="mt-12 grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {tours.map((tour) => (
            <li key={tour._id}>
              <TourCard tour={tour} lang={lang} dict={dict} exchangeRate={exchangeRate} />
            </li>
          ))}
        </ul>
      </div>
    </section>
  );
}

function TourCard({
  tour,
  lang,
  dict,
  exchangeRate,
}: {
  tour: TourCardType;
  lang: Locale;
  dict: Dictionary;
  exchangeRate?: number | null;
}) {
  const title = t(tour.title, lang);
  if (!title) return null;
  const tagline = t(tour.tagline, lang);
  const categories = (tour.categories ?? []).map((c) => t(c, lang)).filter(Boolean) as string[];
  const duration = durationLabel(tour.options, dict);
  const price = fromPriceLabel(tour.options, lang, dict, exchangeRate);

  return (
    <Link
      href={`/${lang}/tours/${tour.slug}`}
      className="group flex h-full flex-col overflow-hidden rounded-sm bg-white shadow-[0_1px_0_rgba(0,0,0,0.04)] ring-1 ring-stone-900/5 transition-shadow hover:shadow-xl hover:shadow-forest-950/10 focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-forest-800"
    >
      <div className="relative aspect-[4/3] overflow-hidden bg-sand-200">
        <SanityImage
          image={tour.coverImage}
          lang={lang}
          aspect={4 / 3}
          sizes="(min-width: 1024px) 33vw, (min-width: 768px) 50vw, 100vw"
          fallbackAlt={title}
          className="transition-transform duration-700 ease-out group-hover:scale-[1.04]"
        />
        {categories.length > 0 && (
          <ul className="absolute left-3 top-3 flex flex-wrap gap-1.5">
            {categories.map((c) => (
              <li
                key={c}
                className="rounded-full bg-white/95 px-3 py-1 text-[0.7rem] font-semibold uppercase tracking-[0.12em] text-forest-900"
              >
                {c}
              </li>
            ))}
          </ul>
        )}
      </div>

      <div className="flex flex-1 flex-col p-6">
        <h3 className="font-display text-2xl leading-tight tracking-tight text-forest-950">{title}</h3>
        {tagline && <p className="mt-2 text-[0.95rem] leading-relaxed text-stone-600">{tagline}</p>}

        <div className="mt-auto flex items-end justify-between gap-4 pt-6">
          <div className="text-sm">
            {duration && (
              <p className="flex items-center gap-1.5 text-stone-600">
                <Clock className="size-4" />
                {duration}
              </p>
            )}
            {price && (
              <p className="mt-1 font-semibold text-forest-900">
                {price.usd}
                {price.bs && <span className="ml-1 font-normal text-stone-500">{price.bs}</span>}
              </p>
            )}
          </div>
          <span
            aria-hidden="true"
            className="flex size-10 shrink-0 items-center justify-center rounded-full border border-forest-900/15 text-forest-900 transition-colors group-hover:bg-forest-900 group-hover:text-white"
          >
            <ArrowRight className="size-4" />
          </span>
        </div>
      </div>
    </Link>
  );
}
