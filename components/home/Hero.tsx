import { ArrowRight } from "@/components/icons";
import { MagneticButton } from "@/components/motion/MagneticButton";
import { Reveal } from "@/components/motion/Reveal";
import { SplitText } from "@/components/motion/SplitText";
import { WordRotator } from "@/components/motion/WordRotator";
import { MountainDivider } from "@/components/MountainDivider";
import { SanityImage } from "@/components/SanityImage";
import { button, container } from "@/components/ui";
import { toFactViews } from "@/lib/facts";
import type { Dictionary, Locale } from "@/lib/i18n";
import { t } from "@/lib/sanity/locale";
import type { SanityImage as SanityImageType, SiteSettings, TourCard } from "@/lib/sanity/types";
import { FactTicker } from "./FactTicker";
import { HeroScene } from "./HeroScene";

const MAX_SLIDES = 5;

type Props = {
  lang: Locale;
  dict: Dictionary;
  settings: SiteSettings | null;
  /** Tours destacados: sus portadas completan el slideshow. */
  tours: TourCard[];
};

/**
 * Fotos del slideshow: la del hero (siteSettings) y las portadas de los tours
 * destacados, sin repetir asset.
 */
function heroSlides(settings: SiteSettings | null, tours: TourCard[]): SanityImageType[] {
  const seen = new Set<string>();
  return [settings?.heroImage, ...tours.map((tour) => tour.coverImage)]
    .filter((image): image is SanityImageType => {
      const ref = image?.asset?._ref;
      if (!ref || seen.has(ref)) return false;
      seen.add(ref);
      return true;
    })
    .slice(0, MAX_SLIDES);
}

/**
 * Separa el título en "texto fijo" + "última palabra rotativa". Las palabras
 * vienen del Studio (siteSettings.heroRotatingWords); sin palabras, el título
 * queda fijo.
 */
function rotatingTitle(title: string, words: string[]) {
  const match = title.match(/^(.*\s)(\p{L}+)([.!?…]*)\s*$/u);
  if (!match || words.length === 0) return null;
  const [, lead, last, punctuation] = match;
  const normalized = last.toLocaleLowerCase();
  return {
    lead: lead.trim(),
    // La palabra del título va primero: es la que se ve al cargar.
    words: [last, ...words.filter((w) => w.toLocaleLowerCase() !== normalized)],
    suffix: punctuation,
  };
}

export function Hero({ lang, dict, settings, tours }: Props) {
  const title = t(settings?.heroTitle, lang);
  if (!title) return null;
  const subtitle = t(settings?.heroSubtitle, lang);
  const cta = t(settings?.heroCtaLabel, lang) ?? dict.buttons.viewTours;
  const words = (settings?.heroRotatingWords ?? [])
    .map((word) => t(word, lang)?.trim())
    .filter((word): word is string => !!word && !/\s/.test(word));
  const rotating = rotatingTitle(title, words);
  const facts = toFactViews(settings?.funFacts, lang);

  // Solo la primera foto se describe; el resto del slideshow es decorativo.
  const slides = heroSlides(settings, tours).map((image, i) => (
    <SanityImage key={i} image={image} lang={lang} sizes="100vw" priority={i === 0} decorative={i > 0} />
  ));

  const titleClass =
    "max-w-[15ch] font-display text-display-hero uppercase tracking-display text-balance text-white";

  return (
    <HeroScene slides={slides} className="min-h-svh" after={<MountainDivider className="text-cream" />}>
      <div className={`${container} flex min-h-svh flex-col justify-end pb-[clamp(7rem,14vw,11rem)] pt-28`}>
        {rotating ? (
          <SplitText
            as="h1"
            trigger="mount"
            delay={0.2}
            text={rotating.lead}
            label={title}
            className={titleClass}
            suffix={<WordRotator words={rotating.words} suffix={rotating.suffix} className="text-ember-300" />}
          />
        ) : (
          <SplitText as="h1" trigger="mount" delay={0.2} text={title} className={titleClass} />
        )}

        {subtitle && (
          <Reveal delay={0.7}>
            <p className="mt-6 max-w-xl text-lg leading-relaxed text-white/85 md:text-xl">{subtitle}</p>
          </Reveal>
        )}

        {tours.length > 0 && (
          <Reveal delay={0.85} className="mt-10">
            <MagneticButton>
              <a href="#tours" className={`${button.base} ${button.large} ${button.accent}`}>
                {cta}
                <ArrowRight className="size-5" />
              </a>
            </MagneticButton>
          </Reveal>
        )}

        {facts.length > 0 && (
          <div className="mt-10 border-t border-white/20 pt-5 md:mt-14">
            <FactTicker facts={facts} lang={lang} label={dict.hero.factLabel} />
          </div>
        )}
      </div>
    </HeroScene>
  );
}
