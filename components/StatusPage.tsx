"use client";

import { createContext, useContext, type ReactNode } from "react";
import { TopoLines } from "@/components/TopoLines";
import { button, container } from "@/components/ui";
import type { Dictionary, Locale } from "@/lib/i18n";

type StatusTexts = Dictionary["status"] & { lang: Locale };

const StatusTextsContext = createContext<StatusTexts | null>(null);

/**
 * Textos de la 404 y del error de `[lang]`. `not-found.tsx` y `error.tsx` no
 * reciben `params`, así que el layout (que sí conoce el idioma) se los pasa
 * por contexto: solo los de ese idioma, sin cargar los diccionarios en el
 * cliente.
 */
export function StatusTextsProvider({ value, children }: { value: StatusTexts; children: ReactNode }) {
  return <StatusTextsContext.Provider value={value}>{children}</StatusTextsContext.Provider>;
}

export function useStatusTexts(): StatusTexts {
  const texts = useContext(StatusTextsContext);
  if (!texts) throw new Error("useStatusTexts debe usarse dentro de <StatusTextsProvider>.");
  return texts;
}

/**
 * Página de estado (404, error) con el estilo del sitio: fondo oscuro,
 * curvas de nivel, título display y CTA hacia el inicio y los tours.
 */
export function StatusPage({
  eyebrow,
  title,
  text,
  actions,
  footnote,
}: {
  eyebrow: string;
  title: string;
  text: string;
  actions: ReactNode;
  /** Línea secundaria (por ejemplo, el texto en el otro idioma). */
  footnote?: ReactNode;
}) {
  return (
    <section className="tone-dark grain relative isolate flex min-h-[85svh] items-center overflow-hidden bg-navy-950 pb-20 pt-36 md:pt-44">
      <TopoLines className="-z-10 text-white/[0.07]" />
      <div className={container}>
        <p className="label-mono text-ember-300">{eyebrow}</p>
        <h1 className="mt-5 max-w-4xl font-display text-display-xl uppercase tracking-display text-balance text-white">
          {title}
        </h1>
        <p className="mt-6 max-w-xl text-lg leading-relaxed text-white/75 text-pretty">{text}</p>
        <div className="mt-10 flex flex-wrap gap-3">{actions}</div>
        {footnote && <div className="mt-12 max-w-xl text-sm leading-relaxed text-white/55">{footnote}</div>}
      </div>
    </section>
  );
}

/** Enlaces "Ir al inicio" (CTA principal) y "Ver tours" de las páginas de estado. */
export function StatusLinks({ lang, home, tours }: { lang: Locale; home: string; tours: string }) {
  return (
    <>
      <a href={`/${lang}`} className={`${button.base} ${button.large} ${button.accent}`}>
        {home}
      </a>
      <a href={`/${lang}#tours`} className={`${button.base} ${button.large} ${button.ghost}`}>
        {tours}
      </a>
    </>
  );
}
