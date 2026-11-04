# 04 · Decisiones

## 2026-11-03 · Rutas i18n

- `cacheComponents` está activo: `generateStaticParams` no puede devolver `[]`. Mientras los slugs no vengan de Sanity, la página de tour usa un slug `__placeholder__` que responde 404.
- Se quitó `export const dynamic = 'force-static'` del Studio (incompatible con `cacheComponents`).
- Redirección de idioma en `proxy.ts` (Next 16) sin librerías; lee `Accept-Language`.

## 2026-11-03 · Esquemas de Sanity

- **Precios:** objeto fijo `{ p1, p2, p3, p4, p5plus }` en USD por persona, dentro de cada opción del tour (no tramos `minPax/maxPax` como proponía `02-tours.md`). Cada precio es opcional; si falta alguno se muestra un aviso (warning) en el Studio. Ejemplo: el City Tour solo tiene precio para 3 personas.
- **Variantes de duración:** `options[]` (Toro Toro tiene 3); cada opción lleva su itinerario y sus precios.
- **Descripción:** `localeText` (texto plano, ~400 caracteres), no Portable Text, para mantenerla corta.
- **Imágenes:** tipo reutilizable `imageWithAlt` (hotspot + `alt` en ES/EN) para portada, destacados, galerías y secciones de ajustes.
- **Validación:** solo son errores (bloquean publicar) el nombre del tour, el slug, el texto en español de los campos bilingües y el límite de 90 caracteres de la frase corta. Lo demás (dificultad, requisitos, no incluye, precios, 3–5 destacados, ~400 caracteres de la descripción) son avisos.
- **Singleton `siteSettings`:** ID fijo `siteSettings`; se oculta de "crear nuevo" y solo admite publicar, descartar y restaurar.
- **Idiomas del tour:** lista fija (es, en, fr, de, pt); fr/de/pt se marcan "con traductor".
