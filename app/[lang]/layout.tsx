import type { Metadata } from "next";
import { Anton, IBM_Plex_Mono, Manrope } from "next/font/google";
import { notFound } from "next/navigation";
import { Footer } from "@/components/layout/Footer";
import { Header, type NavLink } from "@/components/layout/Header";
import { MotionProvider } from "@/components/motion/MotionProvider";
import { SmoothScroll } from "@/components/motion/SmoothScroll";
import { getDictionary, isLocale, locales } from "@/lib/i18n";
import { getFeaturedTours, getGallery, getSiteSettings } from "@/lib/sanity/fetch";
import { hasAbout, hasSafety } from "@/lib/sections";
import { t } from "@/lib/sanity/locale";
import { siteName, siteUrl, whatsappHref } from "@/lib/site";
import "../globals.css";

// Display condensada para títulos enormes, sans legible para el texto y mono
// para datos (altitudes, precios, etiquetas).
const anton = Anton({
  variable: "--font-anton",
  weight: "400",
  subsets: ["latin"],
});

const manrope = Manrope({
  variable: "--font-manrope",
  subsets: ["latin"],
});

const plexMono = IBM_Plex_Mono({
  variable: "--font-plex-mono",
  weight: ["400", "500"],
  subsets: ["latin"],
});

export const metadata: Metadata = {
  metadataBase: new URL(siteUrl),
  title: { default: siteName, template: `%s · ${siteName}` },
};

export function generateStaticParams() {
  return locales.map((lang) => ({ lang }));
}

export default async function RootLayout({ children, params }: LayoutProps<"/[lang]">) {
  const { lang } = await params;
  if (!isLocale(lang)) notFound();

  const [dict, settings, tours, gallery] = await Promise.all([
    getDictionary(lang),
    getSiteSettings(),
    getFeaturedTours(),
    getGallery(),
  ]);

  // Solo se enlazan las secciones que se renderizan en la home.
  const home = `/${lang}`;
  const links: NavLink[] = [
    tours.length > 0 && { href: `${home}#tours`, label: dict.nav.tours },
    hasSafety(settings, lang) && { href: `${home}#seguridad`, label: dict.nav.safety },
    hasAbout(settings, lang) && { href: `${home}#nosotros`, label: dict.nav.about },
    gallery.length > 0 && { href: `${home}/galeria`, label: dict.nav.gallery },
    { href: `${home}#contacto`, label: dict.nav.contact },
  ].filter((link): link is NavLink => !!link);

  // Footer: solo Tours, Galería y Contacto.
  const footerLinks: NavLink[] = [
    tours.length > 0 && { href: `${home}#tours`, label: dict.nav.tours },
    gallery.length > 0 && { href: `${home}/galeria`, label: dict.nav.gallery },
    { href: `${home}#contacto`, label: dict.nav.contact },
  ].filter((link): link is NavLink => !!link);

  // Contacto del menú móvil.
  const phones = [settings?.whatsappPrimary, settings?.whatsappSecondary]
    .map((phone) => ({ phone, href: whatsappHref(phone, dict.whatsapp.general) }))
    .filter((p): p is { phone: string; href: string } => !!p.phone && !!p.href);
  const contact = {
    whatsappHref: phones[0]?.href ?? null,
    phones,
    languages: t(settings?.contactLanguages, lang),
  };

  return (
    // data-scroll-behavior: Next desactiva el scroll suave durante los cambios de ruta.
    <html
      lang={lang}
      data-scroll-behavior="smooth"
      className={`${anton.variable} ${manrope.variable} ${plexMono.variable} h-full antialiased`}
    >
      <body className="flex min-h-full flex-col font-sans">
        {/* Sin JavaScript, las entradas animadas se muestran directamente. */}
        <noscript>
          <style>{`[data-reveal]{opacity:1!important;transform:none!important}`}</style>
        </noscript>
        <MotionProvider>
          <SmoothScroll />
          <Header lang={lang} dict={dict} links={links} contact={contact} />
          <main id="contenido" className="flex-1">
            {children}
          </main>
          <Footer dict={dict} links={footerLinks} facebook={settings?.facebook} instagram={settings?.instagram} />
        </MotionProvider>
      </body>
    </html>
  );
}
