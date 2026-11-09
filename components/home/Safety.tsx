import { MaskReveal } from "@/components/motion/MaskReveal";
import { MountainDivider } from "@/components/MountainDivider";
import { SanityImage } from "@/components/SanityImage";
import { container, SectionHeading } from "@/components/ui";
import type { Dictionary, Locale } from "@/lib/i18n";
import { t } from "@/lib/sanity/locale";
import type { SiteSettings } from "@/lib/sanity/types";
import { featureItems, hasSafety } from "@/lib/sections";
import { SafetyRoute } from "./SafetyRoute";

/**
 * Seguridad y calidad (diferenciador principal). Escritorio: título fijo
 * (sticky) a la izquierda y los puntos como una ruta vertical a la derecha.
 * Móvil: apilado, con la ruta a la izquierda.
 */
export function Safety({ lang, dict, settings }: { lang: Locale; dict: Dictionary; settings: SiteSettings | null }) {
  if (!hasSafety(settings, lang)) return null;

  const section = settings?.safety;
  const title = t(section?.title, lang) ?? dict.sections.safety;
  const intro = t(section?.intro, lang);
  const items = featureItems(section?.items, lang);
  const image = section?.image?.asset ? section.image : null;

  return (
    <section id="seguridad" className="tone-dark grain relative bg-navy-950 pb-[calc(var(--spacing-section)+3rem)] pt-section">
      <div className={`${container} grid gap-16 lg:grid-cols-[minmax(0,5fr)_minmax(0,6fr)] lg:gap-24`}>
        <div>
          <div className="lg:sticky lg:top-28">
            <SectionHeading title={title} intro={intro} tone="light" />
            {image && (
              <MaskReveal curtain="bg-navy-950" className="mt-12 hidden aspect-[4/3] rounded-card lg:block">
                <SanityImage image={image} lang={lang} aspect={4 / 3} sizes="40vw" />
              </MaskReveal>
            )}
          </div>
        </div>
        {items.length > 0 && <SafetyRoute items={items} />}
      </div>
      <MountainDivider className="text-cream" flip />
    </section>
  );
}
