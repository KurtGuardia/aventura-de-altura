import { Compass, FirstAid, Mountain, Shield } from "@/components/icons";
import { SanityImage } from "@/components/SanityImage";
import { container, SectionHeading, sectionY } from "@/components/ui";
import type { Dictionary, Locale } from "@/lib/i18n";
import { t } from "@/lib/sanity/locale";
import type { SiteSettings } from "@/lib/sanity/types";
import { featureItems, hasSafety } from "@/lib/sections";

// Los puntos no tienen ícono propio en Sanity: se asignan por posición.
const ICONS = [Shield, FirstAid, Mountain, Compass];

export function Safety({ lang, dict, settings }: { lang: Locale; dict: Dictionary; settings: SiteSettings | null }) {
  if (!hasSafety(settings, lang)) return null;

  const section = settings?.safety;
  const title = t(section?.title, lang) ?? dict.sections.safety;
  const intro = t(section?.intro, lang);
  const items = featureItems(section?.items, lang);
  const hasImage = !!section?.image?.asset;

  return (
    <section id="seguridad" className={`bg-navy-950 text-white ${sectionY}`}>
      <div className={container}>
        <div className={`grid gap-12 ${hasImage ? "lg:grid-cols-[1fr_1.1fr] lg:items-center lg:gap-20" : ""}`}>
          <div>
            <SectionHeading title={title} intro={intro} tone="light" />
            {items.length > 0 && (
              <ul className="mt-12 grid gap-x-10 gap-y-10 sm:grid-cols-2">
                {items.map((item, i) => {
                  const Icon = ICONS[i % ICONS.length];
                  return (
                    <li key={item.key}>
                      <span className="flex size-12 items-center justify-center rounded-full bg-white/8 text-sand-200 ring-1 ring-white/15">
                        <Icon className="size-6" />
                      </span>
                      <h3 className="mt-5 font-display text-xl leading-snug">{item.title}</h3>
                      {item.text && <p className="mt-2 leading-relaxed text-white/70">{item.text}</p>}
                    </li>
                  );
                })}
              </ul>
            )}
          </div>
          {hasImage && (
            <div className="relative aspect-[4/5] overflow-hidden rounded-sm">
              <SanityImage image={section?.image} lang={lang} aspect={4 / 5} sizes="(min-width: 1024px) 50vw, 100vw" />
            </div>
          )}
        </div>
      </div>
    </section>
  );
}
