"use client";

import { usePathname } from "next/navigation";
import { useEffect, useState, type ReactNode } from "react";

/**
 * Páginas que empiezan con una cabecera oscura a pantalla completa (home y
 * galería): sobre ellas el header es transparente. En el resto es sólido
 * desde el principio y se reserva su altura para no tapar el contenido.
 */
const OVERLAY_PATHS = /^\/[a-z]{2}(\/galeria)?\/?$/;

/**
 * Píxeles de scroll a partir de los cuales el header puede ocultarse. Sobre
 * una cabecera a pantalla completa, solo después de dejarla atrás.
 */
const HIDE_AFTER = 160;
const hideAfter = (overlay: boolean) => (overlay ? Math.max(window.innerHeight, HIDE_AFTER) : HIDE_AFTER);
/** Variación mínima de scroll para cambiar de estado (evita parpadeos). */
const DELTA = 8;

/**
 * Comportamiento del header: transparente sobre el hero, sólido con
 * backdrop-blur al hacer scroll, oculto al bajar y visible al subir.
 */
export function HeaderShell({ children }: { children: ReactNode }) {
  const pathname = usePathname() ?? "";
  const overlay = OVERLAY_PATHS.test(pathname);
  const [scrolled, setScrolled] = useState(false);
  const [hidden, setHidden] = useState(false);

  useEffect(() => {
    let last = window.scrollY;
    let frame = 0;
    const update = () => {
      frame = 0;
      const y = window.scrollY;
      setScrolled(y > 24);
      if (y < hideAfter(overlay)) {
        setHidden(false);
        last = y;
      } else if (Math.abs(y - last) > DELTA) {
        setHidden(y > last);
        last = y;
      }
    };
    const onScroll = () => {
      if (!frame) frame = requestAnimationFrame(update);
    };
    update();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => {
      window.removeEventListener("scroll", onScroll);
      cancelAnimationFrame(frame);
    };
  }, [pathname, overlay]);

  const solid = !overlay || scrolled;

  return (
    <>
      <header
        // Si el teclado entra en el header oculto, vuelve a mostrarse.
        onFocusCapture={() => setHidden(false)}
        className={`tone-dark fixed inset-x-0 top-0 z-40 transition-[translate,background-color,border-color] duration-500 ease-cinematic ${
          hidden ? "-translate-y-full" : "translate-y-0"
        } ${
          solid
            ? "border-b border-white/10 bg-navy-950/80 backdrop-blur-md"
            : "border-b border-transparent bg-gradient-to-b from-black/45 to-transparent"
        }`}
      >
        {children}
      </header>
      {!overlay && <div aria-hidden="true" className="h-16" />}
    </>
  );
}
