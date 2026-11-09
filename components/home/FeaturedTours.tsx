import { ToursShowcase } from "@/components/tours/ToursShowcase";
import { TourCard } from "@/components/tours/TourCard";
import { SectionHeading } from "@/components/ui";
import type { Dictionary, Locale } from "@/lib/i18n";
import type { TourCard as TourCardType } from "@/lib/sanity/types";
import { toTourCardView, type TourCardView } from "@/lib/tours";

type Props = {
  lang: Locale;
  dict: Dictionary;
  tours: TourCardType[];
  exchangeRate?: number | null;
};

export function FeaturedTours({ lang, dict, tours, exchangeRate }: Props) {
  const views = tours
    .map((tour) => toTourCardView(tour, lang, dict, exchangeRate))
    .filter((view): view is TourCardView => !!view);
  if (views.length === 0) return null;

  return (
    <ToursShowcase
      heading={<SectionHeading title={dict.sections.tours} size="lg" />}
      labels={dict.tours}
      cards={views.map((tour) => ({
        key: tour.id,
        node: <TourCard tour={tour} lang={lang} sizes="(min-width: 1024px) 30vw, (min-width: 768px) 44vw, 85vw" />,
      }))}
    />
  );
}
