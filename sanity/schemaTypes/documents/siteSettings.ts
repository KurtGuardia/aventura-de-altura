import {defineArrayMember, defineField, defineType} from 'sanity'

/** Bloque "título + texto" usado en las listas de Seguridad y Por qué elegirnos. */
const featureItem = defineArrayMember({
  name: 'featureItem',
  title: 'Punto',
  type: 'object',
  fields: [
    defineField({name: 'title', title: 'Título', type: 'localeString', validation: (rule) => rule.required()}),
    defineField({name: 'text', title: 'Texto', type: 'localeText'}),
  ],
  preview: {select: {title: 'title.es', subtitle: 'text.es'}},
})

export const SITE_SETTINGS_ID = 'siteSettings'

export const siteSettings = defineType({
  name: 'siteSettings',
  title: 'Ajustes del sitio',
  type: 'document',
  groups: [
    {name: 'contact', title: 'Contacto y precios', default: true},
    {name: 'hero', title: 'Portada'},
    {name: 'facts', title: 'Datos curiosos'},
    {name: 'safety', title: 'Seguridad'},
    {name: 'whyUs', title: 'Por qué elegirnos'},
    {name: 'about', title: 'Nosotros'},
    {name: 'custom', title: 'Tour personalizado'},
    {name: 'booking', title: 'Política de reserva'},
    {name: 'google', title: 'Reseñas de Google'},
  ],
  fields: [
    // ── Contacto ───────────────────────────────────────────────
    defineField({
      name: 'whatsappPrimary',
      title: 'WhatsApp principal',
      type: 'string',
      group: 'contact',
      description: 'Con código de país, por ejemplo +591 76922077. Es el número al que llevan los botones de WhatsApp.',
      validation: (rule) =>
        rule
          .required()
          .regex(/^\+\d[\d\s]{6,}$/, {name: 'teléfono'})
          .warning('Escribe el número con + y código de país, por ejemplo +591 76922077.'),
    }),
    defineField({
      name: 'whatsappSecondary',
      title: 'WhatsApp secundario (opcional)',
      type: 'string',
      group: 'contact',
      description: 'Con código de país, por ejemplo +591 68500428.',
      validation: (rule) =>
        rule
          .regex(/^\+\d[\d\s]{6,}$/, {name: 'teléfono'})
          .warning('Escribe el número con + y código de país, por ejemplo +591 68500428.'),
    }),
    defineField({
      name: 'email',
      title: 'Correo electrónico',
      type: 'string',
      group: 'contact',
      validation: (rule) => rule.email().error('El correo no parece válido.'),
    }),
    defineField({
      name: 'facebook',
      title: 'Página de Facebook',
      type: 'url',
      group: 'contact',
      description: 'Enlace completo, por ejemplo https://www.facebook.com/AventuraDeAlturaBolivia',
    }),
    defineField({
      name: 'instagram',
      title: 'Perfil de Instagram',
      type: 'url',
      group: 'contact',
      description: 'Enlace completo, por ejemplo https://www.instagram.com/aventuradealturabolivia',
    }),
    defineField({
      name: 'contactLanguages',
      title: 'Idiomas de atención',
      type: 'localeText',
      group: 'contact',
      description: 'En qué idiomas atienden y si hay traductor para otros idiomas.',
    }),
    defineField({
      name: 'exchangeRate',
      title: 'Tipo de cambio USD → Bs',
      type: 'number',
      group: 'contact',
      description:
        'Opcional. Si se completa, la web muestra el precio aproximado en Bs junto al USD',
      validation: (rule) => rule.positive(),
    }),

    // ── Portada (hero) ─────────────────────────────────────────
    defineField({
      name: 'heroTitle',
      title: 'Título principal',
      type: 'localeString',
      group: 'hero',
      description: 'Por ejemplo: "Descubre Bolivia. Vive la aventura."',
    }),
    defineField({
      name: 'heroRotatingWords',
      title: 'Palabras que se alternan en el título',
      type: 'array',
      group: 'hero',
      description:
        'La última palabra del título se va cambiando por estas, una tras otra (por ejemplo: cumbre, historia, selva). Escribe una sola palabra por casilla. Si lo dejas vacío, el título queda fijo.',
      of: [defineArrayMember({type: 'localeString', title: 'Palabra'})],
      validation: (rule) =>
        rule.custom((words?: {es?: string; en?: string}[]) => {
          const multi = (words ?? []).some((w) => /\s/.test((w.es ?? '').trim()) || /\s/.test((w.en ?? '').trim()))
          return multi ? 'Usa una sola palabra por casilla.' : true
        }).warning(),
    }),
    defineField({
      name: 'heroCtaLabel',
      title: 'Texto del botón principal',
      type: 'localeString',
      group: 'hero',
      description: 'Botón que lleva a los tours. Por ejemplo: "Encuentra tu próxima aventura".',
    }),
    defineField({
      name: 'heroSubtitle',
      title: 'Subtítulo',
      type: 'localeText',
      group: 'hero',
    }),
    defineField({
      name: 'heroImage',
      title: 'Foto de portada',
      type: 'imageWithAlt',
      group: 'hero',
      description: 'Foto grande y horizontal que aparece al abrir la web.',
    }),

    // ── Datos curiosos ─────────────────────────────────────────
    defineField({
      name: 'funFacts',
      title: 'Datos curiosos de Bolivia',
      type: 'array',
      group: 'facts',
      description:
        'Cifras sorprendentes de lugares de Bolivia. Se alternan en la portada y se muestran en la sección "Bolivia en cifras". En la sección se ven 6 a la vez y se van turnando: lo ideal son 12 o más.',
      of: [
        defineArrayMember({
          name: 'funFact',
          title: 'Dato',
          type: 'object',
          fields: [
            defineField({
              name: 'value',
              title: 'Cifra',
              type: 'number',
              description: 'Solo el número, con punto para decimales. Por ejemplo 3812 o 34.2.',
              validation: (rule) => rule.required(),
            }),
            defineField({
              name: 'unit',
              title: 'Unidad (opcional)',
              type: 'localeString',
              description: 'Va justo después de la cifra. Por ejemplo "msnm", "km²" o "huellas".',
            }),
            defineField({
              name: 'place',
              title: 'Lugar',
              type: 'localeString',
              description: 'Por ejemplo "Lago Titicaca".',
              validation: (rule) => rule.required(),
            }),
            defineField({
              name: 'text',
              title: 'Dato en pocas palabras',
              type: 'localeString',
              description: 'Una frase corta. Por ejemplo "El lago navegable más alto del mundo".',
              validation: (rule) => rule.required(),
            }),
          ],
          preview: {
            select: {value: 'value', unit: 'unit.es', place: 'place.es', text: 'text.es'},
            prepare: ({value, unit, place, text}) => ({
              title: [value, unit].filter(Boolean).join(' ') + (place ? ` · ${place}` : ''),
              subtitle: text,
            }),
          },
        }),
      ],
    }),

    // ── Seguridad ──────────────────────────────────────────────
    defineField({
      name: 'safety',
      title: 'Sección "Seguridad y calidad"',
      type: 'object',
      group: 'safety',
      options: {collapsible: false},
      fields: [
        defineField({name: 'title', title: 'Título', type: 'localeString'}),
        defineField({name: 'intro', title: 'Texto introductorio', type: 'localeText'}),
        defineField({
          name: 'items',
          title: 'Puntos',
          type: 'array',
          description: 'Por ejemplo: guías certificados, botiquín y protocolos, gestión de riesgos.',
          of: [featureItem],
        }),
        defineField({name: 'image', title: 'Foto', type: 'imageWithAlt'}),
      ],
    }),

    // ── Por qué elegirnos ──────────────────────────────────────
    defineField({
      name: 'whyUs',
      title: 'Sección "Por qué elegirnos"',
      type: 'object',
      group: 'whyUs',
      options: {collapsible: false},
      fields: [
        defineField({name: 'title', title: 'Título', type: 'localeString'}),
        defineField({
          name: 'items',
          title: 'Razones',
          type: 'array',
          of: [featureItem],
        }),
      ],
    }),

    // ── Nosotros ───────────────────────────────────────────────
    defineField({
      name: 'about',
      title: 'Sección "Nosotros"',
      type: 'object',
      group: 'about',
      options: {collapsible: false},
      fields: [
        defineField({name: 'title', title: 'Título', type: 'localeString'}),
        defineField({name: 'text', title: 'Texto', type: 'localeText', description: 'Historia y equipo. Mejor párrafos cortos.'}),
        defineField({
          name: 'image',
          title: 'Foto',
          type: 'imageWithAlt',
          description:
            'Una foto del equipo o de un grupo de viajeros. Aparece junto al texto. Si la dejas vacía, la sección se muestra solo con texto.',
        }),
      ],
    }),

    // ── Tour personalizado ─────────────────────────────────────
    defineField({
      name: 'customTour',
      title: 'Sección "Tour personalizado"',
      type: 'object',
      group: 'custom',
      description: 'Invita a pedir un viaje a medida por WhatsApp.',
      options: {collapsible: false},
      fields: [
        defineField({name: 'title', title: 'Título', type: 'localeString'}),
        defineField({name: 'text', title: 'Texto', type: 'localeText'}),
        defineField({name: 'image', title: 'Foto', type: 'imageWithAlt'}),
        defineField({
          name: 'buttonLabel',
          title: 'Texto del botón',
          type: 'localeString',
          description: 'Por ejemplo: "Diseña tu viaje".',
        }),
      ],
    }),

    // ── Política de reserva ────────────────────────────────────
    defineField({
      name: 'bookingPolicy',
      title: 'Política de reserva y cancelación',
      type: 'localeText',
      group: 'booking',
      description: 'Se muestra en la sección de contacto.',
    }),

    // ── Reseñas de Google ──────────────────────────────────────
    defineField({
      name: 'googleRating',
      title: 'Calificación en Google',
      type: 'number',
      group: 'google',
      description:
        'La nota promedio que aparece en Google, por ejemplo 4.9. Actualízala a mano de vez en cuando. Usa punto, no coma.',
      validation: (rule) => rule.min(1).max(5).precision(1),
    }),
    defineField({
      name: 'googleReviewCount',
      title: 'Cantidad de reseñas en Google',
      type: 'number',
      group: 'google',
      description: 'Cuántas reseñas tiene el perfil en Google, por ejemplo 87.',
      validation: (rule) => rule.min(0).integer(),
    }),
    defineField({
      name: 'googleReviewsUrl',
      title: 'Enlace a las reseñas de Google',
      type: 'url',
      group: 'google',
      description:
        'Abre el perfil de la empresa en Google Maps, pulsa "Compartir" y pega aquí el enlace. La web lo usará en el botón "Ver reseñas en Google".',
    }),
  ],
  preview: {
    prepare: () => ({title: 'Ajustes del sitio'}),
  },
})
