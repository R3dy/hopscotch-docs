# Preferences

> Global user settings that persist across adventures and sessions — read-aloud voicing, text scale, motion preferences.

## Type Definition

```ts
type Prefs = {
  readAloudVoicing: "dramatic" | "brisk" | "plain"
  theme: "dark"
  reduceMotion?: boolean
  textScale?: number
  showColorLegend: boolean
}
```

## Field Reference

| Property | Type | Default | Description |
|----------|------|---------|-------------|
| `readAloudVoicing` | `"dramatic" \| "brisk" \| "plain"` | `"dramatic"` | The GM's preferred read-aloud style. Sticky across the entire app. |
| `theme` | `"dark"` | `"dark"` | v1: dark only. Light mode is post-v1. |
| `reduceMotion` | `boolean` | `false` | Respect OS-level reduce-motion preference. Disables slide animations on the run path. |
| `textScale` | `number` | `1.0` | Multiplier for dynamic type. Respects OS text-size settings. |
| `showColorLegend` | `boolean` | `true` | Whether the color legend strip appears in Table mode. |

## Voicing Preference

The `readAloudVoicing` preference is the most frequently-changed setting:

- **Initial default:** `"dramatic"` (first launch)
- **Changed via:** Tapping the left/right zones on any `ReadAloudBlock`, or tapping a voicing dot
- **Persistence:** Written to `localStorage` immediately on change
- **Scope:** Global — changing it on one passage changes it everywhere

```ts
// Reading the preference
const { readAloudVoicing } = usePrefs()

// Changing it (from a ReadAloudBlock tap handler)
usePrefs.setState({ readAloudVoicing: "brisk" })
```

::: tip Sticky across cold starts
The voicing preference survives app reload, PWA cold-start, and browser restart. It's the first pref loaded on app initialization.
:::

## Theme

v1 is dark-only. `theme` exists in the type for forward compatibility:

```ts
type Prefs = {
  theme: "dark"  // v1: only "dark"
}
```

When light mode ships (post-v1), the union expands to `"dark" | "light" | "system"`.

## reduceMotion

When `true`, the app disables:
- Combat overlay slide-in animation
- NPC sheet slide-up animation
- Read-aloud collapse animation
- Beat transition animations

Defaults to the OS-level `prefers-reduced-motion` media query on first launch. The user can override in settings.

## textScale

A multiplier applied to all text sizes:

- `1.0` = default type scale
- `1.2` = 20% larger text
- `0.9` = 10% smaller text

Respects the OS dynamic type / font size setting on first launch. Rounded to one decimal place.

## showColorLegend

Controls visibility of the color legend strip in Table mode:

```
🟡 Read aloud  🔵 NPC  🟣 Roll  🔴 Live
```

Experienced GMs may hide it to reclaim vertical space. Defaults to `true` (shown).

## Storage

```ts
localStorage.setItem("prefs", JSON.stringify(prefs))
```

One key, one object. Total size: ~200 bytes.

## Related Pages

- [Read Aloud Passage](/data-model/read-aloud) — how the voicing preference affects rendering
- [Run State](/data-model/run-state) — per-adventure state (stored separately from prefs)
- [Scene Runner](/guide/scene-runner) — color legend strip in Table mode
- [Combat Runner](/guide/combat-runner) — reduceMotion impact on combat animations
