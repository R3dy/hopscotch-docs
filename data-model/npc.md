# NPC

> Non-player character — a person in the adventure with stats, voice, motivations, tells, and pre-authored dialogue.

## Type Definition

```ts
type Npc = {
  id: string
  name: string
  role: string
  avatar: AssetRef
  onStage?: boolean
  quickRead: string
  stats: Record<string, string | number>
  voice: string
  wants: string
  tells: string[]
  lines: string[]
}
```

## Field Reference

| Property | Type | Required | Description |
|----------|------|----------|-------------|
| `id` | `string` | Yes | Unique within the scene. Referenced by `beat.stage[]`. |
| `name` | `string` | Yes | Display name. Shown in Cast rows and the NPC sheet header. |
| `role` | `string` | Yes | One-line role descriptor, e.g. `"The Fixer"`, `"Queen's Enforcer"`. Lapis-accented. |
| `avatar` | `AssetRef` | Yes | Character portrait. Procedural fallback if asset is missing. |
| `onStage` | `boolean` | No | Declared default stage state. Overridden per-beat by `beat.stage[]`. |
| `quickRead` | `string` | Yes | One-line GM prompt for at-a-glance characterization. Shown in Cast rows. |
| `stats` | `Record<string, string \| number>` | Yes | Stats grid. Common keys: `"AC"`, `"HP"`, `"Insight"`, `"Deception"`, `"Athletics"`. Rendered in JetBrains Mono. |
| `voice` | `string` | Yes | Prose description of how the NPC speaks, moves, and presents themselves. Italic serif. |
| `wants` | `string` | Yes | What this NPC wants from the scene. Character motivation. |
| `tells` | `string[]` | Yes | Numbered cues for the GM — observable behaviors that signal the NPC's state. |
| `lines` | `string[]` | Yes | Pre-authored quotable dialogue. Rendered in gold cards (italic serif). |

## Stats Grid

The `stats` field is a flexible key-value map. Common conventions:

```jsonc
"stats": {
  "AC": 15,
  "HP": 42,
  "Insight": "+6",
  "Deception": "+8",
  "Athletics": "+3",
  "Intimidation": "+5"
}
```

Values can be numbers (for HP, AC) or strings with modifiers (for skills). The NPC sheet renders them in JetBrains Mono with the key as a label and the value as the display.

::: tip Use modifiers for skills
Skill stats are more useful to GMs as modifiers (`"+6"`) than raw scores (`16`). The NPC sheet doesn't do math — it shows what the author wrote.
:::

## Tells

Tells are the single most important field for at-the-table GMing. They're numbered cues that signal NPC state to the GM:

```jsonc
"tells": [
  "Wrings her hands when lying — Insight DC 13 to notice.",
  "Touches the scar on her jaw when the Queen's name comes up.",
  "Stands perfectly still when preparing to draw. If she stops moving, combat starts next round."
]
```

Tells are rendered as numbered items with lapis numerals in the NPC sheet. A GM can glance at the tells and immediately know what to look for at the table.

## Lines

Pre-authored dialogue snippets that the GM can quote directly:

```jsonc
"lines": [
  "\"The Queen doesn't negotiate. She acquits — or she doesn't.\"",
  "\"You think this is about silver? This is about the Archive. And it's bigger than any of us.\"",
  "\"Put the knife down, Tomas. You'll want to hear what they're offering.\""
]
```

Lines render as gold-bordered cards in italic serif. They're designed for the GM to read verbatim when the moment calls for it.

## NPC Sheet (Modal)

Tapping an NPC opens a bottom sheet modal with:

1. **Header** — avatar, name, role (lapis accent), close button
2. **Stats grid** — AC, HP, skills in JetBrains Mono
3. **Voice** — italic serif prose
4. **Wants** — character motivation
5. **Tells** — numbered cues (lapis numerals)
6. **Lines** — gold cards, italic serif

Dismiss with drag-down or backdrop tap. Animation: `hSlide 0.28s cubic-bezier(.2,.7,.2,1)`.

## Stage Control

NPC visibility in Table mode is controlled by `beat.stage[]`:

```jsonc
// Scene declares 3 NPCs
"npcs": [
  { "id": "np_lin", "name": "Lin", ... },
  { "id": "en_vera", "name": "Vera", ... },
  { "id": "en_tomas", "name": "Tomas", ... }
]

// Beat 1: only Lin is on stage
"beats": [{ "stage": ["np_lin"], ... }]

// Beat 3: Vera enters — stage expands
"beats": [{ "stage": ["np_lin", "en_vera"], ... }]

// Beat 5: Tomas appears, Lin exits
"beats": [{ "stage": ["en_vera", "en_tomas"], ... }]
```

The `onStage` field in the NPC object is the declared default. If no beat specifies stage, all NPCs with `onStage: true` are shown.

## Minimal Valid NPC

```jsonc
{
  "id": "np_bartender",
  "name": "Greta",
  "role": "Bartender",
  "avatar": "greta",
  "quickRead": "Cheerful, observant, knows everyone's tab.",
  "stats": {},
  "voice": "Warm, maternal, with a dockworker's vocabulary.",
  "wants": "To keep her tavern peaceful and her patrons safe.",
  "tells": [],
  "lines": []
}
```

## Validation Invariants

- `id` must be unique within the scene (no two NPCs with the same `id`)
- Every `beat.stage[]` reference must match an NPC `id` in the same scene
- Stats keys should be display-ready strings (not internal codes)

## Related Pages

- [Scene](/data-model/scene) — the parent container for NPCs
- [Beat](/data-model/beat) — stage control via `beat.stage[]`
- [Asset References](/data-model/asset-ref) — avatar asset resolution
- [Scene Runner](/guide/scene-runner) — NPC sheet modal rendering
