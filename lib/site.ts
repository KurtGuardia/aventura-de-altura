/**
 * URL pública del sitio, para canonical, hreflang y Open Graph.
 * Netlify define `URL` en el build; `NEXT_PUBLIC_SITE_URL` permite fijar el
 * dominio definitivo.
 */
export const siteUrl = (
  process.env.NEXT_PUBLIC_SITE_URL || process.env.URL || "http://localhost:3000"
).replace(/\/$/, "");

export const siteName = "Aventura de Altura";

/** Enlace de WhatsApp (wa.me) con el mensaje prellenado. */
export function whatsappHref(phone: string | null | undefined, message?: string): string | null {
  const digits = phone?.replace(/\D/g, "");
  if (!digits) return null;
  return `https://wa.me/${digits}${message ? `?text=${encodeURIComponent(message)}` : ""}`;
}
