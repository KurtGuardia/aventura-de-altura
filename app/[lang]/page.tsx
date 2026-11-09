import type { Metadata } from 'next'
import { notFound } from 'next/navigation'
import { About } from '@/components/home/About'
import { Contact } from '@/components/home/Contact'
import { CustomTour } from '@/components/home/CustomTour'
import { FeaturedTours } from '@/components/home/FeaturedTours'
import { FinalCta } from '@/components/home/FinalCta'
import {
  GalleryPreview,
  PREVIEW_COUNT,
} from '@/components/home/GalleryPreview'
import { Hero } from '@/components/home/Hero'
import { Safety } from '@/components/home/Safety'
import { Stats } from '@/components/home/Stats'
import { Testimonials } from '@/components/home/Testimonials'
import { WhyUs } from '@/components/home/WhyUs'
import { WhatsAppFloat } from '@/components/layout/WhatsAppFloat'
import { toFactViews } from '@/lib/facts'
import { toGalleryItems } from '@/lib/gallery'
import { getDictionary, isLocale } from '@/lib/i18n'
import {
  getFeaturedTours,
  getGallery,
  getSiteSettings,
  getTestimonials,
} from '@/lib/sanity/fetch'
import { t } from '@/lib/sanity/locale'
import { pageMetadata } from '@/lib/seo'
import { whatsappHref } from '@/lib/site'

export async function generateMetadata({
  params,
}: PageProps<'/[lang]'>): Promise<Metadata> {
  const { lang } = await params
  if (!isLocale(lang)) return {}
  const [dict, settings] = await Promise.all([
    getDictionary(lang),
    getSiteSettings(),
  ])

  return pageMetadata({
    lang,
    path: '',
    title: dict.meta.homeTitle,
    absoluteTitle: true,
    description:
      t(settings?.heroSubtitle, lang) ??
      dict.meta.homeDescription,
    image: settings?.heroImage,
  })
}

export default async function HomePage({
  params,
}: PageProps<'/[lang]'>) {
  const { lang } = await params
  if (!isLocale(lang)) notFound()

  const [dict, settings, tours, testimonials, gallery] =
    await Promise.all([
      getDictionary(lang),
      getSiteSettings(),
      getFeaturedTours(),
      getTestimonials(),
      getGallery(),
    ])

  const whatsapp = whatsappHref(
    settings?.whatsappPrimary,
    dict.whatsapp.general,
  )

  // Ritmo: oscuro → claro → oscuro (cifras) → foto → oscuro → claro → beige → claro → claro → foto → oscuro.
  return (
    <>
      <Hero
        lang={lang}
        dict={dict}
        settings={settings}
        tours={tours}
      />
      <FeaturedTours
        lang={lang}
        dict={dict}
        tours={tours}
        exchangeRate={settings?.exchangeRate}
      />
      <Stats
        lang={lang}
        dict={dict}
        facts={toFactViews(settings?.funFacts, lang)}
      />
      <CustomTour
        lang={lang}
        dict={dict}
        settings={settings}
      />
      <Safety lang={lang} dict={dict} settings={settings} />
      <WhyUs lang={lang} dict={dict} settings={settings} />
      <About lang={lang} dict={dict} settings={settings} />
      <GalleryPreview
        lang={lang}
        dict={dict}
        items={toGalleryItems(
          gallery.slice(0, PREVIEW_COUNT),
          lang,
        )}
      />
      <Testimonials
        lang={lang}
        dict={dict}
        settings={settings}
        testimonials={testimonials}
      />
      <FinalCta
        lang={lang}
        dict={dict}
        image={settings?.heroImage}
        whatsapp={whatsapp}
        hasTours={tours.length > 0}
      />
      <Contact
        lang={lang}
        dict={dict}
        settings={settings}
      />
      <WhatsAppFloat
        href={whatsapp}
        label={dict.buttons.contactWhatsApp}
      />
    </>
  )
}
