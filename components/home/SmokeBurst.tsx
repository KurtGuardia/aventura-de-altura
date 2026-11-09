'use client'

import { useEffect, useRef } from 'react'

/** Lado del lienzo en px CSS (la nube cabe dentro). */
const SIZE = 550
const PUFFS = 88
/** Duración total del efecto (s). */
const DURATION = 1.5

/**
 * Sprite de una bocanada de humo: varias manchas radiales superpuestas y
 * desplazadas, para que el borde sea irregular y no un círculo perfecto. Se
 * dibuja una sola vez por página y se reutiliza.
 */
let sprite: HTMLCanvasElement | null = null
function getSprite() {
  if (sprite) return sprite
  const s = 128
  const c = document.createElement('canvas')
  c.width = c.height = s
  const ctx = c.getContext('2d')!
  // Semilla fija: el mismo "dibujo" de humo en cada carga.
  let seed = 7
  const rand = () =>
    ((seed = (seed * 16807) % 2147483647) - 1) / 2147483646
  for (let i = 0; i < 12; i++) {
    const x = s / 2 + (rand() - 0.5) * s * 0.36
    const y = s / 2 + (rand() - 0.5) * s * 0.36
    const r = s * (0.18 + rand() * 0.2)
    const g = ctx.createRadialGradient(x, y, 0, x, y, r)
    g.addColorStop(0, 'rgba(255,255,255,0.32)')
    g.addColorStop(0.5, 'rgba(250,248,244,0.14)')
    g.addColorStop(1, 'rgba(255,255,255,0)')
    ctx.fillStyle = g
    ctx.fillRect(0, 0, s, s)
  }
  sprite = c
  return c
}

const easeOut = (t: number) => 1 - Math.pow(1 - t, 3)

type Puff = {
  angle: number
  /** Arranca ya algo separada del centro: evita un núcleo blanco macizo. */
  offset: number
  distance: number
  rise: number
  r0: number
  growth: number
  spin: number
  rotation: number
  delay: number
  life: number
  peak: number
}

/**
 * Bocanada de humo blanco: un destello breve en el centro y nubes suaves que
 * se expanden, se alejan, suben un poco, giran y se disipan. Lienzo 2D que
 * solo dibuja mientras dura el efecto (~2 s); después queda vacío y quieto. Decorativo.
 * Se centra en el punto donde se coloca (el padre lo posiciona).
 */
export function SmokeBurst({
  delay = 0.18,
}: {
  delay?: number
}) {
  const ref = useRef<HTMLCanvasElement>(null)

  useEffect(() => {
    const canvas = ref.current
    const ctx = canvas?.getContext('2d')
    if (!canvas || !ctx) return

    const dpr = Math.min(window.devicePixelRatio || 1, 2)
    canvas.width = SIZE * dpr
    canvas.height = SIZE * dpr
    ctx.scale(dpr, dpr)
    const puffSprite = getSprite()
    const c = SIZE / 2

    const puffs: Puff[] = Array.from(
      { length: PUFFS },
      (_, i) => {
        const angle =
          (i / PUFFS) * Math.PI * 2 +
          (Math.random() - 0.5) * 0.6
        return {
          angle,
          offset: 8 + Math.random() * 18,
          distance: 45 + Math.random() * 95,
          rise: 14 + Math.random() * 30,
          r0: 16 + Math.random() * 18,
          growth: 2 + Math.random() * 2,
          spin: (Math.random() - 0.5) * 1.2,
          rotation: Math.random() * Math.PI * 2,
          delay: Math.random() * 0.18,
          life: 1.1 + Math.random() * 0.6,
          peak: 0.22 + Math.random() * 0.26,
        }
      },
    )

    let frame = 0
    let start = 0
    const draw = (now: number) => {
      if (!start) start = now
      const t = (now - start) / 1000 - delay
      ctx.clearRect(0, 0, SIZE, SIZE)

      if (t >= 0) {
        // Destello del centro: sube rápido y se apaga.
        const flash =
          t < 0.08
            ? t / 0.08
            : Math.max(0, 1 - (t - 0.08) / 0.35)
        if (flash > 0) {
          const r = 20 + 46 * easeOut(Math.min(1, t / 0.4))
          const g = ctx.createRadialGradient(
            c,
            c,
            0,
            c,
            c,
            r,
          )
          g.addColorStop(
            0,
            `rgba(255,255,255,${0.5 * flash})`,
          )
          g.addColorStop(
            0.4,
            `rgba(255,250,240,${0.35 * flash})`,
          )
          g.addColorStop(1, 'rgba(255,255,255,0)')
          ctx.fillStyle = g
          ctx.fillRect(0, 0, SIZE, SIZE)
        }

        for (const p of puffs) {
          const local = (t - p.delay) / p.life
          if (local <= 0 || local >= 1) continue
          const e = easeOut(local)
          const d = p.offset + p.distance * e
          const x = c + Math.cos(p.angle) * d
          const y =
            c + Math.sin(p.angle) * d - p.rise * local
          const r = p.r0 * (1 + p.growth * e)
          // Aparece rápido y se disipa lento.
          const alpha =
            p.peak *
            (local < 0.22
              ? local / 0.22
              : Math.pow(1 - local, 1.4))
          ctx.save()
          ctx.globalAlpha = alpha
          ctx.translate(x, y)
          ctx.rotate(p.rotation + p.spin * local)
          ctx.drawImage(puffSprite, -r, -r, r * 2, r * 2)
          ctx.restore()
        }
      }

      if (t < DURATION) frame = requestAnimationFrame(draw)
    }
    frame = requestAnimationFrame(draw)
    return () => cancelAnimationFrame(frame)
  }, [delay])

  return (
    <canvas
      ref={ref}
      aria-hidden='true'
      className='pointer-events-none absolute -translate-x-1/2 -translate-y-1/2'
      style={{ width: SIZE, height: SIZE }}
    />
  )
}
