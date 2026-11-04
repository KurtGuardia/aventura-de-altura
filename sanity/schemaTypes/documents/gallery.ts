import {defineArrayMember, defineField, defineType} from 'sanity'

export const GALLERY_ID = 'gallery'

/**
 * Singleton con las fotos de la galería de la home.
 * Los elementos del array son de tipo `image` (no objetos), así el cliente
 * puede arrastrar varias fotos a la vez sobre la cuadrícula y reordenarlas.
 */
export const gallery = defineType({
  name: 'gallery',
  title: 'Galería',
  type: 'document',
  fields: [
    defineField({
      name: 'images',
      title: 'Fotos',
      type: 'array',
      description:
        'Arrastra aquí varias fotos a la vez para subirlas. Para cambiar el orden, arrastra cada miniatura a su nueva posición. Haz clic en una foto para añadir su descripción o el tour relacionado.',
      options: {layout: 'grid'},
      of: [
        defineArrayMember({
          name: 'galleryItem',
          title: 'Foto',
          type: 'image',
          options: {hotspot: true},
          fields: [
            defineField({
              name: 'alt',
              title: 'Descripción de la foto (opcional)',
              type: 'localeString',
              description:
                'Describe en pocas palabras lo que se ve. Ayuda a Google y a personas con discapacidad visual.',
            }),
            defineField({
              name: 'tour',
              title: 'Tour relacionado (opcional)',
              type: 'reference',
              to: [{type: 'tour'}],
              // Referencia "débil": no impide borrar el tour más adelante.
              weak: true,
              description: 'Si la foto es de un tour concreto, elígelo para enlazarla con su página.',
            }),
          ],
          preview: {
            select: {title: 'alt.es', tour: 'tour.title.es', media: 'asset'},
            prepare: ({title, tour, media}) => ({
              title: title || 'Foto sin descripción',
              subtitle: tour,
              media,
            }),
          },
        }),
      ],
    }),
  ],
  preview: {
    select: {images: 'images'},
    prepare: ({images}) => ({title: 'Galería', subtitle: `${images?.length ?? 0} fotos`}),
  },
})
