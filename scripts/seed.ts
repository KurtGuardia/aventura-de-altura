/**
 * Carga el contenido inicial en Sanity: los 3 tours de docs/02-tours.md y
 * los ajustes del sitio. Es idempotente: usa IDs fijos y createOrReplace, así
 * que se puede volver a correr sin duplicar nada (pero SOBRESCRIBE esos
 * documentos, incluidos los cambios hechos a mano en el Studio).
 *
 * Uso:  npx tsx scripts/seed.ts
 * Requiere en .env.local: NEXT_PUBLIC_SANITY_PROJECT_ID,
 * NEXT_PUBLIC_SANITY_DATASET y SANITY_API_WRITE_TOKEN.
 * Fotos: carpeta ../fotos (se puede cambiar con FOTOS_DIR).
 *
 * Regla: no inventar datos. Dificultad, requisitos, "no incluye", precios
 * faltantes y altitudes desconocidas se dejan vacíos a propósito.
 */
import {createReadStream, existsSync} from 'node:fs'
import path from 'node:path'
import {loadEnvFile} from 'node:process'
import {createClient, type SanityDocument} from '@sanity/client'

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

// ─── Helpers ───────────────────────────────────────────────────────────────

type Loc = {es: string; en: string}

const loc = (es: string, en: string) => ({_type: 'localeString', es, en})
const locText = (es: string, en: string) => ({_type: 'localeText', es, en})

/** Añade _key estables a los elementos de un array (Sanity los exige). */
function keyed<T extends object>(prefix: string, items: T[]) {
  return items.map((item, i) => ({_key: `${prefix}${i + 1}`, ...item}))
}

const locList = (prefix: string, items: [string, string][]) =>
  keyed(prefix, items.map(([es, en]) => loc(es, en)))

// Fotos provisionales: archivo → texto alternativo (describe lo que se ve).
const PHOTOS = {
  tunariGroup: {file: 'Pico Tunari.JPG', alt: {es: 'Grupo de excursionistas celebrando en una ladera rocosa', en: 'Group of hikers celebrating on a rocky slope'}},
  snowPeak: {file: 'IMG_20221028_092459.jpg', alt: {es: 'Montañistas subiendo hacia un pico nevado', en: 'Climbers heading up toward a snow-capped peak'}},
  trail: {file: 'IMG_20221015_123836_1.jpg', alt: {es: 'Excursionistas caminando por un sendero de montaña', en: 'Hikers walking along a mountain trail'}},
  lagoon: {file: 'IMG-20201126-WA0041.jpg', alt: {es: 'Laguna de altura rodeada de montañas', en: 'High-altitude lagoon surrounded by mountains'}},
  hikersSnow: {file: '1920173_723988037640917_487544959_n.jpg', alt: {es: 'Dos excursionistas frente a montañas nevadas', en: 'Two hikers facing snowy mountains'}},
  viewpoint: {file: 'DSC03877.JPG', alt: {es: 'Excursionista en un mirador sobre lagunas de montaña', en: 'Hiker at a viewpoint above mountain lagoons'}},
  canyon: {file: 'CIMG2175.JPG', alt: {es: 'Visitantes caminando por un estrecho cañón de roca', en: 'Visitors walking through a narrow rock canyon'}},
  umajalanta: {file: 'DSC02097.JPG', alt: {es: 'Grupo con cascos junto al letrero de la caverna de Umajalanta', en: 'Group wearing helmets by the Umajalanta Cave sign'}},
  dinoTracks: {file: 'DSC02331.JPG', alt: {es: 'Huellas de dinosaurio marcadas en la roca', en: 'Dinosaur footprints imprinted in the rock'}},
  rockArt: {file: 'DSC00881.JPG', alt: {es: 'Pinturas rupestres sobre roca rojiza', en: 'Rock paintings on reddish stone'}},
  rockArt2: {file: 'DSC00882.JPG', alt: {es: 'Detalle de pinturas rupestres', en: 'Close-up of rock paintings'}},
  market: {file: 'DSC_0083.JPG', alt: {es: 'Puesto de textiles y sombreros en un mercado andino', en: 'Textile and hat stall at an Andean market'}},
} satisfies Record<string, {file: string; alt: Loc}>

type PhotoKey = keyof typeof PHOTOS

const assetIds = new Map<string, string>()

async function uploadAll() {
  for (const {file} of Object.values(PHOTOS)) {
    if (assetIds.has(file)) continue
    const filePath = path.join(FOTOS_DIR, file)
    if (!existsSync(filePath)) throw new Error(`No se encontró la foto: ${filePath}`)
    // Sanity deduplica por contenido: volver a subir la misma foto no crea copias.
    const asset = await client.assets.upload('image', createReadStream(filePath), {filename: file})
    assetIds.set(file, asset._id)
    console.log(`  ✓ foto ${file}`)
  }
}

function img(key: PhotoKey) {
  const {file, alt} = PHOTOS[key]
  const ref = assetIds.get(file)
  if (!ref) throw new Error(`La foto ${file} no se subió.`)
  return {
    _type: 'imageWithAlt',
    asset: {_type: 'reference', _ref: ref},
    alt: loc(alt.es, alt.en),
  }
}

const gallery = (prefix: string, keys: PhotoKey[]) => keyed(prefix, keys.map(img))

type Highlight = {title: Loc; text: Loc; image?: PhotoKey}
const highlights = (items: Highlight[]) =>
  keyed(
    'hl',
    items.map(({title, text, image}) => ({
      _type: 'highlight',
      title: loc(title.es, title.en),
      text: locText(text.es, text.en),
      ...(image ? {image: img(image)} : {}),
    })),
  )

type Item = [time: string | null, es: string, en: string]
const day = (n: number, items: Item[]) => ({
  _type: 'itineraryDay',
  day: n,
  items: keyed(
    `d${n}i`,
    items.map(([time, es, en]) => ({
      _type: 'itineraryItem',
      ...(time ? {time} : {}),
      text: loc(es, en),
    })),
  ),
})

type Prices = Partial<Record<'p1' | 'p2' | 'p3' | 'p4' | 'p5plus', number>>
type Option = {
  label: Loc
  durationDays: number
  nights: number
  lodging?: string
  itinerary?: ReturnType<typeof day>[]
  prices: Prices
}
const options = (items: Option[]) =>
  keyed(
    'opt',
    items.map(({label, itinerary, ...rest}) => ({
      _type: 'tourOption',
      label: loc(label.es, label.en),
      ...rest,
      ...(itinerary ? {itinerary: keyed('day', itinerary)} : {}),
    })),
  )

// ─── Tipos de tour ─────────────────────────────────────────────────────────

const CATEGORIES = {
  trekking: loc('Trekking', 'Trekking'),
  'alta-montana': loc('Alta montaña', 'High mountain'),
  naturaleza: loc('Naturaleza', 'Nature'),
  cultura: loc('Cultura', 'Culture'),
}
type CategoryKey = keyof typeof CATEGORIES

const categoryId = (key: CategoryKey) => `tourCategory-${key}`

function categoryDocs(): SanityDocument[] {
  return Object.entries(CATEGORIES).map(
    ([key, title]) =>
      ({_id: categoryId(key as CategoryKey), _type: 'tourCategory', title}) as unknown as SanityDocument,
  )
}

const categories = (...keys: CategoryKey[]) =>
  keys.map((key) => ({_key: key, _type: 'reference', _ref: categoryId(key)}))

// ─── Tours ─────────────────────────────────────────────────────────────────

function tunari(): SanityDocument {
  return {
    _id: 'tour-pico-tunari',
    _type: 'tour',
    title: loc('Pico Tunari Full Day', 'Tunari Peak Full Day'),
    slug: {_type: 'slug', current: 'pico-tunari'},
    categories: categories('trekking', 'alta-montana'),
    tagline: loc(
      'Cumbre a 5.030 msnm en un solo día, a 2 horas de Cochabamba.',
      'Reach a 5,030 m summit in a single day, 2 hours from Cochabamba.',
    ),
    coverImage: img('tunariGroup'),
    description: locText(
      'Sube al pico más emblemático de Cochabamba en una sola jornada. Tras unas 2 horas de viaje, caminamos desde el campamento base hasta la cumbre, a 5.030 msnm, entre fauna de la región y paisajes de montaña. De vuelta en el campamento te espera un almuerzo con bebidas frescas. Transporte privado y guías especializados incluidos.',
      "Climb Cochabamba's most iconic peak in a single day. After a drive of about 2 hours, we hike from base camp to the 5,030 m summit, enjoying the local wildlife and majestic mountain views. Back at base camp, lunch and cold drinks await. Private transport and specialized guides included.",
    ),
    quickFacts: {
      altitude: 5030,
      departureCity: 'Cochabamba',
      languages: ['es', 'en'],
    },
    highlights: highlights([
      {
        title: {es: 'Cumbre a 5.030 msnm', en: '5,030 m summit'},
        text: {es: 'El pico más emblemático de Cochabamba.', en: "Cochabamba's most iconic peak."},
        image: 'snowPeak',
      },
      {
        title: {es: 'Trekking de alta montaña', en: 'High-mountain trek'},
        text: {es: 'Unas 2,5 horas de subida desde el campamento base.', en: 'About 2.5 hours uphill from base camp.'},
        image: 'trail',
      },
      {
        title: {es: 'Fauna y paisajes andinos', en: 'Andean wildlife and scenery'},
        text: {es: 'Montañas majestuosas y la fauna típica de la región.', en: 'Majestic mountains and the typical local wildlife.'},
        image: 'lagoon',
      },
      {
        title: {es: 'Almuerzo en el campamento base', en: 'Lunch at base camp'},
        text: {es: 'Almuerzo y bebidas frescas para celebrar la cumbre.', en: 'Lunch and cold drinks to celebrate the summit.'},
        image: 'hikersSnow',
      },
    ]),
    options: options([
      {
        label: {es: 'Full day', en: 'Full day'},
        durationDays: 1,
        nights: 0,
        itinerary: [
          day(1, [
            ['07:00', 'Salida desde Cochabamba. Bebida caliente durante el viaje.', 'Departure from Cochabamba. Hot drink on the way.'],
            [null, 'Viaje de unas 2 horas apreciando la fauna y los paisajes de la ruta.', 'About a 2-hour drive enjoying the wildlife and scenery along the way.'],
            [null, 'Llegada al campamento base e inicio del trekking hacia la cumbre.', 'Arrival at base camp and start of the trek to the summit.'],
            ['12:30', 'Cumbre del Tunari, a 5.030 msnm (hora aproximada).', 'Tunari summit, 5,030 m (approximate time).'],
            [null, 'Descenso al campamento base (unas 2 horas). Almuerzo con bebidas.', 'Descent to base camp (about 2 hours). Lunch with drinks.'],
            ['15:00', 'Inicio del regreso a Cochabamba (hora aproximada).', 'Start of the return trip to Cochabamba (approximate time).'],
            ['18:00', 'Llegada a Cochabamba (hora aproximada).', 'Arrival in Cochabamba (approximate time).'],
          ]),
        ],
        prices: {p1: 166, p2: 88, p3: 66, p4: 54, p5plus: 48},
      },
    ]),
    includes: locList('inc', [
      ['Transporte privado', 'Private transport'],
      ['Guías especializados', 'Specialized guides'],
      ['Almuerzo y refrigerios', 'Lunch and snacks'],
      ['Cooler con agua, jugos y gaseosas', 'Cooler with water, juice and soda'],
    ]),
    gallery: gallery('gal', ['tunariGroup', 'hikersSnow', 'viewpoint', 'trail']),
    featured: true,
    order: 1,
  } as unknown as SanityDocument
}

function toroToro(): SanityDocument {
  const lodging = 'Hotel Villa Etelvina / Cabañas de Umajalanta'
  return {
    _id: 'tour-toro-toro',
    _type: 'tour',
    title: loc('Toro Toro', 'Toro Toro'),
    slug: {_type: 'slug', current: 'toro-toro'},
    categories: categories('naturaleza'),
    tagline: loc(
      'Huellas de dinosaurios, cavernas y cañones en el Parque Nacional Toro Toro.',
      'Dinosaur tracks, caves and canyons in Toro Toro National Park.',
    ),
    coverImage: img('canyon'),
    description: locText(
      'Explora uno de los parques más sorprendentes de Bolivia. Camina junto a huellas de dinosaurios de unos 130 millones de años, entra en Umajalanta, la caverna más profunda del país, y desciende al cañón de El Vergel, con pozas naturales y cascada. Transporte privado, guías, entradas y alimentación incluidos.',
      "Explore one of Bolivia's most remarkable parks. Walk beside dinosaur tracks around 130 million years old, step into Umajalanta, the country's deepest cave, and descend into El Vergel canyon with its natural pools and waterfall. Private transport, guides, entrance fees and meals included.",
    ),
    quickFacts: {
      departureCity: 'Cochabamba',
      languages: ['es', 'en'],
    },
    highlights: highlights([
      {
        title: {es: 'Huellas de dinosaurios', en: 'Dinosaur tracks'},
        text: {es: 'Rastros del Cretácico, de unos 130 millones de años.', en: 'Cretaceous tracks, around 130 million years old.'},
        image: 'dinoTracks',
      },
      {
        title: {es: 'Caverna de Umajalanta', en: 'Umajalanta Cave'},
        text: {es: 'La caverna más profunda de Bolivia.', en: 'The deepest cave in Bolivia.'},
        image: 'umajalanta',
      },
      {
        title: {es: 'Cañón de El Vergel', en: 'El Vergel Canyon'},
        text: {es: 'Un cañón de unos 150 m con pozas naturales y cascada.', en: 'A canyon about 150 m deep with natural pools and a waterfall.'},
        image: 'canyon',
      },
      {
        title: {es: 'Ciudad de Itas', en: 'City of Itas'},
        text: {es: 'Formaciones rocosas con pinturas rupestres.', en: 'Rock formations with ancient cave paintings.'},
        image: 'rockArt',
      },
      {
        title: {es: 'Pueblo de Toro Toro', en: 'Toro Toro village'},
        text: {es: 'Un pueblo con historia que se remonta a 1592.', en: 'A village whose history dates back to 1592.'},
      },
    ]),
    options: options([
      {
        label: {es: '1 día (sin hospedaje)', en: '1 day (no lodging)'},
        durationDays: 1,
        nights: 0,
        prices: {p1: 318, p2: 182, p3: 136, p4: 112, p5plus: 98},
      },
      {
        label: {es: '2 días / 1 noche', en: '2 days / 1 night'},
        durationDays: 2,
        nights: 1,
        lodging,
        itinerary: [
          day(1, [
            ['06:00', 'Recojo del hotel.', 'Hotel pick-up.'],
            ['06:30', 'Salida hacia Toro Toro.', 'Departure to Toro Toro.'],
            ['10:00', 'Llegada, registro y entrada al Parque Nacional.', 'Arrival, check-in and entry to the National Park.'],
            ['10:20', 'Caverna de Umajalanta (unas 3 horas).', 'Umajalanta Cave (about 3 hours).'],
            ['13:00', 'Almuerzo.', 'Lunch.'],
            ['14:30', 'Salida hacia la Ciudad de Itas.', 'Departure to the City of Itas.'],
            ['15:00', 'Visita a la Ciudad de Itas (unas 3 horas).', 'Visit to the City of Itas (about 3 hours).'],
            ['16:30', 'Refrigerio.', 'Snack break.'],
            ['18:00', 'Regreso al hotel.', 'Return to the hotel.'],
            ['19:30', 'Cena.', 'Dinner.'],
            ['20:30', 'Fogata.', 'Campfire.'],
          ]),
          day(2, [
            ['07:30', 'Desayuno y check-out.', 'Breakfast and check-out.'],
            ['08:30', 'Circuito de El Vergel: miradores, descenso al cañón, cascadas y pozas.', 'El Vergel circuit: viewpoints, descent into the canyon, waterfalls and pools.'],
            ['12:30', 'Regreso al pueblo.', 'Return to the village.'],
            ['13:30', 'Almuerzo.', 'Lunch.'],
            ['14:30', 'Museo Pachamama Huasi y centro artesanal.', 'Pachamama Huasi Museum and craft center.'],
            ['16:00', 'Salida hacia Cochabamba.', 'Departure to Cochabamba.'],
            ['19:30', 'Llegada a Cochabamba.', 'Arrival in Cochabamba.'],
          ]),
        ],
        prices: {p1: 462, p2: 264, p3: 198, p4: 164, p5plus: 144},
      },
      {
        label: {es: '3 días / 2 noches', en: '3 days / 2 nights'},
        durationDays: 3,
        nights: 2,
        lodging,
        prices: {p1: 588, p2: 360, p3: 284, p4: 246, p5plus: 224},
      },
    ]),
    includes: locList('inc', [
      ['Transporte privado Cochabamba – Toro Toro – Cochabamba y entre atractivos', 'Private transport Cochabamba – Toro Toro – Cochabamba and between sites'],
      ['Guía coordinador 24/7, guías locales y especializados', '24/7 tour coordinator, local and specialized guides'],
      ['Entradas al parque y a los atractivos', 'Park and site entrance fees'],
      ['Alimentación completa (desayuno, almuerzo y cena), snacks y cooler', 'All meals (breakfast, lunch and dinner), snacks and cooler'],
      ['Hospedaje en habitación simple, doble o familiar con baño privado (opciones de 2 y 3 días)', 'Lodging in single, double or family rooms with private bathroom (2- and 3-day options)'],
    ]),
    excludes: locList('exc', [['Impuestos', 'Taxes']]),
    notes: locText(
      'El itinerario se puede personalizar según las preferencias del grupo.',
      "The itinerary can be customized to the group's preferences.",
    ),
    gallery: gallery('gal', ['canyon', 'umajalanta', 'dinoTracks', 'rockArt', 'rockArt2']),
    featured: true,
    order: 2,
  } as unknown as SanityDocument
}

function cityTour(): SanityDocument {
  return {
    _id: 'tour-city-tour-cochabamba',
    _type: 'tour',
    title: loc('City Tour Cochabamba', 'Cochabamba City Tour'),
    slug: {_type: 'slug', current: 'city-tour-cochabamba'},
    categories: categories('cultura'),
    tagline: loc(
      'Tres días para descubrir la historia, la cultura y la cocina de Cochabamba.',
      "Three days to discover Cochabamba's history, culture and food.",
    ),
    coverImage: img('market'),
    description: locText(
      'Descubre Cochabamba con calma y en buenas manos. En tres días recorrerás el Cristo de la Concordia, el Palacio Portales, Villa Albina y el centro histórico, con almuerzos en restaurantes locales. Te acompaña un guía con formación en emergencias médicas, seguridad y rescate. Incluye transporte privado desde el aeropuerto.',
      'Discover Cochabamba at an easy pace and in good hands. Over three days you will visit Cristo de la Concordia, Palacio Portales, Villa Albina and the historic center, with lunches at local restaurants. Your guide is trained in first aid, safety and rescue. Private transport from the airport included.',
    ),
    quickFacts: {
      difficulty: 'baja',
      departureCity: 'Cochabamba',
      languages: ['es', 'en'],
    },
    highlights: highlights([
      {
        title: {es: 'Cristo de la Concordia', en: 'Cristo de la Concordia'},
        text: {es: 'Vista de la ciudad, con opción de subir en teleférico.', en: 'City views, with the option to ride the cable car.'},
      },
      {
        title: {es: 'Palacio Portales', en: 'Palacio Portales'},
        text: {es: 'Visita guiada a uno de los íconos de la ciudad.', en: "Guided visit to one of the city's landmarks."},
      },
      {
        title: {es: 'Villa Albina', en: 'Villa Albina'},
        text: {es: 'Una tarde en la Villa Albina, en Pairumani.', en: 'An afternoon at Villa Albina, in Pairumani.'},
      },
      {
        title: {es: 'Centro histórico', en: 'Historic center'},
        text: {es: 'El Prado, la plaza principal, la catedral y el convento de Santa Teresa.', en: 'El Prado, the main square, the cathedral and Santa Teresa convent.'},
      },
      {
        title: {es: 'Mercado y cocina local', en: 'Market and local food'},
        text: {es: 'Un mercado tradicional y almuerzos en restaurantes locales.', en: 'A traditional market and lunches at local restaurants.'},
        image: 'market',
      },
    ]),
    options: options([
      {
        label: {es: '3 días / 2 noches', en: '3 days / 2 nights'},
        durationDays: 3,
        nights: 2,
        itinerary: [
          day(1, [
            ['08:00', 'Recojo en el aeropuerto Jorge Wilstermann y traslado al hotel (early check-in opcional).', 'Pick-up at Jorge Wilstermann Airport and transfer to the hotel (optional early check-in).'],
            ['10:00', 'Cristo de la Concordia (opción de subir en teleférico).', 'Cristo de la Concordia (optional cable car ride).'],
            ['12:30', 'Almuerzo en Paprika.', 'Lunch at Paprika.'],
            ['14:00', 'Paseo del Prado, plaza principal y catedral de San Sebastián.', 'El Prado boulevard, main square and San Sebastián Cathedral.'],
            ['15:30', 'Museo-convento de Santa Teresa.', 'Santa Teresa Convent Museum.'],
            ['17:00', 'Parque del Arquitecto.', 'Parque del Arquitecto.'],
            ['17:30', 'Regreso al hotel.', 'Return to the hotel.'],
          ]),
          day(2, [
            ['09:30', 'Recojo en el hotel.', 'Hotel pick-up.'],
            ['10:00', 'Palacio Portales (visita guiada).', 'Palacio Portales (guided visit).'],
            ['12:00', 'Almuerzo en La Estancia.', 'Lunch at La Estancia.'],
            ['14:00', 'Villa Albina (Pairumani).', 'Villa Albina (Pairumani).'],
            ['17:30', 'Regreso a la ciudad.', 'Return to the city.'],
          ]),
          day(3, [
            ['09:45', 'Check-out.', 'Check-out.'],
            ['10:00', 'Visita al mercado.', 'Market visit.'],
            ['12:00', 'Almuerzo en una casa de campo.', 'Lunch at a country house.'],
            ['14:30', 'Cafetería Typica (Palacio Portales).', 'Typica café (Palacio Portales).'],
            [null, 'Por la tarde, traslado al aeropuerto.', 'Afternoon transfer to the airport.'],
          ]),
        ],
        // Solo existe el precio para grupos de 3 personas.
        prices: {p3: 245},
      },
    ]),
    includes: locList('inc', [
      ['Transporte privado', 'Private transport'],
      ['Guía local con formación en emergencias médicas, seguridad y rescate', 'Local guide trained in first aid, safety and rescue'],
      ['Cooler y refrigerios', 'Cooler and snacks'],
      ['Alimentación indicada en el itinerario', 'Meals listed in the itinerary'],
    ]),
    notes: locText(
      'Los horarios pueden variar según la apertura del Palacio Portales.',
      'Times may vary depending on Palacio Portales opening hours.',
    ),
    gallery: gallery('gal', ['market']),
    featured: true,
    order: 3,
  } as unknown as SanityDocument
}

// ─── Ajustes del sitio ─────────────────────────────────────────────────────

function siteSettings(): SanityDocument {
  return {
    _id: 'siteSettings',
    _type: 'siteSettings',
    whatsappPrimary: '+591 76922077',
    whatsappSecondary: '+591 68500428',
    facebook: 'https://www.facebook.com/AventuraDeAlturaBolivia',
    contactLanguages: locText('Atendemos en español e inglés.', 'We assist you in Spanish and English.'),
    heroTitle: loc('Descubre Bolivia. Vive la aventura.', 'Discover Bolivia. Live the adventure.'),
    heroCtaLabel: loc('Encuentra tu próxima aventura', 'Find your next adventure'),
    heroImage: img('snowPeak'),
    about: {
      title: loc('Nosotros', 'About us'),
      text: locText(
        'Aventura de Altura es una operadora de turismo en Bolivia especializada en experiencias de aventura seguras, auténticas y personalizadas. Nuestro objetivo es que cada viajero descubra los destinos más impresionantes del país con la tranquilidad de estar acompañado por un equipo altamente preparado.',
        "Aventura de Altura is a Bolivian tour operator specializing in safe, authentic and personalized adventure experiences. Our goal is for every traveler to discover the country's most impressive destinations with the peace of mind of being accompanied by a highly trained team.",
      ),
    },
  } as unknown as SanityDocument
}

// ─── Main ──────────────────────────────────────────────────────────────────

async function main() {
  console.log(`Subiendo fotos desde ${FOTOS_DIR}…`)
  await uploadAll()

  const docs = [...categoryDocs(), tunari(), toroToro(), cityTour(), siteSettings()]
  const tx = client.transaction()
  for (const doc of docs) {
    tx.createOrReplace(doc)
    // Elimina borradores viejos para que el Studio muestre lo publicado.
    tx.delete(`drafts.${doc._id}`)
  }
  await tx.commit()
  for (const doc of docs) console.log(`  ✓ ${doc._type} ${doc._id}`)
  console.log('Listo.')
}

main().catch((error) => {
  console.error(error)
  process.exit(1)
})
