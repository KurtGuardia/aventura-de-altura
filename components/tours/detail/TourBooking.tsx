"use client";

import { createContext, useContext, useState, type ReactNode } from "react";
import { setSearchParam, useLocationSearch } from "@/components/useLocationSearch";
import { whatsappHref } from "@/lib/site";
import { tourWhatsAppMessage, type WhatsAppTemplates } from "@/lib/tour-detail";

/** Parámetro de la URL con la opción elegida (`?opcion=2-dias`). */
export const OPTION_PARAM = "opcion";

type BookingOption = { slug: string; label: string };

type Booking = {
  options: BookingOption[];
  /** Índice de la opción elegida (0 si la URL no indica otra). */
  selected: number;
  select: (index: number) => void;
  /** Personas elegidas en la calculadora; `null` si no se ha usado. */
  people: number | null;
  setPeople: (people: number) => void;
  /** Enlace de WhatsApp con el mensaje según la opción y las personas. */
  whatsapp: string | null;
};

const BookingContext = createContext<Booking | null>(null);

/**
 * Estado compartido de la página de tour: opción elegida (guardada en la URL
 * para poder compartirla) y nº de personas de la calculadora. Lo leen el
 * selector de opciones, el itinerario, los precios y todos los CTA de
 * WhatsApp (hero, tarjeta lateral, barra móvil y CTA final), que así envían
 * siempre el mismo mensaje.
 */
export function TourBookingProvider({
  tourTitle,
  phone,
  templates,
  options,
  children,
}: {
  tourTitle: string;
  phone: string | null | undefined;
  templates: WhatsAppTemplates;
  options: BookingOption[];
  children: ReactNode;
}) {
  const search = useLocationSearch();
  const [people, setPeople] = useState<number | null>(null);

  const fromUrl = new URLSearchParams(search).get(OPTION_PARAM);
  const index = options.findIndex((o) => o.slug === fromUrl);
  const selected = index >= 0 ? index : 0;

  const select = (i: number) => {
    const option = options[i];
    if (option) setSearchParam(OPTION_PARAM, option.slug);
  };

  // La opción solo va en el mensaje si el tour tiene varias.
  const message = tourWhatsAppMessage(templates, {
    tour: tourTitle,
    option: options.length > 1 ? options[selected]?.label : undefined,
    people,
  });

  return (
    <BookingContext.Provider
      value={{ options, selected, select, people, setPeople, whatsapp: whatsappHref(phone, message) }}
    >
      {children}
    </BookingContext.Provider>
  );
}

export function useTourBooking(): Booking {
  const booking = useContext(BookingContext);
  if (!booking) throw new Error("useTourBooking debe usarse dentro de <TourBookingProvider>.");
  return booking;
}

/**
 * Enlace de WhatsApp con el mensaje del tour. No se renderiza si el sitio no
 * tiene número de WhatsApp.
 */
export function BookingWhatsAppLink({
  className,
  children,
  ariaLabel,
}: {
  className?: string;
  children: ReactNode;
  ariaLabel?: string;
}) {
  const { whatsapp } = useTourBooking();
  if (!whatsapp) return null;
  return (
    <a href={whatsapp} target="_blank" rel="noopener noreferrer" aria-label={ariaLabel} className={className}>
      {children}
    </a>
  );
}
