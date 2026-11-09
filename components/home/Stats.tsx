import { container, SectionHeading } from "@/components/ui";
import type { FactView } from "@/lib/facts";
import type { Dictionary, Locale } from "@/lib/i18n";
import { FactsGrid } from "./FactsGrid";

/**
 * "Bolivia en cifras": los datos curiosos del Studio (siteSettings.funFacts)
 * en una cuadrícula de 6 celdas que se van turnando. Sin datos, no hay sección.
 */
export function Stats({ lang, dict, facts }: { lang: Locale; dict: Dictionary; facts: FactView[] }) {
  if (facts.length === 0) return null;

  return (
    <section aria-label={dict.stats.eyebrow} className="tone-dark grain relative bg-navy-950 py-section">
      <div className={container}>
        <SectionHeading eyebrow={dict.stats.eyebrow} title={dict.stats.title} tone="light" />
        <div className="mt-14 md:mt-20">
          <FactsGrid facts={facts} lang={lang} />
        </div>
      </div>
    </section>
  );
}
