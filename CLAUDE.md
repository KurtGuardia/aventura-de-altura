# CLAUDE.md — Aventura de Altura

Sitio web para **Aventura de Altura**, operadora de turismo de aventura en Cochabamba, Bolivia.
El cliente **no es técnico**: todo el contenido se edita desde Sanity Studio (`/studio`).
Proyecto paralelo con alcance cerrado. Prioriza soluciones simples, mantenibles y rápidas de construir.

## Stack
- Next.js (App Router) + TypeScript (strict) + Tailwind CSS
- Sanity (plan Free), con Studio embebido en `/studio` y `next-sanity`
- Hosting en Netlify. **No usar Vercel** (el plan Hobby prohíbe el uso comercial).
- Actualización: páginas estáticas + revalidación on-demand (webhook de Sanity → `app/api/revalidate/route.ts` → `revalidatePath`)

## Rutas
| Ruta | Contenido |
|---|---|
| `/[lang]` | Home (landing), `lang` = `es` \| `en` |
| `/[lang]/tours/[slug]` | Detalle de tour (`generateStaticParams` + `generateMetadata` desde Sanity) |
| `/studio` | Sanity Studio (fuera de `[lang]`) |
| `/` | Redirige a `/es` (o `/en` según Accept-Language) |

## i18n
- **Contenido editable** (Sanity): campos por idioma `{ es, en }` dentro del mismo documento. El español es obligatorio; el inglés es opcional y, si falta, se muestra el español como respaldo.
- **Textos fijos de UI** (botones, labels): `dictionaries/es.json` y `dictionaries/en.json`, cargados con `getDictionary(lang)` de `lib/i18n.ts`.
- **Traducción**: botón en el Studio que traduce ES → EN con la API de DeepL (plan gratuito) y **guarda** el resultado en Sanity. Nunca traducir en el navegador ni en tiempo de ejecución (SEO).
- `hreflang` ES/EN en todas las páginas.

## Home (orden de secciones)
1. Hero: "Descubre Bolivia. Vive la aventura." + CTA hacia los tours
2. Tours destacados (tarjetas con foto, duración, tipo y "desde USD X", enlazadas a `/tours/[slug]`)
3. Seguridad y calidad (el diferenciador principal)
4. Por qué elegirnos
5. Nosotros
6. Testimonios
7. Galería (grid + lightbox)
8. Contacto (WhatsApp, correo, idiomas, política de reserva)

## Página de tour (orden)
Portada → Datos rápidos (duración, dificultad, altitud, salida, idiomas) → Lo mejor del tour → Descripción → Itinerario → Incluye / No incluye → Requisitos y qué llevar → Precios → Galería → Notas → Otros tours.
CTA "Consultar disponibilidad" por WhatsApp, **fijo en móvil**, con el mensaje prellenado con el nombre del tour.

## Modelo de datos (Sanity)
Documentos: `tour`, `siteSettings` (singleton: contacto, WhatsApp, textos de la home), `testimonial`, `galleryImage`.

`tour`:
- `title` (loc), `slug`, `category`, `tagline` (loc, máx. 90 caracteres), `coverImage` (con alt)
- `quickFacts`: `difficulty` (baja | media | alta), `altitude?`, `departureCity`, `languages`
- `highlights[]`: `title` (loc), `text` (loc), `image`, entre 3 y 5
- `description` (loc, máx. ~60 palabras)
- `options[]` (normalmente 1; Toro Toro tiene 3): `label` (loc), `durationDays`, `nights`, `lodging?`, `itinerary[]` (`day`, `items[]` { `time?`, `text` (loc) }), `prices` { `p1`, `p2`, `p3`, `p4`, `p5plus` } en USD por persona
- `includes[]` (loc), `excludes[]` (loc), `requirements[]` (loc), `notes?` (loc), `gallery[]`
- `featured` (boolean), `order` (number)

Reglas:
- "Desde USD X" = mínimo de `p5plus` entre las opciones con precio, **calculado en el código**.
- Campos opcionales vacíos → **la sección no se renderiza** (nunca mostrar huecos ni "pendiente").
- Usar `validation.warning` (no `error`) para marcar en el Studio lo que falta completar en cada tour.
- Etiquetas y descripciones del Studio en español claro, pensadas para un usuario no técnico.

## Prioridades
- Mobile-first, carga rápida (`next/image` con imágenes de Sanity), Core Web Vitals.
- WhatsApp siempre visible en móvil.
- Precios transparentes: "desde", qué incluye y qué no.
- SEO: metadata y Open Graph por página, `sitemap.ts`, `robots.ts`, `hreflang`. Analytics + Search Console.

## Identidad visual
Aventura premium, fotos reales y grandes. Paleta: verde profundo (naturaleza), arena/beige (calidez), azul oscuro (seguridad), blanco (lectura). Nada de efectos excesivos ni párrafos largos.

## Contacto
- WhatsApp: +591 76922077 / +591 68500428
- Facebook: https://www.facebook.com/AventuraDeAlturaBolivia
- Idiomas de atención: ES / EN; francés, alemán y portugués con traductor (USD 50 por grupo)

## Reglas de trabajo
- **No inventar datos** (precios, horarios, requisitos, dificultad). Si faltan, dejar el campo vacío y avisar.
- La fuente de verdad del contenido es `02-tours.md` (extraído de los Canva del cliente).
- **Fuera de alcance**: reservas, pagos, CRM, páginas por destino, blog. Si algo lo excede, avisar antes de implementarlo.
- Sin dependencias innecesarias. Componentes de servidor por defecto; `"use client"` solo donde haga falta (lightbox, menú móvil).
- Antes de dar algo por terminado: `npm run build` debe pasar sin errores.
- Registrar las decisiones relevantes en `04-decisiones.md`.

## Comandos
- `npm run dev` → http://localhost:3000 (Studio en `/studio`)
- `npm run build` → verificación antes de cada push
- Variables de entorno: `NEXT_PUBLIC_SANITY_PROJECT_ID`, `NEXT_PUBLIC_SANITY_DATASET`, `SANITY_REVALIDATE_SECRET`, `DEEPL_API_KEY`
