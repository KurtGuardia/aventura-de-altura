import { WhatsApp } from "@/components/icons";
import { MagneticButton } from "@/components/motion/MagneticButton";
import { ParallaxImage } from "@/components/motion/ParallaxImage";
import { Reveal } from "@/components/motion/Reveal";
import { SanityImage } from "@/components/SanityImage";
import { button, container, Paragraphs, SectionHeading } from "@/components/ui";
import type { Dictionary, Locale } from "@/lib/i18n";
import { paragraphs, t } from "@/lib/sanity/locale";
import type { SiteSettings } from "@/lib/sanity/types";
import { hasCustomTour } from "@/lib/sections";
import { whatsappHref } from "@/lib/site";

/** Tour personalizado: banner a pantalla completa con foto en parallax y CTA a WhatsApp. */
export function CustomTour({ lang, dict, settings }: { lang: Locale; dict: Dictionary; settings: SiteSettings | null }) {
  const href = whatsappHref(settings?.whatsappPrimary, dict.whatsapp.customTour);
  if (!hasCustomTour(settings, lang) || !href) return null;

  const section = settings?.customTour;
  const title = t(section?.title, lang) ?? dict.sections.customTour;
  const text = paragraphs(t(section?.text, lang));
  const label = t(section?.buttonLabel, lang) ?? dict.buttons.customTour;
  const image = section?.image?.asset ? section.image : null;

  return (
    <section
      id="a-medida"
      className="tone-dark grain relative isolate flex min-h-[90svh] items-center overflow-hidden bg-forest-950 py-section"
    >
      {image && (
        <ParallaxImage strength={14} className="absolute inset-0 -z-10">
          <SanityImage image={image} lang={lang} sizes="100vw" />
        </ParallaxImage>
      )}
      <div
        aria-hidden="true"
        className="absolute inset-0 -z-10 bg-[linear-gradient(100deg,rgb(14_28_21/0.92)_0%,rgb(14_28_21/0.7)_45%,rgb(14_28_21/0.25)_100%)]"
      />

      <div className={container}>
        <SectionHeading
          title={title}
          tone="light"
          size="xl"
          intro={text.length > 0 ? <Paragraphs items={text} className="text-white/85" /> : undefined}
        />
        <Reveal delay={0.25} className="mt-10">
          <MagneticButton>
            <a href={href} target="_blank" rel="noopener noreferrer" className={`${button.base} ${button.large} ${button.accent}`}>
              <WhatsApp className="size-5" />
              {label}
            </a>
          </MagneticButton>
        </Reveal>
      </div>
    </section>
  );
}
