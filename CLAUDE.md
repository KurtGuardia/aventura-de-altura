# CLAUDE.md — Aventura de Altura

Sitio web para **Aventura de Altura**, operadora de turismo de aventura en Cochabamba, Bolivia.
El cliente **no es técnico**: todo el contenido se edita desde Sanity Studio (`/studio`).
Proyecto paralelo con alcance cerrado. Prioriza soluciones simples, mantenibles y rápidas de construir.

## Stack
- Next.js (App Router) + TypeScript (strict) + Tailwind CSS
- Sanity (plan Free), con Studio embebido en `/studio` y `next-sanity`
- Hosting en Netlify. **No usar Vercel** (el plan Hobby prohíbe el uso comercial).
- Actualización: páginas estáticas + revalidación on-demand (webhook de Sanity → `app/api/revalidate/route.ts` → `revalidateTag` por `_type`, con `{ expire: 0 }`). Configuración del webhook en `docs/05-despliegue.md`.

## Rutas
| Ruta | Contenido |
|---|---|
| `/[lang]` | Home (landing), `lang` = `es` \| `en` |
| `/[lang]/tours/[slug]` | Detalle de tour (`generateStaticParams` + `generateMetadata` desde Sanity) |
| `/[lang]/galeria` | Galería completa (todas las fotos, lazy loading nativo, lightbox) |
| `/studio` | Sanity Studio (fuera de `[lang]`) |
| `/` | Redirige a `/es` (o `/en` según Accept-Language) |
| `/sitemap.xml`, `/robots.txt` | `app/sitemap.ts` (home, galería y tours × ES/EN con hreflang) y `app/robots.ts` (todo salvo `/studio` y `/api/`) |

Idiomas no soportados (ej. `/fr`) y rutas inexistentes → 404 del sitio (`app/[lang]/not-found.tsx`, ES/EN, con header y footer; `app/[lang]/[...rest]` atrapa el resto). Con un idioma no válido el layout se pinta en `es` y es la **página** la que llama a `notFound()` (si lo hiciera el layout raíz, saldría la 404 genérica de Next). Errores: `app/[lang]/error.tsx` y `app/global-error.tsx`. `not-found`/`error` no reciben `params`: el layout les pasa los textos con `StatusTextsProvider` (`components/StatusPage.tsx`).

## i18n
- **Contenido editable** (Sanity): campos por idioma `{ es, en }` dentro del mismo documento. El español es obligatorio; el inglés es opcional y, si falta, se muestra el español como respaldo.
- **Textos fijos de UI** (botones, labels): `dictionaries/es.json` y `dictionaries/en.json`, cargados con `getDictionary(lang)` de `lib/i18n.ts`.
- **Traducción**: botón "Traducir al inglés" en el Studio (API de DeepL, plan gratuito). Tras pedir confirmación, **sobrescribe todo el EN** del documento con la traducción del ES y lo **guarda** en Sanity. Nunca traducir en el navegador ni en tiempo de ejecución (SEO).
- `hreflang` ES/EN en todas las páginas.

## Home (orden de secciones)
Ritmo oscuro/claro: cada sección tiene su fondo fijo (entre paréntesis).
1. Hero (oscuro): "Descubre Bolivia. Vive la aventura." con la última palabra rotativa (`heroRotatingWords`, editable en el Studio) + CTA hacia los tours + "¿Sabías que?" con los datos curiosos (`funFacts`) alternándose. Slideshow con `heroImage` + portadas de los tours destacados.
2. Tours destacados (claro): tarjetas con foto, duración, tipo y "desde USD X", enlazadas a `/tours/[slug]`
3. Bolivia en cifras (oscuro): 6 celdas con los datos curiosos (`funFacts`) que se turnan (una cada 2,6 s, a veces dos, con una bocanada de humo blanco en canvas, `SmokeBurst`; nunca dos del mismo lugar a la vez). Lista completa en `sr-only`.
4. Tour personalizado (foto a sangre): "Arma tu propio tour por Bolivia" + CTA "Arma tu tour" a WhatsApp
5. Seguridad y calidad (oscuro, el diferenciador principal)
6. Por qué elegirnos (claro): carrusel automático sin botones
7. Nosotros (beige): curvas de nivel, sello-brújula con el logo que gira con el scroll, coordenadas y nota de Google
8. Testimonios (claro): reseñas de Google curadas a mano + calificación y nº de reseñas
9. Galería (claro): vista previa de 6 fotos + "Ver galería" al final (→ `/[lang]/galeria`)
10. CTA final (foto oscura, `heroImage`): "¿Listo para tu próxima aventura?"
11. Contacto (oscuro): WhatsApp, correo, idiomas, política de reserva

## Página de tour (orden)
`app/[lang]/tours/[slug]/page.tsx` + `components/tours/detail/*`. Datos: `TOUR_PAGE_QUERY` (tour + hasta 3 otros) vía `getTourPage(slug)` con tags `tour`, `tour:<slug>` y `tourCategory`; la vista por idioma sale de `toTourDetailView()` (`lib/tour-detail.ts`).
Ritmo: Portada (oscuro, ~85svh, parallax, migas de pan, CTA + "desde") → Datos rápidos (claro; duración, dificultad, altitud con `CountUp`, salida, idiomas) → Lo mejor del tour (oscuro; escritorio: lista + foto sticky en crossfade; móvil: carrusel embla; sin foto propia usa la portada) → bloque claro a 2 columnas con tarjeta lateral sticky: Descripción + Notas → Opciones (tabs, solo si hay >1) + Itinerario (ruta que se dibuja con el scroll; acordeón en móvil; sin itinerario → aviso con CTA) → Incluye / No incluye → Requisitos (tarjeta oscura) → Precios (tabla por tramo + mejor precio + calculadora 1–10) → Galería (arena, `Gallery` mosaico sin chip de tour) → CTA final (`FinalCta` con `title`/`actions`) → Otros tours (`TourCard`).
- **Estado compartido** (`TourBookingProvider`): opción elegida en la URL (`?opcion=1-dia|2-dias|…`, igual en ES/EN; el selector de idioma conserva la query) y nº de personas de la calculadora. Todos los CTA usan `BookingWhatsAppLink`, con el mensaje de `dict.whatsapp.tour` + opción (si hay varias) + personas (si se usó la calculadora).
- **CTA móvil/tablet** (<1024px): barra fija inferior (`TourMobileBar`) tras pasar la portada, con safe-area; reemplaza a `WhatsAppFloat` (no se incluye en esta página). Escritorio: `TourStickyCard`.
- **View Transition:** la portada usa `<ViewTransition name={tourImageTransitionName(slug)} share="tour-morph" default="none">` como `TourCard`. `TourCard` usa `prefetch` para que el detalle llegue en el mismo commit de la navegación (con Partial Prefetching un enlace normal solo trae el App Shell y no habría morph).
- **SEO:** metadata por idioma (`Nombre · Aventura de Altura`, tagline o descripción, OG con la portada, canonical y hreflang) y JSON-LD `TouristTrip` (`tourJsonLd` en `lib/seo.ts`, oferta "desde" como `AggregateOffer` en USD).
- **Itinerario:** la primera opción del array es la de por defecto (sin `?opcion=`). El slug de la opción sale de la duración (`4-horas`, `1-dia`, `2-dias`; `opcion-N` si se repite). Varios días: "Día N · {title}" (acordeón en móvil). Un solo día: sin encabezado, directamente la línea de tiempo con un punto por actividad.

## SEO, analytics y despliegue
- `metadataBase` = `siteUrl` (`lib/site.ts`: `NEXT_PUBLIC_SITE_URL` → `URL` de Netlify → localhost). Se fija en el build.
- Open Graph por defecto: `public/og-default.jpg` (logo sobre azul noche), vía `pageMetadata` cuando la página no tiene foto. No usar `opengraph-image.*` por archivo: pisaría la portada de cada tour.
- Íconos: `app/favicon.ico`, `app/icon.png`, `app/apple-icon.png` (del logo).
- JSON-LD `TravelAgency` en la home (`organizationJsonLd`), con los datos de contacto de `siteSettings`.
- GA4 con `@next/third-parties`, solo si existe `NEXT_PUBLIC_GA_ID`. Evento `whatsapp_click` (`origin`, `tour_slug`): todo enlace a WhatsApp lleva `waTracking(origin, slug?)` de `lib/analytics.ts` (`data-wa-origin`/`data-wa-tour`) y `WhatsAppTracker` escucha los clics. `BookingWhatsAppLink` exige `origin`. Un CTA nuevo de WhatsApp debe llevar su origen.
- Cabeceras de seguridad en `next.config.ts` (`nosniff`, `Referrer-Policy`, `frame-ancestors 'self'`).
- Netlify: runtime de Next sin `netlify.toml`. Variables y pasos manuales en `docs/05-despliegue.md`.

## UI y movimiento
Dirección: "revista de expedición" — fotos enormes, tipografía protagonista, ritmo oscuro/claro y movimiento con propósito (guiar hacia un tour o un CTA).

- **Tokens** (`app/globals.css`, `@theme`): colores `forest`, `sand`, `navy` (azul noche casi negro), `cream` (blanco cálido), `ember` (acento de CTAs, siempre con texto `navy-950`). Tipos `text-display-hero|xl|lg|md`, utilidades `label-mono` y `grain`, espaciados `py-section` y `px-gutter`, `rounded-card`, `shadow-card|float`, `ease-cinematic`. Las secciones oscuras llevan `tone-dark` (texto claro y anillo de foco `ember`). Variante `can-hover:` = solo ratón.
- **Fuentes** (`next/font`): Anton (display, siempre en mayúsculas), Manrope (texto), IBM Plex Mono (datos: altitudes, precios, etiquetas).
- **Tokens de JS** en `lib/motion.ts` (`EASE`, `DURATION`, `STAGGER`, breakpoints). Duplican los de CSS: cambiar ambos.
- **Primitivas** (`components/motion/`, únicas con `"use client"` además de las piezas interactivas): `Reveal`, `Stagger`/`StaggerItem`, `SplitText`, `WordRotator`, `CountUp`, `ParallaxImage`, `MaskReveal`, `MagneticButton` (se inclina siempre hacia el cursor, máx. 6 px), `SmoothScroll` (Lenis). Usar siempre `m.*` (LazyMotion estricto), nunca `motion.*`.
- **Títulos accesibles**: una sola versión legible por heading. `SplitText` pone el texto en el `aria-label` del heading (en un `<p>`, `sr-only`) y todas las copias visuales van con `aria-hidden`; los marcadores decorativos dentro de headings (p. ej. el "01" del itinerario), también. `CountUp` termina siempre en el valor exacto (`onComplete`, limpieza y temporizador de respaldo).
- **Menos movimiento**: `useReducedMotion()` (`components/motion/useReducedMotion.ts`) es la única fuente; las primitivas renderizan el estado final. Antes de hidratar, el CSS muestra todo lo marcado con `data-reveal`. Sin parallax, Ken Burns, autoplay de carruseles, pin ni Lenis.
- **Imágenes**: siempre `components/SanityImage.tsx` (next/image + hotspot + LQIP de Sanity). Regla de hover: en tarjetas y galería la imagen reposa a `scale(1.05)` y pasa a 1 en hover → prop `zoom` en la imagen + clase `zoom-trigger` en el contenedor que recibe el hover (con `overflow-hidden`). Sin efecto en táctil.
- **Rendimiento**: animar solo `transform` y `opacity` (excepción: el humo de `SmokeBurst`, un canvas 2D que solo dibuja ~2 s por cambio). GSAP (solo pin horizontal de tours, ≥1024px) y Lenis se importan dinámicamente. La primera foto del hero va con `priority`; el resto del slideshow se monta en idle.
- **Overlays** (menú móvil, lightbox): portal a `body`, `useFocusTrap` y `lockScroll` (`components/motion/lenis.ts`).

## Modelo de datos (Sanity)
Documentos:
- `tour` (ver abajo) y `tourCategory` (tipos de tour, editables por el cliente).
- `siteSettings` (singleton): contacto, WhatsApp, Facebook e Instagram, `exchangeRate?` (USD → Bs, manual), textos de la home (Nosotros con una foto `about.image`), palabras rotativas del título (`heroRotatingWords[]`, localeString), datos curiosos de Bolivia (`funFacts[]`: `value`, `unit?`, `place`, `text`, todos loc salvo `value`), sección Tour personalizado (`customTour`: título, texto, imagen, texto del botón) y reseñas de Google (`googleRating`, `googleReviewCount`, `googleReviewsUrl`, manuales).
- `testimonial`: `name`, `country?`, `rating` (1–5), `text` (loc), `date?`, `sourceUrl?`, `order`.
- `gallery` (singleton): `images[]` → `image` (hotspot), `alt?` (loc), `tour?` (referencia a `tour`).

`tour`:
- `title` (loc), `slug`, `categories[]` (referencias a `tourCategory`, uno o varios), `tagline` (loc, máx. 90 caracteres), `coverImage` (con alt)
- `quickFacts`: `difficulty` (baja | media | alta), `altitude?`, `departureCity`, `languages`
- `highlights[]`: `title` (loc), `text` (loc), `image`, entre 3 y 5
- `description` (loc, máx. ~60 palabras)
- `options[]` (normalmente 1; Toro Toro tiene 3, la primera "2 días / 1 noche"): `label` (loc), `duration` { `value` (número, admite 1 decimal), `unit`: `horas` \| `dias` }, `nights`, `lodging?`, `itinerary[]` (`day`, `title?` (loc, ej. "Cochabamba → Toro Toro"), `items[]` { `time?` (texto libre: "08:00", "~12:30", "Por la tarde"), `text` (loc) }), `prices` { `p1`, `p2`, `p3`, `p4`, `p5plus` } en USD por persona. El orden del array importa: la primera opción es la que se muestra al entrar.
- Duración en la web (`durationLabel`/`formatDuration` de `lib/price.ts`): "4 horas", "1 día", "1–3 días" (misma unidad, plural según el máximo) o "4 horas – 2 días"; unidades y plurales en `dict.labels.units`.
- `includes[]` (loc), `excludes[]` (loc), `requirements[]` (loc), `notes?` (loc), `gallery[]`
- `featured` (boolean), `order` (number)

Reglas:
- "Desde USD X" = mínimo de **todos** los precios por persona disponibles (`p1`–`p5plus`) en todas las opciones, ignorando los vacíos, **calculado en el código**. Si el tour no tiene ningún precio, no se muestra.
- Precios solo en USD. Si existe `exchangeRate`, `/es` muestra además "≈ Bs X".
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
- Idiomas de atención: ES / EN. **No** se ofrecen otros idiomas ni servicio de traductor.

## Reglas de trabajo
- **No inventar datos** (precios, horarios, requisitos, dificultad). Si faltan, dejar el campo vacío y avisar.
- La fuente de verdad del contenido es `docs/02-tours.md` (extraído de los Canva del cliente).
- **No re-ejecutar los scripts de seed** (`scripts/seed*.ts`) una vez que el cliente haya editado contenido en el Studio: sobrescriben sus cambios. Para corregir datos reales, usar patches puntuales.
- **Fuera de alcance**: reservas, pagos, CRM, páginas por destino, blog. Si algo lo excede, avisar antes de implementarlo.
- Sin dependencias innecesarias. Componentes de servidor por defecto; `"use client"` solo donde haga falta (lightbox, menú móvil).
- Antes de dar algo por terminado: `npm run build` debe pasar sin errores.
- Registrar las decisiones relevantes en `docs/04-decisiones.md` (fecha, decisión, motivo, alternativas descartadas).

## Comandos
- `npm run dev` → http://localhost:3000 (Studio en `/studio`)
- `npm run build` → verificación antes de cada push
- Variables de entorno (ver `.env.example`): `NEXT_PUBLIC_SITE_URL`, `NEXT_PUBLIC_SANITY_PROJECT_ID`, `NEXT_PUBLIC_SANITY_DATASET`, `SANITY_REVALIDATE_SECRET`, `NEXT_PUBLIC_GA_ID` (opcional), `DEEPL_API_KEY`. `SANITY_API_WRITE_TOKEN` solo en `.env.local` para los scripts de seed/migración, **nunca** en Netlify.
- Patches puntuales de datos: scripts idempotentes con modo prueba (ej. `npx tsx scripts/migrate-duration.ts [--apply]`).
