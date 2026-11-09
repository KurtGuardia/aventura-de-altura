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
  const image = section?.image?.asset ? section.image : null;

  const heading = (
    <h2 className="font-display text-4xl leading-[1.05] tracking-tight text-forest-950 md:text-5xl">{title}</h2>
  );
  const body = (
    <Paragraphs items={text} className="text-lg leading-relaxed text-stone-700 md:text-xl md:leading-relaxed" />
  );

  // Sin foto: solo texto, en un bloque compacto.
  if (!image) {
    return (
      <section id="nosotros" className="bg-sand-100 py-16 md:py-20">
        <div className={container}>
          <div className="max-w-3xl">
            {heading}
            <div className="mt-6">{body}</div>
          </div>
        </div>
      </section>
    );
  }

  // Con foto: apilada en móvil, dos columnas (foto + texto) en escritorio.
  return (
    <section id="nosotros" className={`bg-sand-100 ${sectionY}`}>
      <div className={`${container} grid items-center gap-10 md:grid-cols-2 md:gap-16`}>
        <div className="relative aspect-[4/5] overflow-hidden rounded-sm bg-sand-200">
          <SanityImage image={image} lang={lang} aspect={4 / 5} sizes="(min-width: 768px) 50vw, 100vw" />
        </div>
        <div>
          {heading}
          <div className="mt-6">{body}</div>
        </div>
      </div>
    </section>
  );
}
