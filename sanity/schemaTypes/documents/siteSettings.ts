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
    {name: 'contact', title: 'Contacto', default: true},
    {name: 'hero', title: 'Portada'},
    {name: 'safety', title: 'Seguridad'},
    {name: 'whyUs', title: 'Por qué elegirnos'},
    {name: 'about', title: 'Nosotros'},
    {name: 'custom', title: 'Tour personalizado'},
    {name: 'booking', title: 'Política de reserva'},
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

    // ── Portada (hero) ─────────────────────────────────────────
    defineField({
      name: 'heroTitle',
      title: 'Título principal',
      type: 'localeString',
      group: 'hero',
      description: 'Por ejemplo: "Descubre Bolivia. Vive la aventura."',
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
          name: 'images',
          title: 'Fotos del equipo',
          type: 'array',
          of: [defineArrayMember({type: 'imageWithAlt'})],
          options: {layout: 'grid'},
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
  ],
  preview: {
    prepare: () => ({title: 'Ajustes del sitio'}),
  },
})
