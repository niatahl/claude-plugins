import type { ThemeSetArgs } from 'claude-code'

import { makeColors } from './make-colors.js'
import type { Theme } from './theme.js'

// Neon District: an in-game menu look. Salmon-red text and frame lines on
// red-black, cyan for what's selected and actionable. Dark only.
const { theme, problems } = makeColors({
  label: 'Neon District',
  only: 'dark',
  roles: {
    accent: '#5ef6ff', // selection cyan
    danger: '#ff4a4a', // alarm red
    success: '#2ef29a', // terminal green
    warning: '#f3e600', // the rare yellow
    pro: '#ff6f61', // salmon red
  },
  dark: {
    gray: {
      anchors: {
        // Near-black for OLED: code blocks and the page sit on these.
        'surface-0': '#050304',
        'surface-1': '#0e080a',
        'surface-2': '#140b0e',
        'surface-3': '#1a0f13',
        'text-primary': '#fff1ee',
        'text-secondary': '#f2a29b',
        'text-muted': '#c9776f',
      },
    },
    git: {
      added: '#5ef6ff',
      removed: '#ff4a4a',
      modified: '#f3e600',
      merged: '#2ef29a',
      closed: '#ff4a4a',
      conflicting: '#ff9a3c',
      draft: '#b8868a',
    },
  },
})

// A menu screen's frame, no scenery: a red glow from the top, a faint grid,
// cut-corner brackets pinned to each corner, cyan edge markers, scanlines
// and a slow scan band. Corners are nested SVGs so they stay put on any screen.
const RED = '#ff5a4e'
const CYAN = '#5ef6ff'

const SCENE = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 1600 1000" preserveAspectRatio="xMidYMid slice">
<style>
@keyframes band { from { transform: translateY(-200px) } to { transform: translateY(1200px) } }
@keyframes flick { 0%,94%,100% { opacity: 1 } 95% { opacity: .35 } 96% { opacity: 1 } 97% { opacity: .5 } }
@keyframes pulse { 0%,100% { opacity: .9 } 50% { opacity: .35 } }
@keyframes tick { 0%,70% { opacity: .7 } 71%,100% { opacity: .15 } }
.band { animation: band 14s linear infinite }
.flick { animation: flick 11s steps(1) infinite }
.pulse { animation: pulse 3.2s ease-in-out infinite }
.tick { animation: tick 1.4s steps(1) infinite }
@media (prefers-reduced-motion: reduce) { * { animation: none !important } }
</style>
<defs>
<radialGradient id="glow" cx=".5" cy="0" r=".9" fx=".5" fy="0">
<stop offset="0" stop-color="#5a0f16" stop-opacity=".75"/>
<stop offset=".45" stop-color="#2a0a0f" stop-opacity=".45"/>
<stop offset="1" stop-color="#050304" stop-opacity="0"/>
</radialGradient>
<filter id="grain" x="0" y="0" width="100%" height="100%" color-interpolation-filters="sRGB">
<feTurbulence type="fractalNoise" baseFrequency=".85" numOctaves="2" seed="7" stitchTiles="stitch" result="n"/>
<feColorMatrix in="n" type="matrix" values="0 0 0 0 1  0 0 0 0 1  0 0 0 0 1  1.4 0 0 0 -0.45"/>
</filter>
<linearGradient id="bandg" x1="0" y1="0" x2="0" y2="1">
<stop offset="0" stop-color="${RED}" stop-opacity="0"/>
<stop offset=".5" stop-color="${RED}" stop-opacity=".05"/>
<stop offset="1" stop-color="${RED}" stop-opacity="0"/>
</linearGradient>
<pattern id="grid" width="48" height="48" patternUnits="userSpaceOnUse">
<path d="M48 0H0V48" fill="none" stroke="${RED}" stroke-opacity=".05" stroke-width="1"/>
</pattern>
<pattern id="scan" width="4" height="4" patternUnits="userSpaceOnUse">
<rect width="4" height="1" fill="#000" opacity=".28"/>
</pattern>
</defs>
<rect width="1600" height="1000" fill="#050304"/>
<rect width="1600" height="1000" fill="url(#glow)"/>
<rect width="1600" height="1000" fill="url(#grid)"/>
<rect class="band" width="1600" height="200" fill="url(#bandg)"/>
<!-- Static grain on top of every gradient: dithers away the banding -->
<rect width="1600" height="1000" filter="url(#grain)" opacity=".04"/>

<svg width="100%" height="100%" viewBox="0 0 400 300" preserveAspectRatio="xMinYMin meet">
<g class="flick" fill="none" stroke="${RED}" stroke-width="1.2" stroke-opacity=".7">
<path d="M14 90V30L30 14H130"/>
<path d="M14 100V112" stroke="${CYAN}"/>
</g>
<rect x="136" y="11" width="6" height="6" fill="${RED}" opacity=".8"/>
<g class="tick" fill="${RED}"><rect x="34" y="24" width="22" height="2"/><rect x="60" y="24" width="10" height="2"/><rect x="74" y="24" width="4" height="2"/></g>
</svg>

<svg width="100%" height="100%" viewBox="0 0 400 300" preserveAspectRatio="xMaxYMin meet">
<g class="flick" fill="none" stroke="${RED}" stroke-width="1.2" stroke-opacity=".7">
<path d="M386 90V30L370 14H270"/>
</g>
<rect x="258" y="11" width="6" height="6" fill="${CYAN}" class="pulse"/>
<g fill="${RED}" opacity=".55"><rect x="330" y="24" width="40" height="2"/><rect x="350" y="30" width="20" height="2"/></g>
</svg>

<svg width="100%" height="100%" viewBox="0 0 400 300" preserveAspectRatio="xMinYMax meet">
<g class="flick" fill="none" stroke="${RED}" stroke-width="1.2" stroke-opacity=".7">
<path d="M14 210V270L30 286H130"/>
</g>
<g fill="${RED}" opacity=".5"><rect x="34" y="276" width="6" height="2"/><rect x="44" y="276" width="6" height="2"/><rect x="54" y="276" width="6" height="2"/><rect x="64" y="276" width="30" height="2"/></g>
</svg>

<svg width="100%" height="100%" viewBox="0 0 400 300" preserveAspectRatio="xMaxYMax meet">
<g class="flick" fill="none" stroke="${RED}" stroke-width="1.2" stroke-opacity=".7">
<path d="M386 210V270L370 286H270"/>
<path d="M386 200V188" stroke="${CYAN}"/>
</g>
<rect x="258" y="283" width="6" height="6" fill="${RED}" opacity=".8"/>
</svg>

<svg width="100%" height="100%" viewBox="0 0 100 400" preserveAspectRatio="xMinYMid meet">
<rect class="pulse" x="6" y="194" width="8" height="8" fill="none" stroke="${CYAN}" stroke-width="1.2"/>
<rect x="8.5" y="196.5" width="3" height="3" fill="${CYAN}"/>
</svg>

<svg width="100%" height="100%" viewBox="0 0 100 400" preserveAspectRatio="xMaxYMid meet">
<rect class="pulse" x="86" y="194" width="8" height="8" fill="none" stroke="${CYAN}" stroke-width="1.2"/>
<rect x="88.5" y="196.5" width="3" height="3" fill="${CYAN}"/>
</svg>

<rect width="1600" height="1000" fill="url(#scan)"/>
</svg>`

const look: ThemeSetArgs = {
  colors: theme,
  overrideColorScheme: 'dark',
  backdrop: {
    scene: 'neon-district',
    glass: { blur: 10, tint: '#050304', opacity: 0.8 },
  },
}

export const neonDistrict: Theme = {
  id: 'neon-district',
  label: 'Neon District',
  blurb: 'red-black game menu, salmon-red frames, cyan highlights',
  look,
  scene: SCENE,
  problems,
}
