import { NextResponse, type NextRequest } from "next/server";
import { defaultLocale, isLocale, locales, type Locale } from "@/lib/i18n";

// Devuelve el primer idioma soportado según el orden de preferencia (q) de
// Accept-Language. Si ninguno coincide, usa el idioma por defecto.
function getPreferredLocale(request: NextRequest): Locale {
  const header = request.headers.get("accept-language");
  if (!header) return defaultLocale;

  const preferred = header
    .split(",")
    .map((part) => {
      const [tag, ...rest] = part.trim().split(";");
      const q = rest.find((p) => p.trim().startsWith("q="));
      return {
        lang: tag.trim().toLowerCase().split("-")[0],
        q: q ? Number(q.trim().slice(2)) || 0 : 1,
      };
    })
    .filter((item) => item.q > 0)
    .sort((a, b) => b.q - a.q);

  for (const { lang } of preferred) {
    if (isLocale(lang)) return lang;
  }
  return defaultLocale;
}

export function proxy(request: NextRequest) {
  const { pathname } = request.nextUrl;

  const hasLocale = locales.some(
    (locale) => pathname === `/${locale}` || pathname.startsWith(`/${locale}/`),
  );
  if (hasLocale) return;

  const url = request.nextUrl.clone();
  url.pathname = `/${getPreferredLocale(request)}${pathname === "/" ? "" : pathname}`;
  return NextResponse.redirect(url);
}

export const config = {
  // Excluye /studio, /api, internos de Next y cualquier ruta con extensión
  // (archivos estáticos: favicon.ico, imágenes de /public, robots.txt, etc.).
  matcher: ["/((?!studio(?:/|$)|api(?:/|$)|_next/|_vercel/|.*\\..*).*)"],
};
