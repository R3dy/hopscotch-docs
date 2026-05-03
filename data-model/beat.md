# Beat

> The atomic story unit in a scene — one beat is one narrative moment, with read-aloud, roll prompts, stage directions, and combat triggers.

## Type Definition

```ts
type Beat = {
  id: string
  label: string
  summary: string

  readAloud?: ReadAloudPassage
  stage?: string[]
  prompts: RollPrompt[]

  initiatesCombat?: boolean
  combatCue?: ReadAloudPassage
  requiresCombatResolved?: boolean
  onEnterOutcomes?: string[]
}
```

## Field Reference

| Property | Type | Required | Description |
|----------|------|----------|-------------|
| `id` | `string` | Yes | Unique within the scene. Used as `activeBeatId` in run state. |
| `label` | `string` | Yes | Short title for the beat, e.g. `"The door creaks open"`. Displayed on the beat chip. |
| `summary` | `string` | Yes | DM-facing prose — what happens in this beat. Shown in the beat detail card. |
| `readAloud` | `ReadAloudPassage` | No | Player-facing prose with three voicings. Rendered in a `ReadAloudBlock` under the beats nav. |
| `stage` | `string[]` | No | NPC ids on stage during this beat. Controls the Cast split ("On stage" vs "In the wings"). |
| `prompts` | `RollPrompt[]` | Yes | Skill checks and their 4-outcome consequences. Can be empty (`[]`). |
| `initiatesCombat` | `boolean` | No | **If `true`, this beat is a Combat Trigger.** Normal detail is replaced with a Combat Trigger card. |
| `combatCue` | `ReadAloudPassage` | No | The read-aloud line shown inside the Combat Trigger card. Required if `initiatesCombat` is true. |
| `requiresCombatResolved` | `boolean` | No | **If `true`, this beat is locked until combat resolves.** Renders as a dashed-border stub. |
| `onEnterOutcomes` | `string[]` | No | Tags written to `outcomes` when the GM opens this beat. Rarely needed. |

## Beat Properties in Detail

### `initiatesCombat` — Combat Trigger

When the GM advances to a beat with `initiatesCombat: true`, the Scene Runner renders a Combat Trigger card instead of the normal beat detail:

```jsonc
{
  "id": "b3",
  "label": "Ambush",
  "summary": "The crew springs their trap. Vera's agents emerge from the shadows.",
  "initiatesCombat": true,
  "combatCue": {
    "dramatic": "Shadows stretch across the marble floor as Vera's rapier catches the chandelier light. 'You've made a mistake,' she murmurs, and the air fills with steel.",
    "brisk": "Vera draws. Her agents emerge from the shadows. Combat begins.",
    "plain": "Vera and her agents attack. Roll initiative."
  }
}
```

The Combat Trigger card shows:
- Hatched-rose top edge
- `combatCue` in italic serif (current voicing)
- Primary CTA: **"Roll initiative · enter combat"** (rose, dice icon)

Tapping the CTA mounts the `CombatOverlay` fullscreen.

### `requiresCombatResolved` — Post-Combat Lock

Beats with this flag are inaccessible until `outcomes` includes `'after'` (added when combat resolves):

```jsonc
{
  "id": "b6",
  "label": "The Aftermath",
  "summary": "Vera is subdued. The crew searches the chamber.",
  "requiresCombatResolved": true
}
```

The Scene Runner renders these as dimmed, dashed-border stubs:
> 🔒 **Locked** — unlocks once combat is resolved

### `stage` — Cast Control

The `stage` array controls which NPCs appear "On stage" vs "In the wings" in Table mode:

```jsonc
// Beat 1: only Lin is on stage
{ "stage": ["np_lin"] }

// Beat 3: Lin, Vera, and Tomas are all present
{ "stage": ["np_lin", "en_vera", "en_tomas"] }
```

NPCs in `stage[]` get the lapis-blue active treatment. NPCs not in `stage[]` but declared on the scene appear as faded "In the wings" entries.

::: tip Stage changes signal scene evolution
Use `stage[]` to introduce NPCs as they become relevant. A beat where `stage` expands from `["np_lin"]` to `["np_lin", "en_vera"]` visually signals that Vera just entered the room — the GM doesn't need to remember.
:::

## Minimal Valid Beat

```jsonc
{
  "id": "b1",
  "label": "Arrival",
  "summary": "The party arrives at the Gilded Swan. The bartender nods toward a back table.",
  "prompts": []
}
```

## Beat with Roll Prompts

```jsonc
{
  "id": "b2",
  "label": "Read the room",
  "summary": "Lin is nervous. Something's off about the clientele.",
  "prompts": [
    {
      "skill": "Insight",
      "dc": 14,
      "target": "lin",
      "on": "Read Lin's body language — is he hiding something?",
      "crit": "Lin is terrified of his employer. He'll spill everything if you give him an out.",
      "pass": "Lin is holding back. He's afraid, not deceitful.",
      "fail": "Lin seems nervous but you can't tell why.",
      "fumble": "Lin catches you studying him. He clams up and gets defensive."
    }
  ]
}
```

## Validation Invariants

- Every `beat.stage[]` id must refer to an NPC declared on the same scene
- If `initiatesCombat: true`, the scene must have a `combat` block
- `combatCue` is required when `initiatesCombat: true`
- `initiatesCombat` and `requiresCombatResolved` should never both be `true` on the same beat (combat trigger beats are inherently pre-combat)

## Related Pages

- [Scene](/data-model/scene) — the parent container for beats
- [Read Aloud Passage](/data-model/read-aloud) — three-voicing system
- [Roll Prompt](/data-model/roll-prompt) — 4-outcome skill check reference
- [Combat (Scene)](/data-model/combat) — embedded combat configuration
- [Scene Runner](/guide/scene-runner) — how beats are rendered in Prep and Table modes
