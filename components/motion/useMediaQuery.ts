"use client";

import { useCallback, useSyncExternalStore } from "react";

/**
 * Estado de una media query. En el servidor y durante la hidratación devuelve
 * `serverValue`, así el HTML del servidor y el primer render del cliente
 * coinciden; justo después toma el valor real.
 */
export function useMediaQuery(query: string, serverValue = false): boolean {
  const subscribe = useCallback(
    (onChange: () => void) => {
      const mql = window.matchMedia(query);
      mql.addEventListener("change", onChange);
      return () => mql.removeEventListener("change", onChange);
    },
    [query],
  );
  return useSyncExternalStore(
    subscribe,
    () => window.matchMedia(query).matches,
    () => serverValue,
  );
}
