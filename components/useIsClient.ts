"use client";

import { useSyncExternalStore } from "react";

const noop = () => () => {};

/** `true` solo en el cliente tras hidratar (para portales a document.body). */
export function useIsClient(): boolean {
  return useSyncExternalStore(
    noop,
    () => true,
    () => false,
  );
}
