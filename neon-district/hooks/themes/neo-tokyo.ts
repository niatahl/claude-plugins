import type { ThemeSetArgs } from 'claude-code'

import { makeColors } from './make-colors.js'
import type { Theme } from './theme.js'

// Neo-Tokyo: an overcast harbour city in murky teal haze. Aqua for what's
// actionable, warm sign-pink for literals, soft green, amber and red for
// meaning. Dark only.
const { theme, problems } = makeColors({
  label: 'Neo-Tokyo',
  only: 'dark',
  roles: {
    accent: '#4fd1c5', // harbour aqua
    danger: '#ff5470', // alarm red
    success: '#8fd694', // soft green
    warning: '#e8c468', // sodium amber
    pro: '#ff8fb1', // sign pink
  },
  dark: {
    gray: {
      anchors: {
        'surface-0': '#060b0c',
        'surface-1': '#0a1214',
        'surface-2': '#0e1719',
        'surface-3': '#121d20',
        'text-primary': '#dfeee9',
        'text-secondary': '#a3bfba',
        'text-muted': '#7c9a95',
      },
    },
    git: {
      added: '#8fd694',
      removed: '#ff5470',
      modified: '#e8c468',
      merged: '#4fd1c5',
      closed: '#ff5470',
      conflicting: '#ff9a5a',
      draft: '#7c9a95',
    },
  },
})

// Seeded so the city is the same every time.
const seeded = (seed: number) => () => {
  seed = (seed + 0x6d2b79f5) | 0
  let t = Math.imul(seed ^ (seed >>> 15), 1 | seed)
  t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t

  return ((t ^ (t >>> 14)) >>> 0) / 4294967296
}

const HORIZON = 720
const r1 = (n: number): string => n.toFixed(1)

// Towers near the middle stay lower, so the words in front sit on haze.
const centreDip = (x: number): number => 1 - 0.35 * Math.exp(-(((x - 800) / 360) ** 2))

const SIGN_COLOURS = ['#ff8f5a', '#ff6fae', '#6fe3ff', '#ffd27a', '#ff6f6f'] as const

type City = { path: string; signs: string }

// A dense block of rectangular high-rises: setbacks, rooftop masts, and
// vertical signboards glowing on some faces.
const block = (seed: number, minH: number, maxH: number, minW: number, maxW: number, signChance: number, from: number, to: number): City => {
  const rand = seeded(seed)
  let path = ''
  const signs: string[] = []
  let x = from

  while (x < to) {
    const w = minW + rand() * (maxW - minW)
    const h = (minH + rand() * (maxH - minH)) * centreDip(x + w / 2)
    const top = HORIZON - h
    path += `M${r1(x)} ${HORIZON}V${r1(top)}H${r1(x + w)}V${HORIZON}Z`

    if (rand() < 0.4) {
      const inset = w * (0.15 + rand() * 0.2)
      const extra = 14 + rand() * 40
      path += `M${r1(x + inset)} ${r1(top)}V${r1(top - extra)}H${r1(x + w - inset)}V${r1(top)}Z`
    }

    if (rand() < 0.25) {
      const mx = x + w * (0.3 + rand() * 0.4)
      path += `M${r1(mx)} ${r1(top)}V${r1(top - 30 - rand() * 40)}h1.6V${r1(top)}Z`
    }

    if (rand() < signChance * 0.45 && h > 90) {
      // a horizontal board near the roof
      const bw = w * (0.5 + rand() * 0.4)
      const bx = x + (w - bw) / 2
      const by = top + 8 + rand() * 20
      const colour = SIGN_COLOURS[Math.floor(rand() * SIGN_COLOURS.length)] ?? '#ff8f5a'
      signs.push(`<rect x="${r1(bx)}" y="${r1(by)}" width="${r1(bw)}" height="${r1(5 + rand() * 6)}" fill="${colour}" opacity="${(0.25 + rand() * 0.25).toFixed(2)}"/>`)
    }

    if (rand() < signChance && h > 70) {
      const sw = 5 + rand() * 8
      const sh = 18 + rand() * 34
      const sx = x + rand() * (w - sw)
      const sy = top + 12 + rand() * Math.max(4, h * 0.5 - sh)
      const colour = SIGN_COLOURS[Math.floor(rand() * SIGN_COLOURS.length)] ?? '#ff8f5a'
      const flicker = rand() < 0.3 ? ` class="flick" style="animation-delay:${r1(-rand() * 9)}s"` : ''
      signs.push(`<rect${flicker} x="${r1(sx)}" y="${r1(sy)}" width="${r1(sw)}" height="${r1(sh)}" fill="${colour}" opacity="${(0.35 + rand() * 0.3).toFixed(2)}"/>`)
    }
    x += w + rand() * 6
  }

  return { path, signs: signs.join('') }
}

// The middle block (0–1600) is the original city; wings of their own seed
// carry it out to WING on each side for wide windows (see SCENE).
const WING = 2000
const city = (seed: number, minH: number, maxH: number, minW: number, maxW: number, signChance: number): City => {
  const parts = [
    block(seed + 1000, minH, maxH, minW, maxW, signChance, -40 - WING, -40),
    block(seed, minH, maxH, minW, maxW, signChance, -40, 1640),
    block(seed + 2000, minH, maxH, minW, maxW, signChance, 1640, 1640 + WING),
  ]

  return { path: parts.map(p => p.path).join(''), signs: parts.map(p => p.signs).join('') }
}

const FAR = city(4, 170, 440, 24, 64, 0)
const MID = city(31, 120, 390, 26, 78, 0.4)
const NEAR = city(19, 70, 320, 30, 90, 0.7)

// A small targeting reticle, top right: broken rings, ticks, a slow turn.
const RETICLE = `<g transform="translate(-160 150)" fill="none" stroke="#4fd1c5" stroke-opacity=".45">
<g class="spin">
<circle r="46" stroke-width="1" stroke-dasharray="52 20 8 20"/>
<circle r="58" stroke-width=".6" stroke-dasharray="2 6" stroke-opacity=".3"/>
</g>
<g class="spin-rev"><circle r="32" stroke-width="1.4" stroke-dasharray="30 70"/></g>
<path d="M-70 0H-52M52 0H70M0 -70V-52M0 52V70" stroke-width="1"/>
<rect x="-3" y="-3" width="6" height="6" stroke-width="1"/>
</g>`

// Original art: an overcast harbour city. Drifting cloud and mist, three
// layers of high-rises with glowing signboards, their reflection rippling in
// dark water, light rain, a reticle in one corner, and a static grain that
// keeps the gradients from banding.
//
// Fits any window shape (see README, "Scenes fit every screen"): rain and
// grain fill the window in CSS pixels and the reticle is pinned to its top
// right; sky, city and water sit on a 1600×1000 stage pinned to the bottom,
// sized by the window's height on wide screens, with wings drawn past its
// edges for ultrawides.
const X0 = -40 - WING
const XW = 1680 + 2 * WING
const WIDE = `x="${X0}" width="${XW}"`
const SCENE = `<svg xmlns="http://www.w3.org/2000/svg" width="100%" height="100%">
<style>
@keyframes drift { from { transform: translateX(-120px) } to { transform: translateX(120px) } }
@keyframes ripple { from { transform: translateY(0) } to { transform: translateY(12px) } }
@keyframes rain { from { transform: translate(0,0) } to { transform: translate(0,200px) } }
@keyframes flick { 0%,88%,100% { opacity: .55 } 90% { opacity: .1 } 92% { opacity: .5 } 94% { opacity: .15 } }
@keyframes spin { to { transform: rotate(360deg) } }
.cloud { animation: drift 70s ease-in-out infinite alternate }
.mist { animation: drift 45s ease-in-out infinite alternate-reverse }
.ripple { animation: ripple 2.4s linear infinite }
.rain { animation: rain .9s linear infinite }
.flick { animation: flick 9s steps(1) infinite }
.spin { animation: spin 40s linear infinite }
.spin-rev { animation: spin 26s linear infinite reverse }
@media (prefers-reduced-motion: reduce) { * { animation: none !important } }
</style>
<defs>
<linearGradient id="sky" x1="0" y1="0" x2="0" y2="1">
<stop offset="0" stop-color="#080f11"/>
<stop offset=".45" stop-color="#0f1c1c"/>
<stop offset=".72" stop-color="#1b2c29"/>
</linearGradient>
<linearGradient id="water" x1="0" y1="0" x2="0" y2="1">
<stop offset="0" stop-color="#0d1a1a"/>
<stop offset="1" stop-color="#040809"/>
</linearGradient>
<linearGradient id="mistg" x1="0" y1="0" x2="0" y2="1">
<stop offset="0" stop-color="#4a6b63" stop-opacity="0"/>
<stop offset=".55" stop-color="#4a6b63" stop-opacity=".22"/>
<stop offset="1" stop-color="#4a6b63" stop-opacity="0"/>
</linearGradient>
<linearGradient id="reflectFade" x1="0" y1="0" x2="0" y2="1">
<stop offset="0" stop-color="#fff" stop-opacity=".5"/>
<stop offset="1" stop-color="#fff" stop-opacity="0"/>
</linearGradient>
<filter id="soft" x="-20%" y="-50%" width="140%" height="200%">
<feGaussianBlur stdDeviation="28"/>
</filter>
<pattern id="ripples" width="1600" height="12" patternUnits="userSpaceOnUse">
<rect width="1600" height="7" fill="#fff"/>
</pattern>
<mask id="waterMask" maskUnits="userSpaceOnUse" ${WIDE} y="${HORIZON}" height="${1000 - HORIZON}">
<rect ${WIDE} y="${HORIZON}" height="${1000 - HORIZON}" fill="url(#reflectFade)"/>
</mask>
<mask id="rippleMask" maskUnits="userSpaceOnUse" ${WIDE} y="${HORIZON - 20}" height="${1020 - HORIZON}">
<rect class="ripple" ${WIDE} y="${HORIZON - 12}" height="${1012 - HORIZON}" fill="url(#ripples)"/>
</mask>
<pattern id="rainP" width="150" height="200" patternUnits="userSpaceOnUse">
<g stroke="#9cc4bc" stroke-width=".9" stroke-linecap="round">
<path d="M20 0L19 30" stroke-opacity=".12"/>
<path d="M88 46L87 70" stroke-opacity=".08"/>
<path d="M130 112L129 146" stroke-opacity=".13"/>
<path d="M52 150L51 172" stroke-opacity=".07"/>
<path d="M110 10L109 28" stroke-opacity=".06"/>
</g>
</pattern>
<filter id="grain" x="0" y="0" width="100%" height="100%" color-interpolation-filters="sRGB">
<feTurbulence type="fractalNoise" baseFrequency=".85" numOctaves="2" seed="9" stitchTiles="stitch" result="n"/>
<feColorMatrix in="n" type="matrix" values="0 0 0 0 1  0 0 0 0 1  0 0 0 0 1  1.4 0 0 0 -0.45"/>
</filter>
<g id="nearCity">
<path d="${NEAR.path}" fill="#070d0f"/>
${NEAR.signs}
</g>
</defs>

<rect width="100%" height="100%" fill="#080f11"/>
<svg width="100%" height="100%" viewBox="0 0 1600 1000" preserveAspectRatio="xMidYMax meet" overflow="visible">
<rect ${WIDE} height="${HORIZON}" fill="url(#sky)"/>
<g class="cloud" filter="url(#soft)" fill="#2b403c" opacity=".55">
<ellipse cx="-1500" cy="140" rx="420" ry="56"/>
<ellipse cx="-820" cy="80" rx="380" ry="50"/>
<ellipse cx="-300" cy="260" rx="320" ry="44"/>
<ellipse cx="260" cy="120" rx="380" ry="60"/>
<ellipse cx="980" cy="70" rx="460" ry="50"/>
<ellipse cx="1420" cy="240" rx="340" ry="56"/>
<ellipse cx="600" cy="300" rx="300" ry="40"/>
<ellipse cx="2100" cy="110" rx="400" ry="54"/>
<ellipse cx="2750" cy="280" rx="340" ry="46"/>
<ellipse cx="3300" cy="90" rx="420" ry="52"/>
</g>
<path d="${FAR.path}" fill="#111d1d" opacity=".9"/>
<rect class="mist" x="${X0 - 200}" y="${HORIZON - 220}" width="${XW + 400}" height="200" fill="url(#mistg)"/>
<path d="${MID.path}" fill="#0c1517"/>
<g opacity=".55">${MID.signs}</g>
<rect class="mist" x="${X0 - 200}" y="${HORIZON - 160}" width="${XW + 400}" height="170" fill="url(#mistg)" opacity=".8"/>
<use href="#nearCity"/>
<rect class="mist" x="${X0 - 200}" y="${HORIZON - 90}" width="${XW + 400}" height="120" fill="url(#mistg)" opacity=".7"/>

<rect ${WIDE} y="${HORIZON}" height="${1000 - HORIZON}" fill="url(#water)"/>
<g mask="url(#waterMask)">
<g mask="url(#rippleMask)">
<use href="#nearCity" transform="translate(0 ${2 * HORIZON}) scale(1 -1)" opacity=".75"/>
</g>
</g>
<rect ${WIDE} y="${HORIZON - 1}" height="2" fill="#4a6b63" opacity=".35"/>
</svg>

<g class="rain"><rect y="-200" width="100%" height="200%" fill="url(#rainP)"/></g>
<svg x="100%" overflow="visible">${RETICLE}</svg>
<rect width="100%" height="100%" filter="url(#grain)" opacity=".045"/>
</svg>`

const look: ThemeSetArgs = {
  colors: theme,
  overrideColorScheme: 'dark',
  backdrop: {
    scene: 'neo-tokyo',
    glass: { blur: 12, tint: '#060b0c', opacity: 0.76 },
  },
}

export const neoTokyo: Theme = {
  id: 'neo-tokyo',
  label: 'Neo-Tokyo',
  blurb: 'teal haze, harbour skyline reflected in the water, sign glow',
  look,
  scene: SCENE,
  problems,
}
