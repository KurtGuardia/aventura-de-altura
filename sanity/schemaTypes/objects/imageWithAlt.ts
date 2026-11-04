import {defineField, defineType} from 'sanity'

/** Imagen con recorte (hotspot) y texto alternativo en dos idiomas. */
export const imageWithAlt = defineType({
  name: 'imageWithAlt',
  title: 'Imagen',
  type: 'image',
  options: {hotspot: true},
  fields: [
    defineField({
      name: 'alt',
      title: 'Descripción de la imagen',
      type: 'localeString',
      description:
        'Describe en pocas palabras lo que se ve en la foto (por ejemplo: "Grupo en la cumbre del Pico Tunari"). Ayuda a Google y a personas con discapacidad visual.',
      validation: (rule) => rule.required().warning('Falta la descripción de la imagen.'),
    }),
  ],
  preview: {
    select: {title: 'alt.es', media: 'asset'},
    prepare: ({title, media}) => ({title: title || 'Imagen sin descripción', media}),
  },
})
