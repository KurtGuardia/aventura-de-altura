import { Reveal } from "@/components/motion/Reveal";
import type { Dictionary } from "@/lib/i18n";
import { DrawnMark } from "./DrawnMark";

/** Título de bloque dentro de la columna principal del detalle. */
export function BlockTitle({ id, children, light = false }: { id?: string; children: string; light?: boolean }) {
  return (
    <h2
      id={id}
      className={`font-display text-[clamp(2rem,4vw,3.25rem)] uppercase leading-[0.95] tracking-display text-balance ${
        light ? "text-white" : "text-navy-950"
      }`}
    >
      {children}
    </h2>
  );
}

function MarkList({ items, kind }: { items: string[]; kind: "check" | "cross" }) {
  return (
    <ul className="mt-6 space-y-4">
      {items.map((item, i) => (
        <li key={i} className="flex gap-3.5 leading-relaxed text-stone-700">
          <span
            className={`mt-0.5 flex size-6 shrink-0 items-center justify-center rounded-full ${
              kind === "check" ? "bg-forest-100 text-forest-700" : "bg-sand-200 text-sand-700"
            }`}
          >
            <DrawnMark kind={kind} delay={i * 0.06} className="size-4" />
          </span>
          {item}
        </li>
      ))}
    </ul>
  );
}

/**
 * Incluye / No incluye: dos columnas (apiladas en móvil). Una lista vacía no
 * se renderiza; sin ninguna, no hay bloque.
 */
export function TourIncludes({ includes, excludes, dict }: { includes: string[]; excludes: string[]; dict: Dictionary }) {
  if (includes.length === 0 && excludes.length === 0) return null;
  const both = includes.length > 0 && excludes.length > 0;

  return (
    <div className={`grid gap-12 ${both ? "md:grid-cols-2 md:gap-10" : ""}`}>
      {includes.length > 0 && (
        <Reveal>
          <BlockTitle>{dict.tour.includes}</BlockTitle>
          <MarkList items={includes} kind="check" />
        </Reveal>
      )}
      {excludes.length > 0 && (
        <Reveal delay={0.1}>
          <BlockTitle>{dict.tour.excludes}</BlockTitle>
          <MarkList items={excludes} kind="cross" />
        </Reveal>
      )}
    </div>
  );
}

/**
 * Requisitos y qué llevar: bloque oscuro, en línea con el mensaje de
 * seguridad de la home. Vacío, no se renderiza.
 */
export function TourRequirements({ items, dict }: { items: string[]; dict: Dictionary }) {
  if (items.length === 0) return null;
  return (
    <Reveal className="tone-dark grain relative overflow-hidden rounded-card bg-navy-950 p-7 md:p-10">
      <BlockTitle light>{dict.tour.requirements}</BlockTitle>
      <ul className="mt-6 grid gap-x-10 gap-y-4 md:grid-cols-2">
        {items.map((item, i) => (
          <li key={i} className="flex gap-3.5 leading-relaxed text-white/80">
            <span aria-hidden="true" className="mt-2.5 size-1.5 shrink-0 rounded-full bg-ember-400" />
            {item}
          </li>
        ))}
      </ul>
    </Reveal>
  );
}
