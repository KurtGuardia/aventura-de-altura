import type {StructureBuilder, StructureResolver} from 'sanity/structure'
import {GALLERY_ID} from './schemaTypes/documents/gallery'
import {SITE_SETTINGS_ID} from './schemaTypes/documents/siteSettings'

const byOrder = [{field: 'order', direction: 'asc' as const}]

/** Entrada del menú que abre directamente el único documento de un singleton. */
const singleton = (S: StructureBuilder, schemaType: string, id: string, title: string) =>
  S.listItem()
    .title(title)
    .id(id)
    .schemaType(schemaType)
    .child(S.document().schemaType(schemaType).documentId(id).title(title))

// https://www.sanity.io/docs/structure-builder-cheat-sheet
export const structure: StructureResolver = (S) =>
  S.list()
    .title('Contenido')
    .items([
      singleton(S, 'siteSettings', SITE_SETTINGS_ID, 'Ajustes del sitio'),
      S.divider(),
      S.documentTypeListItem('tour')
        .title('Tours')
        .child(S.documentTypeList('tour').title('Tours').defaultOrdering(byOrder)),
      S.documentTypeListItem('tourCategory').title('Tipos de tour'),
      S.documentTypeListItem('testimonial')
        .title('Testimonios')
        .child(S.documentTypeList('testimonial').title('Testimonios').defaultOrdering(byOrder)),
      singleton(S, 'gallery', GALLERY_ID, 'Galería'),
    ])
