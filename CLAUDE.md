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
| `/[lang]/galeria` | Galería completa (todas las fotos, lazy loading nativo, lightbox) |
| `/studio` | Sanity Studio (fuera de `[lang]`) |
| `/` | Redirige a `/es` (o `/en` según Accept-Language) |

Idiomas no soportados (ej. `/fr`) → 404.

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
Portada → Datos rápidos (duración, dificultad, altitud, salida, idiomas) → Lo mejor del tour → Descripción → Itinerario → Incluye / No incluye → Requisitos y qué llevar → Precios → Galería → Notas → Otros tours.
CTA "Consultar disponibilidad" por WhatsApp, **fijo en móvil**, con el mensaje prellenado con el nombre del tour.
- **View Transition (pendiente en el detalle):** la foto de la portada debe envolverse en `<ViewTransition name={tourImageTransitionName(slug)} share="tour-morph" default="none">` (de `react` y `lib/tours.ts`), igual que en `TourCard`, para que la foto de la tarjeta se expanda hacia ella. La portada debe renderizarse en el mismo commit que la navegación (no detrás de un fallback de Suspense) o no habrá morph.
- "Otros tours" reutiliza `components/tours/TourCard.tsx` con `toTourCardView()`.

## UI y movimiento
Dirección: "revista de expedición" — fotos enormes, tipografía protagonista, ritmo oscuro/claro y movimiento con propósito (guiar hacia un tour o un CTA).

- **Tokens** (`app/globals.css`, `@theme`): colores `forest`, `sand`, `navy` (azul noche casi negro), `cream` (blanco cálido), `ember` (acento de CTAs, siempre con texto `navy-950`). Tipos `text-display-hero|xl|lg|md`, utilidades `label-mono` y `grain`, espaciados `py-section` y `px-gutter`, `rounded-card`, `shadow-card|float`, `ease-cinematic`. Las secciones oscuras llevan `tone-dark` (texto claro y anillo de foco `ember`). Variante `can-hover:` = solo ratón.
- **Fuentes** (`next/font`): Anton (display, siempre en mayúsculas), Manrope (texto), IBM Plex Mono (datos: altitudes, precios, etiquetas).
- **Tokens de JS** en `lib/motion.ts` (`EASE`, `DURATION`, `STAGGER`, breakpoints). Duplican los de CSS: cambiar ambos.
- **Primitivas** (`components/motion/`, únicas con `"use client"` además de las piezas interactivas): `Reveal`, `Stagger`/`StaggerItem`, `SplitText`, `WordRotator`, `CountUp`, `ParallaxImage`, `MaskReveal`, `MagneticButton` (se inclina siempre hacia el cursor, máx. 6 px), `SmoothScroll` (Lenis). Usar siempre `m.*` (LazyMotion estricto), nunca `motion.*`.
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
- `options[]` (normalmente 1; Toro Toro tiene 3): `label` (loc), `durationDays`, `nights`, `lodging?`, `itinerary[]` (`day`, `items[]` { `time?`, `text` (loc) }), `prices` { `p1`, `p2`, `p3`, `p4`, `p5plus` } en USD por persona
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
- Variables de entorno: `NEXT_PUBLIC_SANITY_PROJECT_ID`, `NEXT_PUBLIC_SANITY_DATASET`, `SANITY_REVALIDATE_SECRET`, `DEEPL_API_KEY`, `SANITY_API_WRITE_TOKEN` (solo scripts de seed)
