import { GoogleAnalytics } from "@next/third-parties/google";
import type { Metadata } from "next";
import { Footer } from "@/components/layout/Footer";
import { Header, type NavLink } from "@/components/layout/Header";
import { MotionProvider } from "@/components/motion/MotionProvider";
import { SmoothScroll } from "@/components/motion/SmoothScroll";
import { defaultLocale, getDictionary, isLocale, locales } from "@/lib/i18n";
import { getFeaturedTours, getGallery, getSiteSettings } from "@/lib/sanity/fetch";
import { hasAbout, hasSafety } from "@/lib/sections";
import { t } from "@/lib/sanity/locale";
import { siteName, siteUrl, whatsappHref } from "@/lib/site";
import { StatusTextsProvider } from "@/components/StatusPage";
import { WhatsAppTracker } from "@/components/WhatsAppTracker";
import { fontVariables } from "../fonts";
import "../globals.css";

/** Google Analytics 4: solo se carga si existe la variable. */
const gaId = process.env.NEXT_PUBLIC_GA_ID?.trim();

export const metadata: Metadata = {
  metadataBase: new URL(siteUrl),
  title: { default: siteName, template: `%s · ${siteName}` },
};

export function generateStaticParams() {
  return locales.map((lang) => ({ lang }));
}

export default async function RootLayout({ children, params }: LayoutProps<"/[lang]">) {
  // Idioma no soportado (/fr, /foto.jpg…): el layout se pinta en el idioma por
  // defecto y la página llama a notFound(), así se muestra la 404 del sitio
  // (app/[lang]/not-found.tsx). Si el layout llamara a notFound(), al ser el
  // layout raíz no habría boundary y saldría la 404 genérica de Next.
  const { lang: param } = await params;
  const lang = isLocale(param) ? param : defaultLocale;

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
      className={`${fontVariables} h-full antialiased`}
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
            {/* Textos de la 404 y del error de esta sección (no reciben params). */}
            <StatusTextsProvider value={{ lang, ...dict.status }}>{children}</StatusTextsProvider>
          </main>
          <Footer dict={dict} links={footerLinks} facebook={settings?.facebook} instagram={settings?.instagram} />
        </MotionProvider>
        {gaId && <WhatsAppTracker />}
      </body>
      {gaId && <GoogleAnalytics gaId={gaId} />}
    </html>
  );
}
