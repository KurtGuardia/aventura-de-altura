"use client";

import { useSyncExternalStore } from "react";

/** Evento que se emite tras cambiar la query con `history.replaceState`. */
const SEARCH_CHANGE = "locationsearchchange";

function subscribe(onChange: () => void) {
  window.addEventListener("popstate", onChange);
  window.addEventListener(SEARCH_CHANGE, onChange);
  return () => {
    window.removeEventListener("popstate", onChange);
    window.removeEventListener(SEARCH_CHANGE, onChange);
  };
}

/**
 * Query actual de la URL ("?opcion=2-dias" o ""). En el servidor y durante la
 * hidratación devuelve "": así la página sigue siendo estática (sin
 * `useSearchParams`, que obligaría a renderizar en el cliente detrás de un
 * Suspense) y justo después toma el valor real.
 */
export function useLocationSearch(): string {
  return useSyncExternalStore(
    subscribe,
    () => window.location.search,
    () => "",
  );
}

/**
 * Cambia un parámetro de la query sin navegar ni añadir una entrada al
 * historial (`null` lo quita) y avisa a `useLocationSearch`.
 */
export function setSearchParam(name: string, value: string | null) {
  const url = new URL(window.location.href);
  if (value === null) url.searchParams.delete(name);
  else url.searchParams.set(name, value);
  // Next.js integra replaceState con su router (no recarga la página).
  window.history.replaceState(null, "", `${url.pathname}${url.search}${url.hash}`);
  window.dispatchEvent(new Event(SEARCH_CHANGE));
}
