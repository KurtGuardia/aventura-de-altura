/**
 * Patch puntual de contenido (2026-11-15). Idempotente: se puede repetir sin duplicar nada.
 *
 * 1. Ajustes: política de reserva y cancelación (borrador para que el cliente la revise)
 *    y calificación de Google 5.0 (la real; estaba en 4.9).
 * 2. Quita las fotos de Wikimedia Commons que se habían puesto en "Lo mejor del tour" y en la
 *    galería del tour nuevo (se prefieren fotos propias del cliente) y borra esos archivos de Sanity.
 * 3. Galería: añade las fotos de ../fotos que aún no estaban (los .NEF, ya convertidos a JPG).
 * 4. Tour nuevo "Incallajta + Totora" (de la publicación de Instagram del 26-nov-2025),
 *    sin precios ni dificultad: el cliente debe completarlos.
 *
 * Solo toca esos campos: no pisa lo demás que haya editado el cliente.
 *
 * Uso:  npx tsx scripts/patch-content-2026-11-15.ts          (modo prueba: solo muestra qué haría)
 *       npx tsx scripts/patch-content-2026-11-15.ts --apply  (aplica los cambios)
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
const FOTOS_DIR = path.resolve('../fotos')
const WEB_DIR = path.resolve('../imagenes-web')

type Loc = {es: string; en: string}
const ls = (v: Loc) => ({_type: 'localeString', ...v})
const lt = (v: Loc) => ({_type: 'localeText', ...v})

type Upload = {file: string; credit?: string; source?: {name: string; url: string}}

const uploaded = new Map<string, string>()
/** Sube una imagen (Sanity deduplica por contenido) y devuelve el id del asset. */
async function upload({file, credit, source}: Upload): Promise<string> {
  const cached = uploaded.get(file)
  if (cached) return cached
  if (!existsSync(file)) throw new Error(`No se encontró la imagen: ${file}`)
  if (!APPLY) {
    uploaded.set(file, `image-PRUEBA-${path.basename(file)}`)
    return uploaded.get(file)!
  }
  const asset = await client.assets.upload('image', createReadStream(file), {
    filename: path.basename(file),
    ...(credit ? {creditLine: credit} : {}),
    ...(source ? {source: {name: source.name, url: source.url, id: source.url}} : {}),
  })
  uploaded.set(file, asset._id)
  return asset._id
}

const imageWithAlt = (assetId: string, alt: Loc) => ({
  _type: 'imageWithAlt',
  asset: {_type: 'reference', _ref: assetId},
  alt: ls(alt),
})

// ── 1. Ajustes ────────────────────────────────────────────────
const BOOKING_POLICY: Loc = {
  es: `Reserva: para confirmar tu tour pedimos un adelanto del 50 % del total. El saldo se paga antes de comenzar el tour. Te enviamos la confirmación por WhatsApp con la fecha, el horario y el punto de recojo.

Cambios: puedes cambiar la fecha una vez sin costo, avisando con al menos 72 horas de anticipación y según disponibilidad.

Cancelación: si cancelas con 7 días o más de anticipación, te devolvemos el adelanto completo. Entre 6 días y 72 horas antes, devolvemos el 50 % del adelanto. Con menos de 72 horas, o si no te presentas, el adelanto no es reembolsable.

Clima y seguridad: si tenemos que suspender el tour por mal tiempo, bloqueos de caminos u otras causas ajenas a ti, te ofrecemos otra fecha o la devolución total de lo pagado. Tu seguridad está primero: el guía puede ajustar o detener una actividad si las condiciones no son seguras.`,
  en: `Booking: to confirm your tour we ask for a 50% deposit. The balance is paid before the tour starts. We send you the confirmation on WhatsApp with the date, time and pick-up point.

Changes: you can change the date once at no cost, with at least 72 hours' notice and subject to availability.

Cancellation: if you cancel 7 days or more in advance, we refund the full deposit. Between 6 days and 72 hours before, we refund 50% of the deposit. With less than 72 hours' notice, or if you don't show up, the deposit is non-refundable.

Weather and safety: if we have to cancel the tour due to bad weather, road blockades or other causes beyond your control, we offer you another date or a full refund. Your safety comes first: the guide may adjust or stop an activity if conditions are not safe.`,
}

const CITY_TOUR_ID = 'tour-city-tour-cochabamba'

// ── 3. Galería: fotos que faltaban ────────────────────────────
const NEW_TOUR_ID = 'tour-incallajta-totora'
const GALLERY_PHOTOS: {file: string; alt: Loc; tourId?: string}[] = [
  {file: path.join(FOTOS_DIR, '1920173_723988037640917_487544959_n.jpg'), alt: {es: 'Dos excursionistas frente a una cordillera nevada', en: 'Two hikers facing a snow-capped mountain range'}},
  {file: path.join(FOTOS_DIR, 'CIMG2175.JPG'), alt: {es: 'Excursionistas cruzando un paso estrecho entre paredes de roca', en: 'Hikers walking through a narrow passage between rock walls'}},
  {file: path.join(FOTOS_DIR, 'DSC00881.JPG'), alt: {es: 'Pinturas rupestres sobre roca rojiza', en: 'Rock paintings on reddish stone'}},
  {file: path.join(FOTOS_DIR, 'DSC00882.JPG'), alt: {es: 'Detalle de pinturas rupestres en la roca', en: 'Close-up of rock paintings'}},
  {file: path.join(FOTOS_DIR, 'DSC01825.JPG'), tourId: NEW_TOUR_ID, alt: {es: 'Muro de la Gran Kallanka de Incallajta en el valle', en: 'Wall of the Great Kallanka of Incallajta in the valley'}},
  {file: path.join(FOTOS_DIR, 'DSC_0083.JPG'), alt: {es: 'Tejidos andinos a la venta junto a vagones de tren antiguos', en: 'Andean textiles for sale next to old train carriages'}},
  {file: path.join(FOTOS_DIR, 'IMG-20201126-WA0041.jpg'), alt: {es: 'Laguna de montaña entre cerros rocosos', en: 'Mountain lagoon among rocky hills'}},
  {file: path.join(FOTOS_DIR, 'IMG-20230912-WA0123.jpg'), alt: {es: 'Puerta del Sol de Tiwanaku', en: 'Gate of the Sun at Tiwanaku'}},
  {file: path.join(FOTOS_DIR, 'IMG_20180608_114547.jpg'), tourId: NEW_TOUR_ID, alt: {es: 'Ruinas incas de piedra en la ladera de un valle', en: 'Inca stone ruins on a valley slope'}},
  {file: path.join(FOTOS_DIR, 'IMG_20221015_123836_1.jpg'), tourId: NEW_TOUR_ID, alt: {es: 'Grupo caminando entre las ruinas incas de Incallajta', en: 'Group walking among the Inca ruins of Incallajta'}},
  {file: path.join(WEB_DIR, 'DSC_0533.jpg'), tourId: 'tour-toro-toro', alt: {es: 'Montañas de capas plegadas bajo un cielo azul', en: 'Folded rock mountains under a blue sky'}},
  {file: path.join(WEB_DIR, 'DSC_0746.jpg'), alt: {es: 'Llama en una ladera frente a un gran lago al atardecer', en: 'Llama on a hillside overlooking a large lake at dusk'}},
]

// ── 4. Tour nuevo: Incallajta + Totora ────────────────────────
async function buildNewTour() {
  const kallanka = await upload({file: path.join(FOTOS_DIR, 'DSC01825.JPG')})
  const ruinas = await upload({file: path.join(FOTOS_DIR, 'IMG_20180608_114547.jpg')})
  const grupo = await upload({file: path.join(FOTOS_DIR, 'IMG_20221015_123836_1.jpg')})

  const altKallanka = {es: 'Muro de la Gran Kallanka de Incallajta en el valle', en: 'Wall of the Great Kallanka of Incallajta in the valley'}
  const altRuinas = {es: 'Ruinas incas de piedra en la ladera de un valle', en: 'Inca stone ruins on a valley slope'}
  const altGrupo = {es: 'Grupo caminando entre las ruinas incas de Incallajta', en: 'Group walking among the Inca ruins of Incallajta'}

  const item = (key: string, es: string, en: string) => ({_key: key, _type: 'itineraryItem', text: ls({es, en})})

  return {
    _id: NEW_TOUR_ID,
    _type: 'tour',
    title: ls({es: 'Incallajta + Totora', en: 'Incallajta + Totora'}),
    slug: {_type: 'slug', current: 'incallajta-totora'},
    categories: [
      {_key: 'cultura', _type: 'reference', _ref: 'tourCategory-cultura'},
      {_key: 'naturaleza', _type: 'reference', _ref: 'tourCategory-naturaleza'},
    ],
    tagline: ls({
      es: 'Ciudadela inca, pueblo colonial y cascada en un viaje 100 % privado',
      en: 'Inca citadel, colonial town and waterfall on a 100% private trip',
    }),
    coverImage: imageWithAlt(kallanka, altKallanka),
    description: lt({
      es: 'Dos días para recorrer la historia del Valle Alto. Exploramos con guía la ciudadela inca de Incallajta, con su Gran Kallanka y su torreón astronómico, y dormimos en Totora, un pueblo colonial con puentes, iglesias y casonas antiguas. Cerramos en La Pajcha, una cascada de 30 m. Tour privado, solo para tu grupo.',
      en: 'Two days exploring the history of the Valle Alto. We tour the Inca citadel of Incallajta with a guide, with its Great Kallanka and astronomical tower, and spend the night in Totora, a colonial town of bridges, churches and old mansions. We finish at La Pajcha, a 30 m waterfall. Private tour, just for your group.',
    }),
    quickFacts: {
      departureCity: 'Cochabamba',
      languages: ['es', 'en'],
    },
    highlights: [
      {
        _key: 'hl1',
        _type: 'highlight',
        title: ls({es: 'Gran Kallanka', en: 'Great Kallanka'}),
        text: lt({es: 'El gran salón inca, símbolo de Incallajta.', en: 'The great Inca hall, the symbol of Incallajta.'}),
        image: imageWithAlt(kallanka, altKallanka),
      },
      {
        _key: 'hl2',
        _type: 'highlight',
        title: ls({es: 'Ciudadela inca de Incallajta', en: 'Inca citadel of Incallajta'}),
        text: lt({es: 'Torreón astronómico, Baño de las Ñustas y miradores, con guía experto.', en: 'Astronomical tower, Baño de las Ñustas and viewpoints, with an expert guide.'}),
        image: imageWithAlt(ruinas, altRuinas),
      },
      {
        _key: 'hl3',
        _type: 'highlight',
        title: ls({es: 'Senderos entre ruinas', en: 'Trails among the ruins'}),
        text: lt({es: 'Caminatas tranquilas y rincones ideales para fotografía.', en: 'Easy walks and perfect spots for photography.'}),
        image: imageWithAlt(grupo, altGrupo),
      },
      {
        _key: 'hl4',
        _type: 'highlight',
        title: ls({es: 'Totora colonial', en: 'Colonial Totora'}),
        text: lt({es: 'Puentes coloniales, iglesias antiguas y casonas históricas.', en: 'Colonial bridges, old churches and historic mansions.'}),
      },
      {
        _key: 'hl5',
        _type: 'highlight',
        title: ls({es: 'Cascada La Pajcha', en: 'La Pajcha waterfall'}),
        text: lt({es: 'Una caída de 30 m rodeada de naturaleza.', en: 'A 30 m waterfall surrounded by nature.'}),
      },
    ],
    options: [
      {
        _key: 'opt1',
        _type: 'tourOption',
        label: ls({es: '2 días / 1 noche', en: '2 days / 1 night'}),
        duration: {value: 2, unit: 'dias'},
        nights: 1,
        lodging: 'Hospedaje en Totora',
        itinerary: [
          {
            _key: 'day1',
            _type: 'itineraryDay',
            day: 1,
            title: ls({es: 'Cochabamba → Incallajta → Totora', en: 'Cochabamba → Incallajta → Totora'}),
            items: [
              item('d1i1', 'Salida desde Cochabamba con dirección a Pocona.', 'Departure from Cochabamba toward Pocona.'),
              item('d1i2', 'Recorrido panorámico por La Angostura y el Valle Alto.', 'Scenic drive through La Angostura and the Valle Alto.'),
              item('d1i3', 'Visita guiada a la ciudadela inca de Incallajta: Gran Kallanka, Torreón Astronómico, Baño de las Ñustas, senderos y miradores.', 'Guided visit to the Inca citadel of Incallajta: Great Kallanka, Astronomical Tower, Baño de las Ñustas, trails and viewpoints.'),
              item('d1i4', 'Almuerzo típico.', 'Traditional lunch.'),
              item('d1i5', 'Visita al pueblo de Incallajta.', 'Visit to the village of Incallajta.'),
              item('d1i6', 'Refrigerio.', 'Snack break.'),
              item('d1i7', 'Llegada y hospedaje en Totora.', 'Arrival and overnight stay in Totora.'),
            ],
          },
          {
            _key: 'day2',
            _type: 'itineraryDay',
            day: 2,
            title: ls({es: 'Totora → Cochabamba', en: 'Totora → Cochabamba'}),
            items: [
              item('d2i1', 'Desayuno.', 'Breakfast.'),
              item('d2i2', 'Recorrido por Totora: puentes coloniales, arquitectura histórica e iglesias antiguas.', 'Tour of Totora: colonial bridges, historic architecture and old churches.'),
              item('d2i3', 'Visita a La Pajcha, cascada de 30 m.', 'Visit to La Pajcha, a 30 m waterfall.'),
              item('d2i4', 'Almuerzo.', 'Lunch.'),
              item('d2i5', 'Retorno privado a Cochabamba.', 'Private return to Cochabamba.'),
            ],
          },
        ],
      },
    ],
    includes: [
      {_key: 'inc1', ...ls({es: 'Transporte privado', en: 'Private transport'})},
      {_key: 'inc2', ...ls({es: 'Guía especializado en historia, naturaleza y cultura', en: 'Guide specialized in history, nature and culture'})},
      {_key: 'inc3', ...ls({es: '1 noche de hospedaje en Totora', en: '1 night of lodging in Totora'})},
      {_key: 'inc4', ...ls({es: 'Desayuno, 2 almuerzos y refrigerio', en: 'Breakfast, 2 lunches and a snack'})},
    ],
    notes: lt({
      es: 'Tour 100 % privado para familias, parejas o grupos pequeños, con ritmo flexible adaptado a tu grupo.',
      en: '100% private tour for families, couples or small groups, at a flexible pace adapted to your group.',
    }),
    gallery: [
      {_key: 'gal1', ...imageWithAlt(kallanka, altKallanka)},
      {_key: 'gal2', ...imageWithAlt(grupo, altGrupo)},
      {_key: 'gal3', ...imageWithAlt(ruinas, altRuinas)},
    ],
    featured: true,
    order: 4,
  }
}

async function main() {
  console.log(APPLY ? 'Aplicando cambios…' : 'MODO PRUEBA (usa --apply para guardar)')

  const state = await client.fetch<{
    settings: {bookingPolicy?: unknown; googleRating?: number} | null
    city: {highlights?: {_key: string; hasImage: boolean}[]} | null
    galleryAssets: string[] | null
    galleryFiles: string[] | null
    newTourExists: boolean
    drafts: string[]
  }>(
    `{
      "settings": *[_id == "siteSettings"][0]{bookingPolicy, googleRating},
      "city": *[_id == $city][0]{"highlights": highlights[]{_key, "hasImage": defined(image.asset)}},
      "galleryAssets": *[_id == "gallery"][0].images[].asset._ref,
      "galleryFiles": *[_id == "gallery"][0].images[].asset->originalFilename,
      "newTourExists": defined(*[_id == $newTour][0]._id),
      "drafts": *[_id in ["drafts.siteSettings", "drafts.gallery", "drafts." + $city]]._id
    }`,
    {city: CITY_TOUR_ID, newTour: NEW_TOUR_ID},
  )
  if (state.drafts.length) {
    throw new Error(
      `Hay borradores sin publicar en el Studio (${state.drafts.join(', ')}). Publícalos o descártalos antes de aplicar.`,
    )
  }

  const tx = client.transaction()

  // 1. Ajustes
  const settingsPatch: Record<string, unknown> = {}
  if (!state.settings?.bookingPolicy) settingsPatch.bookingPolicy = lt(BOOKING_POLICY)
  if (state.settings?.googleRating !== 5) settingsPatch.googleRating = 5
  if (Object.keys(settingsPatch).length) {
    tx.patch('siteSettings', (p) => p.set(settingsPatch))
    console.log(`  · Ajustes: ${Object.keys(settingsPatch).join(', ')}`)
  }

  // 2. Quitar fotos de Wikimedia Commons (se usarán fotos propias)
  const COMMONS = `source.name == "Wikimedia Commons"`
  const commonsUses = await client.fetch<{_id: string; hl: string[] | null; gal: string[] | null}[]>(
    `*[_id in [$city, $newTour]]{
      _id,
      "hl": highlights[image.asset->${COMMONS}]._key,
      "gal": gallery[asset->${COMMONS}]._key
    }`,
    {city: CITY_TOUR_ID, newTour: NEW_TOUR_ID},
  )
  for (const doc of commonsUses) {
    const paths = [
      ...(doc.hl ?? []).map((key) => `highlights[_key=="${key}"].image`),
      ...(doc.gal ?? []).map((key) => `gallery[_key=="${key}"]`),
    ]
    if (!paths.length) continue
    tx.patch(doc._id, (p) => p.unset(paths))
    console.log(`  · ${doc._id}: se quitan ${paths.length} fotos de Commons`)
  }
  const commonsAssets = await client.fetch<string[]>(`*[_type == "sanity.imageAsset" && ${COMMONS}]._id`)
  for (const id of commonsAssets) console.log(`  · Se borra el archivo ${id}`)

  // 4. Tour nuevo (antes que la galería, que lo referencia)
  if (!state.newTourExists) {
    tx.createIfNotExists(await buildNewTour())
    console.log(`  · Tour nuevo: ${NEW_TOUR_ID}`)
  }

  // 3. Galería
  const existingFiles = new Set(state.galleryFiles ?? [])
  const existingAssets = new Set(state.galleryAssets ?? [])
  const items: Record<string, unknown>[] = []
  for (const photo of GALLERY_PHOTOS) {
    if (existingFiles.has(path.basename(photo.file))) continue
    const assetId = await upload({file: photo.file})
    if (existingAssets.has(assetId)) continue
    items.push({
      _key: `img-${path.basename(photo.file).replace(/[^A-Za-z0-9]/g, '').slice(0, 24).toLowerCase()}`,
      _type: 'galleryItem',
      asset: {_type: 'reference', _ref: assetId},
      alt: ls(photo.alt),
      ...(photo.tourId ? {tour: {_type: 'reference', _ref: photo.tourId, _weak: true}} : {}),
    })
    console.log(`  · Galería: ${path.basename(photo.file)}${photo.tourId ? ` → ${photo.tourId}` : ''}`)
  }
  if (items.length) tx.patch('gallery', (p) => p.setIfMissing({images: []}).append('images', items))

  if (!APPLY) {
    console.log('Modo prueba: no se guardó nada.')
    return
  }
  await tx.commit()
  // Después del commit: Sanity no deja borrar un archivo que siga referenciado.
  for (const id of commonsAssets) await client.delete(id)
  console.log('Listo.')
}

main().catch((error) => {
  console.error(error)
  process.exit(1)
})
