import { container, SectionHeading } from "@/components/ui";
import type { Dictionary, Locale } from "@/lib/i18n";
import { t } from "@/lib/sanity/locale";
import type { SiteSettings } from "@/lib/sanity/types";
import { featureItems, hasWhyUs } from "@/lib/sections";
import { WhyUsCarousel } from "./WhyUsCarousel";

/** Por qué elegirnos: razones del Studio en un carrusel automático. */
export function WhyUs({ lang, dict, settings }: { lang: Locale; dict: Dictionary; settings: SiteSettings | null }) {
  if (!hasWhyUs(settings, lang)) return null;

  const title = t(settings?.whyUs?.title, lang) ?? dict.sections.whyUs;
  const items = featureItems(settings?.whyUs?.items, lang);

  return (
    <section id="por-que-elegirnos" className="overflow-hidden bg-cream py-section">
      <div className={container}>
        <SectionHeading title={title} />
        <div className="mt-14 md:mt-20">
          <WhyUsCarousel items={items} labels={dict.whyUs} />
        </div>
      </div>
    </section>
  );
}
