"use client";

import { AnimatePresence, m } from "motion/react";
import { useEffect, useState } from "react";
import { WhatsApp } from "@/components/icons";
import { useReducedMotion } from "@/components/motion/useReducedMotion";

/** Fracción de la altura de la pantalla que hay que bajar para mostrar el botón. */
const SHOW_AFTER = 0.8;

/**
 * Botón flotante de WhatsApp, solo en móvil. Aparece tras pasar el hero con
 * una micro-animación. Se incluye por página, no en el layout: la página de
 * tour tiene su propio CTA fijo y no deben solaparse.
 */
export function WhatsAppFloat({ href, label }: { href: string | null; label: string }) {
  const [visible, setVisible] = useState(false);
  const reduced = useReducedMotion();

  useEffect(() => {
    const update = () => setVisible(window.scrollY > window.innerHeight * SHOW_AFTER);
    update();
    window.addEventListener("scroll", update, { passive: true });
    return () => window.removeEventListener("scroll", update);
  }, []);

  if (!href) return null;

  return (
    <AnimatePresence>
      {visible && (
        <m.a
          href={href}
          target="_blank"
          rel="noopener noreferrer"
          aria-label={label}
          initial={reduced ? { opacity: 0 } : { opacity: 0, scale: 0.4, y: 24 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.6, y: 16 }}
          transition={reduced ? { duration: 0.2 } : { type: "spring", stiffness: 380, damping: 22 }}
          className="fixed bottom-[max(1rem,env(safe-area-inset-bottom))] right-4 z-30 flex size-14 items-center justify-center rounded-full bg-whatsapp text-forest-950 shadow-float md:hidden"
        >
          <WhatsApp className="size-7" />
        </m.a>
      )}
    </AnimatePresence>
  );
}
