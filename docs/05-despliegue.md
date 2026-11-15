# 05 · Despliegue y pasos manuales

Qué hay que configurar fuera del código para que el sitio funcione en producción (Netlify + Sanity + Google).

---

## 1. Netlify

El sitio se despliega con el runtime de Next.js de Netlify (adaptador OpenNext), que se instala solo: **no hace falta `netlify.toml`**. Comando de build: `npm run build` (Netlify lo detecta).

### Variables de entorno

*Site configuration → Environment variables*. Todas en los contextos *Production* y *Deploy previews*:

| Variable | Valor | Notas |
|---|---|---|
| `NEXT_PUBLIC_SITE_URL` | `https://<sitio>.netlify.app` (luego el dominio definitivo) | Sin barra final. Se fija **en el build**: si cambia el dominio, hay que volver a desplegar. Si falta, se usa `URL` de Netlify. |
| `NEXT_PUBLIC_SANITY_PROJECT_ID` | el de `.env.local` | |
| `NEXT_PUBLIC_SANITY_DATASET` | el de `.env.local` | |
| `SANITY_REVALIDATE_SECRET` | una cadena larga aleatoria (`openssl rand -hex 32`) | La misma que el webhook de Sanity (paso 2). |
| `NEXT_PUBLIC_GA_ID` | `G-XXXXXXXXXX` | Opcional. Vacía o ausente = sin Google Analytics. |
| `DEEPL_API_KEY` | vacía de momento | Botón "Traducir al inglés" del Studio. |

**Nunca** subir `SANITY_API_WRITE_TOKEN` a Netlify: solo se usa en local para los scripts de seed/migración.

### Cabeceras de seguridad

Definidas en `next.config.ts` (valen en local y en Netlify): `X-Content-Type-Options: nosniff`, `Referrer-Policy: strict-origin-when-cross-origin`, `Content-Security-Policy: frame-ancestors 'self'` y `X-Frame-Options: SAMEORIGIN`. Excepción: `/studio` permite `https://sanity.io` y `https://*.sanity.io` como ancestros (sin `X-Frame-Options`) para que el Studio se abra dentro del Dashboard de sanity.io.

### Registrar el Studio en sanity.io (Dashboard)

Para que el proyecto en sanity.io abra **el Studio** (y no la web), hay que registrar su URL completa, con `/studio`:

```bash
npx sanity deploy --external --url https://<dominio>/studio
```

Si antes se registró la URL raíz del sitio, borrarla en sanity.io/manage → proyecto → **Studios**. En **API → CORS origins** debe estar `https://<dominio>` con *Allow credentials*.

---

## 2. Webhook de Sanity (revalidación on-demand)

Cuando el cliente publica en el Studio, Sanity avisa a `/api/revalidate` y el sitio refresca solo lo que cambió. Sin el webhook, los cambios no se ven hasta el siguiente deploy.

En [sanity.io/manage](https://www.sanity.io/manage) → proyecto → **API → Webhooks → Create webhook**:

| Campo | Valor |
|---|---|
| Name | `Revalidar sitio (Netlify)` |
| URL | `https://<sitio>.netlify.app/api/revalidate` |
| Dataset | el de producción (`NEXT_PUBLIC_SANITY_DATASET`) |
| Trigger on | Create, Update, Delete |
| Filter | `_type in ["tour", "tourCategory", "siteSettings", "testimonial", "gallery"]` |
| Projection | `{_type, "slug": slug.current}` |
| Status | Enabled |
| HTTP method | POST |
| API version | la más reciente |
| Drafts | **desactivado** (solo documentos publicados) |
| Secret | el mismo valor que `SANITY_REVALIDATE_SECRET` en Netlify |

Si cambia el dominio, actualizar la URL del webhook.

**Qué revalida** (`app/api/revalidate/route.ts`, por tags de caché):

| `_type` | Tags | Páginas afectadas |
|---|---|---|
| `tour` | `tour`, `tour:<slug>` | home, galería, todas las páginas de tour, sitemap |
| `tourCategory` | `tourCategory` | tarjetas y páginas de tour |
| `siteSettings` | `siteSettings` | todo el sitio (layout, home, galería, tours) |
| `testimonial` | `testimonial` | home |
| `gallery` | `gallery` | home, galería, sitemap |

**Comprobar que funciona:** en el webhook, pestaña *Attempts log* → la respuesta debe ser `200` con `{"revalidated":true,...}`. Un `401` indica que el secreto no coincide; un `500` con "Falta SANITY_REVALIDATE_SECRET", que la variable no está en Netlify (o falta volver a desplegar tras añadirla).

**Probar en local:** `npm run build && SANITY_REVALIDATE_SECRET=prueba npx next start` y enviar un POST firmado (cabecera `sanity-webhook-signature: t=<ms>,v1=<base64url(HMAC-SHA256(secreto, "<ms>.<cuerpo>"))>`). Sin firma o con otro secreto responde `401`.

---

## 3. Google Analytics 4

1. [analytics.google.com](https://analytics.google.com) → Administrar → Crear propiedad → flujo de datos **Web** con la URL del sitio.
2. Copiar el **ID de medición** (`G-…`) en `NEXT_PUBLIC_GA_ID` de Netlify y volver a desplegar.
3. Evento personalizado `whatsapp_click` (se envía en cada clic a un enlace de WhatsApp), con los parámetros:
   - `origin`: `hero`, `detalle-sidebar`, `detalle-barra-movil`, `detalle-precios`, `detalle-itinerario`, `detalle-cta-final`, `tour-personalizado`, `contacto`, `cta-final`, `flotante`, `menu`.
   - `tour_slug`: solo en los CTA de la página de un tour.
4. Para verlos en los informes: Administrar → **Definiciones personalizadas** → crear dos dimensiones de evento, `origin` y `tour_slug`. Opcional: marcar `whatsapp_click` como **evento clave** (conversión).
5. Comprobar con *Informes → Tiempo real* o *DebugView* tras pulsar un botón de WhatsApp.

---

## 4. Google Search Console

1. [search.google.com/search-console](https://search.google.com/search-console) → Añadir propiedad → **Prefijo de URL** con la URL pública.
2. Verificar con la **etiqueta HTML** (meta `google-site-verification`): avisar para añadirla en `metadata.verification` del layout, o verificar con la cuenta de Google Analytics si ya está activo.
3. *Sitemaps* → enviar `sitemap.xml`. Incluye home, galería y todos los tours en ES y EN con sus alternativas hreflang.
4. Repetir con el dominio definitivo cuando exista (propiedad de dominio por DNS, recomendada) y actualizar `NEXT_PUBLIC_SITE_URL`.

---

## Limitación conocida

La primera visita a un tour **inexistente** (`/es/tours/no-existe`) responde con estado HTTP 200 (muestra la página 404 y lleva `noindex`); las siguientes responden 404. Es cómo Next sirve con *Partial Prerendering* los slugs que no se generaron en el build. Las rutas inexistentes fuera de los tours (`/es/xyz`) responden 404 desde la primera visita.
