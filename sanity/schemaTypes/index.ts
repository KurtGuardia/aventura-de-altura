import {type SchemaTypeDefinition} from 'sanity'

import {galleryImage} from './documents/galleryImage'
import {siteSettings} from './documents/siteSettings'
import {testimonial} from './documents/testimonial'
import {tour} from './documents/tour'
import {imageWithAlt} from './objects/imageWithAlt'
import {localeString, localeText} from './objects/locale'

export const schema: {types: SchemaTypeDefinition[]} = {
  types: [
    // Objetos reutilizables
    localeString,
    localeText,
    imageWithAlt,
    // Documentos
    siteSettings,
    tour,
    testimonial,
    galleryImage,
  ],
}
