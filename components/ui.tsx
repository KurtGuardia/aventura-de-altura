import type { ReactNode } from "react";
import { Star } from "@/components/icons";

/** Contenedor horizontal común: 20 px de margen en móvil. */
export const container = "mx-auto w-full max-w-6xl px-5 md:px-8";

/** Ritmo vertical de las secciones de la home. */
export const sectionY = "py-20 md:py-28";

export const button = {
  base: "inline-flex min-h-12 items-center justify-center gap-2 rounded-full px-6 text-sm font-semibold tracking-wide transition-colors focus-visible:outline-2 focus-visible:outline-offset-2",
  primary: "bg-forest-800 text-white hover:bg-forest-700 focus-visible:outline-forest-800",
  light: "bg-sand-100 text-forest-950 hover:bg-white focus-visible:outline-white",
  outline: "border border-current hover:bg-forest-950/5",
  whatsapp: "bg-whatsapp text-forest-950 hover:brightness-95 focus-visible:outline-whatsapp",
};

export function SectionHeading({
  title,
  intro,
  tone = "dark",
  className = "",
}: {
  title: string;
  intro?: ReactNode;
  tone?: "dark" | "light";
  className?: string;
}) {
  return (
    <div className={`max-w-2xl ${className}`}>
      <h2
        className={`font-display text-4xl leading-[1.05] tracking-tight text-balance md:text-5xl ${
          tone === "light" ? "text-white" : "text-forest-950"
        }`}
      >
        {title}
      </h2>
      {intro && (
        <div className={`mt-5 text-lg leading-relaxed ${tone === "light" ? "text-white/75" : "text-stone-600"}`}>
          {intro}
        </div>
      )}
    </div>
  );
}

/** Estrellas de calificación (redondeadas al entero). La etiqueta accesible la pone el padre. */
export function Stars({ rating, className = "size-4" }: { rating: number; className?: string }) {
  const filled = Math.round(rating);
  return (
    <span className="inline-flex gap-0.5" aria-hidden="true">
      {Array.from({ length: 5 }, (_, i) => (
        <Star key={i} className={`${className} ${i < filled ? "text-amber-500" : "text-stone-300"}`} />
      ))}
    </span>
  );
}

/** Párrafos de un texto largo de Sanity. */
export function Paragraphs({ items, className = "" }: { items: string[]; className?: string }) {
  return (
    <div className={`space-y-4 ${className}`}>
      {items.map((p, i) => (
        <p key={i}>{p}</p>
      ))}
    </div>
  );
}
