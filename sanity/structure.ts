import type {StructureResolver} from 'sanity/structure'
import {SITE_SETTINGS_ID} from './schemaTypes/documents/siteSettings'

const byOrder = [{field: 'order', direction: 'asc' as const}]

// https://www.sanity.io/docs/structure-builder-cheat-sheet
export const structure: StructureResolver = (S) =>
  S.list()
    .title('Contenido')
    .items([
      S.listItem()
        .title('Ajustes del sitio')
        .id(SITE_SETTINGS_ID)
        .child(
          S.document()
            .schemaType('siteSettings')
            .documentId(SITE_SETTINGS_ID)
            .title('Ajustes del sitio'),
        ),
      S.divider(),
      S.documentTypeListItem('tour')
        .title('Tours')
        .child(S.documentTypeList('tour').title('Tours').defaultOrdering(byOrder)),
      S.documentTypeListItem('testimonial').title('Testimonios'),
      S.documentTypeListItem('galleryImage')
        .title('Galería')
        .child(S.documentTypeList('galleryImage').title('Galería').defaultOrdering(byOrder)),
    ])
