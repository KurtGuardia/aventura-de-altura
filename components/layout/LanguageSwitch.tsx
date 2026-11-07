"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { locales, type Locale } from "@/lib/i18n";

/** ES / EN: cambia solo el primer segmento de la ruta actual. */
export function LanguageSwitch({ lang, label }: { lang: Locale; label: string }) {
  const pathname = usePathname() ?? `/${lang}`;
  const rest = pathname.replace(/^\/[^/]+/, "");

  return (
    <nav aria-label={label} className="flex items-center text-xs font-semibold tracking-[0.14em]">
      {locales.map((locale, i) => (
        <span key={locale} className="flex items-center">
          {i > 0 && <span aria-hidden="true" className="mx-1.5 text-white/30">/</span>}
          <Link
            href={`/${locale}${rest}`}
            hrefLang={locale}
            lang={locale}
            aria-current={locale === lang ? "true" : undefined}
            className={
              locale === lang
                ? "text-white"
                : "text-white/55 transition-colors hover:text-white"
            }
          >
            {locale.toUpperCase()}
          </Link>
        </span>
      ))}
    </nav>
  );
}
