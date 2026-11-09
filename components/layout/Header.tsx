import Image from "next/image";
import Link from "next/link";
import type { Dictionary, Locale } from "@/lib/i18n";
import { siteName } from "@/lib/site";
import { HeaderShell } from "./HeaderShell";
import { LanguageSwitch } from "./LanguageSwitch";
import { MobileMenu, type MenuContact } from "./MobileMenu";

export type NavLink = { href: string; label: string };

export function Header({
  lang,
  dict,
  links,
  contact,
}: {
  lang: Locale;
  dict: Dictionary;
  links: NavLink[];
  contact: MenuContact;
}) {
  return (
    <HeaderShell>
      <a
        href="#contenido"
        className="sr-only focus:not-sr-only focus:absolute focus:left-4 focus:top-3 focus:z-50 focus:rounded-sm focus:bg-cream focus:px-3 focus:py-2 focus:text-ink"
      >
        {dict.nav.skipToContent}
      </a>
      <div className="mx-auto flex h-16 max-w-[90rem] items-center justify-between gap-6 px-gutter">
        <Link href={`/${lang}`} className="group flex items-center gap-3 font-display text-2xl uppercase tracking-wide">
          {/* El logo no lleva texto legible: el nombre se mantiene al lado. */}
          <Image
            src="/logo-mark.png"
            alt=""
            width={40}
            height={40}
            priority
            className="size-9 rounded-full transition-transform duration-700 ease-cinematic can-hover:group-hover:rotate-[20deg] md:size-10"
          />
          {siteName}
        </Link>

        <div className="flex items-center gap-7">
          <nav aria-label={dict.nav.main} className="hidden md:block">
            <ul className="flex items-center gap-8 text-sm font-medium">
              {links.map((link) => (
                <li key={link.href}>
                  <Link
                    href={link.href}
                    className="relative text-white/80 transition-colors duration-300 after:absolute after:-bottom-1 after:left-0 after:h-px after:w-full after:origin-right after:scale-x-0 after:bg-ember-400 after:transition-transform after:duration-500 after:ease-cinematic hover:text-white hover:after:origin-left hover:after:scale-x-100"
                  >
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </nav>
          <div className="hidden md:block">
            <LanguageSwitch lang={lang} label={dict.nav.language} names={dict.nav.languageNames} />
          </div>
          <MobileMenu
            lang={lang}
            links={links}
            contact={contact}
            labels={{
              open: dict.nav.openMenu,
              close: dict.nav.closeMenu,
              nav: dict.nav.main,
              language: dict.nav.language,
              languageNames: dict.nav.languageNames,
              whatsapp: dict.buttons.contactWhatsApp,
              contact: dict.nav.contact,
            }}
          />
        </div>
      </div>
    </HeaderShell>
  );
}
