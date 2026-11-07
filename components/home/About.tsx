import { SanityImage } from "@/components/SanityImage";
import { container, Paragraphs, sectionY } from "@/components/ui";
import type { Dictionary, Locale } from "@/lib/i18n";
import { paragraphs, t } from "@/lib/sanity/locale";
import type { SiteSettings } from "@/lib/sanity/types";
import { hasAbout } from "@/lib/sections";

export function About({ lang, dict, settings }: { lang: Locale; dict: Dictionary; settings: SiteSettings | null }) {
  if (!hasAbout(settings, lang)) return null;

  const section = settings?.about;
  const title = t(section?.title, lang) ?? dict.sections.about;
  const text = paragraphs(t(section?.text, lang));
  const images = (section?.images ?? []).filter((img) => img.asset).slice(0, 3);

  return (
    <section id="nosotros" className={`bg-sand-100 ${sectionY}`}>
      <div className={`${container} grid gap-10 md:grid-cols-[0.8fr_1.2fr] md:gap-16`}>
        <h2 className="font-display text-4xl leading-[1.05] tracking-tight text-forest-950 md:text-5xl">{title}</h2>
        <div>
          <Paragraphs items={text} className="text-lg leading-relaxed text-stone-700 md:text-xl md:leading-relaxed" />
          {images.length > 0 && (
            <ul className="mt-10 grid grid-cols-2 gap-3 sm:grid-cols-3">
              {images.map((image, i) => (
                <li
                  key={image._key}
                  className={`relative aspect-[4/5] overflow-hidden rounded-sm bg-sand-200 ${i === 2 ? "hidden sm:block" : ""}`}
                >
                  <SanityImage image={image} lang={lang} aspect={4 / 5} sizes="(min-width: 768px) 20vw, 50vw" />
                </li>
              ))}
            </ul>
          )}
        </div>
      </div>
    </section>
  );
}
