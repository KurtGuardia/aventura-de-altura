import type { Locale } from "@/lib/i18n";
import type { LocaleValue } from "./types";

/**
 * Texto de un campo bilingüe en el idioma pedido. Si el inglés falta o está
 * vacío, devuelve el español. Devuelve `undefined` si no hay texto: así el
 * componente puede no renderizar la sección o el campo.
 */
export function t(field: LocaleValue | null | undefined, lang: Locale): string | undefined {
  const value = field?.[lang]?.trim() || field?.es?.trim();
  return value || undefined;
}

/** Divide un texto largo en párrafos (una o más líneas en blanco o saltos de línea). */
export function paragraphs(text: string | undefined): string[] {
  return text ? text.split(/\n\s*\n|\n/).map((p) => p.trim()).filter(Boolean) : [];
}
