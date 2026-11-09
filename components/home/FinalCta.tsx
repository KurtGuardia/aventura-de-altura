import { ArrowRight, WhatsApp } from "@/components/icons";
import { MagneticButton } from "@/components/motion/MagneticButton";
import { ParallaxImage } from "@/components/motion/ParallaxImage";
import { Reveal } from "@/components/motion/Reveal";
import { SplitText } from "@/components/motion/SplitText";
import { SanityImage } from "@/components/SanityImage";
import { button, container } from "@/components/ui";
import type { Dictionary, Locale } from "@/lib/i18n";
import type { SanityImage as SanityImageType } from "@/lib/sanity/types";
import type { ReactNode } from "react";

/**
 * CTA final a pantalla completa: foto en parallax, título gigante (del
 * diccionario) y botones a WhatsApp y a los tours.
 *
 * La página de tour lo reutiliza con su propio `title` y sus `actions` (el
 * botón de WhatsApp con el mensaje del tour), que reemplazan a los botones
 * por defecto.
 */
export function FinalCta({
  lang,
  dict,
  image,
  whatsapp = null,
  hasTours = false,
  title,
  actions,
}: {
  lang: Locale;
  dict: Dictionary;
  image?: SanityImageType | null;
  whatsapp?: string | null;
  hasTours?: boolean;
  /** Título (por defecto, `dict.cta.title`). */
  title?: string;
  /** Botones propios en lugar de WhatsApp general + "Ver tours". */
  actions?: ReactNode;
}) {
  if (!actions && !whatsapp && !hasTours) return null;

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
          text={title ?? dict.cta.title}
          className="mx-auto max-w-[16ch] font-display text-display-xl uppercase tracking-display text-balance"
        />
        <Reveal delay={0.3} className="mt-12 flex flex-wrap justify-center gap-4">
          {actions}
          {!actions && whatsapp && (
            <MagneticButton>
              <a href={whatsapp} target="_blank" rel="noopener noreferrer" className={`${button.base} ${button.large} ${button.accent}`}>
                <WhatsApp className="size-5" />
                {dict.buttons.contactWhatsApp}
              </a>
            </MagneticButton>
          )}
          {!actions && hasTours && (
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
