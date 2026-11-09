import type { ReactNode } from "react";
import { Star } from "@/components/icons";
import { Reveal } from "@/components/motion/Reveal";
import { SplitText } from "@/components/motion/SplitText";

/** Contenedor horizontal común (márgenes fluidos, 20 px en móvil). */
export const container = "mx-auto w-full max-w-[90rem] px-gutter";

/** Ritmo vertical de las secciones de la home. */
export const sectionY = "py-section";

export const button = {
  base: "inline-flex min-h-12 items-center justify-center gap-2.5 rounded-full px-7 text-sm font-semibold tracking-wide transition-[background-color,color,border-color] duration-300 ease-cinematic",
  large: "min-h-14 px-9 text-base",
  /** CTA principal: color de acento con texto oscuro (AA). */
  accent: "bg-ember-400 text-navy-950 hover:bg-ember-300",
  primary: "bg-forest-800 text-white hover:bg-forest-700",
  light: "bg-cream text-navy-950 hover:bg-white",
  /** Contorno claro, sobre fotos o fondos oscuros. */
  ghost: "border border-white/40 text-white hover:border-white hover:bg-white/10",
  /** Contorno oscuro, sobre fondos claros. */
  outline: "border border-current text-forest-900 hover:bg-forest-950/5",
  whatsapp: "bg-whatsapp text-forest-950 hover:bg-[#3ee07a]",
};

/** Etiqueta pequeña en mono, mayúsculas y tracking amplio (antetítulos, datos). */
export function Eyebrow({ children, className = "" }: { children: ReactNode; className?: string }) {
  return <p className={`label-mono ${className}`}>{children}</p>;
}

/**
 * Título de sección en display gigante, revelado palabra por palabra, con
 * antetítulo e introducción opcionales.
 */
export function SectionHeading({
  title,
  eyebrow,
  intro,
  tone = "dark",
  size = "lg",
  className = "",
}: {
  title: string;
  eyebrow?: string;
  intro?: ReactNode;
  /** `dark`: texto oscuro (fondos claros). `light`: texto claro (fondos oscuros). */
  tone?: "dark" | "light";
  size?: "lg" | "xl";
  className?: string;
}) {
  const light = tone === "light";
  return (
    <div className={`max-w-4xl ${className}`}>
      {eyebrow && (
        <Reveal>
          <Eyebrow className={`mb-5 ${light ? "text-ember-300" : "text-sand-700"}`}>{eyebrow}</Eyebrow>
        </Reveal>
      )}
      <SplitText
        as="h2"
        text={title}
        className={`font-display uppercase tracking-display text-balance ${
          size === "xl" ? "text-display-xl" : "text-display-lg"
        } ${light ? "text-white" : "text-navy-950"}`}
      />
      {intro && (
        <Reveal delay={0.15}>
          <div className={`mt-6 max-w-2xl text-lg leading-relaxed ${light ? "text-white/75" : "text-stone-600"}`}>
            {intro}
          </div>
        </Reveal>
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
        <Star key={i} className={`${className} ${i < filled ? "text-ember-400" : "text-stone-300"}`} />
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
