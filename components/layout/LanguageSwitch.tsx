"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useLocationSearch } from "@/components/useLocationSearch";
import { locales, type Locale } from "@/lib/i18n";

/**
 * ES / EN: cambia solo el primer segmento de la ruta actual. Mantiene la
 * página (también el slug del tour) y la query (por ejemplo, la opción
 * elegida del tour, `?opcion=2-dias`).
 */
export function LanguageSwitch({
  lang,
  label,
  names,
  className = "",
}: {
  lang: Locale;
  label: string;
  /** Nombre de cada idioma en su propio idioma, para lectores de pantalla. */
  names: Record<Locale, string>;
  className?: string;
}) {
  const pathname = usePathname() ?? `/${lang}`;
  const rest = pathname.replace(/^\/[^/]+/, "");
  const search = useLocationSearch();

  return (
    <nav aria-label={label} className={`label-mono flex items-center ${className}`}>
      {locales.map((locale, i) => (
        <span key={locale} className="flex items-center">
          {i > 0 && (
            <span aria-hidden="true" className="mx-2 text-white/30">
              /
            </span>
          )}
          <Link
            href={`/${locale}${rest}${search}`}
            // Misma posición de la página: solo cambia el idioma, sin volver arriba.
            scroll={false}
            hrefLang={locale}
            lang={locale}
            aria-label={names[locale]}
            aria-current={locale === lang ? "true" : undefined}
            className={
              locale === lang
                ? "py-2 text-white"
                : "py-2 text-white/55 transition-colors hover:text-white"
            }
          >
            {locale.toUpperCase()}
          </Link>
        </span>
      ))}
    </nav>
  );
}
