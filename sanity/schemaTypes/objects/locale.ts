import {defineField, defineType} from 'sanity'

export type LocaleValue = {es?: string; en?: string}

const fieldTitles = {
  es: 'Español',
  en: 'Inglés (opcional)',
}

const enDescription =
  'Si lo dejas vacío, en la versión en inglés de la web se mostrará el texto en español.'

/** Texto corto en dos idiomas (títulos, etiquetas, frases). */
export const localeString = defineType({
  name: 'localeString',
  title: 'Texto corto (ES / EN)',
  type: 'object',
  options: {columns: 2},
  fields: [
    defineField({
      name: 'es',
      title: fieldTitles.es,
      type: 'string',
      validation: (rule) => rule.required().error('El texto en español es obligatorio.'),
    }),
    defineField({
      name: 'en',
      title: fieldTitles.en,
      type: 'string',
      description: enDescription,
    }),
  ],
  preview: {
    select: {title: 'es', subtitle: 'en'},
  },
})

/** Texto largo en dos idiomas (párrafos). */
export const localeText = defineType({
  name: 'localeText',
  title: 'Texto largo (ES / EN)',
  type: 'object',
  fields: [
    defineField({
      name: 'es',
      title: fieldTitles.es,
      type: 'text',
      rows: 4,
      validation: (rule) => rule.required().error('El texto en español es obligatorio.'),
    }),
    defineField({
      name: 'en',
      title: fieldTitles.en,
      type: 'text',
      rows: 4,
      description: enDescription,
    }),
  ],
  preview: {
    select: {title: 'es', subtitle: 'en'},
  },
})

/** Devuelve un mensaje si el texto en algún idioma supera `max` caracteres. */
export function checkLocaleMaxLength(value: LocaleValue | undefined, max: number) {
  const tooLong = (['es', 'en'] as const).filter((lang) => (value?.[lang]?.length ?? 0) > max)
  if (tooLong.length === 0) return true
  const names = tooLong.map((lang) => (lang === 'es' ? 'español' : 'inglés')).join(' y ')
  return `Máximo ${max} caracteres (revisa el texto en ${names}).`
}
