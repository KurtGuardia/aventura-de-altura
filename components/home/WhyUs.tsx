import { container, SectionHeading, sectionY } from "@/components/ui";
import type { Dictionary, Locale } from "@/lib/i18n";
import { t } from "@/lib/sanity/locale";
import type { SiteSettings } from "@/lib/sanity/types";
import { featureItems, hasWhyUs } from "@/lib/sections";

export function WhyUs({ lang, dict, settings }: { lang: Locale; dict: Dictionary; settings: SiteSettings | null }) {
  if (!hasWhyUs(settings, lang)) return null;

  const title = t(settings?.whyUs?.title, lang) ?? dict.sections.whyUs;
  const items = featureItems(settings?.whyUs?.items, lang);

  return (
    <section id="por-que-elegirnos" className={`bg-white ${sectionY}`}>
      <div className={container}>
        <SectionHeading title={title} />
        <ol className="mt-12 grid gap-px overflow-hidden rounded-sm bg-stone-200 sm:grid-cols-2 lg:grid-cols-3">
          {items.map((item, i) => (
            <li key={item.key} className="bg-white p-7 md:p-9">
              <span className="font-display text-4xl text-sand-500" aria-hidden="true">
                {String(i + 1).padStart(2, "0")}
              </span>
              <h3 className="mt-4 font-display text-xl leading-snug text-forest-950">{item.title}</h3>
              {item.text && <p className="mt-2 leading-relaxed text-stone-600">{item.text}</p>}
            </li>
          ))}
        </ol>
      </div>
    </section>
  );
}
