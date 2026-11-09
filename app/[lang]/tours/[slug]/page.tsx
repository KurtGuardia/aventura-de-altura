import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { Gallery } from "@/components/gallery/Gallery";
import { FinalCta } from "@/components/home/FinalCta";
import { WhatsApp } from "@/components/icons";
import { MagneticButton } from "@/components/motion/MagneticButton";
import { Reveal } from "@/components/motion/Reveal";
import { SanityImage } from "@/components/SanityImage";
import { BookingWhatsAppLink, TourBookingProvider } from "@/components/tours/detail/TourBooking";
import { TourMobileBar, TourStickyCard } from "@/components/tours/detail/TourBookingBar";
import { TourHero, TOUR_HERO_ID } from "@/components/tours/detail/TourHero";
import { TourHighlights } from "@/components/tours/detail/TourHighlights";
import { TourItinerary } from "@/components/tours/detail/TourItinerary";
import { BlockTitle, TourIncludes, TourRequirements } from "@/components/tours/detail/TourLists";
import { TourPrices } from "@/components/tours/detail/TourPrices";
import { TourQuickFacts } from "@/components/tours/detail/TourQuickFacts";
import { TourCard } from "@/components/tours/TourCard";
import { button, container, Paragraphs, SectionHeading } from "@/components/ui";
import { galleryLabels, toGalleryItems } from "@/lib/gallery";
import { getDictionary, isLocale, type Dictionary, type Locale } from "@/lib/i18n";
import { getSiteSettings, getTourPage, getTourSlugs } from "@/lib/sanity/fetch";
import { paragraphs } from "@/lib/sanity/locale";
import { jsonLdScript, pageMetadata, tourJsonLd } from "@/lib/seo";
import { toTourDetailView, type TourDetailView } from "@/lib/tour-detail";
import { toTourCardView, type TourCardView } from "@/lib/tours";

// Con cacheComponents activo, generateStaticParams no puede devolver []
// (error de build): sin tours publicados se usa un slug que responde 404.
const PLACEHOLDER_SLUG = "__placeholder__";

/** Todos los slugs de Sanity; se combinan con los idiomas del layout (es/en). */
export async function generateStaticParams() {
  const slugs = await getTourSlugs();
  return slugs.length ? slugs.map((slug) => ({ slug })) : [{ slug: PLACEHOLDER_SLUG }];
}

export async function generateMetadata({ params }: PageProps<"/[lang]/tours/[slug]">): Promise<Metadata> {
  const { lang, slug } = await params;
  if (!isLocale(lang) || slug === PLACEHOLDER_SLUG) return {};
  const [dict, { tour }] = await Promise.all([getDictionary(lang), getTourPage(slug)]);
  const view = tour && toTourDetailView(tour, lang, dict);
  if (!view) return {};

  // Título: "Nombre del tour · Aventura de Altura" (plantilla del layout).
  return pageMetadata({
    lang,
    path: `/tours/${slug}`,
    title: view.title,
    description: view.tagline ?? view.description?.replace(/\s+/g, " "),
    image: view.cover,
  });
}

// La página lee `params` fuera de <Suspense> (como la home y la galería). Con
// un Suspense, el HTML estático llega con el contenido oculto y React lo
// revela con un script: eso retrasaba ~1,4 s el pintado de la portada (LCP).
// `instant = false` solo silencia la validación de "navegación instantánea"
// en desarrollo; la navegación es instantánea igualmente porque los enlaces
// de <TourCard> precargan la página completa (y la foto hace el morph).
export const instant = false;

export default async function TourPage({ params }: PageProps<"/[lang]/tours/[slug]">) {
  const { lang, slug } = await params;
  if (!isLocale(lang) || slug === PLACEHOLDER_SLUG) notFound();

  const [dict, settings, { tour, others }] = await Promise.all([
    getDictionary(lang),
    getSiteSettings(),
    getTourPage(slug),
  ]);
  const exchangeRate = settings?.exchangeRate;
  const view = tour && toTourDetailView(tour, lang, dict, exchangeRate);
  if (!tour || !view) notFound();

  const otherTours = others
    .map((other) => toTourCardView(other, lang, dict, exchangeRate))
    .filter((card): card is TourCardView => !!card);
  const gallery = toGalleryItems(tour.gallery ?? [], lang);
  const allPrices = view.options.flatMap((o) => o.prices.map((p) => p.usd));

  const bookingLabels = {
    from: dict.labels.from,
    selectedOption: dict.tour.selectedOption,
    people: dict.tour.people,
    peopleCount: dict.tour.peopleCount,
    peopleCountOne: dict.tour.peopleCountOne,
    checkAvailability: dict.buttons.checkAvailability,
  };

  return (
    <TourBookingProvider
      tourTitle={view.title}
      phone={settings?.whatsappPrimary}
      templates={dict.whatsapp}
      options={view.options.map((o) => ({ slug: o.slug, label: o.label }))}
    >
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={jsonLdScript(
          tourJsonLd({
            lang,
            slug,
            name: view.title,
            description: view.description ?? view.tagline,
            image: view.cover,
            prices: allPrices,
            telephone: settings?.whatsappPrimary,
          }),
        )}
      />

      {/* Ritmo: portada oscura → datos (claro) → lo mejor (oscuro) → detalle (claro) → galería (arena) → CTA (foto) → otros tours (claro). */}
      <TourHero tour={view} lang={lang} dict={dict} />
      <TourQuickFacts tour={view} lang={lang} dict={dict} />
      <Highlights tour={view} lang={lang} dict={dict} />

      <div className="bg-cream py-section">
        <div className={`${container} grid gap-16 lg:grid-cols-[minmax(0,1fr)_20rem] lg:gap-16 xl:grid-cols-[minmax(0,1fr)_22rem] xl:gap-24`}>
          <div className="min-w-0 space-y-[clamp(4.5rem,9vw,7.5rem)]">
            {view.description && (
              <section aria-labelledby="tour-descripcion">
                <Reveal>
                  <p id="tour-descripcion" className="label-mono mb-6 text-sand-700">
                    {dict.tour.about}
                  </p>
                  <Paragraphs
                    items={paragraphs(view.description)}
                    className="max-w-3xl text-[clamp(1.35rem,2.4vw,2rem)] font-medium leading-snug text-navy-950 text-pretty"
                  />
                </Reveal>
                {view.notes && (
                  <Reveal delay={0.1} className="mt-10 max-w-2xl border-l-2 border-sand-300 pl-5">
                    <p className="label-mono text-sand-700">{dict.tour.notes}</p>
                    <Paragraphs items={paragraphs(view.notes)} className="mt-2 leading-relaxed text-stone-600" />
                  </Reveal>
                )}
              </section>
            )}

            {view.options.length > 0 && (
              <section aria-labelledby="tour-itinerario">
                <div className="mb-10">
                  <BlockTitle id="tour-itinerario">{dict.tour.itinerary}</BlockTitle>
                </div>
                <TourItinerary
                  options={view.options}
                  labels={{
                    options: dict.tour.options,
                    itinerary: dict.tour.itinerary,
                    day: dict.tour.day,
                    lodging: dict.tour.lodging,
                    noItinerary: dict.tour.noItinerary,
                    checkAvailability: dict.buttons.checkAvailability,
                  }}
                />
              </section>
            )}

            <TourIncludes includes={view.includes} excludes={view.excludes} dict={dict} />
            <TourRequirements items={view.requirements} dict={dict} />

            <section aria-labelledby="tour-precios">
              <div className="mb-10">
                <BlockTitle id="tour-precios">{dict.tour.prices}</BlockTitle>
              </div>
              <TourPrices
                options={view.options}
                lang={lang}
                exchangeRate={exchangeRate}
                labels={{ ...dict.tour, checkAvailability: dict.buttons.checkAvailability }}
              />
            </section>
          </div>

          {/* Tarjeta lateral fija: acompaña desde la descripción hasta los precios. */}
          <aside className="hidden lg:block">
            <TourStickyCard
              tourTitle={view.title}
              options={view.options}
              lang={lang}
              exchangeRate={exchangeRate}
              minPrice={view.minPrice}
              labels={bookingLabels}
            />
          </aside>
        </div>
      </div>

      {gallery.length > 0 && (
        <section aria-label={dict.tour.gallery} className="bg-sand-100 py-section">
          <div className={container}>
            <SectionHeading title={dict.tour.gallery} />
            <div className="mt-12 md:mt-16">
              <Gallery items={gallery} variant="mosaic" labels={galleryLabels(dict)} />
            </div>
          </div>
        </section>
      )}

      <FinalCta
        lang={lang}
        dict={dict}
        image={view.cover}
        title={dict.tour.cta}
        actions={
          <MagneticButton>
            <BookingWhatsAppLink className={`${button.base} ${button.large} ${button.accent}`}>
              <WhatsApp className="size-5" />
              {dict.buttons.checkAvailability}
            </BookingWhatsAppLink>
          </MagneticButton>
        }
      />

      {otherTours.length > 0 && (
        <section aria-label={dict.tour.otherTours} className="overflow-hidden bg-cream py-section">
          <div className={container}>
            <SectionHeading title={dict.tour.otherTours} />
            <ul className="no-scrollbar -mx-gutter mt-12 flex snap-x snap-mandatory gap-4 overflow-x-auto px-gutter md:mx-0 md:mt-16 md:grid md:grid-cols-3 md:gap-8 md:overflow-visible md:px-0">
              {otherTours.map((card) => (
                <li key={card.id} className="w-[80%] shrink-0 snap-start sm:w-[55%] md:w-auto">
                  <TourCard tour={card} lang={lang} sizes="(min-width: 768px) 30vw, 80vw" />
                </li>
              ))}
            </ul>
          </div>
        </section>
      )}

      {/* Reemplaza al botón flotante de WhatsApp en esta página. */}
      <TourMobileBar
        heroId={TOUR_HERO_ID}
        options={view.options}
        lang={lang}
        exchangeRate={exchangeRate}
        minPrice={view.minPrice}
        labels={bookingLabels}
      />
    </TourBookingProvider>
  );
}

/** "Lo mejor del tour" (oscuro). Sin foto propia, cada atractivo usa la portada del tour. */
function Highlights({ tour, lang, dict }: { tour: TourDetailView; lang: Locale; dict: Dictionary }) {
  if (tour.highlights.length === 0) return null;
  return (
    <section aria-label={dict.tour.highlights} className="tone-dark grain relative bg-navy-950 py-section">
      <div className={container}>
        <TourHighlights
          heading={<SectionHeading title={dict.tour.highlights} tone="light" />}
          labels={{ carousel: dict.tour.highlightsCarousel, slide: dict.tour.highlightSlide, goTo: dict.tour.highlightGoTo }}
          items={tour.highlights.map((h) => {
            const image = h.image ?? tour.cover;
            return {
              key: h.key,
              title: h.title,
              text: h.text,
              image: (
                <SanityImage image={image} lang={lang} aspect={4 / 3} sizes="(min-width: 640px) 55vw, 82vw" fallbackAlt={h.title} />
              ),
              still: <SanityImage image={image} lang={lang} sizes="50vw" decorative />,
            };
          })}
        />
      </div>
    </section>
  );
}
