import type { ThemeSetArgs } from 'claude-code'

import { makeColors } from './make-colors.js'
import type { Theme } from './theme.js'

// Machine Cult: a gothic forge-world of the far future. Rust-crimson robes,
// tarnished brass, bone parchment and iron, lit by furnaces below and green
// phosphor cogitator screens. Dark only.
const { theme, problems } = makeColors({
  label: 'Machine Cult',
  only: 'dark',
  roles: {
    accent: '#d9aa4e', // tarnished brass
    danger: '#ff5a48', // furnace red
    success: '#7fd88a', // phosphor green
    warning: '#f0a03c', // molten amber
    pro: '#e0785a', // hot copper
  },
  dark: {
    gray: {
      anchors: {
        'surface-0': '#0b0807',
        'surface-1': '#141110',
        'surface-2': '#191513',
        'surface-3': '#201b17',
        'text-primary': '#f5eddb',
        'text-secondary': '#c9b896',
        'text-muted': '#ab9b7c',
      },
    },
    git: {
      added: '#7fd88a',
      removed: '#ff6a58',
      modified: '#d9aa4e',
      merged: '#f08c6c',
      closed: '#ff6a58',
      conflicting: '#f0a03c',
      draft: '#b8a888',
    },
  },
})

const seeded = (seed: number) => () => {
  seed = (seed + 0x6d2b79f5) | 0
  let t = Math.imul(seed ^ (seed >>> 15), 1 | seed)
  t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t

  return ((t ^ (t >>> 14)) >>> 0) / 4294967296
}

const r1 = (n: number): string => n.toFixed(1)
const polar = (cx: number, cy: number, r: number, a: number): string => `${r1(cx + r * Math.cos(a))} ${r1(cy + r * Math.sin(a))}`

// A gear outline, clockwise. Four points per tooth, flat tips.
const gear = (cx: number, cy: number, r: number, teeth: number, depth = 0.16): string => {
  const s = Math.PI / teeth
  const pts: string[] = []

  for (let i = 0; i < teeth; i++) {
    const a = i * 2 * s
    pts.push(polar(cx, cy, r * (1 - depth), a - s * 0.55), polar(cx, cy, r, a - s * 0.32), polar(cx, cy, r, a + s * 0.32), polar(cx, cy, r * (1 - depth), a + s * 0.55))
  }

  return 'M' + pts.join('L') + 'Z'
}

// A circle drawn counter-clockwise: a hole inside a clockwise shape.
const hole = (cx: number, cy: number, r: number): string => `M${r1(cx - r)} ${r1(cy)}a${r1(r)} ${r1(r)} 0 1 0 ${r1(2 * r)} 0a${r1(r)} ${r1(r)} 0 1 0 ${r1(-2 * r)} 0Z`

type Kind = 'stack' | 'spire' | 'hall' | 'cogtower' | 'dome'
type Built = { d: string; smoke?: readonly [number, number] }

const shape = (kind: Kind, x: number, w: number, h: number, b: number): Built => {
  const p = (pts: readonly (readonly [number, number])[]) => 'M' + pts.map(([px, py]) => `${r1(px)} ${r1(py)}`).join('L') + 'Z'

  switch (kind) {
    case 'stack': {
      const top = b - h

      return {
        d: p([[x + w * 0.22, b], [x + w * 0.28, top], [x + w * 0.16, top], [x + w * 0.16, top - 9], [x + w * 0.84, top - 9], [x + w * 0.84, top], [x + w * 0.72, top], [x + w * 0.78, b]]),
        smoke: [x + w / 2, top - 12],
      }
    }
    case 'spire':
      return { d: p([[x, b], [x, b - h * 0.6], [x + w * 0.12, b - h * 0.7], [x + w * 0.24, b - h * 0.6], [x + w * 0.3, b - h * 0.74], [x + w * 0.5, b - h], [x + w * 0.7, b - h * 0.74], [x + w * 0.76, b - h * 0.6], [x + w * 0.88, b - h * 0.7], [x + w, b - h * 0.6], [x + w, b]]) }
    case 'hall':
      return { d: p([[x - w * 0.12, b], [x, b - h * 0.42], [x, b - h * 0.78], [x + w * 0.5, b - h], [x + w, b - h * 0.78], [x + w, b - h * 0.42], [x + w * 1.12, b]]) }
    case 'cogtower': {
      const r = w * 0.5
      const cy = b - h - r * 0.55

      return { d: p([[x + w * 0.18, b], [x + w * 0.26, b - h], [x + w * 0.74, b - h], [x + w * 0.82, b]]) + gear(x + w / 2, cy, r, 10) + hole(x + w / 2, cy, r * 0.42) }
    }
    case 'dome':
      return { d: `M${r1(x)} ${b}V${r1(b - h * 0.45)}A${r1(w / 2)} ${r1(h * 0.55)} 0 0 1 ${r1(x + w)} ${r1(b - h * 0.45)}V${b}Z` }
  }
}

type Layer = { seed: number; count: number; kinds: readonly Kind[]; minH: number; maxH: number; minW: number; maxW: number; deck: number; pipes?: boolean; from?: number; span?: number }
type Built2 = { d: string; smoke: (readonly [number, number])[] }

// Buildings near the middle stay lower, so the words in front sit on haze.
const centreDip = (x: number): number => 1 - 0.4 * Math.exp(-(((x - 800) / 380) ** 2))

const strip = (l: Layer): Built2 => {
  const rand = seeded(l.seed)
  const from = l.from ?? -60
  const span = l.span ?? 1700
  const step = span / l.count
  let d = ''
  const smoke: (readonly [number, number])[] = []

  for (let i = 0; i < l.count; i++) {
    const kind = l.kinds[Math.floor(rand() * l.kinds.length)] ?? 'hall'
    const slim = kind === 'stack' || kind === 'spire'
    const w = slim ? l.minW * (0.6 + rand() * 0.5) : l.minW + rand() * (l.maxW - l.minW)
    const x = from + i * step + (rand() - 0.5) * step * 0.8
    const h = (l.minH + rand() * (l.maxH - l.minH)) * centreDip(x + w / 2) * (slim ? 1.2 : 1)
    const built = shape(kind, x, w, h, 1000)
    d += built.d

    if (built.smoke) {
      smoke.push(built.smoke)
    }
  }
  const to = from + span + 20
  d += `M${from} 1000V${1000 - l.deck}H${to}V1000Z`

  // Pipe runs along the near deck, on stubby supports.
  if (l.pipes === true) {
    for (let i = 0; i < Math.round(span / 500); i++) {
      const px = from + rand() * span
      const len = 160 + rand() * 340
      const py = 1000 - l.deck - 14 - rand() * 50
      d += `M${r1(px)} ${r1(py)}h${r1(len)}v7h${r1(-len)}Z`
      for (let s = px + 20; s < px + len; s += 70) {
        d += `M${r1(s)} ${r1(py + 7)}h4V${1000 - l.deck}h-4Z`
      }
    }
  }

  return { d, smoke }
}

// The middle strip (0–1600) carries the composition; wings of their own seed
// carry the city out to WING on each side for wide windows (see SCENE).
const WING = 2000
const layer = (l: Layer): Built2 => {
  const count = Math.max(1, Math.round((l.count * WING) / 1700))
  const parts = [strip({ ...l, seed: l.seed + 1000, count, from: -60 - WING, span: WING }), strip(l), strip({ ...l, seed: l.seed + 2000, count, from: 1660, span: WING })]

  return { d: parts.map(b => b.d).join(''), smoke: parts.flatMap(b => b.smoke) }
}

const FAR = layer({ seed: 3, count: 24, kinds: ['spire', 'stack', 'hall', 'cogtower', 'spire'], minH: 220, maxH: 470, minW: 40, maxW: 110, deck: 30 })
const MID = layer({ seed: 17, count: 16, kinds: ['hall', 'cogtower', 'stack', 'hall', 'spire'], minH: 130, maxH: 320, minW: 60, maxW: 150, deck: 40 })
const NEAR = layer({ seed: 41, count: 9, kinds: ['dome', 'hall', 'dome', 'stack'], minH: 40, maxH: 130, minW: 110, maxW: 240, deck: 46, pipes: true })

// Two landmarks: a cathedral spire on the left, a gear-crowned forge tower right.
const HERO = shape('spire', 220, 120, 600, 1000).d + shape('cogtower', 1290, 110, 400, 1000).d

// Smoke from the stacks: soft puffs that rise, swell and fade.
const smokeRand = seeded(99)
const SMOKE = [...FAR.smoke, ...MID.smoke]
  .map(([sx, sy]) => {
    const puffs = [0, 1, 2]
      .map(k => `<ellipse class="puff" rx="${r1(16 + smokeRand() * 10)}" ry="${r1(11 + smokeRand() * 6)}" style="animation-delay:${r1(-(k * 4 + smokeRand() * 4))}s"/>`)
      .join('')

    return `<g transform="translate(${r1(sx)} ${r1(sy)})">${puffs}</g>`
  })
  .join('')

// Embers rising from the furnaces, spread across the stage and its wings.
const emberRand = seeded(123)
const EMBERS = Array.from({ length: 46 }, () => {
  const x = -1400 + emberRand() * 4400
  const y = 860 + emberRand() * 130
  const dur = 6 + emberRand() * 7

  return `<circle class="ember" cx="${r1(x)}" cy="${r1(y)}" r="${r1(0.8 + emberRand() * 1.4)}" style="animation-duration:${r1(dur)}s;animation-delay:${r1(-emberRand() * dur)}s"/>`
}).join('')

// The great cog in the haze: a toothed rim, a hole, six spokes and a hub.
const COG_R = 340
const SPOKES = Array.from({ length: 6 }, (_, i) => `<rect x="-14" y="${-COG_R * 0.72}" width="28" height="${COG_R * 0.72}" transform="rotate(${i * 60})"/>`).join('')
const COG = `<g transform="translate(1180 430)" fill="#2c0f0b" opacity=".55">
<g class="turn">
<path fill-rule="evenodd" d="${gear(0, 0, COG_R, 24, 0.09)}${hole(0, 0, COG_R * 0.74)}"/>
${SPOKES}
<circle r="${COG_R * 0.2}"/>
<circle r="${COG_R * 0.08}" fill="#140807"/>
<circle r="${COG_R * 0.84}" fill="none" stroke="#6a3a1c" stroke-width="2" stroke-dasharray="3 14 40 14" opacity=".7"/>
</g>
</g>`

const BRASS = '#b88a3c'

// The chat column in the desktop app, in CSS pixels (measured from a
// screenshot of the Code tab, both panels open). Its width is fixed but
// its place is not: it centres in the room the sidebar and side pane leave,
// and the backdrop is never told where that is. The theme assumes the usual
// layout of the people using it, both panels open, so the column's centre
// sits (SIDEBAR - PANE) / 2 from the window's. The rails stand GAP outside
// the column and fade at both ends, so a panel dragged wider or closed reads
// as breathing room. Below the window width that layout needs, the column
// shrinks and the rails step aside.
const COLUMN = 768
const SIDEBAR = 280
const PANE = 320
const GAP = 72
const RAIL = COLUMN / 2 + GAP
const SHIFT = (SIDEBAR - PANE) / 2
const RAILS_FROM = SIDEBAR + PANE + COLUMN + 2 * GAP + 40
const railSide = (s: 1 | -1): string => `<rect x="${s * RAIL - 1.5}" width="3" height="100%" fill="${BRASS}" opacity=".55"/>
<rect x="${s * (RAIL + 8) - 0.5}" width="1" height="100%" fill="${BRASS}" opacity=".3"/>
<rect x="${s * RAIL - 4}" width="8" height="100%" fill="url(#rivets)"/>`
const RAILS = `<svg x="50%" overflow="visible" class="rails">
<g mask="url(#railfade)" transform="translate(${SHIFT} 0)">
${railSide(-1)}
${railSide(1)}
<rect x="${-RAIL}" y="63" width="${2 * RAIL}" height="2" fill="${BRASS}" opacity=".45"/>
<rect x="${-RAIL + 8}" y="69" width="${2 * RAIL - 16}" height="1" fill="${BRASS}" opacity=".25"/>
<circle r="17" cy="64" fill="#0b0807"/>
<g transform="translate(0 64)" fill="${BRASS}" opacity=".7"><g class="turn-fast"><path fill-rule="evenodd" d="${gear(0, 0, 14, 10)}${hole(0, 0, 5.5)}"/></g></g>
</g>
</svg>`

// Original art: a forge-cathedral city at dusk. Furnace glow from below,
// a red sky with drifting incense haze, a great cog turning slowly behind
// three layers of spires, smokestacks and gear-crowned towers, smoke and
// rising embers, cables slung across the top, and brass rails framing the
// chat column. A static grain keeps the gradients from banding.
//
// Fits any window shape (see README, "Scenes fit every screen"): glows,
// cables, rails and grain work in CSS pixels on the window; the sky, cog and
// city sit on a 1600×1000 stage pinned to the bottom, sized by the window's
// height on wide screens, with wings drawn past its edges.
const STAGE = `<svg width="100%" height="100%" viewBox="0 0 1600 1000" preserveAspectRatio="xMidYMax meet" overflow="visible">`
const WIDE = `x="${-60 - WING}" width="${1720 + 2 * WING}"`
const SCENE = `<svg xmlns="http://www.w3.org/2000/svg" width="100%" height="100%">
<style>
@keyframes turn { to { transform: rotate(360deg) } }
@keyframes puff { 0% { transform: translate(0,0) scale(.5); opacity: 0 } 12% { opacity: .55 } 100% { transform: translate(-46px,-190px) scale(2.4); opacity: 0 } }
@keyframes ember { 0% { transform: translate(0,0); opacity: 0 } 10% { opacity: .9 } 100% { transform: translate(30px,-300px); opacity: 0 } }
@keyframes drift { from { transform: translateX(-160px) } to { transform: translateX(160px) } }
@keyframes forge { 0%,100% { opacity: .75 } 50% { opacity: 1 } }
.turn { animation: turn 360s linear infinite }
.turn-fast { animation: turn 40s linear infinite }
.puff { fill: url(#puffg); animation: puff 12s linear infinite }
.ember { fill: #ffb45a; animation: ember 9s linear infinite }
.drift { animation: drift 60s ease-in-out infinite alternate }
.forge { animation: forge 7s ease-in-out infinite }
@media (max-width: ${RAILS_FROM - 1}px) { .rails { display: none } }
@media (prefers-reduced-motion: reduce) { * { animation: none !important } .puff, .ember { display: none } }
</style>
<defs>
<linearGradient id="sky" x1="0" y1="0" x2="0" y2="1">
<stop offset="0" stop-color="#0b0605"/>
<stop offset=".5" stop-color="#1c0a08"/>
<stop offset="1" stop-color="#43160d"/>
</linearGradient>
<radialGradient id="furnace" cx=".5" cy="1.05" r=".75">
<stop offset="0" stop-color="#ff7a24" stop-opacity=".42"/>
<stop offset=".4" stop-color="#a8320f" stop-opacity=".22"/>
<stop offset="1" stop-color="#0b0807" stop-opacity="0"/>
</radialGradient>
<radialGradient id="vignette" cx=".5" cy=".45" r=".8">
<stop offset=".55" stop-color="#000" stop-opacity="0"/>
<stop offset="1" stop-color="#000" stop-opacity=".55"/>
</radialGradient>
<linearGradient id="haze" x1="0" y1="0" x2="0" y2="1">
<stop offset="0" stop-color="#8a3a1c" stop-opacity="0"/>
<stop offset=".5" stop-color="#8a3a1c" stop-opacity=".16"/>
<stop offset="1" stop-color="#8a3a1c" stop-opacity="0"/>
</linearGradient>
<linearGradient id="low" x1="0" y1="0" x2="0" y2="1">
<stop offset="0" stop-color="#d8541c" stop-opacity="0"/>
<stop offset="1" stop-color="#d8541c" stop-opacity=".26"/>
</linearGradient>
<radialGradient id="puffg">
<stop offset="0" stop-color="#5a3a2c" stop-opacity=".5"/>
<stop offset="1" stop-color="#5a3a2c" stop-opacity="0"/>
</radialGradient>
<linearGradient id="railg" x1="0" y1="0" x2="0" y2="1">
<stop offset="0" stop-color="#fff" stop-opacity="0"/>
<stop offset=".04" stop-color="#fff" stop-opacity="1"/>
<stop offset=".7" stop-color="#fff" stop-opacity=".75"/>
<stop offset=".94" stop-color="#fff" stop-opacity="0"/>
</linearGradient>
<mask id="railfade" maskUnits="userSpaceOnUse" x="-3000" y="0" width="6000" height="100%">
<rect x="-3000" width="6000" height="100%" fill="url(#railg)"/>
</mask>
<pattern id="rivets" width="8" height="64" patternUnits="userSpaceOnUse">
<circle cx="4" cy="32" r="2.6" fill="${BRASS}" opacity=".85"/>
</pattern>
<filter id="grain" x="0" y="0" width="100%" height="100%" color-interpolation-filters="sRGB">
<feTurbulence type="fractalNoise" baseFrequency=".85" numOctaves="2" seed="13" stitchTiles="stitch" result="n"/>
<feColorMatrix in="n" type="matrix" values="0 0 0 0 1  0 0 0 0 1  0 0 0 0 1  1.4 0 0 0 -0.45"/>
</filter>
</defs>

<rect width="100%" height="100%" fill="#0b0605"/>
${STAGE}
<rect ${WIDE} height="1000" fill="url(#sky)"/>
${COG}
<rect class="drift" x="${-260 - WING}" y="240" width="${2120 + 2 * WING}" height="260" fill="url(#haze)"/>
<path d="${FAR.d}" fill="#3a140e" fill-opacity=".75"/>
<rect class="drift" x="${-260 - WING}" y="560" width="${2120 + 2 * WING}" height="220" fill="url(#haze)" style="animation-direction:alternate-reverse"/>
${SMOKE}
<path d="${MID.d}${HERO}" fill="#1e0b08" fill-opacity=".95"/>
<rect class="forge" ${WIDE} y="740" height="260" fill="url(#low)"/>
<path d="${NEAR.d}" fill="#0a0605"/>
${EMBERS}
</svg>
<rect class="forge" width="100%" height="100%" fill="url(#furnace)"/>
<rect width="100%" height="100%" fill="url(#vignette)"/>

<!-- cables slung across the top of the window -->
<svg width="100%" height="150" viewBox="0 0 100 10" preserveAspectRatio="none">
<g fill="none" stroke="#1a0d0a" vector-effect="non-scaling-stroke">
<path d="M-2 1Q22 9 46 2" stroke-width="5" vector-effect="non-scaling-stroke"/>
<path d="M30 0Q58 10 84 1" stroke-width="3" vector-effect="non-scaling-stroke"/>
<path d="M70 2Q88 8 102 0" stroke-width="6" vector-effect="non-scaling-stroke"/>
</g>
</svg>

<!-- brass rails standing around the chat column -->
${RAILS}

<rect width="100%" height="100%" filter="url(#grain)" opacity=".05"/>
</svg>`

const look: ThemeSetArgs = {
  colors: theme,
  overrideColorScheme: 'dark',
  backdrop: {
    scene: 'machine-cult',
    glass: { blur: 12, tint: '#0b0807', opacity: 0.78 },
  },
}

export const machineCult: Theme = {
  id: 'machine-cult',
  label: 'Machine Cult',
  blurb: 'forge-cathedral city, rust crimson and brass, a great cog in the haze',
  look,
  scene: SCENE,
  problems,
}
