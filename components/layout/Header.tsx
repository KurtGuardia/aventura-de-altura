import Link from "next/link";
import type { Dictionary, Locale } from "@/lib/i18n";
import { siteName } from "@/lib/site";
import { LanguageSwitch } from "./LanguageSwitch";
import { MobileMenu } from "./MobileMenu";

export type NavLink = { href: string; label: string };

export function Header({ lang, dict, links }: { lang: Locale; dict: Dictionary; links: NavLink[] }) {
  return (
    <header className="sticky top-0 z-40 bg-forest-950/95 text-white backdrop-blur supports-[backdrop-filter]:bg-forest-950/85">
      <a
        href="#contenido"
        className="sr-only focus:not-sr-only focus:absolute focus:left-4 focus:top-3 focus:z-50 focus:bg-white focus:px-3 focus:py-2 focus:text-ink"
      >
        {dict.nav.skipToContent}
      </a>
      <div className="relative mx-auto flex h-16 max-w-6xl items-center justify-between gap-6 px-5 md:px-8">
        <Link href={`/${lang}`} className="font-display text-xl font-semibold tracking-tight">
          {siteName}
        </Link>

        <div className="flex items-center gap-6">
          <nav aria-label={dict.nav.main} className="hidden md:block">
            <ul className="flex items-center gap-7 text-sm font-medium">
              {links.map((link) => (
                <li key={link.href}>
                  <Link href={link.href} className="text-white/80 transition-colors hover:text-white">
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </nav>
          <LanguageSwitch lang={lang} label={dict.nav.language} />
          <MobileMenu
            links={links}
            labels={{ open: dict.nav.openMenu, close: dict.nav.closeMenu, nav: dict.nav.main }}
          />
        </div>
      </div>
    </header>
  );
}
