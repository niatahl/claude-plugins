import type { EngineInterface, Register } from 'claude-code'

import { bladeNoir } from './themes/blade-noir.js'
import { neonDistrict } from './themes/neon-district.js'
import { neoTokyo } from './themes/neo-tokyo.js'
import type { Theme } from './themes/theme.js'

// Every look /skin can switch to. Add a theme: write a file in themes/,
// then list it here.
const THEMES: readonly Theme[] = [neonDistrict, bladeNoir, neoTokyo]
const DEFAULT = neonDistrict.id
const STORE_KEY = 'theme'
const OFF = 'off'
// /theme is Claude Code's own, so the switcher is /skin.
const COMMAND = 'skin'
const listing = (current: string): string =>
  [
    'Themes:',
    ...THEMES.map(t => `${t.id === current ? '▸' : ' '} ${t.id}: ${t.blurb}`),
    `${current === OFF ? '▸' : ' '} off: the app's own look`,
    '',
    `Switch with /${COMMAND} <name>.`,
  ].join('\n')

const apply = async ($: EngineInterface, t: Theme): Promise<void> => {
  const unpainted = t.problems.find(line => line.startsWith("Desktop won't paint"))

  if (unpainted !== undefined) {
    $.ui.toast(`${t.label}: ${unpainted}`)
  }
  const set = await $.theme.set(t.look)

  $.ui.status(set.isDrawn ? undefined : set.reason)
}

const chosen = async ($: EngineInterface): Promise<string> => {
  const stored = await $.store.get(STORE_KEY)

  return typeof stored === 'string' && (stored === OFF || THEMES.some(t => t.id === stored))
    ? stored
    : DEFAULT
}

export const register: Register = on => {
  on('session.start', async ($, e, next) => {
    await $.command.register({
      name: COMMAND,
      description: `Switch the look: ${THEMES.map(t => t.id).join(', ')} or off`,
      argumentHint: '[name | off]',
      immediate: true,
    })
    const id = await chosen($)
    const t = THEMES.find(one => one.id === id)

    if (t !== undefined) {
      await apply($, t)
    }

    return next(e)
  })

  on('command.run', { command: COMMAND }, async ($, e) => {
    const ask = e.args.trim().toLowerCase()
    const current = await chosen($)

    if (ask === '') {
      return { text: listing(current) }
    }

    if (ask === OFF) {
      await $.theme.clear()
      $.ui.status(undefined)
      await $.store.set(STORE_KEY, OFF)

      return { text: "Theme off: back to the app's own look." }
    }
    const t = THEMES.find(one => one.id === ask || one.id.startsWith(ask) || one.label.toLowerCase() === ask)

    if (t === undefined) {
      return { text: `No theme called "${ask}".\n\n${listing(current)}` }
    }
    await apply($, t)
    await $.store.set(STORE_KEY, t.id)

    return { text: `Theme: ${t.label}.` }
  }).catch(($, e, next) =>
    next.called ? next(e) : { text: 'The theme could not be switched this time. Try again.' },
  )

  on('ui.render', { component: 'Backdrop' }, ($, e, next) => {
    const t = THEMES.find(one => one.id === e.props.scene)

    if ((e.surface !== 'desktop' && e.surface !== 'mobile') || t === undefined) {
      return next(e)
    }
    const { Svg } = $.ui.resolve(e)

    return <Svg source={t.scene} alt={`${t.label} backdrop`} isInteractive />
  })
}
