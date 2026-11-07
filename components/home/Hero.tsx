import { ArrowRight } from "@/components/icons";
import { SanityImage } from "@/components/SanityImage";
import { button, container } from "@/components/ui";
import type { Dictionary, Locale } from "@/lib/i18n";
import { t } from "@/lib/sanity/locale";
import type { SiteSettings } from "@/lib/sanity/types";

export function Hero({
  lang,
  dict,
  settings,
  hasTours,
}: {
  lang: Locale;
  dict: Dictionary;
  settings: SiteSettings | null;
  hasTours: boolean;
}) {
  const title = t(settings?.heroTitle, lang);
  const subtitle = t(settings?.heroSubtitle, lang);
  const cta = t(settings?.heroCtaLabel, lang) ?? dict.buttons.viewTours;
  if (!title) return null;

  return (
    <section
      id="inicio"
      className="relative isolate flex min-h-[calc(100svh-4rem)] items-end overflow-hidden bg-forest-900"
    >
      <SanityImage
        image={settings?.heroImage}
        lang={lang}
        sizes="100vw"
        priority
        className="-z-10"
      />
      {/* Degradado para que el texto se lea sobre cualquier foto. */}
      <div
        aria-hidden="true"
        className="absolute inset-0 -z-10 bg-gradient-to-t from-forest-950/90 via-forest-950/35 to-forest-950/10"
      />

      <div className={`${container} pb-16 pt-32 md:pb-24`}>
        <h1 className="max-w-4xl font-display text-[2.85rem] font-medium leading-[0.98] tracking-tight text-balance text-white sm:text-6xl md:text-7xl lg:text-8xl">
          {title}
        </h1>
        {subtitle && (
          <p className="mt-6 max-w-xl text-lg leading-relaxed text-white/85 md:text-xl">{subtitle}</p>
        )}
        {hasTours && (
          <a href="#tours" className={`${button.base} ${button.light} mt-10`}>
            {cta}
            <ArrowRight className="size-4" />
          </a>
        )}
      </div>
    </section>
  );
}
