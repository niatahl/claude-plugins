import type { ThemeSetArgs } from 'claude-code'

// One look the /skin command can switch to. `id` is also the backdrop's
// scene name, so the Backdrop hook can find the SVG to draw.
export type Theme = {
  id: string
  label: string
  blurb: string
  look: ThemeSetArgs
  scene: string
  problems: string[]
}
