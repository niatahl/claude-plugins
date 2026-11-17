# claude-plugins

Personal plugins for Claude Code.

## neon-district

A theme pack for the Claude desktop and mobile apps, with three looks and a `/skin` command to switch between them. Each theme sets a full color palette and an animated backdrop behind the conversation. All art is original, drawn in SVG.

| Theme | Look |
| --- | --- |
| `neon-district` | A red-black game menu: salmon-red frames and text, cyan highlights, cut-corner HUD brackets and scanlines |
| `blade-noir` | Rain and sodium haze: a layered skyline of spires fading into amber fog, cold teal accents |
| `neo-tokyo` | An overcast harbour city in teal haze: three layers of high-rises with neon boards, reflected in rippling water |

### Using it

- `/skin` lists the themes and marks the current one
- `/skin <name>` switches straight away (a prefix works too, like `/skin neo`)
- `/skin off` goes back to the app's own look

Your choice is remembered across sessions. All animation stops when your system asks for reduced motion. The terminal draws no backdrop or palette; the themes show in the desktop and mobile apps.

## Install

At the prompt of a Claude Code terminal session:

```
/plugin install neon-district --marketplace niatahl/claude-plugins
```

Answer `y` to add the marketplace, then pick a scope (user is first).

From a shell:

```bash
claude plugin install neon-district --marketplace niatahl/claude-plugins
```

In the desktop app: click **+** next to the prompt box, then **Plugins**, **Add marketplace** with `niatahl/claude-plugins`, then **Add plugin**.

### Updating

```bash
claude plugin update neon-district
```

then `/reload-plugins`, or start a new session.

## Adding a theme

Write a file in `neon-district/hooks/themes/` that exports a `Theme` (see `theme.ts` and the existing themes), then add it to the `THEMES` list in `neon-district/hooks/register.tsx`.

## License

MIT
