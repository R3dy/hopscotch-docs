# Scene

> The core unit of gameplay structure — a scene holds beats, NPCs, transitions, and (optionally) an embedded combat encounter.

## Type Definition

```ts
type Scene = {
  id: string
  n: string
  title: string
  location: string
  duration: string
  kind: SceneKind
  pacing?: number

  setup: {
    goal: string
    pillars?: string[]
    stakes?: string
  }

  readAloud?: ReadAloudPassage
  npcs: Npc[]
  beats: Beat[]
  transitions: Transition[]
  secrets?: Secret[]
  rules?: Rule[]
  pace?: PaceMeta
  combat?: Combat
}

type SceneKind = "Hook" | "Social" | "Skill" | "Plan" | "Combat" | "Coda" | string
```

## Field Reference

| Property | Type | Required | Description |
|----------|------|----------|-------------|
| `id` | `string` | Yes | Unique within the adventure. Used in `transition.to` and `beat.stage[]`. |
| `n` | `string` | Yes | Display label: `"1"`, `"2A"`, `"Coda"`. Shown in scene lists and the Scene Runner header. |
| `title` | `string` | Yes | Scene title. Rendered in italic serif on the title plate. |
| `location` | `string` | Yes | Where the scene takes place. Displayed in scene overview lists. |
| `duration` | `string` | Yes | Expected duration, e.g. `"~45 min"`. Display only — not parsed. |
| `kind` | `SceneKind` | Yes | The scene's gameplay type. Displayed as a chip in scene lists. |
| `pacing` | `number` | No | Author's intended pacing pin, 0–1. Display only in Prep mode. |
| `setup` | `object` | Yes | The scene's goal, optional pillars, and stakes. |
| `readAloud` | `ReadAloudPassage` | No | Scene opener. Shown on Beat 1 in Table mode, always in Prep mode. |
| `npcs` | `Npc[]` | Yes | All NPCs available in this scene. Referenced by `beat.stage[]`. |
| `beats` | `Beat[]` | Yes | Ordered story beats. The Scene Runner advances through them one at a time. |
| `transitions` | `Transition[]` | Yes | Where this scene can lead — success, lateral, and fail branches. |
| `secrets` | `Secret[]` | No | DM-only information, hidden from players. |
| `rules` | `Rule[]` | No | Mechanical reminders (custom rules, special mechanics). |
| `pace` | `PaceMeta` | No | Checkpoint markers on the pacing bar. |
| `combat` | `Combat` | No | Combat configuration. **If present, this scene is combat-bearing.** |

## SceneKind

| Kind | Description | Typical Use |
|------|-------------|-------------|
| `"Hook"` | Opens the adventure — the inciting incident | First scene, introduces the central tension |
| `"Social"` | Dialogue-heavy, NPC interaction | Negotiations, interrogations, persuasion |
| `"Skill"` | Challenge with physical or mental checks | Lockpicking, traversal, investigation |
| `"Plan"` | Players prepare for a major challenge | Heist planning, ambush setup |
| `"Combat"` | Standalone combat encounter | Boss fight, skirmish |
| `"Coda"` | Closing scene — resolution and aftermath | Epilogue, rewards, loose ends |

::: info Custom kinds
`SceneKind` is `string`, not a closed union. Authors can use any string. The built-in kinds receive specific treatment in Prep mode (icon, layout variation), but custom kinds render with a generic layout.
:::

## Combat-Bearing Detection

The Scene Runner checks `scene.combat !== undefined`. If present:

- Beats with `initiatesCombat: true` render a Combat Trigger card
- Beats with `requiresCombatResolved: true` are locked until `outcomes` includes `'after'`
- The combat overlay is mounted on combat trigger activation

## PaceMeta

```ts
type PaceMeta = {
  now?: string               // "~12 min in" — display only
  checkpoints: { at: number; label: string }[]  // at ∈ [0, 1]
}
```

`checkpoints` provide named markers on the pacing progress bar in Table mode. `at` is a fractional position (0 = start, 1 = end).

```jsonc
"pace": {
  "now": "~12 min in",
  "checkpoints": [
    { "at": 0.25, "label": "Enter the gallery" },
    { "at": 0.5,  "label": "The offer" },
    { "at": 0.75, "label": "Confrontation" }
  ]
}
```

## Minimal Valid Scene

```jsonc
{
  "id": "s1",
  "n": "1",
  "title": "The Collector's Invitation",
  "location": "The Gilded Swan tavern",
  "duration": "~30 min",
  "kind": "Hook",
  "setup": {
    "goal": "Meet Lin at the Swan and learn about the job.",
    "stakes": "Refuse, and Lin finds someone else."
  },
  "npcs": [],
  "beats": [],
  "transitions": []
}
```

::: warning Empty beats
A scene with no beats will render as an empty page in the Scene Runner. Always define at least one beat.
:::

## Validation Invariants

- Every `scene.transitions[].to` must resolve to an existing scene `id` in the adventure
- Every `beat.stage[]` id must refer to an NPC declared in `scene.npcs`
- If `scene.combat` exists, every `combat.endConditions[].predicate` that references a `combatantId` must match an id in `combat.combatants`
- No duplicate `id` values among scenes, beats, NPCs, or combatants within the adventure

## Related Pages

- [Beat](/data-model/beat) — the story unit inside each scene
- [NPC](/data-model/npc) — non-player character reference
- [Combat (Scene)](/data-model/combat) — embedded combat configuration
- [Transition](/data-model/transition) — scene branching logic
- [Scene Runner](/guide/scene-runner) — how the Scene Runner renders Prep and Table modes
