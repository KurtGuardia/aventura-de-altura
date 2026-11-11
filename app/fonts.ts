import { Anton, IBM_Plex_Mono, Manrope } from "next/font/google";

// Display condensada para títulos enormes, sans legible para el texto y mono
// para datos (altitudes, precios, etiquetas). Las usan el layout de [lang] y
// global-error, que renderiza su propio documento.
const anton = Anton({
  variable: "--font-anton",
  weight: "400",
  subsets: ["latin"],
});

const manrope = Manrope({
  variable: "--font-manrope",
  subsets: ["latin"],
});

const plexMono = IBM_Plex_Mono({
  variable: "--font-plex-mono",
  weight: ["400", "500"],
  subsets: ["latin"],
});

/** Clases de `<html>` con las variables de las tres fuentes. */
export const fontVariables = `${anton.variable} ${manrope.variable} ${plexMono.variable}`;
