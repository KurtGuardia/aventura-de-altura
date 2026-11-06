import {useToast} from '@sanity/ui'
import {useState} from 'react'
import {
  useDocumentOperation,
  useSchema,
  type DocumentActionComponent,
  type SchemaType,
} from 'sanity'

/** Tipos de documento que muestran el botón "Traducir al inglés". */
export const TRANSLATABLE_TYPES = new Set(['tour', 'siteSettings', 'testimonial', 'gallery'])

const LOCALE_TYPES = new Set(['localeString', 'localeText'])

/** Un texto en español a traducir y la ruta (sintaxis de patch) de su campo `en`. */
type TranslatableText = {path: string; es: string}

function isLocaleType(type: SchemaType | undefined): boolean {
  for (let t = type; t; t = t.type) {
    if (LOCALE_TYPES.has(t.name)) return true
  }
  return false
}

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === 'object' && value !== null && !Array.isArray(value)
}

/**
 * Recorre el documento guiándose por el esquema y devuelve todos los campos
 * localeString/localeText con `es` no vacío, incluidos los que están dentro
 * de objetos y arrays (identificados por `_key`).
 */
function collectTexts(value: unknown, type: SchemaType | undefined, path: string, out: TranslatableText[]) {
  if (!type || value == null) return

  if (isLocaleType(type)) {
    const es = isRecord(value) ? value.es : undefined
    if (typeof es === 'string' && es.trim()) out.push({path: `${path}.en`, es})
    return
  }

  if (type.jsonType === 'object' && 'fields' in type && isRecord(value)) {
    for (const field of type.fields) {
      collectTexts(value[field.name], field.type, path ? `${path}.${field.name}` : field.name, out)
    }
    return
  }

  if (type.jsonType === 'array' && 'of' in type && Array.isArray(value)) {
    for (const item of value) {
      if (!isRecord(item) || typeof item._key !== 'string') continue
      const memberType =
        type.of.find((member) => member.name === item._type) ?? (type.of.length === 1 ? type.of[0] : undefined)
      collectTexts(item, memberType, `${path}[_key==${JSON.stringify(item._key)}]`, out)
    }
  }
}

export const TranslateAction: DocumentActionComponent = (props) => {
  const {id, type, draft, published} = props
  const schema = useSchema()
  const toast = useToast()
  const {patch} = useDocumentOperation(id, type)
  const [dialogOpen, setDialogOpen] = useState(false)
  const [isTranslating, setIsTranslating] = useState(false)

  const translate = async () => {
    setDialogOpen(false)
    const texts: TranslatableText[] = []
    collectTexts(draft ?? published, schema.get(type), '', texts)

    if (texts.length === 0) {
      toast.push({status: 'warning', title: 'No hay textos en español para traducir.'})
      return
    }

    setIsTranslating(true)
    try {
      const response = await fetch('/api/translate', {
        method: 'POST',
        headers: {'Content-Type': 'application/json'},
        body: JSON.stringify({texts: texts.map((t) => t.es)}),
      })
      const data = (await response.json().catch(() => ({}))) as {translations?: string[]; error?: string}

      if (!response.ok || data.translations?.length !== texts.length) {
        throw new Error(data.error || 'No se pudo traducir. Inténtalo más tarde.')
      }

      const translations = data.translations
      const set = Object.fromEntries(texts.map((t, i) => [t.path, translations[i]]))
      // Se aplica sobre el borrador; el cliente revisa y publica cuando quiera.
      patch.execute([{set}])

      toast.push({
        status: 'success',
        title: 'Traducción lista',
        description: `Se tradujeron ${texts.length} textos. Revísalos y pulsa "Publicar" cuando estén bien.`,
      })
    } catch (err) {
      toast.push({
        status: 'error',
        title: 'No se pudo traducir',
        description: err instanceof Error ? err.message : String(err),
        closable: true,
      })
    } finally {
      setIsTranslating(false)
    }
  }

  return {
    label: isTranslating ? 'Traduciendo…' : 'Traducir al inglés',
    disabled: isTranslating || Boolean(patch.disabled) || !(draft || published),
    title: 'Rellena el inglés de todo el documento con una traducción automática del español.',
    onHandle: () => setDialogOpen(true),
    dialog: dialogOpen && {
      type: 'confirm',
      tone: 'caution',
      message: 'Esto reemplazará todo el texto en inglés de este documento. ¿Continuar?',
      confirmButtonText: 'Traducir',
      cancelButtonText: 'Cancelar',
      onConfirm: translate,
      onCancel: () => setDialogOpen(false),
    },
  }
}
