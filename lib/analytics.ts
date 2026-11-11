/**
 * Origen de cada CTA de WhatsApp para el evento `whatsapp_click` de GA4.
 * Cada enlace lleva `data-wa-origin` (y `data-wa-tour` con el slug si es de
 * un tour); <WhatsAppTracker> los lee al hacer clic.
 */
export type WhatsAppOrigin =
  | "hero" // portada del detalle de tour
  | "detalle-sidebar"
  | "detalle-barra-movil"
  | "detalle-precios"
  | "detalle-itinerario"
  | "detalle-cta-final"
  | "tour-personalizado"
  | "contacto"
  | "cta-final" // CTA final de la home
  | "flotante" // botón flotante (home y galería, móvil)
  | "menu"; // menú móvil

export const WA_EVENT = "whatsapp_click";

/** Atributos de seguimiento para un enlace de WhatsApp. */
export function waTracking(origin: WhatsAppOrigin, tourSlug?: string) {
  return {
    "data-wa-origin": origin,
    ...(tourSlug && { "data-wa-tour": tourSlug }),
  };
}
