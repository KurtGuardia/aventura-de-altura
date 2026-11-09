import { ArrowRight, WhatsApp } from "@/components/icons";
import { MagneticButton } from "@/components/motion/MagneticButton";
import { ParallaxImage } from "@/components/motion/ParallaxImage";
import { Reveal } from "@/components/motion/Reveal";
import { SplitText } from "@/components/motion/SplitText";
import { SanityImage } from "@/components/SanityImage";
import { button, container } from "@/components/ui";
import type { Dictionary, Locale } from "@/lib/i18n";
import type { SanityImage as SanityImageType } from "@/lib/sanity/types";

/**
 * CTA final a pantalla completa: foto en parallax, título gigante (del
 * diccionario) y botones a WhatsApp y a los tours.
 */
export function FinalCta({
  lang,
  dict,
  image,
  whatsapp,
  hasTours,
}: {
  lang: Locale;
  dict: Dictionary;
  image?: SanityImageType | null;
  whatsapp: string | null;
  hasTours: boolean;
}) {
  if (!whatsapp && !hasTours) return null;

  return (
    <section className="tone-dark grain relative isolate flex min-h-svh items-center overflow-hidden bg-navy-950 py-section">
      {image?.asset && (
        <ParallaxImage strength={16} className="absolute inset-0 -z-10">
          {/* La foto acompaña al título: decorativa. */}
          <SanityImage image={image} lang={lang} sizes="100vw" decorative />
        </ParallaxImage>
      )}
      <div aria-hidden="true" className="absolute inset-0 -z-10 bg-navy-950/65" />

      <div className={`${container} text-center`}>
        <SplitText
          as="h2"
          text={dict.cta.title}
          className="mx-auto max-w-[16ch] font-display text-display-xl uppercase tracking-display text-balance"
        />
        <Reveal delay={0.3} className="mt-12 flex flex-wrap justify-center gap-4">
          {whatsapp && (
            <MagneticButton>
              <a href={whatsapp} target="_blank" rel="noopener noreferrer" className={`${button.base} ${button.large} ${button.accent}`}>
                <WhatsApp className="size-5" />
                {dict.buttons.contactWhatsApp}
              </a>
            </MagneticButton>
          )}
          {hasTours && (
            <a href="#tours" className={`${button.base} ${button.large} ${button.ghost}`}>
              {dict.buttons.viewTours}
              <ArrowRight className="size-5" />
            </a>
          )}
        </Reveal>
      </div>
    </section>
  );
}
