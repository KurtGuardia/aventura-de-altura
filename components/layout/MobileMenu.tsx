"use client";

import { AnimatePresence, m, type Variants } from "motion/react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useId, useRef, useState } from "react";
import { createPortal } from "react-dom";
import { Close, Menu, WhatsApp } from "@/components/icons";
import { lockScroll } from "@/components/motion/lenis";
import { useReducedMotion } from "@/components/motion/useReducedMotion";
import { button } from "@/components/ui";
import { useFocusTrap } from "@/components/useFocusTrap";
import { useIsClient } from "@/components/useIsClient";
import type { Locale } from "@/lib/i18n";
import { EASE } from "@/lib/motion";
import { LanguageSwitch } from "./LanguageSwitch";

export type MenuContact = {
  /** Enlace de WhatsApp con mensaje prellenado. */
  whatsappHref: string | null;
  phones: { phone: string; href: string }[];
  languages?: string;
};

type Props = {
  lang: Locale;
  links: { href: string; label: string }[];
  contact: MenuContact;
  labels: {
    open: string;
    close: string;
    nav: string;
    language: string;
    languageNames: Record<Locale, string>;
    whatsapp: string;
    contact: string;
  };
};

const list: Variants = { hidden: {}, show: { transition: { staggerChildren: 0.07, delayChildren: 0.15 } } };
const item: Variants = {
  hidden: { opacity: 0, y: 40 },
  show: { opacity: 1, y: 0, transition: { duration: 0.8, ease: EASE } },
};

/**
 * Menú móvil a pantalla completa: fondo oscuro, enlaces grandes en display
 * que entran en cascada y contacto abajo. Bloquea el scroll de la página,
 * atrapa el foco y se cierra con Esc, con la X o al navegar.
 * Se monta en document.body (portal) porque el header usa transform y
 * backdrop-filter, que romperían el `position: fixed` del panel.
 */
export function MobileMenu({ lang, links, contact, labels }: Props) {
  const [open, setOpen] = useState(false);
  const panelId = useId();
  const panelRef = useRef<HTMLDivElement>(null);
  const pathname = usePathname();
  const isClient = useIsClient();
  const reduced = useReducedMotion();

  useFocusTrap(panelRef, open, () => setOpen(false));

  // Se cierra al cambiar de página (incluido el botón "atrás").
  const [lastPath, setLastPath] = useState(pathname);
  if (pathname !== lastPath) {
    setLastPath(pathname);
    setOpen(false);
  }

  useEffect(() => {
    if (!open) return;
    lockScroll(true);
    return () => lockScroll(false);
  }, [open]);

  const panel = (
    <AnimatePresence>
      {open && (
        <m.div
          ref={panelRef}
          id={panelId}
          role="dialog"
          aria-modal="true"
          aria-label={labels.nav}
          className="tone-dark grain fixed inset-0 z-50 flex flex-col overflow-y-auto bg-navy-950 md:hidden"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: reduced ? 0 : 0.4, ease: EASE }}
          data-lenis-prevent=""
        >
          <div className="flex h-16 shrink-0 items-center justify-between px-gutter">
            <LanguageSwitch lang={lang} label={labels.language} names={labels.languageNames} />
            <button
              type="button"
              onClick={() => setOpen(false)}
              aria-label={labels.close}
              data-autofocus=""
              className="-mr-2 flex size-11 items-center justify-center"
            >
              <Close className="size-7" />
            </button>
          </div>

          <nav aria-label={labels.nav} className="flex flex-1 flex-col justify-center px-gutter py-8">
            <m.ul variants={list} initial="hidden" animate="show" className="space-y-1">
              {links.map((link) => (
                <m.li key={link.href} variants={item} className="overflow-hidden">
                  <Link
                    href={link.href}
                    onClick={() => setOpen(false)}
                    className="block py-1.5 font-display text-[clamp(2.75rem,13vw,4.5rem)] uppercase leading-none tracking-display"
                  >
                    {link.label}
                  </Link>
                </m.li>
              ))}
            </m.ul>
          </nav>

          <m.div
            className="space-y-5 border-t border-white/10 px-gutter pb-[max(2rem,env(safe-area-inset-bottom))] pt-6"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: reduced ? 0 : 0.8, ease: EASE, delay: reduced ? 0 : 0.45 }}
          >
            {contact.whatsappHref && (
              <a
                href={contact.whatsappHref}
                target="_blank"
                rel="noopener noreferrer"
                className={`${button.base} ${button.whatsapp} w-full`}
              >
                <WhatsApp className="size-5" />
                {labels.whatsapp}
              </a>
            )}
            {(contact.phones.length > 0 || contact.languages) && (
              <div className="flex flex-wrap items-end justify-between gap-x-6 gap-y-2 text-sm text-white/70">
                {contact.phones.length > 0 && (
                  <ul className="font-mono">
                    {contact.phones.map((p) => (
                      <li key={p.phone}>
                        <a href={p.href} target="_blank" rel="noopener noreferrer" className="hover:text-white">
                          {p.phone}
                        </a>
                      </li>
                    ))}
                  </ul>
                )}
                {contact.languages && <p>{contact.languages}</p>}
              </div>
            )}
          </m.div>
        </m.div>
      )}
    </AnimatePresence>
  );

  return (
    <div className="md:hidden">
      <button
        type="button"
        onClick={() => setOpen(true)}
        aria-expanded={open}
        aria-controls={panelId}
        aria-label={labels.open}
        className="-mr-2 flex size-11 items-center justify-center"
      >
        <Menu className="size-7" />
      </button>
      {isClient && createPortal(panel, document.body)}
    </div>
  );
}
