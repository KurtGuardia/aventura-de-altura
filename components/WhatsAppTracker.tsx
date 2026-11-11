"use client";

import { sendGAEvent } from "@next/third-parties/google";
import { useEffect } from "react";
import { WA_EVENT } from "@/lib/analytics";

/**
 * Envía `whatsapp_click` a GA4 al pulsar cualquier enlace de WhatsApp, con su
 * origen (`data-wa-origin`) y el slug del tour (`data-wa-tour`) si aplica.
 * Un solo listener delegado: los CTA siguen siendo componentes de servidor.
 */
export function WhatsAppTracker() {
  useEffect(() => {
    const onClick = (event: MouseEvent) => {
      const link = (event.target as Element | null)?.closest?.<HTMLAnchorElement>('a[href^="https://wa.me/"]');
      if (!link) return;
      const { waOrigin, waTour } = link.dataset;
      sendGAEvent("event", WA_EVENT, {
        origin: waOrigin ?? "otro",
        ...(waTour && { tour_slug: waTour }),
      });
    };
    // Captura: se registra aunque otro manejador detenga la propagación.
    document.addEventListener("click", onClick, { capture: true });
    return () => document.removeEventListener("click", onClick, { capture: true });
  }, []);

  return null;
}
