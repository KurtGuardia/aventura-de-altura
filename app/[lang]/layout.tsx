import type { Metadata } from "next";
import { Fraunces, Manrope } from "next/font/google";
import { notFound } from "next/navigation";
import { Footer } from "@/components/layout/Footer";
import { Header, type NavLink } from "@/components/layout/Header";
import { getDictionary, isLocale, locales } from "@/lib/i18n";
import { getFeaturedTours, getGallery, getSiteSettings } from "@/lib/sanity/fetch";
import { hasAbout, hasSafety } from "@/lib/sections";
import { siteName, siteUrl } from "@/lib/site";
import "../globals.css";

// Display con carácter (serif editorial) + sans legible para el texto.
const fraunces = Fraunces({
  variable: "--font-fraunces",
  subsets: ["latin"],
  axes: ["opsz", "SOFT"],
});

const manrope = Manrope({
  variable: "--font-manrope",
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

  return (
    // data-scroll-behavior: Next desactiva el scroll suave durante los cambios de ruta.
    <html lang={lang} data-scroll-behavior="smooth" className={`${fraunces.variable} ${manrope.variable} h-full antialiased`}>
      <body className="flex min-h-full flex-col font-sans">
        <Header lang={lang} dict={dict} links={links} />
        <main id="contenido" className="flex-1">
          {children}
        </main>
        <Footer lang={lang} dict={dict} settings={settings} />
      </body>
    </html>
  );
}
