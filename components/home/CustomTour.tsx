import { WhatsApp } from "@/components/icons";
import { SanityImage } from "@/components/SanityImage";
import { button, container, Paragraphs, sectionY } from "@/components/ui";
import type { Dictionary, Locale } from "@/lib/i18n";
import { paragraphs, t } from "@/lib/sanity/locale";
import type { SiteSettings } from "@/lib/sanity/types";
import { hasCustomTour } from "@/lib/sections";
import { whatsappHref } from "@/lib/site";

export function CustomTour({ lang, dict, settings }: { lang: Locale; dict: Dictionary; settings: SiteSettings | null }) {
  const href = whatsappHref(settings?.whatsappPrimary, dict.whatsapp.customTour);
  if (!hasCustomTour(settings, lang) || !href) return null;

  const section = settings?.customTour;
  const title = t(section?.title, lang) ?? dict.sections.customTour;
  const text = paragraphs(t(section?.text, lang));
  const label = t(section?.buttonLabel, lang) ?? dict.buttons.customTour;
  const hasImage = !!section?.image?.asset;

  return (
    <section id="a-medida" className={`bg-white ${sectionY}`}>
      <div className={`${container} grid items-center gap-10 md:gap-16 ${hasImage ? "md:grid-cols-2" : ""}`}>
        {hasImage && (
          <div className="relative aspect-[4/5] overflow-hidden rounded-sm bg-sand-200 md:order-2">
            <SanityImage image={section?.image} lang={lang} aspect={4 / 5} sizes="(min-width: 768px) 50vw, 100vw" />
          </div>
        )}
        <div className={hasImage ? "" : "max-w-2xl"}>
          <h2 className="font-display text-4xl leading-[1.05] tracking-tight text-balance text-forest-950 md:text-5xl">
            {title}
          </h2>
          {text.length > 0 && <Paragraphs items={text} className="mt-6 text-lg leading-relaxed text-stone-600" />}
          <a
            href={href}
            target="_blank"
            rel="noopener noreferrer"
            className={`${button.base} ${button.primary} mt-9`}
          >
            <WhatsApp className="size-5" />
            {label}
          </a>
        </div>
      </div>
    </section>
  );
}
