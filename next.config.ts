import type { NextConfig } from "next";

/**
 * Cabeceras de seguridad básicas para todo el sitio (Studio incluido):
 * - frame-ancestors 'self' (y X-Frame-Options para navegadores antiguos): nadie
 *   puede incrustar el sitio en un iframe ajeno; el propio dominio sí (el
 *   Studio podría previsualizar páginas). No es una CSP completa: no limita
 *   scripts ni estilos, así que no afecta al Studio, a GA ni a Sanity.
 */
const securityHeaders = [
  { key: "X-Content-Type-Options", value: "nosniff" },
  { key: "Referrer-Policy", value: "strict-origin-when-cross-origin" },
  { key: "Content-Security-Policy", value: "frame-ancestors 'self'" },
  { key: "X-Frame-Options", value: "SAMEORIGIN" },
];

const nextConfig: NextConfig = {
  async headers() {
    return [{ source: "/:path*", headers: securityHeaders }];
  },
  cacheComponents: true,
  partialPrefetching: true,
  turbopack: {
    rules: {
      "*.css": {
        loaders: ["@tailwindcss/turbopack"],
        as: "*.css",
      },
    },
  },
};

export default nextConfig;
