import type { NextConfig } from "next";

/**
 * Cabeceras de seguridad básicas para todo el sitio (Studio incluido):
 * - frame-ancestors 'self' (y X-Frame-Options para navegadores antiguos): nadie
 *   puede incrustar el sitio en un iframe ajeno; el propio dominio sí (el
 *   Studio podría previsualizar páginas). No es una CSP completa: no limita
 *   scripts ni estilos, así que no afecta al Studio, a GA ni a Sanity.
 */
const baseHeaders = [
  { key: "X-Content-Type-Options", value: "nosniff" },
  { key: "Referrer-Policy", value: "strict-origin-when-cross-origin" },
];

const securityHeaders = [
  ...baseHeaders,
  { key: "Content-Security-Policy", value: "frame-ancestors 'self'" },
  { key: "X-Frame-Options", value: "SAMEORIGIN" },
];

/**
 * El Studio (/studio) se abre también desde el Dashboard de sanity.io, que lo
 * carga en un iframe: ahí se permite sanity.io como ancestro (sin
 * X-Frame-Options, que no admite listas y lo bloquearía).
 */
const studioHeaders = [
  ...baseHeaders,
  {
    key: "Content-Security-Policy",
    value: "frame-ancestors 'self' https://sanity.io https://*.sanity.io",
  },
];

const nextConfig: NextConfig = {
  async headers() {
    return [
      { source: "/((?!studio).*)", headers: securityHeaders },
      { source: "/studio", headers: studioHeaders },
      { source: "/studio/:path*", headers: studioHeaders },
    ];
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
