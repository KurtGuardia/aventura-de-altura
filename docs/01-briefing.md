# 01 · Briefing — Landing "Aventura de Altura"

> Fuente: conversación con ChatGPT (9-oct-2026), Si necesitas ver, este es el enlace publico: https://chatgpt.com/share/6ae10cb4-f040-83e8-b221-28b63f9045a8 . Depurada y actualizada con las decisiones tomadas después (27-oct-2026). Lo marcado como **[DECIDIDO]** prevalece sobre lo que dijo ChatGPT.

## 1. Cliente

- **Aventura de Altura**: operadora de turismo de aventura con base en **Cochabamba, Bolivia**.
- Especialidad: experiencias de aventura seguras, auténticas y personalizadas.
- Guías con formación en emergencias médicas, seguridad preventiva y rescate.
- Quiere destacar **más de 15 años de experiencia** (dato a verificar con el cliente).
- WhatsApp: +591 76922077 / +591 68500428.
- Facebook: https://www.facebook.com/AventuraDeAlturaBolivia
- Atiende en español e inglés; francés, alemán y portugués con traductor (USD 50 por grupo).
- **El cliente no es técnico**: debe poder editar contenido sin depender de un programador.

## 2. Posicionamiento y mensaje

- No competir solo por precio con las agencias tradicionales.
- Posicionarse como la operadora que **se encarga de todos los detalles** para que el viajero disfrute Bolivia con tranquilidad.
- Tres mensajes desde el primer pantallazo:
  1. Aventura auténtica en Bolivia.
  2. Seguridad profesional (el diferenciador principal).
  3. Experiencia integral y personalizada.
- Público: turistas extranjeros y nacionales (**a confirmar** la prioridad con el cliente).

## 3. Identidad visual (propuesta)

- Estilo de **aventura premium**: fotografías grandes y reales, moderno pero no minimalista en exceso.
- Paleta:
  - **Verde profundo**: naturaleza y confianza.
  - **Arena / beige**: tierra y calidez.
  - **Azul oscuro**: profesionalismo y seguridad.
  - **Blanco**: lectura.
- **Evitar**: exceso de efectos, fotos de stock genéricas y párrafos largos.
- Regla de usabilidad: descubrir un tour y consultar su precio en **pocos pasos**.

## 4. Alcance acordado (landing + detalle de tours) [DECIDIDO]

### Arquitectura de páginas

| Ruta | Contenido | Motivo |
|---|---|---|
| `/[lang]` (Home) | Landing con 6–8 secciones (ver sección 5) | Presentación, confianza y captación |
| `/[lang]/tours/[slug]` | Detalle de cada tour (ver sección 6) | SEO por tour + URL propia para compartir por WhatsApp o redes |

- `lang` = `es` | `en`.
- **Una sola plantilla dinámica** de tour (`generateStaticParams`), alimentada desde Sanity. Si el cliente crea un tour nuevo, su página aparece sola, con su metadata y Open Graph.
- **Descartados**:
  - *Modals*: Google no indexa cada tour y no hay URL compartible.
  - *Todo en la home*: una sola URL compite por todas las búsquedas.
- La **galería** es una sección de la home con *lightbox*; no lleva página propia.

### Incluye

- Home (landing) con 6–8 secciones.
- **Plantilla de detalle de tour** con URL propia (hasta 8 tours).
- Diseño responsive, **mobile-first**.
- Next.js + Tailwind CSS.
- **Sanity Studio**: el cliente edita textos, fotos, precios y tours (crear, editar, destacar y ordenar).
- Galería, testimonios, sección "Nosotros" y contacto.
- Botones de WhatsApp para consultar cada tour, con el mensaje prellenado con el nombre del tour.
- SEO básico (metadata y Open Graph por página, sitemap, `hreflang` ES/EN), dominio conectado y publicación.
- Capacitación breve al cliente.
- **Una** ronda de correcciones tras la entrega.

### No incluye (se cotiza aparte)

- Reservas y pagos en línea.
- CRM.
- Páginas por **destino** (por ejemplo, "Torotoro" como destino con varios tours), blog o artículos para viajeros (fase 2).
- Funcionalidades a medida.
- Mantenimiento indefinido.

### Estimación de esfuerzo

- **30–40 horas efectivas** con apoyo de IA (base de 25–35 h + 4–8 h por la plantilla de detalle de tour).
- Supuesto: el cliente entrega fotos, textos y datos de los tours.


## 5. Secciones de la Home (adaptado de la propuesta de 7 secciones)

1. **Hero**: "Descubre Bolivia. Vive la aventura." + CTA "Encuentra tu próxima aventura".
2. **Tours destacados**: tarjetas con foto, duración, tipo y "desde USD X". La tarjeta enlaza a `/tours/[slug]`.
3. **Seguridad y calidad**: preparación de los guías, gestión de riesgos, botiquín y protocolos. Es el diferenciador.
4. **Por qué elegirnos**: respaldo profesional, viajes a medida y atención directa.
5. **Nosotros**: historia, equipo y fotos reales.
6. **Testimonios**: reseñas reales, idealmente con enlace a la fuente (Facebook, Google, TripAdvisor).
7. **Galería**: grid con *lightbox*, editable desde Sanity.
8. **Contacto**: WhatsApp, correo, idiomas y política de reserva y cancelación.

## 6. Página de detalle de tour (`/tours/[slug]`)

Esquema de datos en `02-tours.md`. Cada página debe tener:

- Hero con foto, nombre, duración, tipo y dificultad.
- Descripción breve que venda la experiencia.
- Horarios: salida, duración y retorno.
- Itinerario.
- Qué incluye y qué no incluye.
- Seguridad y requisitos: condición física, aclimatación, equipo.
- Precio por persona según tamaño del grupo.
- Galería propia del tour.
- CTA claro y **fijo en móvil**: "Consultar disponibilidad" por WhatsApp, con el mensaje prellenado.
- Bloque de "Otros tours" al final, para navegación interna y SEO.

## 7. Prioridades funcionales

- **ES / EN**, con un inglés bien traducido.
- **WhatsApp siempre visible** en móvil.
- **Precios transparentes**: "desde", qué incluye y extras aclarados.
- **Google Analytics + Search Console**.

## 8. Stack y hosting [DECIDIDO]

| Pieza | Elección | Nota |
|---|---|---|
| Framework | Next.js (App Router) + TypeScript | — |
| Estilos | Tailwind CSS | — |
| CMS | **Sanity** (plan Free) | En la conversación original se escribió "Sentry" por error: Sentry monitoriza errores, no es un CMS. |
| Hosting | **Netlify** | Descartados: Vercel Hobby (prohíbe uso comercial) y Cloudflare con export estático (requiere *rebuild* en cada cambio). |
| Actualización | ISR / revalidación on-demand | Webhook de Sanity → route handler con `revalidatePath`. El cliente publica y se ve sin pasos manuales. |
| UI | Claude Code + mockups aprobados | v0 descartado: genera contenido fijo en el código que luego habría que rehacer para Sanity. |

### Costos recurrentes estimados (a verificar antes de cotizar)

| Servicio | Costo |
|---|---|
| Sanity Free | USD 0/mes |
| Netlify (plan gratuito) | USD 0/mes; verificar los límites actuales |
| Dominio .com | USD 10–20/año |


