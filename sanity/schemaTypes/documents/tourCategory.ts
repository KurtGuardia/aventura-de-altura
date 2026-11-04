import {defineField, defineType} from 'sanity'

/** Tipo de tour (Trekking, Naturaleza…). El cliente puede crear los que quiera. */
export const tourCategory = defineType({
  name: 'tourCategory',
  title: 'Tipo de tour',
  type: 'document',
  fields: [
    defineField({
      name: 'title',
      title: 'Nombre',
      type: 'localeString',
      description: 'Por ejemplo: "Trekking", "Naturaleza", "Cultura".',
      validation: (rule) => rule.required(),
    }),
  ],
  preview: {
    select: {title: 'title.es', subtitle: 'title.en'},
  },
})
