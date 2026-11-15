/**
 * Segundo patch puntual de contenido (2026-11-15). Idempotente: se puede repetir sin duplicar nada.
 *
 * 1. Dos testimonios más de Google Maps (5 estrellas; no hay reseñas con menos) y calificación 5.
 * 2. Dos tipos de tour nuevos (aún sin tours asignados): Aventura y Selva.
 * 3. Fotos para "Lo mejor del tour" que estaban vacías, desde ../imagenes-web:
 *    todas de Unsplash (licencia Unsplash: uso libre, sin crédito obligatorio). Salvo el Cristo y la
 *    vista de Cochabamba, son fotos genéricas: el alt describe lo que se ve, no el lugar del tour.
 *    Si falta un archivo, se avisa y se salta.
 *
 * Uso:  npx tsx scripts/patch-content-2026-11-15-b.ts          (modo prueba)
 *       npx tsx scripts/patch-content-2026-11-15-b.ts --apply  (aplica los cambios)
 */
import {createReadStream, existsSync} from 'node:fs'
import path from 'node:path'
import {loadEnvFile} from 'node:process'
import {createClient} from '@sanity/client'

if (existsSync('.env.local')) loadEnvFile('.env.local')

function requireEnv(name: string): string {
  const value = process.env[name]
  if (!value) throw new Error(`Falta la variable de entorno ${name} (en .env.local).`)
  return value
}

const client = createClient({
  projectId: requireEnv('NEXT_PUBLIC_SANITY_PROJECT_ID'),
  dataset: requireEnv('NEXT_PUBLIC_SANITY_DATASET'),
  token: requireEnv('SANITY_API_WRITE_TOKEN'),
  apiVersion: process.env.NEXT_PUBLIC_SANITY_API_VERSION || '2026-10-27',
  useCdn: false,
})

const APPLY = process.argv.includes('--apply')
const WEB_DIR = path.resolve('../imagenes-web')
const GOOGLE_REVIEWS_URL = 'https://maps.app.goo.gl/GAaS8u9TamaaeHiV9'

type Loc = {es: string; en: string}
const ls = (v: Loc) => ({_type: 'localeString', ...v})
const lt = (v: Loc) => ({_type: 'localeText', ...v})

// ── 1. Testimonios (reseñas de Google, originales en inglés) ──
const TESTIMONIALS = [
  {
    _id: 'testimonial-google-jana-v',
    name: 'Jana V.',
    order: 3,
    text: {
      es: '¡Tuvimos una excursión de dos días al Parque Nacional Toro Toro que fue fantástica! Nos sentimos muy seguros en el auto y hacen todo para que te sientas a gusto. Si buscas un tour en Cochabamba o sus alrededores, ¡recomendamos esta agencia!',
      en: 'We had a very nice 2 days tour to Toro Toro National Park! Felt supersafe in the car and they do everything to make you feel at ease. If you are looking for a tour in or around Cochabamba, we would recommend this agency!',
    },
  },
  {
    _id: 'testimonial-google-bliss-v',
    name: 'Bliss v.',
    order: 4,
    text: {
      es: '¡Nos encantó nuestra experiencia en el tour! Nuestro guía Gabriel nos dio un recorrido muy detallado por el Parque Nacional Tunari, con excelentes paradas y vistas, buena comida y un delicioso café y yogur local. No puedo recomendar lo suficiente esta experiencia: ¡5 estrellas! Gracias, Gabriel, por un tour tan maravilloso.',
      en: "We loved our experience during our tour! Our guide Gabriel gave us a very detailed tour of the Parque Nacional Tunari, excellent stops and views during the trip, included great foods choices as well as a delicious local coffee and yogourt. I couldn't recommend this experience enough. This experience was A-1+++ and 5-Stars. Thank you Gabriel for such a wonderful tour!",
    },
  },
]

// ── 2. Tipos de tour nuevos ───────────────────────────────────
const CATEGORIES = [
  {_id: 'tourCategory-aventura', title: {es: 'Aventura', en: 'Adventure'}},
  {_id: 'tourCategory-selva', title: {es: 'Selva', en: 'Jungle'}},
]

// ── 3. Fotos de "Lo mejor del tour" ───────────────────────────
const HIGHLIGHT_IMAGES: {tourId: string; key: string; file: string; alt: Loc; credit?: string}[] = [
  {
    tourId: 'tour-city-tour-cochabamba',
    key: 'hl1',
    file: 'cristo-unsplash.jpg',
    credit: 'Unsplash',
    alt: {es: 'Cristo de la Concordia con los brazos abiertos bajo el cielo azul', en: 'Cristo de la Concordia with open arms under a blue sky'},
  },
  {
    tourId: 'tour-city-tour-cochabamba',
    key: 'hl2',
    file: 'libre-palacio.jpg',
    credit: 'Unsplash',
    alt: {es: 'Palacete de estilo europeo con jardines, fuente y montañas al fondo', en: 'European-style mansion with gardens, a fountain and mountains behind'},
  },
  {
    tourId: 'tour-city-tour-cochabamba',
    key: 'hl3',
    file: 'libre-mansion.jpg',
    credit: 'Unsplash',
    alt: {es: 'Mansión neoclásica con columnas y jardín de rosas', en: 'Neoclassical mansion with columns and a rose garden'},
  },
  {
    tourId: 'tour-city-tour-cochabamba',
    key: 'hl4',
    file: 'libre-cochabamba.jpg',
    credit: 'Unsplash',
    alt: {es: 'Techos de Cochabamba con el cerro San Pedro y el Cristo al fondo', en: 'Cochabamba rooftops with San Pedro hill and the Christ statue behind'},
  },
  {
    tourId: 'tour-toro-toro',
    key: 'hl5',
    file: 'libre-pueblo-andino.jpg',
    credit: 'Unsplash',
    alt: {es: 'Caballos ensillados en un valle seco de montaña junto a un pequeño pueblo', en: 'Saddled horses in a dry mountain valley next to a small village'},
  },
  {
    tourId: 'tour-incallajta-totora',
    key: 'hl4',
    file: 'libre-calle-colonial.jpg',
    credit: 'Unsplash',
    alt: {es: 'Calle empedrada en pendiente con techos de teja y macetas con flores', en: 'Steep cobblestone street with tiled roofs and flower pots'},
  },
  {
    tourId: 'tour-incallajta-totora',
    key: 'hl5',
    file: 'libre-cascada.jpg',
    credit: 'Unsplash',
    alt: {es: 'Cascada sobre rocas en un valle verde de montaña', en: 'Waterfall over rocks in a green mountain valley'},
  },
]

async function main() {
  console.log(APPLY ? 'Aplicando cambios…' : 'MODO PRUEBA (usa --apply para guardar)')

  const tourIds = [...new Set(HIGHLIGHT_IMAGES.map((h) => h.tourId))]
  const state = await client.fetch<{
    existing: string[]
    rating: number | null
    tours: {_id: string; highlights: {_key: string; hasImage: boolean}[] | null}[]
    drafts: string[]
  }>(
    `{
      "existing": *[_id in $ids]._id,
      "rating": *[_id == "siteSettings"][0].googleRating,
      "tours": *[_id in $tourIds]{_id, "highlights": highlights[]{_key, "hasImage": defined(image.asset)}},
      "drafts": *[_id in $draftIds]._id
    }`,
    {
      ids: [...TESTIMONIALS.map((t) => t._id), ...CATEGORIES.map((c) => c._id)],
      tourIds,
      draftIds: ['drafts.siteSettings', ...tourIds.map((id) => `drafts.${id}`)],
    },
  )
  if (state.drafts.length) {
    throw new Error(`Hay borradores sin publicar (${state.drafts.join(', ')}). Publícalos o descártalos antes de aplicar.`)
  }

  const tx = client.transaction()

  for (const t of TESTIMONIALS) {
    if (state.existing.includes(t._id)) continue
    tx.createIfNotExists({
      _id: t._id,
      _type: 'testimonial',
      name: t.name,
      rating: 5,
      text: lt(t.text),
      sourceUrl: GOOGLE_REVIEWS_URL,
      order: t.order,
    })
    console.log(`  · Testimonio: ${t.name}`)
  }
  if (state.rating !== 5) {
    tx.patch('siteSettings', (p) => p.set({googleRating: 5}))
    console.log('  · Calificación de Google: 5')
  }

  for (const c of CATEGORIES) {
    if (state.existing.includes(c._id)) continue
    tx.createIfNotExists({_id: c._id, _type: 'tourCategory', title: ls(c.title)})
    console.log(`  · Tipo de tour: ${c.title.es}`)
  }

  const patches = new Map<string, Record<string, unknown>>()
  for (const h of HIGHLIGHT_IMAGES) {
    const highlight = state.tours.find((t) => t._id === h.tourId)?.highlights?.find((x) => x._key === h.key)
    if (!highlight || highlight.hasImage) continue
    const file = path.join(WEB_DIR, h.file)
    if (!existsSync(file)) {
      console.log(`  ! Falta ${h.file}: ${h.tourId} / ${h.key} sigue sin foto`)
      continue
    }
    const assetId = APPLY
      ? (
          await client.assets.upload('image', createReadStream(file), {
            filename: h.file,
            ...(h.credit ? {creditLine: h.credit} : {}),
          })
        )._id
      : `image-PRUEBA-${h.file}`
    const set = patches.get(h.tourId) ?? {}
    set[`highlights[_key=="${h.key}"].image`] = {
      _type: 'imageWithAlt',
      asset: {_type: 'reference', _ref: assetId},
      alt: ls(h.alt),
    }
    patches.set(h.tourId, set)
    console.log(`  · Foto: ${h.tourId} / ${h.key} ← ${h.file}`)
  }
  for (const [tourId, set] of patches) tx.patch(tourId, (p) => p.set(set))

  if (!APPLY) {
    console.log('Modo prueba: no se guardó nada.')
    return
  }
  await tx.commit()
  console.log('Listo.')
}

main().catch((error) => {
  console.error(error)
  process.exit(1)
})
