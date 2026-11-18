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

// A menu screen's frame, no scenery. The backdrop spans the whole window and
// the app's frosted panels (title bar, sidebar, side pane) sit on top of it.
//
// The root has no viewBox, so its units are CSS pixels and nothing is cropped.
// Only the glow sits in a nested `slice` svg. Frame pieces are pinned to the
// real window edges with nested svgs at x/y = 100% (drawn in negative
// coordinates); they glow through the panels' glass. The main brackets sit at
// percentages (L, R) so they stay visible beside an open sidebar or side pane.
const RED = '#ff5a4e'
const CYAN = '#5ef6ff'
const TOP = 50 // rail height; labels above it clear a title bar drawn over the backdrop
const BOTTOM = 18 // rail distance from the bottom edge
// Inner brackets: beside the transcript column on common layouts (sidebar
// open, side pane open or shut). The scene can't see where the panels are.
const L = '22%'
const R = '78%'

const SCENE = `<svg xmlns="http://www.w3.org/2000/svg" width="100%" height="100%">
<style>
text { font: 500 10px ui-monospace, 'DejaVu Sans Mono', Menlo, Consolas, monospace; letter-spacing: .16em; fill: ${RED} }
.line { fill: none; stroke: ${RED}; stroke-width: 1.5 }
.bold { stroke-width: 2 }
@keyframes band { from { transform: translateY(-200px) } to { transform: translateY(1200px) } }
@keyframes flick { 0%,94%,100% { opacity: 1 } 95% { opacity: .35 } 96% { opacity: 1 } 97% { opacity: .5 } }
@keyframes pulse { 0%,100% { opacity: .9 } 50% { opacity: .35 } }
@keyframes tick { 0%,70% { opacity: .7 } 71%,100% { opacity: .15 } }
@keyframes caret { 0%,49% { opacity: .9 } 50%,100% { opacity: 0 } }
@keyframes jolt { 0%,90%,94%,100% { transform: none } 91% { transform: translate(-3px,0) } 92% { transform: translate(2px,1px) } 93% { transform: translate(-1px,0) } }
@keyframes ghost { 0%,90%,94%,100% { opacity: 0; transform: none } 91% { opacity: .6; transform: translate(5px,-1px) } 92% { opacity: .35; transform: translate(-4px,1px) } 93% { opacity: .2; transform: translate(2px,0) } }
.band { animation: band 14s linear infinite }
.flick { animation: flick 11s steps(1) infinite }
.pulse { animation: pulse 3.2s ease-in-out infinite }
.tick { animation: tick 1.4s steps(1) infinite }
.caret { animation: caret 1.1s steps(1) infinite }
.frame { animation: jolt 9s steps(1) infinite }
.ghost { opacity: 0; animation: ghost 9s steps(1) infinite }
@media (max-width: 760px) { .wide { display: none } }
@media (prefers-reduced-motion: reduce) { * { animation: none !important } .ghost { display: none } }
</style>
<defs>
<radialGradient id="glow" cx=".5" cy="0" r=".9" fx=".5" fy="0">
<stop offset="0" stop-color="#5a0f16" stop-opacity=".75"/>
<stop offset=".45" stop-color="#2a0a0f" stop-opacity=".45"/>
<stop offset="1" stop-color="#050304" stop-opacity="0"/>
</radialGradient>
<radialGradient id="floor" cx=".5" cy="1" r=".7" fx=".5" fy="1">
<stop offset="0" stop-color="#3a0a10" stop-opacity=".35"/>
<stop offset="1" stop-color="#050304" stop-opacity="0"/>
</radialGradient>
<radialGradient id="edgefade" cx=".5" cy=".5" r=".75">
<stop offset="0" stop-color="#000"/>
<stop offset=".45" stop-color="#222"/>
<stop offset="1" stop-color="#fff"/>
</radialGradient>
<mask id="edges"><rect width="100%" height="100%" fill="url(#edgefade)"/></mask>
<filter id="grain" x="0" y="0" width="100%" height="100%" color-interpolation-filters="sRGB">
<feTurbulence type="fractalNoise" baseFrequency=".85" numOctaves="2" seed="7" stitchTiles="stitch" result="n"/>
<feColorMatrix in="n" type="matrix" values="0 0 0 0 1  0 0 0 0 1  0 0 0 0 1  1.4 0 0 0 -0.45"/>
</filter>
<filter id="neon" x="-5%" y="-5%" width="110%" height="110%">
<feGaussianBlur in="SourceGraphic" stdDeviation="2.5" result="b"/>
<feMerge><feMergeNode in="b"/><feMergeNode in="SourceGraphic"/></feMerge>
</filter>
<filter id="cyanize" color-interpolation-filters="sRGB">
<feColorMatrix type="matrix" values="0 0 0 0 .37  0 0 0 0 .96  0 0 0 0 1  0 0 0 1 0"/>
</filter>
<linearGradient id="bandg" x1="0" y1="0" x2="0" y2="1">
<stop offset="0" stop-color="${RED}" stop-opacity="0"/>
<stop offset=".5" stop-color="${RED}" stop-opacity=".05"/>
<stop offset="1" stop-color="${RED}" stop-opacity="0"/>
</linearGradient>
<pattern id="grid" width="48" height="48" patternUnits="userSpaceOnUse">
<path d="M48 0H0V48" fill="none" stroke="${RED}" stroke-opacity=".08" stroke-width="1"/>
<rect x="-1" y="-1" width="2" height="2" fill="${RED}" opacity=".18"/>
</pattern>
<pattern id="hatch" width="5" height="5" patternUnits="userSpaceOnUse" patternTransform="rotate(45)">
<rect width="2" height="5" fill="${RED}" opacity=".55"/>
</pattern>
<pattern id="scan" width="4" height="4" patternUnits="userSpaceOnUse">
<rect width="4" height="1" fill="#000" opacity=".28"/>
</pattern>
</defs>

<rect width="100%" height="100%" fill="#050304"/>
<svg width="100%" height="100%" viewBox="0 0 1600 1000" preserveAspectRatio="xMidYMid slice">
<rect width="1600" height="1000" fill="url(#glow)"/>
<rect class="band" width="1600" height="200" fill="url(#bandg)"/>
</svg>
<rect width="100%" height="100%" fill="url(#floor)"/>
<rect width="100%" height="100%" fill="url(#grid)" mask="url(#edges)"/>
<!-- Static grain on top of every gradient: dithers away the banding -->
<rect width="100%" height="100%" filter="url(#grain)" opacity=".04"/>

<g id="frame" class="frame" filter="url(#neon)">
<!-- rails: edge to inner bracket stays solid, the stretch over the transcript is faint -->
<g class="flick">
<line class="line" stroke-opacity=".6" x1="38" y1="${TOP}" x2="${L}" y2="${TOP}"/>
<line class="line" stroke-opacity=".6" x1="${R}" y1="${TOP}" x2="100%" y2="${TOP}" transform="translate(-38 0)"/>
<line class="line" stroke-opacity=".6" x1="38" y1="100%" x2="${L}" y2="100%" transform="translate(0 -${BOTTOM})"/>
<line class="line" stroke-opacity=".6" x1="${R}" y1="100%" x2="100%" y2="100%" transform="translate(-38 -${BOTTOM})"/>
</g>
<line class="line" stroke-opacity=".3" stroke-width="1" stroke-dasharray="14 6 2 6" x1="${L}" y1="${TOP}" x2="${R}" y2="${TOP}"/>

<!-- outer corners on the window edges: under the panels they glow through the glass -->
<g class="flick">
<path class="line" stroke-opacity=".85" d="M16 170V${TOP + 22}L38 ${TOP}"/>
<path class="line" stroke="${CYAN}" d="M16 182V198"/>
<svg x="100%" overflow="visible">
<path class="line" stroke-opacity=".85" d="M-16 170V${TOP + 22}L-38 ${TOP}"/>
<path class="line" stroke="${CYAN}" d="M-16 182V198"/>
</svg>
<svg y="100%" overflow="visible"><path class="line" stroke-opacity=".85" d="M16 -150V-${BOTTOM + 22}L38 -${BOTTOM}"/></svg>
<svg x="100%" y="100%" overflow="visible">
<path class="line" stroke-opacity=".85" d="M-16 -150V-${BOTTOM + 22}L-38 -${BOTTOM}"/>
<path class="line" stroke="${CYAN}" d="M-16 -162V-176"/>
</svg>
</g>

<!-- inner brackets at ${L} and ${R}: in the gutter beside the transcript on common layouts -->
<svg x="${L}" overflow="visible">
<path class="line bold" d="M0 ${TOP}V${TOP + 150}"/>
<path class="line" stroke-width="3.5" d="M0 ${TOP + 10}V${TOP + 46}"/>
<rect x="-4" y="${TOP - 4}" width="8" height="8" fill="${RED}"/>
<g class="wide">
<path d="M14 ${TOP - 15}h64l-7 7h-64z" fill="url(#hatch)"/>
<text x="88" y="${TOP - 7}">LNK.07 // 4F-2A</text>
<rect class="caret" x="200" y="${TOP - 15}" width="5" height="9" fill="${RED}"/>
</g>
<g class="tick" fill="${RED}"><rect x="8" y="${TOP + 8}" width="26" height="2"/><rect x="38" y="${TOP + 8}" width="10" height="2"/><rect x="52" y="${TOP + 8}" width="4" height="2"/></g>
</svg>
<svg x="${R}" overflow="visible">
<path class="line bold" d="M0 ${TOP}V${TOP + 150}"/>
<path class="line" stroke="${CYAN}" stroke-width="3.5" d="M0 ${TOP + 10}V${TOP + 46}"/>
<rect x="-4" y="${TOP - 4}" width="8" height="8" fill="${RED}"/>
<g class="wide">
<path d="M-14 ${TOP - 15}h-64l7 7h64z" fill="url(#hatch)"/>
<g fill="${RED}">
<rect x="-150" y="${TOP - 14}" width="6" height="6"/><rect x="-141" y="${TOP - 14}" width="6" height="6"/><rect x="-132" y="${TOP - 14}" width="6" height="6"/><rect x="-123" y="${TOP - 14}" width="6" height="6"/>
</g>
<rect class="pulse" x="-114" y="${TOP - 14}" width="6" height="6" fill="${CYAN}"/>
<rect x="-104.5" y="${TOP - 13.5}" width="5" height="5" fill="none" stroke="${RED}" stroke-opacity=".6"/>
<rect x="-95.5" y="${TOP - 13.5}" width="5" height="5" fill="none" stroke="${RED}" stroke-opacity=".6"/>
<text x="-162" y="${TOP - 7}" text-anchor="end">SYS 0x3A // SYNC</text>
</g>
</svg>

<!-- side markers: cyan target squares on the inner brackets' line -->
<svg x="${L}" y="50%" overflow="visible">
<path class="line" stroke-opacity=".7" d="M0 -80V-12M0 12V80"/>
<rect class="pulse" x="-5" y="-5" width="10" height="10" fill="none" stroke="${CYAN}" stroke-width="1.4"/>
<rect x="-2" y="-2" width="4" height="4" fill="${CYAN}"/>
</svg>
<svg x="${R}" y="50%" overflow="visible">
<path class="line" stroke-opacity=".7" d="M0 -80V-12M0 12V80"/>
<rect class="pulse" x="-5" y="-5" width="10" height="10" fill="none" stroke="${CYAN}" stroke-width="1.4"/>
<rect x="-2" y="-2" width="4" height="4" fill="${CYAN}"/>
</svg>

<!-- bottom inner brackets -->
<svg x="${L}" y="100%" overflow="visible">
<path class="line bold" d="M0 -${BOTTOM}V-${BOTTOM + 140}"/>
<path class="line" stroke-width="3.5" d="M0 -${BOTTOM + 10}V-${BOTTOM + 40}"/>
<rect x="-4" y="-${BOTTOM + 4}" width="8" height="8" fill="${RED}"/>
<text class="wide" x="12" y="-${BOTTOM + 6}">◣ READY</text>
</svg>
<svg x="${R}" y="100%" overflow="visible">
<path class="line bold" d="M0 -${BOTTOM}V-${BOTTOM + 140}"/>
<path class="line" stroke="${CYAN}" stroke-width="3.5" d="M0 -${BOTTOM + 10}V-${BOTTOM + 40}"/>
<rect x="-4" y="-${BOTTOM + 4}" width="8" height="8" fill="${RED}"/>
<path class="wide" d="M12 -${BOTTOM + 14}h44l-6 6h-44z" fill="url(#hatch)"/>
</svg>
</g>
<!-- glitch: a cyan ghost of the frame that jumps out for a few frames -->
<use href="#frame" class="ghost" filter="url(#cyanize)"/>

<rect width="100%" height="100%" fill="url(#scan)"/>
</svg>`

const look: ThemeSetArgs = {
  colors: theme,
  overrideColorScheme: 'dark',
  backdrop: {
    scene: 'neon-district',
    // See-through enough that the frame under the sidebar and side pane
    // still glows through; the backdrop is near-black, so panel text stays clear.
    glass: { blur: 3, tint: '#050304', opacity: 0.55 },
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
