import {defineArrayMember, defineField, defineType} from 'sanity'
import {checkLocaleMaxLength, type LocaleValue} from '../objects/locale'

const PRICE_TIERS = [
  {name: 'p1', title: '1 persona'},
  {name: 'p2', title: '2 personas'},
  {name: 'p3', title: '3 personas'},
  {name: 'p4', title: '4 personas'},
  {name: 'p5plus', title: '5 o más personas'},
] as const

type Prices = Partial<Record<(typeof PRICE_TIERS)[number]['name'], number>>

export const tour = defineType({
  name: 'tour',
  title: 'Tour',
  type: 'document',
  groups: [
    {name: 'cover', title: 'Portada', default: true},
    {name: 'facts', title: 'Datos rápidos'},
    {name: 'highlights', title: 'Destacados'},
    {name: 'options', title: 'Itinerario y precios'},
    {name: 'includes', title: 'Incluye / Requisitos'},
    {name: 'gallery', title: 'Galería'},
    {name: 'control', title: 'Control'},
  ],
  fields: [
    // ── Portada ────────────────────────────────────────────────
    defineField({
      name: 'title',
      title: 'Nombre del tour',
      type: 'localeString',
      group: 'cover',
      validation: (rule) => rule.required(),
    }),
    defineField({
      name: 'slug',
      title: 'Dirección web (URL)',
      type: 'slug',
      group: 'cover',
      description:
        'Se usa en el enlace del tour, por ejemplo /es/tours/pico-tunari. Pulsa "Generar" para crearla a partir del nombre. Evita cambiarla una vez publicado el tour.',
      options: {source: 'title.es', maxLength: 96},
      validation: (rule) => rule.required().error('La dirección web es obligatoria.'),
    }),
    defineField({
      name: 'category',
      title: 'Tipo de tour',
      type: 'string',
      group: 'cover',
      options: {
        list: [
          {title: 'Trekking', value: 'trekking'},
          {title: 'Alta montaña', value: 'alta-montana'},
          {title: 'Naturaleza', value: 'naturaleza'},
          {title: 'Cultura / ciudad', value: 'cultura'},
        ],
        layout: 'radio',
      },
      validation: (rule) => rule.required().warning('Elige el tipo de tour.'),
    }),
    defineField({
      name: 'tagline',
      title: 'Frase corta',
      type: 'localeString',
      group: 'cover',
      description: 'Una frase que resume el tour. Aparece en la tarjeta y en la portada. Máximo 90 caracteres.',
      validation: (rule) => rule.custom<LocaleValue>((value) => checkLocaleMaxLength(value, 90)),
    }),
    defineField({
      name: 'coverImage',
      title: 'Foto de portada',
      type: 'imageWithAlt',
      group: 'cover',
      description: 'Foto grande y horizontal. Es la primera imagen que ve el visitante.',
      validation: (rule) => rule.required().warning('Falta la foto de portada.'),
    }),
    defineField({
      name: 'description',
      title: 'Descripción',
      type: 'localeText',
      group: 'cover',
      description: 'Uno o dos párrafos cortos (unas 60 palabras, máximo ~400 caracteres).',
      validation: (rule) =>
        rule.custom<LocaleValue>((value) => checkLocaleMaxLength(value, 400)).warning(),
    }),

    // ── Datos rápidos ──────────────────────────────────────────
    defineField({
      name: 'quickFacts',
      title: 'Datos rápidos',
      type: 'object',
      group: 'facts',
      options: {collapsible: false},
      fields: [
        defineField({
          name: 'difficulty',
          title: 'Dificultad',
          type: 'string',
          options: {
            list: [
              {title: 'Baja', value: 'baja'},
              {title: 'Media', value: 'media'},
              {title: 'Alta', value: 'alta'},
            ],
            layout: 'radio',
            direction: 'horizontal',
          },
          validation: (rule) => rule.required().warning('Falta indicar la dificultad del tour.'),
        }),
        defineField({
          name: 'altitude',
          title: 'Altitud máxima (msnm)',
          type: 'number',
          description: 'En metros sobre el nivel del mar, solo el número (por ejemplo: 5030). Déjalo vacío si no aplica.',
          validation: (rule) => rule.min(0).integer(),
        }),
        defineField({
          name: 'departureCity',
          title: 'Ciudad de salida',
          type: 'string',
          initialValue: 'Cochabamba',
        }),
        defineField({
          name: 'languages',
          title: 'Idiomas del tour',
          type: 'array',
          of: [defineArrayMember({type: 'string'})],
          options: {
            list: [
              {title: 'Español', value: 'es'},
              {title: 'Inglés', value: 'en'},
              {title: 'Francés (con traductor)', value: 'fr'},
              {title: 'Alemán (con traductor)', value: 'de'},
              {title: 'Portugués (con traductor)', value: 'pt'},
            ],
            layout: 'grid',
          },
        }),
      ],
    }),

    // ── Destacados ─────────────────────────────────────────────
    defineField({
      name: 'highlights',
      title: 'Lo mejor del tour',
      type: 'array',
      group: 'highlights',
      description: 'Entre 3 y 5 atractivos principales, cada uno con una foto.',
      of: [
        defineArrayMember({
          name: 'highlight',
          title: 'Atractivo',
          type: 'object',
          fields: [
            defineField({name: 'title', title: 'Título', type: 'localeString', validation: (rule) => rule.required()}),
            defineField({name: 'text', title: 'Texto', type: 'localeText'}),
            defineField({name: 'image', title: 'Foto', type: 'imageWithAlt'}),
          ],
          preview: {
            select: {title: 'title.es', media: 'image'},
          },
        }),
      ],
      validation: (rule) => rule.min(3).max(5).warning('Lo ideal son entre 3 y 5 atractivos.'),
    }),

    // ── Itinerario y precios ───────────────────────────────────
    defineField({
      name: 'options',
      title: 'Opciones del tour',
      type: 'array',
      group: 'options',
      description:
        'Normalmente hay una sola opción. Agrega más si el tour tiene variantes de duración (por ejemplo: 1, 2 o 3 días).',
      of: [
        defineArrayMember({
          name: 'tourOption',
          title: 'Opción',
          type: 'object',
          fields: [
            defineField({
              name: 'label',
              title: 'Nombre de la opción',
              type: 'localeString',
              description: 'Por ejemplo: "Full day", "2 días / 1 noche".',
              validation: (rule) => rule.required(),
            }),
            defineField({
              name: 'durationDays',
              title: 'Duración (días)',
              type: 'number',
              validation: (rule) => rule.required().min(1).integer().warning('Falta la duración.'),
            }),
            defineField({
              name: 'nights',
              title: 'Noches',
              type: 'number',
              initialValue: 0,
              validation: (rule) => rule.min(0).integer(),
            }),
            defineField({
              name: 'lodging',
              title: 'Hospedaje',
              type: 'string',
              description: 'Nombre del hotel o tipo de alojamiento. Déjalo vacío si no incluye hospedaje.',
            }),
            defineField({
              name: 'itinerary',
              title: 'Itinerario',
              type: 'array',
              of: [
                defineArrayMember({
                  name: 'itineraryDay',
                  title: 'Día',
                  type: 'object',
                  fields: [
                    defineField({
                      name: 'day',
                      title: 'Número de día',
                      type: 'number',
                      validation: (rule) => rule.required().min(1).integer(),
                    }),
                    defineField({
                      name: 'items',
                      title: 'Actividades',
                      type: 'array',
                      of: [
                        defineArrayMember({
                          name: 'itineraryItem',
                          title: 'Actividad',
                          type: 'object',
                          fields: [
                            defineField({
                              name: 'time',
                              title: 'Hora (opcional)',
                              type: 'string',
                              description: 'Formato 24 h, por ejemplo 07:00.',
                              validation: (rule) =>
                                rule
                                  .regex(/^([01]\d|2[0-3]):[0-5]\d$/, {name: 'hora'})
                                  .warning('Usa el formato HH:MM, por ejemplo 07:00.'),
                            }),
                            defineField({
                              name: 'text',
                              title: 'Actividad',
                              type: 'localeString',
                              validation: (rule) => rule.required(),
                            }),
                          ],
                          preview: {
                            select: {time: 'time', text: 'text.es'},
                            prepare: ({time, text}) => ({
                              title: time ? `${time} · ${text ?? ''}` : text,
                            }),
                          },
                        }),
                      ],
                    }),
                  ],
                  preview: {
                    select: {day: 'day', items: 'items'},
                    prepare: ({day, items}) => ({
                      title: `Día ${day ?? '?'}`,
                      subtitle: `${items?.length ?? 0} actividades`,
                    }),
                  },
                }),
              ],
            }),
            defineField({
              name: 'prices',
              title: 'Precios por persona (USD)',
              type: 'object',
              description: 'Precio por persona en dólares, según el tamaño del grupo. Solo el número.',
              options: {columns: 5},
              fields: PRICE_TIERS.map(({name, title}) =>
                defineField({
                  name,
                  title,
                  type: 'number',
                  validation: (rule) => rule.min(0),
                }),
              ),
              validation: (rule) =>
                rule
                  .custom<Prices>((value) => {
                    const missing = PRICE_TIERS.filter(({name}) => value?.[name] == null)
                    if (missing.length === 0) return true
                    if (missing.length === PRICE_TIERS.length) return 'Faltan los precios.'
                    return `Faltan precios para: ${missing.map((t) => t.title).join(', ')}.`
                  })
                  .warning(),
            }),
          ],
          preview: {
            select: {title: 'label.es', days: 'durationDays', nights: 'nights', price: 'prices.p5plus'},
            prepare: ({title, days, nights, price}) => ({
              title,
              subtitle: [
                days ? `${days} ${days === 1 ? 'día' : 'días'}` : null,
                nights ? `${nights} ${nights === 1 ? 'noche' : 'noches'}` : null,
                price != null ? `5+ pers.: USD ${price}` : null,
              ]
                .filter(Boolean)
                .join(' · '),
            }),
          },
        }),
      ],
      validation: (rule) => rule.required().min(1).warning('Agrega al menos una opción con su itinerario y precios.'),
    }),

    // ── Incluye / Requisitos ───────────────────────────────────
    defineField({
      name: 'includes',
      title: 'Incluye',
      type: 'array',
      group: 'includes',
      description: 'Un elemento por línea, por ejemplo "Transporte privado".',
      of: [defineArrayMember({type: 'localeString'})],
    }),
    defineField({
      name: 'excludes',
      title: 'No incluye',
      type: 'array',
      group: 'includes',
      description: 'Por ejemplo: impuestos, propinas, seguro de viaje.',
      of: [defineArrayMember({type: 'localeString'})],
      validation: (rule) => rule.required().min(1).warning('Indica qué no incluye el tour.'),
    }),
    defineField({
      name: 'requirements',
      title: 'Requisitos y qué llevar',
      type: 'array',
      group: 'includes',
      description: 'Condición física, aclimatación, ropa y equipo recomendado.',
      of: [defineArrayMember({type: 'localeString'})],
      validation: (rule) => rule.required().min(1).warning('Faltan los requisitos y qué llevar.'),
    }),
    defineField({
      name: 'notes',
      title: 'Notas',
      type: 'localeText',
      group: 'includes',
      description: 'Aclaraciones opcionales, por ejemplo "Los horarios pueden variar".',
    }),

    // ── Galería ────────────────────────────────────────────────
    defineField({
      name: 'gallery',
      title: 'Galería del tour',
      type: 'array',
      group: 'gallery',
      of: [defineArrayMember({type: 'imageWithAlt'})],
      options: {layout: 'grid'},
    }),

    // ── Control ────────────────────────────────────────────────
    defineField({
      name: 'featured',
      title: 'Destacado en la página de inicio',
      type: 'boolean',
      group: 'control',
      description: 'Actívalo para mostrar este tour en la sección "Tours destacados".',
      initialValue: false,
    }),
    defineField({
      name: 'order',
      title: 'Orden',
      type: 'number',
      group: 'control',
      description: 'Los tours con número menor aparecen primero (1, 2, 3…).',
      validation: (rule) => rule.integer(),
    }),
  ],
  orderings: [
    {title: 'Orden', name: 'orderAsc', by: [{field: 'order', direction: 'asc'}]},
  ],
  preview: {
    select: {title: 'title.es', media: 'coverImage', featured: 'featured', category: 'category'},
    prepare: ({title, media, featured}) => ({
      title: title || 'Tour sin nombre',
      subtitle: featured ? '★ Destacado' : undefined,
      media,
    }),
  },
})
