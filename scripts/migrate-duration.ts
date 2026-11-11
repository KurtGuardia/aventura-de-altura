/**
 * Patch puntual (2026-11-09): migra `options[].durationDays` → `options[].duration`
 * { value, unit: 'dias' } en todos los tours (publicados y borradores) y deja
 * "2 días / 1 noche" como primera opción de Toro Toro.
 *
 * Es idempotente y no toca nada más: solo opciones que aún tienen
 * `durationDays` y, en Toro Toro, el orden (si la opción ya va primera, no hace
 * nada). Cada documento se parchea con `ifRevisionId`, así que si alguien lo
 * edita a la vez el patch falla en lugar de pisar el cambio.
 *
 * Uso:  npx tsx scripts/migrate-duration.ts         (muestra lo que haría)
 *       npx tsx scripts/migrate-duration.ts --apply (aplica)
 * Requiere en .env.local: NEXT_PUBLIC_SANITY_PROJECT_ID,
 * NEXT_PUBLIC_SANITY_DATASET y SANITY_API_WRITE_TOKEN.
 */
import {existsSync} from 'node:fs'
import {loadEnvFile} from 'node:process'
import {createClient} from '@sanity/client'

if (existsSync('.env.local')) loadEnvFile('.env.local')

function requireEnv(name: string): string {
  const value = process.env[name]
  if (!value) throw new Error(`Falta la variable de entorno ${name} (en .env.local).`)
  return value
}

const client = createClient({
  projectId: requireEnv('NEXT_PUBLIC_SANITY_PROJECT_ID'),
  dataset: requireEnv('NEXT_PUBLIC_SANITY_DATASET'),
  token: requireEnv('SANITY_API_WRITE_TOKEN'),
  apiVersion: process.env.NEXT_PUBLIC_SANITY_API_VERSION || '2026-10-27',
  useCdn: false,
  perspective: 'raw',
})

const apply = process.argv.includes('--apply')
const TORO_TORO_FIRST = '2 días / 1 noche'

type Option = {_key: string; durationDays?: number; duration?: unknown; label?: {es?: string}; [field: string]: unknown}
type Tour = {_id: string; _rev: string; slug?: string; options?: Option[]}

async function main() {
  const tours = await client.fetch<Tour[]>(
    `*[_type == "tour"]{_id, _rev, "slug": slug.current, options}`,
  )

  for (const tour of tours) {
    const changes: string[] = []

    // Opciones migradas: duration { value, unit } en lugar de durationDays.
    let options = (tour.options ?? []).map((option) => {
      if (typeof option.durationDays !== 'number') return option
      const {durationDays, ...rest} = option
      changes.push(`${option._key}: durationDays ${durationDays} → duration {${durationDays}, dias}`)
      return rest.duration ? rest : {...rest, duration: {value: durationDays, unit: 'dias'}}
    })

    if (tour.slug === 'toro-toro') {
      const first = options.findIndex((o) => o.label?.es?.trim() === TORO_TORO_FIRST)
      if (first > 0) {
        options = [options[first], ...options.filter((_, i) => i !== first)]
        changes.push(`orden: ${options.map((o) => o._key).join(', ')}`)
      }
    }

    if (!changes.length) {
      console.log(`= ${tour._id}: sin cambios`)
      continue
    }
    console.log(`${apply ? '✔' : '·'} ${tour._id}\n    ${changes.join('\n    ')}`)
    if (apply) await client.patch(tour._id).ifRevisionId(tour._rev).set({options}).commit()
  }

  if (!apply) console.log('\nModo prueba: no se cambió nada. Ejecuta con --apply para aplicar.')
}

main().catch((error) => {
  console.error(error)
  process.exit(1)
})
