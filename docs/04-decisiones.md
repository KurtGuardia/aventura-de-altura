# 04 · Decisiones

Registro de decisiones del proyecto, en orden cronológico. Cada entrada indica la fecha, la decisión, el motivo y las alternativas descartadas.

---

## 2026-10-27 · Hosting en Netlify

- **Decisión:** el sitio se publica en Netlify (plan gratuito).
- **Motivo:** permite uso comercial en el plan gratuito y admite revalidación on-demand, así que los cambios publicados en Sanity se ven sin pasos manuales.
- **Alternativas descartadas:**
  - Vercel Hobby: sus condiciones prohíben el uso comercial.
  - Cloudflare con export estático: exige un *rebuild* completo cada vez que el cliente cambia contenido.

## 2026-10-27 · Página de detalle por tour

- **Decisión:** cada tour tiene su propia página, `/[lang]/tours/[slug]`, incluida en el alcance. Usa una sola plantilla dinámica alimentada desde Sanity.
- **Motivo:** SEO por tour (cada uno compite por sus propias búsquedas) y una URL propia para compartir por WhatsApp o redes. Si el cliente crea un tour nuevo, su página aparece sola.
- **Alternativas descartadas:**
  - Modals sobre la home: Google no indexa cada tour y no hay URL que compartir.
  - Todo el contenido en la home: una sola URL compite por todas las búsquedas.

## 2026-11-03 · i18n: contenido bilingüe con fallback y traducción en el Studio

- **Decisión:**
  - El español es obligatorio y el inglés opcional. Si falta el inglés, la web muestra el español.
  - Los campos bilingües (`localeString`, `localeText`) guardan `{ es, en }` dentro del mismo documento.
  - El Studio tendrá un botón "Traducir al inglés" que usa la API de DeepL (plan Free). Tras pedir confirmación, sobrescribe **todo** el inglés del documento y guarda el resultado en Sanity.
  - Nunca se traduce en tiempo de ejecución.
- **Motivo:**
  - El cliente escribe en español y no tiene por qué dominar el inglés.
  - Guardar la traducción hace que el inglés sea contenido real e indexable (SEO), revisable y editable, sin costo ni latencia por cada visita.
  - La confirmación evita perder por error un inglés corregido a mano.
- **Alternativas descartadas:**
  - Traducir en el navegador o en tiempo de ejecución: Google no indexa ese texto, se paga o se espera en cada visita y el resultado no se puede revisar.
  - Hacer obligatorio el inglés: bloquearía publicar al cliente.

## 2026-11-03 · Rutas i18n sin librerías

- **Decisión:**
  - Rutas `/es` y `/en` bajo `app/[lang]`.
  - `proxy.ts` (el reemplazo de `middleware` en Next 16) redirige `/` y las rutas sin idioma según `Accept-Language`. Por defecto va a `/es`.
  - Textos fijos de UI en `dictionaries/{es,en}.json`, cargados con `getDictionary`.
  - `/studio` queda fuera de `[lang]`, con su propio layout raíz.
- **Motivo:** son solo dos idiomas, y el proyecto evita dependencias innecesarias.
- **Alternativas descartadas:** librerías de i18n (`next-intl` y similares).
- **Consecuencias técnicas:**
  - Como `cacheComponents` está activo, `generateStaticParams` no puede devolver `[]`. Mientras los slugs no vengan de Sanity, la página de tour usa un slug `__placeholder__` que responde 404.
  - Se quitó `export const dynamic = 'force-static'` del Studio, porque es incompatible con `cacheComponents`.

## 2026-11-03 · Precios solo en USD, con tipo de cambio manual opcional

- **Decisión:**
  - Los precios se cargan y muestran en USD por persona.
  - `siteSettings.exchangeRate` es un campo opcional que el cliente completa a mano. Si tiene valor, la versión `/es` muestra además "≈ Bs X".
- **Motivo:** en Bolivia hay diferencia entre el tipo de cambio oficial y el paralelo. Un valor manual permite que el cliente use el que realmente aplica.
- **Alternativas descartadas:** tomar el tipo de cambio de una API, que no refleja la diferencia entre el oficial y el paralelo.

## 2026-11-03 · Modelo de datos del tour

- **Decisión:**
  - **Opciones:** `options[]`, con 1 por defecto (Toro Toro tiene 3: 1, 2 y 3 días). Cada opción lleva su duración, noches, hospedaje, itinerario y precios.
  - **Precios:** grilla fija `{ p1, p2, p3, p4, p5plus }` en USD por persona. Cada precio es opcional; por ejemplo, el City Tour solo tiene `p3`.
  - **"Desde USD X":** es el mínimo de `p5plus` entre las opciones con precio. Se calcula en el código, no se guarda.
  - **Validación:** los datos faltantes se marcan con `validation.warning`, no con `error`. Solo bloquean publicar el nombre, el slug, el español de los campos bilingües y los límites duros, como los 90 caracteres de la frase corta.
  - **Secciones vacías:** no se renderizan. Nunca se muestran huecos ni "pendiente".
  - **Descripción:** `localeText` en texto plano de unos 400 caracteres, no Portable Text, para mantenerla corta.
  - **Imágenes:** tipo reutilizable `imageWithAlt`, con hotspot y `alt` en ES/EN.
- **Motivo:**
  - La grilla fija replica la tabla de precios de los Canva del cliente y es fácil de llenar.
  - Calcular el "desde" evita que quede desactualizado.
  - Los avisos permiten publicar tours incompletos (faltan dificultad, requisitos y precios) sin perder de vista qué falta.
- **Alternativas descartadas:**
  - Tramos `{ minPax, maxPax, pricePerPerson }`, como proponía `02-tours.md`: más flexibles, pero más difíciles de editar para un usuario no técnico.
  - Validación con `error` para todo: impediría publicar con los datos que hay hoy.

## 2026-11-03 · Singleton de ajustes del sitio

- **Decisión:**
  - `siteSettings` tiene un ID fijo y no aparece en "crear nuevo". Solo admite publicar, descartar cambios y restaurar.
  - Incluye `contactLanguages` (idiomas de atención) y `heroCtaLabel` (texto del botón del hero).
- **Motivo:** hay un único conjunto de ajustes; evita que el cliente cree duplicados o lo borre por error.
- **Alternativas descartadas:** un documento normal sin restricciones.

## 2026-11-03 · Sin otros idiomas ni servicio de traductor

- **Decisión:** solo se atiende en español e inglés. No se ofrece francés, alemán ni portugués, ni el traductor de USD 50 por grupo. Los tours solo permiten marcar `es` y `en`.
- **Motivo:** no es un servicio que se quiera ofrecer en la web; los interesados preguntan directamente.
- **Alternativas descartadas:** mostrar los idiomas con traductor que figuraban en el Canva del City Tour y en el briefing.

## 2026-11-03 · Tipos de tour editables y múltiples

- **Decisión:** los tipos de tour son documentos `tourCategory` que el cliente crea en "Tipos de tour", con nombre ES/EN. Cada tour referencia uno o varios (`categories[]`).
- **Motivo:** un tour puede encajar en varios tipos (Pico Tunari es Trekking y Alta montaña), y el cliente debe poder agregar tipos nuevos sin programador.
- **Alternativas descartadas:**
  - Lista fija de una sola opción.
  - Etiquetas libres de texto: no permiten traducir al inglés.

## 2026-11-03 · Edición de textos cortos y URL en el Studio

- **Decisión:**
  - `localeString` usa áreas de texto de 2 líneas, con ES y EN uno debajo del otro. El frontend debe tratar los saltos de línea como espacios.
  - La dirección web (slug) va en la pestaña "Control" y se genera una sola vez con "Generate".
- **Motivo:**
  - En un input de una línea, los textos largos quedaban cortados y no se podían leer sin mover el cursor.
  - El slug no se toca en el día a día, y cambiarlo rompe los enlaces ya compartidos.
- **Alternativas descartadas:**
  - Inputs de una línea en dos columnas.
  - Dejar el slug en la pestaña "Portada".

## 2026-11-03 · Contenido inicial cargado por scripts de seed

- **Decisión:**
  - El contenido inicial se carga con scripts de seed que usan IDs fijos:
    - `scripts/seed.ts`: los 3 tours, los tipos de tour y `siteSettings`.
    - `scripts/seed-gallery.ts`: la galería.
  - **No se vuelven a ejecutar una vez que el cliente empiece a editar.**
  - El cliente completa lo que falta en el Studio, sobre la URL de Netlify, **antes** de conectar el dominio.
- **Motivo:**
  - Carga reproducible del contenido de `02-tours.md` sin teclearlo a mano.
  - `seed.ts` usa `createOrReplace`, así que volver a correrlo borraría los cambios del cliente.
  - Completar el contenido antes de conectar el dominio evita que el sitio público salga con huecos.
- **Alternativas descartadas:**
  - Cargar todo a mano en el Studio.
  - Conectar el dominio primero y completar el contenido después.
- **Precauciones y supuestos:**
  - `seed.ts` **sobrescribe** sus documentos y borra sus borradores. `seed-gallery.ts` no hace nada si la galería ya tiene fotos, salvo que se pase `--force`. Los cambios posteriores sobre datos reales se aplicaron con *patches* puntuales.
  - Las fotos son **provisionales** y varias no son del lugar del tour. Sus textos alternativos describen lo que se ve, no el lugar.
  - Toro Toro de 3 días se cargó con 2 noches, que la fuente no indica. Los precios cargados son los del servicio "Normal". Ambos puntos están pendientes de confirmar con el cliente.
  - El dataset `production` es de lectura pública, así que el frontend no necesita token para leer contenido publicado.

## 2026-11-03 · Sección "Tour personalizado" en la home

- **Decisión:** nueva sección en la home, justo después de "Tours destacados", con un CTA "Arma tu tour" que abre WhatsApp. Los textos, la imagen y el texto del botón se editan en `siteSettings.customTour`.
- **Motivo:** el viaje a medida es parte del posicionamiento (experiencia integral y personalizada). Colocarlo tras los tours destacados capta a quien no encuentra un tour que le encaje.
- **Alternativas descartadas:** no se registraron.

## 2026-11-04 · Galería: singleton, vista previa en la home y página propia

- **Decisión:**
  - **Datos:** `gallery` es un singleton con `images[]` (del orden de decenas de fotos, menos de 100). Los elementos son de tipo `image`, con los campos extra `alt` (opcional) y `tour` (opcional, referencia débil). El orden del array es el orden en la web.
  - **Home:** muestra una vista previa de 6 fotos y un botón "Ver galería".
  - **Página propia:** `/[lang]/galeria` muestra todas las fotos con *lazy loading* nativo. Esto cambia el briefing, que no preveía una página propia para la galería.
  - **Lightbox:** si la foto tiene tour, muestra un botón "Ver tour →". En escritorio, al pasar el ratón aparece un chip enlazado al tour; en móvil, tocar una foto solo abre el lightbox.
- **Motivo:**
  - El cliente arrastra varias fotos a la vez sobre una cuadrícula de miniaturas y las reordena arrastrando.
  - Con decenas de fotos, mostrarlas todas en la home la haría pesada; la vista previa mantiene la home rápida.
  - El enlace al tour convierte la galería en una vía hacia las páginas de tour.
  - En móvil no hay *hover*, y un toque que navegara al tour sería inesperado.
  - La referencia débil evita que una foto impida borrar un tour.
- **Alternativas descartadas:**
  - Un documento `galleryImage` por foto, con un campo `order`: subida de una en una y orden con números.
  - Elementos de tipo objeto que contienen una imagen: no permiten la subida múltiple.
  - La galería completa en la home, como preveía el briefing, sin página propia.

## 2026-11-04 · Testimonios y reseñas de Google curados a mano

- **Decisión:**
  - Los testimonios son reseñas reales de Google, seleccionadas y copiadas a mano en Sanity. Cada uno tiene nombre, país, calificación (1–5), texto ES/EN, fecha, enlace a la reseña original y orden.
  - La calificación y la cantidad de reseñas de Google también se cargan a mano, en `siteSettings`.
- **Motivo:** control total sobre qué se muestra, sin costo, sin dependencias externas y sin afectar la velocidad de la web.
- **Alternativas descartadas:**
  - API de Google Places: requiere facturación, devuelve como máximo 5 reseñas y tiene restricciones de caché.
  - Widgets de terceros: agregan peso a la página y muestran una marca ajena.
  - Un desplegable de origen (Facebook, Google…): el enlace ya lo indica.

## 2026-11-04 · Idiomas no soportados devuelven 404

- **Decisión:** las rutas con un idioma no soportado (por ejemplo, `/fr`) terminan en 404.
- **Motivo:** solo existen `es` y `en`; mostrar contenido en otro idioma sería engañoso.
- **Alternativas descartadas:** redirigir al idioma por defecto conservando el resto de la ruta.
- **Estado actual:** `proxy.ts` trata `/fr` como una ruta sin idioma y redirige (307) a `/es/fr`, que responde 404. El resultado final es un 404, pero pasando por una redirección.

## 2026-11-06 · Botón "Traducir al inglés" en el Studio

- **Decisión:**
  - Document action "Traducir al inglés" en `tour`, `siteSettings`, `testimonial` y `gallery` (`sanity/actions/TranslateAction.ts`). Recorre el documento guiándose por el esquema y recoge todos los `localeString`/`localeText` con `es` no vacío, también dentro de objetos y arrays.
  - Tras confirmar, envía todos los textos en **una sola petición** a `POST /api/translate` y aplica los `en` como patch sobre el **borrador**, sin publicar: el cliente revisa y publica.
  - Todo lo específico de DeepL vive en `lib/translate.ts` (`translateTexts`). El endpoint (`api-free` o `api`) se elige según si la clave termina en `:fx`. Internamente parte en lotes de 50 textos, el máximo de DeepL.
  - El endpoint solo acepta peticiones del mismo origen y como máximo 20.000 caracteres. Sin `DEEPL_API_KEY` responde 503 "Traducción no configurada todavía".
- **Motivo:** traducción guardada en Sanity (buena para SEO) y sin acoplar la app a un proveedor concreto. El límite de caracteres protege la cuota gratuita de DeepL (500.000 caracteres al mes).
- **Alternativas descartadas:**
  - Traducir en el navegador o en tiempo de ejecución: peor para SEO y gasta cuota en cada visita.
  - Llamar a DeepL desde el Studio: expondría la clave en el navegador.
  - Publicar automáticamente: el cliente no podría revisar la traducción antes.
- **Limitación conocida:** la comprobación de mismo origen evita que otras webs usen el endpoint desde el navegador, pero no es autenticación: un cliente que falsifique las cabeceras podría consumir cuota (como mucho 20.000 caracteres por petición).

## 2026-11-06 · Home, galería y capa de datos del frontend

- **Decisión:**
  - **Datos:** `lib/sanity/fetch.ts` lee Sanity sin CDN dentro de funciones `"use cache"` con `cacheLife("max")` y `cacheTag(<_type>)` (`siteSettings`, `tour`, `tourCategory`, `testimonial`, `gallery`). El webhook podrá usar `revalidateTag(_type)`. Las consultas están en `lib/sanity/queries.ts` (`defineQuery`) y los tipos se escriben a mano en `lib/sanity/types.ts` (sin TypeGen).
  - **Imágenes:** `next-sanity/image` (loader del CDN de Sanity), no el optimizador de Next. El recorte con hotspot se pide a Sanity (`urlFor().width().height().fit("crop")`), y `object-position` usa el hotspot como respaldo.
  - **Diseño:** Fraunces (display) + Manrope (texto) con `next/font`. Tokens `forest`, `sand`, `navy` en `app/globals.css`. Header sólido verde oscuro y fijo, sin transparencias que dependan del scroll.
  - **Secciones vacías:** cada sección decide si se renderiza (`lib/sections.ts`). El header solo enlaza las anclas de las secciones visibles. Los títulos de sección usan el texto de Sanity y, si falta, el del diccionario.
  - **Íconos de Seguridad:** el esquema no tiene campo de ícono; se asignan por posición (escudo, botiquín, montaña, brújula).
  - **WhatsApp flotante:** solo en móvil y se incluye por página, no en el layout, para no chocar con el CTA fijo de la página de tour.
  - **Galería:** componente cliente compartido (mosaico 1+5 en la home, cuadrícula en `/galeria`). El lightbox usa `<dialog>` nativo (foco atrapado, Esc, el foco vuelve a la miniatura) con flechas en escritorio y deslizamiento en móvil. El chip del tour solo aparece con `@media (hover: hover)` o con foco de teclado.
  - **Testimonios en móvil:** carrusel con `scroll-snap` de CSS, sin JavaScript.
  - **SEO:** `lib/seo.ts` genera canonical, hreflang (`es`, `en`, `x-default` → `es`) y Open Graph con la foto del hero recortada a 1200×630. La URL base sale de `NEXT_PUBLIC_SITE_URL`, si no de `URL` (Netlify), y si no de localhost.
- **Motivo:** contenido estático y rápido que solo cambia cuando el cliente publica. Sin dependencias nuevas, y con JavaScript de cliente solo en el menú móvil, el selector de idioma y la galería.
- **Alternativas descartadas:**
  - `defineLive`/`SanityLive`: conexión en vivo innecesaria para un sitio que cambia poco.
  - Optimizador de imágenes de Next en Netlify: duplica el trabajo del CDN de Sanity.
  - Librerías de carrusel o lightbox: peso extra para algo que resuelven CSS y `<dialog>`.
- **Pendiente (resuelto el 2026-11-09):** el "desde" del City Tour no se mostraba porque solo tiene precio para 3 personas. Ver "Precio desde: mínimo de todas las franjas".

## 2026-11-09 · Precio "desde": mínimo de todas las franjas

- **Decisión:** "Desde USD X" es el mínimo de **todos** los precios por persona disponibles (`p1`–`p5plus`) en todas las opciones del tour, ignorando los vacíos. Si el tour no tiene ningún precio, no se muestra. Reemplaza la regla anterior (mínimo de `p5plus`) de "Modelo de datos del tour".
- **Motivo:** el City Tour solo tiene precio para 3 personas (`p3`), así que con la regla anterior su tarjeta no mostraba ningún precio. En los demás tours el resultado no cambia, porque `p5plus` ya es su precio más bajo.
- **Alternativas descartadas:**
  - Mantener `p5plus`: deja sin precio a cualquier tour con la grilla incompleta.
  - Mostrar "Consultar precio": oculta un precio que sí existe.

## 2026-11-09 · Textos iniciales de Seguridad, Por qué elegirnos y Tour personalizado

- **Decisión:**
  - `scripts/seed-sections.ts` carga un borrador ES/EN de esas tres secciones en `siteSettings`, más una foto provisional para Tour personalizado y otra para Nosotros.
  - Usa `setIfMissing` campo por campo: no sobrescribe lo que el cliente ya escribió, así que se puede volver a ejecutar sin riesgo (a diferencia de `seed.ts`).
  - Solo usa hechos de `01-briefing.md` y `02-tours.md`, sin certificaciones, cifras ni años de experiencia.
- **Motivo:** las tres secciones estaban vacías y no se mostraban; entre ellas, Seguridad, el diferenciador principal.
- **Pendiente de confirmar con el cliente:** "Guía coordinador 24/7" solo figura en el Canva de Toro Toro; el texto no dice que aplique a todos los tours, pero así se presenta en la sección general.

## 2026-11-09 · "Nosotros" con una sola foto y footer mínimo

- **Decisión:**
  - `about.images` (fotos del equipo, vacío) se reemplaza por `about.image`, una sola foto con texto alternativo ES/EN. Con foto, la sección va a dos columnas en escritorio y apilada en móvil. Sin foto, solo texto en un bloque más compacto.
  - El footer deja de repetir los datos de contacto: muestra el nombre, "Cochabamba, Bolivia", enlaces a Tours, Galería y Contacto, el ícono de Facebook y el copyright. Los datos de contacto viven solo en la sección Contacto.
- **Motivo:** un único campo de foto es más claro para el cliente y encaja con el diseño a dos columnas. Repetir WhatsApp, idiomas y Facebook en el footer, justo debajo de Contacto, duplicaba la información.
- **Alternativas descartadas:** mantener las fotos del equipo en una cuadrícula; un footer con todos los datos de contacto.

## 2026-11-09 · Refactor visual: "revista de expedición" con movimiento

- **Decisión:**
  - **Librerías nuevas:** `motion` (entradas, hovers, layout animation del lightbox; con `LazyMotion` estricto y funciones cargadas en diferido), `lenis` (scroll suave), `gsap` + `ScrollTrigger` (solo el scroll horizontal fijo de tours en escritorio) y `embla-carousel` (+ `autoplay` y `fade`) para los carruseles de tours en móvil y testimonios. GSAP y Lenis se importan de forma dinámica en el cliente.
  - **Tipografía:** Anton (display condensada) + Manrope (texto) + IBM Plex Mono (datos). Reemplaza a Fraunces.
  - **Tokens** en `app/globals.css` y `lib/motion.ts`; primitivas de movimiento en `components/motion/` con un único `useReducedMotion`.
  - **Header:** transparente sobre las cabeceras oscuras (home y galería, decidido por ruta en `HeaderShell`), sólido con blur al hacer scroll y oculto al bajar. En el resto de páginas es sólido y reserva su altura. Reemplaza la decisión "header sólido sin transparencias" del 2026-11-06.
  - **Home:** nuevas secciones Cifras, Cinta de destinos y CTA final. Las cifras solo usan datos de Sanity: altitud máxima (`quickFacts.altitude`), `googleRating`, `googleReviewCount` y nº de idiomas distintos en `quickFacts.languages` de los tours. Sin dato, la cifra no aparece.
  - **Datos:** sin cambios de esquema. Se añadió `lqip` a la proyección de imágenes y la consulta `TOUR_FACTS_QUERY` (todos los tours publicados: título, altitud, idiomas).
  - **Palabra rotativa del hero:** solo rota si la última palabra del título de Sanity está en `dictionaries/*.json` (`hero.rotatingWords`). Si el cliente cambia el título, se muestra tal cual, sin frases sin sentido.
  - **CTA final:** usa `heroImage` (no hay campo propio) y el título del diccionario.
  - **Lightbox:** deja `<dialog>` nativo por un overlay en portal con foco atrapado a mano, para poder animar la apertura desde la miniatura (layoutId) y el cierre.
  - **Testimonios:** carrusel embla en fade con autoplay en lugar del `scroll-snap` sin JS; con un solo testimonio se muestra estático.
  - **View Transitions:** la foto de cada `TourCard` usa `<ViewTransition name="tour-image-<slug>">` de React 19.3. El lado del detalle queda pendiente (ver CLAUDE.md).
- **Motivo:** el sitio era correcto pero plano; el posicionamiento premium pide fotos grandes, tipografía con carácter y movimiento que lleve la mirada a los tours y a WhatsApp, sin perder rendimiento (Lighthouse móvil en `/es`: Performance 91, Accesibilidad 100, CLS 0).
- **Alternativas descartadas:**
  - Mantener "sin librerías de carrusel/animación" (decisión del 2026-11-06): no permite el pin horizontal, el lightbox con layout animation ni el carrusel en fade sin reimplementarlos a mano.
  - GSAP para todo: más peso y una segunda API; se limita al pin horizontal.
  - `clip-path` para `MaskReveal`: no es transform/opacity; se usa una cortina que se recoge con `scaleY`.
  - Un campo de imagen nuevo para el CTA final: cambiaría el esquema, fuera del alcance del refactor.


## 2026-11-09 · Ajustes tras la revisión del refactor

- **Decisión:**
  - **Palabras rotativas del hero en el Studio:** nuevo campo `siteSettings.heroRotatingWords` (lista de `localeString`). La última palabra del título se alterna con ellas; vacío = título fijo. Sustituye a `hero.rotatingWords` del diccionario y a la regla "solo rota si la palabra está en el diccionario".
  - **Datos curiosos de Bolivia:** nuevo campo `siteSettings.funFacts` (grupo "Datos curiosos"). Se alternan en la portada (reemplazan a "Punto más alto") y forman la sección "Bolivia en cifras", que absorbe las cifras propias ("Y con nosotros").
  - **Fuera la cinta de destinos** (y la primitiva `Marquee`): el desplazamiento horizontal continuo no encajaba con el resto.
  - **Header:** en home y galería no se oculta mientras se está en la cabecera a pantalla completa; solo después.
  - **Por qué elegirnos:** carrusel embla con autoplay, sin botones (arrastrable, pausa con ratón/foco, sin autoplay con menos movimiento). Se añadieron 5 razones (why4–why8) con un patch aditivo (`insert` tras el último ítem), sin tocar las existentes.
  - **MagneticButton:** reacciona al cursor cercano desde fuera (radio 110 px, tope 6 px), no solo con el cursor dentro.
  - **Cambio de idioma:** ya era navegación cliente; ahora usa `scroll={false}` para quedarse en el mismo punto.
  - **Logo:** `public/logo.jpg` genera `app/favicon.ico`, `app/icon.png`, `app/apple-icon.png` y `public/logo-mark.png` (recorte circular). Va en header y footer junto al nombre, y en el sello de Nosotros.
  - **Contenido cargado** con patch `setIfMissing` (no se re-ejecutaron seeds): 3 palabras rotativas y 6 datos curiosos (Uyuni 10.582 km², Titicaca 3.812 msnm, Sajama 6.542 msnm, Cristo de la Concordia 34,2 m, Cal Orck'o 5.000 huellas, 37 idiomas oficiales). Conviene que el cliente los revise.
- **Motivo:** feedback del cliente/desarrollador tras ver el refactor.
- **Alternativas descartadas:** datos curiosos en el diccionario (no editables por el cliente); header siempre visible (se mantiene el ocultar al bajar fuera del hero); mover `<html>` a un layout raíz común para evitar recargas (no hacía falta: el cambio de idioma no recarga).

## 2026-11-09 · Segunda ronda de ajustes de la home

- **Decisión:**
  - **MagneticButton:** se inclina siempre hacia el cursor, esté donde esté (curva que se satura en 6 px), no solo al acercarse.
  - **Hero:** se quita el indicador "Desliza".
  - **Bolivia en cifras:** se quita "Y con nosotros" (altitud máxima de los tours, nota y reseñas de Google, idiomas); la nota de Google sigue en Nosotros y Testimonios. Se eliminan `TOUR_FACTS_QUERY`, `getTourFacts`, `maxAltitude` y `languageCount`, que quedaban sin uso.
  - **Datos curiosos en rotación:** 12 datos (6 nuevos con patch aditivo: Huayna Potosí, aeropuerto de El Alto, Mi Teleférico, Titicaca en km², Madidi, Laguna Colorada). `FactsGrid` muestra 6 y cada segundo cambia 1 o 2 celdas (permanencia mínima 3,5 s; cola en orden; no cambia la celda bajo el ratón; pausa fuera de pantalla; sin rotación con menos movimiento). Entre salida y entrada, un destello blanco con partículas (solo transform/opacity).
  - **Barra de desplazamiento:** pulgar `navy-800` sobre pista `sand-100`.
  - **Instagram:** nuevo campo `siteSettings.instagram` (sección Contacto e ícono en el footer). Se guardó la URL sin el parámetro de seguimiento `xtok`.
- **Motivo:** feedback tras revisar la primera ronda.
- **Alternativas descartadas:** cambiar las 6 celdas a la vez (demasiado ruido); intervalo fijo por celda (patrón predecible).

## 2026-11-09 · Humo en lugar de chispas en "Bolivia en cifras"

- **Decisión:** el destello (un degradado radial + 10 puntos animados con motion) se reemplaza por `SmokeBurst`: un canvas 2D con ~28 bocanadas que se expanden, se alejan, suben, giran y se disipan, más un brillo breve en el centro. El sprite de humo (manchas radiales superpuestas, semilla fija) se dibuja una vez por página. Cada lienzo dibuja ~2 s y después queda vacío; sin dependencias nuevas.
- **Motivo:** las chispas se veían como un efecto genérico; el humo encaja mejor con la estética de expedición y se ve más cuidado.
- **Alternativas descartadas:** filtros SVG `feTurbulence` animados (caros de repintar); vídeo/sprite de humo con transparencia (un asset más que mantener y con licencia); librerías de partículas como tsParticles (dependencia grande para un efecto pequeño).

## 2026-11-09 · Ritmo más pausado en "Bolivia en cifras" y 16 datos

- **Decisión:** un cambio cada 2,6 s (antes 1 s), normalmente de una celda (dos con un 20 % de probabilidad, antes 40 %) y permanencia mínima de 8 s por dato. Se añaden 4 datos con patch aditivo (La Paz 3.640 msnm, Illimani 6.438 msnm, Chacaltaya 5.421 msnm, Misiones de Chiquitos 6 pueblos): 16 en total.
- **Motivo:** el humo dura ~2 s; con un cambio por segundo las bocanadas se encadenaban y el efecto se sentía apresurado.
- **Alternativas descartadas:** acortar el humo (pierde el efecto de bocanada).

## 2026-11-09 · Plantilla de detalle de tour

- **Decisión:**
  - **Datos:** una sola consulta (`TOUR_PAGE_QUERY`) trae el tour por slug y hasta 3 "otros tours" (por `order`). Caché con tags `tour`, `tour:<slug>` y `tourCategory`. `generateStaticParams` lista todos los slugs de Sanity (× es/en del layout); los tours nuevos se renderizan al pedirlos.
  - **Opción en la URL:** la opción elegida se guarda en `?opcion=` (`1-dia`, `2-dias`… según la duración; `opcion-N` si se repite), con `history.replaceState` y sin `useSearchParams`, para que la página siga siendo estática. El selector ES/EN conserva la query.
  - **Barra CTA móvil:** por debajo de 1024px, una barra fija inferior con el precio "desde" de la opción elegida y "Consultar disponibilidad" aparece al dejar atrás la portada y reemplaza al botón flotante de WhatsApp. En escritorio, una tarjeta lateral sticky acompaña desde la descripción hasta los precios.
  - **Calculadora:** 1–10 personas; usa el tramo exacto (`p1`–`p4`) o `p5plus` para 5 o más. Si ese tramo no tiene precio, avisa y remite a WhatsApp (no se interpola). El nº de personas solo entra en el mensaje de WhatsApp si el usuario usó la calculadora.
  - **Mensaje de WhatsApp:** plantillas en `dictionaries/*.json` (`whatsapp.tour` + `tourOption` + `tourPeople`). Los paréntesis de la etiqueta de la opción se pasan a comas para no anidarlos.
  - **JSON-LD:** `TouristTrip` con nombre, descripción, foto, `AggregateOffer` (USD, `lowPrice` = "desde", `highPrice`) y proveedor `TravelAgency`; solo con los datos que existen.
  - **Morph de la foto:** `TourCard` usa `prefetch` (precarga por enlace de Partial Prefetching) para que la portada del detalle llegue en el mismo commit que la navegación.
  - **Reutilización:** `FinalCta` acepta `title` y `actions`; `Gallery` en modo mosaico se adapta a cualquier nº de fotos sin huecos (la home, con 6, queda igual).
- **Motivo:** el detalle es la página que convierte: precios transparentes por grupo, un CTA siempre a mano y un mensaje de WhatsApp que ya llega con el tour, la opción y el tamaño del grupo. La opción en la URL permite compartir exactamente lo que se está viendo.
- **Alternativas descartadas:**
  - `useSearchParams` o leer `searchParams` en el servidor: la página dejaría de ser estática (renderizado en cliente detrás de un Suspense, o por petición).
  - Mantener el botón flotante de WhatsApp en el detalle: se duplicaría con la barra.
  - Interpolar precios para tramos vacíos: sería inventar precios.
  - Un `Offer` por tramo en el JSON-LD: más ruido sin beneficio claro; el "desde" es lo que interesa.

## 2026-11-09 · Ajustes previos de la home (palabra rotativa, accesibilidad, reseñas)

- **Decisión:**
  - **Palabra rotativa:** `WordRotator` deja de recortar (`overflow-hidden`) y cambia con un desplazamiento corto (40 %) + fundido; la máscara del sufijo en `SplitText` se amplía (padding y margen negativo que se compensan). Antes, con el interlineado 0,9 de los títulos, la palabra se cortaba por abajo durante el cambio.
  - **Accesibilidad:** regla común a las primitivas que duplican texto: una sola versión legible (`sr-only` o `label`) y copias animadas con `aria-hidden`. `SplitText`, `WordRotator` y `CountUp` ya la cumplían; el "¿Sabías que?" del hero (`FactTicker`) pasa a `aria-hidden`, porque repetía los datos que ya están completos en la lista accesible de "Bolivia en cifras".
  - **Reseñas de Google:** se cargaron las 2 reseñas de 5 estrellas en español visibles sin sesión en Google Maps (que solo muestra 5), con el texto tal cual, nombre "Nombre I.", `sourceUrl` = `googleReviewsUrl` y sin fecha (Google solo muestra "Hace 3 años"). Las otras 3 están en francés y portugués y no se usaron (el modelo es ES/EN y no se traduce a mano). Se borró el testimonio de prueba y `googleRating` pasó de 4,9 a 5,0 (publicado y borrador). Conviene completar más testimonios desde el Studio.
- **Motivo:** feedback de la revisión de la home.
- **Alternativas descartadas:** traducir o resumir reseñas (dejarían de ser reales); poner reseñas en francés o portugués en `text.es`.
