import type { Locale } from "@/lib/i18n";
import { t } from "@/lib/sanity/locale";
import type { FunFact } from "@/lib/sanity/types";

/** Dato curioso ya resuelto por idioma (portada y "Bolivia en cifras"). */
export type FactView = {
  key: string;
  value: number;
  /** Decimales que trae la cifra escrita en el Studio (34.2 → 1). */
  decimals: number;
  unit?: string;
  place: string;
  text: string;
};

export function toFactViews(facts: FunFact[] | null | undefined, lang: Locale): FactView[] {
  return (facts ?? []).flatMap((fact) => {
    const place = t(fact.place, lang);
    const text = t(fact.text, lang);
    if (typeof fact.value !== "number" || !place || !text) return [];
    return [
      {
        key: fact._key,
        value: fact.value,
        decimals: (String(fact.value).split(".")[1] ?? "").length,
        unit: t(fact.unit, lang),
        place,
        text,
      },
    ];
  });
}
