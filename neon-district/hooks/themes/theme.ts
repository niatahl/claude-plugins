import type { ThemeSetArgs } from 'claude-code'

// One look the /skin command can switch to. `id` is also the backdrop's
// scene name, so the Backdrop hook can find the SVG to draw.
//
// Requirement: `scene` must fit every window shape, from a portrait dock to a
// 32:9 ultrawide, without cropping its subject or stretching it. The root
// <svg> has width/height 100% and no viewBox, so its units are CSS pixels.
// - Window-wide layers (fills, glows, rain, grain): 100% rects.
// - Pieces tied to an edge or corner: nested <svg x="100%" / y="100%"
//   overflow="visible"> drawn in negative coordinates (see neon-district.ts).
// - Scenery: a nested stage <svg viewBox="0 0 1600 1000"
//   preserveAspectRatio="xMidYMax meet" overflow="visible">, drawn out to
//   x = -2000…3600 so a window up to about 5.5:1 has no bare edges
//   (see blade-noir.ts and neo-tokyo.ts).
// Never a fixed viewBox with `slice` on the root: it crops on every shape it
// wasn't drawn for. Check new scenes at 16:10, 32:9 and a portrait window.
export type Theme = {
  id: string
  label: string
  blurb: string
  look: ThemeSetArgs
  scene: string
  problems: string[]
}
