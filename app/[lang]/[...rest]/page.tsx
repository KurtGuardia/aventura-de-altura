import { notFound } from "next/navigation";

/**
 * Cualquier ruta inexistente bajo /es o /en (por ejemplo /es/xyz) muestra la
 * 404 del sitio, con header, footer y en su idioma (app/[lang]/not-found.tsx).
 */
export default function CatchAll() {
  notFound();
}
