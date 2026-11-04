import {defineField, defineType} from 'sanity'

const stars = (rating?: number) =>
  rating ? '★'.repeat(rating) + '☆'.repeat(Math.max(0, 5 - rating)) : ''

export const testimonial = defineType({
  name: 'testimonial',
  title: 'Testimonio',
  type: 'document',
  fields: [
    defineField({
      name: 'name',
      title: 'Nombre',
      type: 'string',
      description: 'Nombre y la inicial del apellido, por ejemplo "María G.".',
      validation: (rule) => rule.required(),
    }),
    defineField({
      name: 'country',
      title: 'País (opcional)',
      type: 'string',
    }),
    defineField({
      name: 'rating',
      title: 'Calificación',
      type: 'number',
      description: 'Cuántas estrellas dio la persona.',
      initialValue: 5,
      options: {
        list: [5, 4, 3, 2, 1].map((value) => ({title: stars(value), value})),
        layout: 'radio',
      },
      validation: (rule) => rule.required().min(1).max(5).integer(),
    }),
    defineField({
      name: 'text',
      title: 'Testimonio',
      type: 'localeText',
      description: 'Copia el comentario tal como lo escribió la persona.',
      validation: (rule) => rule.required(),
    }),
    defineField({
      name: 'date',
      title: 'Fecha (opcional)',
      type: 'date',
      description: 'Cuándo se escribió la reseña o cuándo se hizo el viaje.',
      options: {dateFormat: 'DD/MM/YYYY'},
    }),
    defineField({
      name: 'sourceUrl',
      title: 'Enlace a la reseña original (opcional)',
      type: 'url',
      description:
        'Si la reseña está publicada (Google, Facebook, TripAdvisor…), pega aquí el enlace. Le da más credibilidad.',
    }),
    defineField({
      name: 'order',
      title: 'Orden',
      type: 'number',
      description: 'Los testimonios con número menor aparecen primero (1, 2, 3…).',
      validation: (rule) => rule.integer(),
    }),
  ],
  orderings: [
    {title: 'Orden', name: 'orderAsc', by: [{field: 'order', direction: 'asc'}]},
  ],
  preview: {
    select: {name: 'name', rating: 'rating', country: 'country'},
    prepare: ({name, rating, country}) => ({
      title: name,
      subtitle: [stars(rating), country].filter(Boolean).join(' · '),
    }),
  },
})
