/**
 * Carga fotos provisionales en el singleton "Galería" (documento `gallery`).
 * Independiente de scripts/seed.ts: no toca tours ni ajustes.
 *
 * Uso:  npx tsx scripts/seed-gallery.ts [--force]
 * Si la galería ya existe, no hace nada salvo que se pase --force (en ese
 * caso REEMPLAZA todas sus fotos, incluidas las que haya subido el cliente).
 *
 * Requiere en .env.local: NEXT_PUBLIC_SANITY_PROJECT_ID,
 * NEXT_PUBLIC_SANITY_DATASET y SANITY_API_WRITE_TOKEN.
 * Fotos: carpeta ../fotos (se puede cambiar con FOTOS_DIR).
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

const FOTOS_DIR = path.resolve(process.env.FOTOS_DIR ?? '../fotos')
const GALLERY_ID = 'gallery'
const FORCE = process.argv.includes('--force')

type Photo = {
  file: string
  alt: {es: string; en: string}
  /** Solo cuando la foto es claramente de ese tour. */
  tourId?: string
}

// Fotos provisionales. Los textos describen lo que se ve, sin afirmar lugares
// que no se pueden confirmar.
const PHOTOS: Photo[] = [
  {file: 'Pico Tunari.JPG', tourId: 'tour-pico-tunari', alt: {es: 'Grupo de excursionistas celebrando en el Pico Tunari', en: 'Group of hikers celebrating on Tunari Peak'}},
  {file: 'DSC02097.JPG', tourId: 'tour-toro-toro', alt: {es: 'Grupo con cascos junto al letrero de la caverna de Umajalanta', en: 'Group wearing helmets by the Umajalanta Cave sign'}},
  {file: 'DSC02331.JPG', tourId: 'tour-toro-toro', alt: {es: 'Huellas de dinosaurio marcadas en la roca', en: 'Dinosaur footprints imprinted in the rock'}},
  {file: 'IMG_20221028_092459.jpg', alt: {es: 'Montañistas subiendo hacia un pico nevado', en: 'Climbers heading up toward a snow-capped peak'}},
  {file: 'DSC03877.JPG', alt: {es: 'Excursionista en un mirador sobre lagunas de montaña', en: 'Hiker at a viewpoint above mountain lagoons'}},
  {file: 'Villa Tunari4.JPG', alt: {es: 'Grupo haciendo rafting en un río entre la selva', en: 'Group rafting on a jungle river'}},
  {file: 'DSC_2819.JPG', alt: {es: 'Grupo de viajeros bajo un cielo estrellado', en: 'Group of travelers under a starry sky'}},
  {file: 'DSC_0529.JPG', alt: {es: 'Formación rocosa junto a vehículos todoterreno', en: 'Rock formation next to off-road vehicles'}},
  {file: 'DSC_0744.JPG', alt: {es: 'Vista de un lago con embarcaciones junto a la orilla', en: 'View of a lake with boats near the shore'}},
  {file: 'Copacabana1.jpeg', alt: {es: 'Bote en la orilla de un lago de aguas azules', en: 'Boat on the shore of a blue lake'}},
  {file: 'Llama.jpg', alt: {es: 'Llama blanca junto a un hombre con chullo', en: 'White llama next to a man wearing a chullo hat'}},
  {file: '461481336_931866118976550_1370257978666588367_n.jpg', alt: {es: 'Portada de piedra al atardecer', en: 'Stone gateway at sunset'}},
]

async function main() {
  const existing = await client.fetch<number | null>(`count(*[_id == $id || _id == $draft][0].images)`, {
    id: GALLERY_ID,
    draft: `drafts.${GALLERY_ID}`,
  })
  if (existing && !FORCE) {
    console.log(`La galería ya tiene ${existing} fotos. No se cambió nada (usa --force para reemplazarlas).`)
    return
  }

  // Comprueba que los tours referenciados existen antes de subir nada.
  const tourIds = [...new Set(PHOTOS.flatMap((p) => (p.tourId ? [p.tourId] : [])))]
  const found = await client.fetch<string[]>(`*[_id in $ids]._id`, {ids: tourIds})
  const missing = tourIds.filter((id) => !found.includes(id))
  if (missing.length) throw new Error(`No existen estos tours: ${missing.join(', ')}`)

  console.log(`Subiendo ${PHOTOS.length} fotos desde ${FOTOS_DIR}…`)
  const images = []
  for (const [i, {file, alt, tourId}] of PHOTOS.entries()) {
    const filePath = path.join(FOTOS_DIR, file)
    if (!existsSync(filePath)) throw new Error(`No se encontró la foto: ${filePath}`)
    // Sanity deduplica por contenido: una foto ya subida no se duplica.
    const asset = await client.assets.upload('image', createReadStream(filePath), {filename: file})
    images.push({
      _key: `img${i + 1}`,
      _type: 'galleryItem',
      asset: {_type: 'reference', _ref: asset._id},
      alt: {_type: 'localeString', ...alt},
      ...(tourId ? {tour: {_type: 'reference', _ref: tourId, _weak: true}} : {}),
    })
    console.log(`  ✓ ${file}${tourId ? `  →  ${tourId}` : ''}`)
  }

  await client
    .transaction()
    .createOrReplace({_id: GALLERY_ID, _type: 'gallery', images})
    .delete(`drafts.${GALLERY_ID}`)
    .commit()
  console.log(`Listo: galería con ${images.length} fotos.`)
}

main().catch((error) => {
  console.error(error)
  process.exit(1)
})
