import {defineField, defineType} from 'sanity'

export const testimonial = defineType({
  name: 'testimonial',
  title: 'Testimonio',
  type: 'document',
  fields: [
    defineField({
      name: 'name',
      title: 'Nombre',
      type: 'string',
      validation: (rule) => rule.required(),
    }),
    defineField({
      name: 'country',
      title: 'País',
      type: 'string',
    }),
    defineField({
      name: 'text',
      title: 'Testimonio',
      type: 'localeText',
      description: 'Copia el comentario tal como lo escribió la persona.',
      validation: (rule) => rule.required(),
    }),
    defineField({
      name: 'source',
      title: 'Dónde se publicó (opcional)',
      type: 'string',
      options: {list: ['Facebook', 'Google', 'TripAdvisor', 'WhatsApp', 'Otro']},
    }),
    defineField({
      name: 'sourceUrl',
      title: 'Enlace a la reseña original (opcional)',
      type: 'url',
      description: 'Si la reseña está publicada, pega aquí el enlace. Le da más credibilidad.',
    }),
  ],
  preview: {
    select: {title: 'name', country: 'country', source: 'source'},
    prepare: ({title, country, source}) => ({
      title,
      subtitle: [country, source].filter(Boolean).join(' · '),
    }),
  },
})
