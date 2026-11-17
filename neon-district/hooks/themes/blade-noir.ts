import type { ThemeSetArgs } from 'claude-code'

import { makeColors } from './make-colors.js'
import type { Theme } from './theme.js'

// Blade-noir: a rain-soaked future city at night. Cold blue-black steel,
// sodium-amber light bleeding through haze, a teal shaft from above.
// Dark only.
const { theme, problems } = makeColors({
  label: 'Blade-noir',
  only: 'dark',
  roles: {
    accent: '#ff9a3c', // sodium amber
    danger: '#f0565b', // warning-light red
    success: '#6fcf97', // terminal green, muted
    warning: '#f2c14e', // dust yellow
    pro: '#3ec6c8', // cold teal
  },
  dark: {
    gray: {
      anchors: {
        'surface-0': '#080b0d',
        'surface-1': '#0e1316',
        'surface-2': '#13191d',
        'surface-3': '#182025',
        'text-primary': '#efe7da',
        'text-secondary': '#c4b8a6',
        'text-muted': '#968b7c',
      },
    },
    git: {
      added: '#6fcf97',
      removed: '#ff6a6e',
      modified: '#ff9a3c',
      merged: '#3ec6c8',
      closed: '#ff6a6e',
      conflicting: '#f2c14e',
      draft: '#a89d8d',
    },
  },
})

// An original skyline in silhouette: tapered towers, needles, spires and
// leaning wedge pyramids in three layers. Farther layers sit paler in the
// haze. Shapes come from a seeded generator, so the skyline is the same
// every time. No lights in the buildings, only their outlines.
type Kind = 'tower' | 'spire' | 'wedge' | 'block' | 'needle' | 'stepped'
const KINDS: readonly Kind[] = ['tower', 'spire', 'wedge', 'block', 'needle', 'stepped', 'tower', 'wedge']

const seeded = (seed: number) => () => {
  seed = (seed + 0x6d2b79f5) | 0
  let t = Math.imul(seed ^ (seed >>> 15), 1 | seed)
  t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t

  return ((t ^ (t >>> 14)) >>> 0) / 4294967296
}

const r1 = (n: number): string => n.toFixed(1)

const shape = (kind: Kind, x: number, w: number, h: number, b: number): string => {
  const p = (pts: readonly (readonly [number, number])[]) =>
    'M' + pts.map(([px, py]) => `${r1(px)} ${r1(py)}`).join('L') + 'Z'

  switch (kind) {
    case 'tower':
      return p([[x, b], [x + w * 0.16, b - h], [x + w * 0.5, b - h - w * 0.7], [x + w * 0.84, b - h], [x + w, b]])
    case 'spire':
      return p([[x, b], [x + w * 0.42, b - h * 0.55], [x + w * 0.5, b - h], [x + w * 0.58, b - h * 0.55], [x + w, b]])
    case 'wedge':
      return p([[x, b], [x + w * 0.28, b - h], [x + w * 0.36, b - h], [x + w, b]])
    case 'block':
      return p([[x, b], [x, b - h], [x + w, b - h * 0.78], [x + w, b]])
    case 'needle':
      return p([[x, b], [x + w * 0.2, b - h], [x + w * 0.5, b - h - 46], [x + w * 0.8, b - h], [x + w, b]])
    case 'stepped':
      return p([[x, b], [x, b - h * 0.6], [x + w * 0.22, b - h * 0.6], [x + w * 0.3, b - h], [x + w * 0.7, b - h], [x + w * 0.78, b - h * 0.6], [x + w, b - h * 0.6], [x + w, b]])
  }
}

type Layer = { seed: number; count: number; kinds?: readonly Kind[]; deck?: number; minH: number; maxH: number; minW: number; maxW: number; base: number }

// Buildings near the middle stay lower, so the words in front sit on sky.
const centreDip = (x: number): number => 1 - 0.42 * Math.exp(-(((x - 800) / 380) ** 2))

const layer = (l: Layer): string => {
  const rand = seeded(l.seed)
  const parts: string[] = []
  const step = 1700 / l.count

  for (let i = 0; i < l.count; i++) {
    const kinds = l.kinds ?? KINDS
    const kind = kinds[Math.floor(rand() * kinds.length)] ?? 'tower'
    const slim = kind === 'spire' || kind === 'needle'
    const w = slim ? l.minW * (0.5 + rand() * 0.6) : l.minW + rand() * (l.maxW - l.minW)
    const x = -60 + i * step + (rand() - 0.5) * step * 0.8
    const h = (l.minH + rand() * (l.maxH - l.minH)) * centreDip(x + w / 2) * (slim ? 1.25 : 1)
    parts.push(shape(kind, x, w, h, l.base))
  }
  // A low continuous base so the layer reads as one city, not a row of toys.
  const deck = l.deck ?? 26
  parts.push(`M-60 ${l.base}L-60 ${l.base - deck}L1660 ${l.base - deck}L1660 ${l.base}Z`)

  return parts.join('')
}

const FAR = layer({ seed: 7, count: 30, minH: 150, maxH: 360, minW: 34, maxW: 96, base: 1000 })
const MID = layer({ seed: 23, count: 20, minH: 90, maxH: 250, minW: 40, maxW: 130, base: 1000 })
const NEAR = layer({ seed: 51, count: 7, minH: 24, maxH: 90, minW: 120, maxW: 280, base: 1000, deck: 38, kinds: ['wedge', 'block', 'stepped', 'block'] })

// One tall hero spire on the left.
const HERO_X = 300
const HERO_TIP = 1000 - 470
const HERO = shape('tower', HERO_X - 34, 68, 1000 - HERO_TIP - 68 * 0.7, 1000)

// Original art: haze, rain and light over a skyline in silhouette. Amber
// haze rising from the horizon, a teal shaft from the upper right, two layers
// of falling rain, drifting dust and a fine static grain that keeps the
// gradients from banding.
const SCENE = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 1600 1000" preserveAspectRatio="xMidYMid slice">
<style>
@keyframes rainA { from { transform: translate(0,0) } to { transform: translate(0,240px) } }
@keyframes rainB { from { transform: translate(0,0) } to { transform: translate(0,160px) } }
@keyframes breathe { 0%,100% { opacity: .55 } 50% { opacity: .85 } }
@keyframes shaft { 0%,100% { opacity: .35 } 50% { opacity: .6 } }
@keyframes holo { 0%,100% { opacity: .28 } 40% { opacity: .5 } 42% { opacity: .2 } 44% { opacity: .5 } }
@keyframes dust { from { transform: translate(0,0) } to { transform: translate(140px,-60px) } }
.rainA { animation: rainA .7s linear infinite }
.rainB { animation: rainB 1.1s linear infinite }
.breathe { animation: breathe 9s ease-in-out infinite }
.shaft { animation: shaft 13s ease-in-out infinite }
.holo { animation: holo 6s ease-in-out infinite }
.dust { animation: dust 40s linear infinite alternate }
@media (prefers-reduced-motion: reduce) { * { animation: none !important } }
</style>
<defs>
<linearGradient id="sky" x1="0" y1="0" x2="0" y2="1">
<stop offset="0" stop-color="#070a0c"/>
<stop offset=".55" stop-color="#0c1418"/>
<stop offset="1" stop-color="#181009"/>
</linearGradient>
<radialGradient id="sodium" cx=".22" cy="1" r=".8">
<stop offset="0" stop-color="#ff8a2a" stop-opacity=".7"/>
<stop offset=".45" stop-color="#b8541a" stop-opacity=".36"/>
<stop offset="1" stop-color="#080b0d" stop-opacity="0"/>
</radialGradient>
<radialGradient id="sodium2" cx=".95" cy="1.05" r=".45">
<stop offset="0" stop-color="#ff9a3c" stop-opacity=".3"/>
<stop offset="1" stop-color="#080b0d" stop-opacity="0"/>
</radialGradient>
<radialGradient id="holo" cx="1" cy=".45" r=".35">
<stop offset="0" stop-color="#d0569a" stop-opacity=".35"/>
<stop offset=".5" stop-color="#5a3fa0" stop-opacity=".12"/>
<stop offset="1" stop-color="#080b0d" stop-opacity="0"/>
</radialGradient>
<linearGradient id="shaftg" x1="1" y1="0" x2=".3" y2="1">
<stop offset="0" stop-color="#3ec6c8" stop-opacity=".22"/>
<stop offset="1" stop-color="#3ec6c8" stop-opacity="0"/>
</linearGradient>
<pattern id="rainNear" width="176" height="240" patternUnits="userSpaceOnUse">
<g stroke="#a9c3cc" stroke-width="1" stroke-linecap="round">
<path d="M30 0L28 40" stroke-opacity=".16"/>
<path d="M97 38L96 70" stroke-opacity=".1"/>
<path d="M150 112L148 156" stroke-opacity=".18"/>
<path d="M58 141L57 167" stroke-opacity=".08"/>
<path d="M121 196L120 226" stroke-opacity=".12"/>
<path d="M12 182L11 216" stroke-opacity=".14"/>
<path d="M170 20L169 44" stroke-opacity=".07"/>
</g>
</pattern>
<pattern id="rainFar" width="104" height="160" patternUnits="userSpaceOnUse">
<g stroke="#7f9aa4" stroke-width=".8">
<path d="M18 10L17 28" stroke-opacity=".12"/>
<path d="M71 44L70 56" stroke-opacity=".08"/>
<path d="M40 92L39 110" stroke-opacity=".1"/>
<path d="M93 118L92 130" stroke-opacity=".07"/>
<path d="M6 140L5 152" stroke-opacity=".09"/>
</g>
</pattern>
<linearGradient id="horizon" x1="0" y1="0" x2="0" y2="1">
<stop offset="0" stop-color="#c76a26" stop-opacity="0"/>
<stop offset=".55" stop-color="#b8601f" stop-opacity=".28"/>
<stop offset="1" stop-color="#d9782c" stop-opacity=".42"/>
</linearGradient>
<linearGradient id="veil" x1="0" y1="0" x2="0" y2="1">
<stop offset="0" stop-color="#a8561c" stop-opacity="0"/>
<stop offset="1" stop-color="#a8561c" stop-opacity=".3"/>
</linearGradient>
<linearGradient id="fog" x1="0" y1="0" x2="0" y2="1">
<stop offset="0" stop-color="#c76a26" stop-opacity="0"/>
<stop offset="1" stop-color="#c76a26" stop-opacity=".22"/>
</linearGradient>
<filter id="grain" x="0" y="0" width="100%" height="100%" color-interpolation-filters="sRGB">
<feTurbulence type="fractalNoise" baseFrequency=".85" numOctaves="2" seed="11" stitchTiles="stitch" result="n"/>
<feColorMatrix in="n" type="matrix" values="0 0 0 0 1  0 0 0 0 1  0 0 0 0 1  1.4 0 0 0 -0.45"/>
</filter>
</defs>

<rect width="1600" height="1000" fill="url(#sky)"/>
<polygon class="shaft" points="1180,0 1600,0 980,1000 640,1000" fill="url(#shaftg)"/>
<rect class="breathe" width="1600" height="1000" fill="url(#sodium)"/>
<rect width="1600" height="1000" fill="url(#sodium2)"/>
<rect class="holo" width="1600" height="1000" fill="url(#holo)"/>

<rect class="breathe" y="380" width="1600" height="620" fill="url(#horizon)"/>
<path d="${FAR}" fill="#2a1a10" fill-opacity=".7"/>
<rect y="600" width="1600" height="400" fill="url(#veil)"/>
<path d="${MID}${HERO}" fill="#140d09" fill-opacity=".92"/>
<rect y="760" width="1600" height="240" fill="url(#veil)" opacity=".7"/>
<path d="${NEAR}" fill="#07090b"/>
<rect class="breathe" y="760" width="1600" height="240" fill="url(#fog)"/>

<g class="rainB"><rect x="-100" y="-200" width="1800" height="1400" fill="url(#rainFar)"/></g>
<g class="rainA"><rect x="-100" y="-240" width="1800" height="1480" fill="url(#rainNear)"/></g>

<g class="dust" fill="#ffc48a">
<circle cx="180" cy="820" r="1.4" opacity=".35"/>
<circle cx="260" cy="760" r="1" opacity=".25"/>
<circle cx="90" cy="700" r="1.2" opacity=".3"/>
<circle cx="340" cy="880" r=".9" opacity=".25"/>
<circle cx="1420" cy="840" r="1.1" opacity=".25"/>
<circle cx="1510" cy="780" r="1.3" opacity=".3"/>
</g>

<rect width="1600" height="1000" filter="url(#grain)" opacity=".045"/>
</svg>`

const look: ThemeSetArgs = {
  colors: theme,
  overrideColorScheme: 'dark',
  backdrop: {
    scene: 'blade-noir',
    glass: { blur: 14, tint: '#080b0d', opacity: 0.76 },
  },
}

export const bladeNoir: Theme = {
  id: 'blade-noir',
  label: 'Blade-noir',
  blurb: 'rain and sodium haze, amber light, cold teal accents',
  look,
  scene: SCENE,
  problems,
}
