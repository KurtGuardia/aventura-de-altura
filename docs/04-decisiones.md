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
