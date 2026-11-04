import {defineField, defineType} from 'sanity'

export const galleryImage = defineType({
  name: 'galleryImage',
  title: 'Foto de la galería',
  type: 'document',
  fields: [
    defineField({
      name: 'image',
      title: 'Foto',
      type: 'image',
      options: {hotspot: true},
      validation: (rule) => rule.required(),
    }),
    defineField({
      name: 'alt',
      title: 'Descripción de la foto',
      type: 'localeString',
      description:
        'Describe en pocas palabras lo que se ve (por ejemplo: "Huellas de dinosaurio en Toro Toro"). Ayuda a Google y a personas con discapacidad visual.',
      validation: (rule) => rule.required().warning('Falta la descripción de la foto.'),
    }),
    defineField({
      name: 'order',
      title: 'Orden',
      type: 'number',
      description: 'Las fotos con número menor aparecen primero.',
      validation: (rule) => rule.integer(),
    }),
  ],
  orderings: [
    {title: 'Orden', name: 'orderAsc', by: [{field: 'order', direction: 'asc'}]},
  ],
  preview: {
    select: {title: 'alt.es', media: 'image', order: 'order'},
    prepare: ({title, media, order}) => ({
      title: title || 'Foto sin descripción',
      subtitle: order != null ? `Orden: ${order}` : undefined,
      media,
    }),
  },
})
