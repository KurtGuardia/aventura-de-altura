/**
 * Borrador de textos para las secciones de la home que estaban vacías:
 * "Seguridad y calidad", "Por qué elegirnos" y "Tour personalizado", más una
 * foto provisional para "Nosotros".
 *
 * NO sobrescribe nada: usa setIfMissing campo por campo sobre `siteSettings`
 * (y sobre su borrador, si existe). Lo que el cliente ya haya escrito se
 * respeta, así que se puede volver a correr sin riesgo.
 *
 * Uso:  npx tsx scripts/seed-sections.ts
 * Requiere en .env.local: NEXT_PUBLIC_SANITY_PROJECT_ID,
 * NEXT_PUBLIC_SANITY_DATASET y SANITY_API_WRITE_TOKEN.
 * Fotos: carpeta ../fotos (se puede cambiar con FOTOS_DIR).
 *
 * Regla: solo hechos de docs/01-briefing.md y docs/02-tours.md. Sin
 * certificaciones, cifras ni años de experiencia que no estén en los docs.
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
const SETTINGS_ID = 'siteSettings'

const loc = (es: string, en: string) => ({_type: 'localeString', es, en})
const locText = (es: string, en: string) => ({_type: 'localeText', es, en})

type Point = {title: [string, string]; text: [string, string]}
const points = (prefix: string, items: Point[]) =>
  items.map(({title, text}, i) => ({
    _key: `${prefix}${i + 1}`,
    _type: 'featureItem',
    title: loc(...title),
    text: locText(...text),
  }))

// ─── Textos ────────────────────────────────────────────────────────────────

const SAFETY = {
  title: loc('Seguridad y calidad', 'Safety and quality'),
  // "equipo altamente preparado": texto institucional de 02-tours.md.
  intro: locText(
    'Viajas acompañado por un equipo altamente preparado, para que solo te preocupes de disfrutar.',
    'You travel with a highly trained team, so all you have to do is enjoy the trip.',
  ),
  items: points('safety', [
    {
      // 01-briefing.md y "Incluye" del City Tour.
      title: ['Guías preparados para emergencias', 'Guides trained for emergencies'],
      text: [
        'Nuestros guías tienen formación en emergencias médicas, seguridad preventiva y rescate.',
        'Our guides are trained in medical emergencies, preventive safety and rescue.',
      ],
    },
    {
      // "Incluye" de Toro Toro: guía coordinador 24/7, guías locales y especializados.
      title: ['Guía coordinador 24/7', '24/7 coordinating guide'],
      text: [
        'Un guía coordinador está pendiente del grupo las 24 horas, junto a guías locales y especializados.',
        'A coordinating guide looks after the group around the clock, together with local and specialized guides.',
      ],
    },
    {
      // "Incluye" de los tres tours.
      title: ['Transporte privado', 'Private transport'],
      text: [
        'Viajas en transporte privado desde Cochabamba y entre los atractivos de cada tour.',
        'You travel by private transport from Cochabamba and between each tour’s sights.',
      ],
    },
    {
      // Nota de Toro Toro: itinerario personalizable según las preferencias del cliente.
      title: ['Itinerarios adaptables', 'Flexible itineraries'],
      text: [
        'Ajustamos el itinerario a tu grupo y a tus preferencias.',
        'We adapt the itinerary to your group and your preferences.',
      ],
    },
  ]),
}

const WHY_US = {
  title: loc('Por qué elegirnos', 'Why choose us'),
  items: points('why', [
    {
      // Posicionamiento del briefing.
      title: ['Nos encargamos de todos los detalles', 'We take care of every detail'],
      text: [
        'Transporte, guías y comidas organizados por nosotros, para que disfrutes Bolivia con tranquilidad.',
        'Transport, guides and meals arranged by us, so you can enjoy Bolivia with peace of mind.',
      ],
    },
    {
      title: ['Viajes a medida', 'Tailor-made trips'],
      text: [
        'Armamos el viaje según tus días, tu grupo y lo que quieras vivir.',
        'We plan the trip around your days, your group and what you want to experience.',
      ],
    },
    {
      title: ['Atención directa por WhatsApp', 'Direct contact on WhatsApp'],
      text: [
        'Hablas directamente con nuestro equipo, en español o en inglés.',
        'You talk directly with our team, in Spanish or English.',
      ],
    },
  ]),
}

const CUSTOM_TOUR = {
  title: loc('Arma tu propio tour por Bolivia', 'Build your own tour of Bolivia'),
  text: locText(
    '¿Quieres conocer un destino que no está entre nuestros tours? Cuéntanos qué te gustaría vivir, cuántos viajan y cuántos días tienes, y armamos un itinerario a tu medida por Bolivia.',
    'Want to visit a place that isn’t among our tours? Tell us what you’d like to experience, how many of you are traveling and how many days you have, and we’ll put together a tailor-made itinerary across Bolivia.',
  ),
  buttonLabel: loc('Arma tu tour', 'Build your tour'),
}

// Fotos provisionales. Los textos describen lo que se ve, sin afirmar lugares.
const PHOTOS = {
  // No se usa en ninguna otra sección ni en la galería.
  customTour: {
    file: 'DSC01825.JPG',
    alt: loc('Muros de piedra antiguos en un valle andino', 'Ancient stone walls in an Andean valley'),
  },
  // Está en la galería (posición 7), fuera de la vista previa de 6 fotos de la home.
  // El grupo está abajo en una foto vertical: el hotspot evita que el recorte lo corte.
  about: {
    file: 'DSC_2819.JPG',
    alt: loc('Grupo de viajeros bajo un cielo estrellado', 'Group of travelers under a starry sky'),
    hotspot: {_type: 'sanity.imageHotspot', x: 0.5, y: 0.82, width: 0.7, height: 0.3},
  },
}

async function uploadImage({file, alt, hotspot}: {file: string; alt: ReturnType<typeof loc>; hotspot?: object}) {
  const filePath = path.join(FOTOS_DIR, file)
  if (!existsSync(filePath)) throw new Error(`No se encontró la foto: ${filePath}`)
  // Sanity deduplica por contenido: una foto ya subida no se duplica.
  const asset = await client.assets.upload('image', createReadStream(filePath), {filename: file})
  console.log(`  ✓ foto ${file}`)
  return {
    _type: 'imageWithAlt',
    asset: {_type: 'reference', _ref: asset._id},
    alt,
    ...(hotspot ? {hotspot} : {}),
  }
}

async function main() {
  const ids = await client.fetch<string[]>(`*[_id in $ids]._id`, {
    ids: [SETTINGS_ID, `drafts.${SETTINGS_ID}`],
  })
  if (!ids.includes(SETTINGS_ID)) throw new Error('No existe el documento siteSettings publicado.')

  console.log(`Subiendo fotos desde ${FOTOS_DIR}…`)
  const customTourImage = await uploadImage(PHOTOS.customTour)
  const aboutImage = await uploadImage(PHOTOS.about)

  // Primero los objetos contenedores, luego cada campo: así no se pisa un
  // campo que el cliente ya completó aunque el resto de la sección esté vacío.
  const tx = client.transaction()
  for (const id of ids) {
    tx.patch(id, (p) => p.setIfMissing({safety: {}, whyUs: {}, customTour: {}, about: {}}))
    tx.patch(id, (p) =>
      p.setIfMissing({
        'safety.title': SAFETY.title,
        'safety.intro': SAFETY.intro,
        'safety.items': SAFETY.items,
        'whyUs.title': WHY_US.title,
        'whyUs.items': WHY_US.items,
        'customTour.title': CUSTOM_TOUR.title,
        'customTour.text': CUSTOM_TOUR.text,
        'customTour.buttonLabel': CUSTOM_TOUR.buttonLabel,
        'customTour.image': customTourImage,
        'about.image': aboutImage,
      }),
    )
  }
  await tx.commit()
  console.log(`Listo: secciones completadas donde faltaban (${ids.join(', ')}).`)
}

main().catch((error) => {
  console.error(error)
  process.exit(1)
})
