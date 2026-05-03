# Transition

> Branching logic that moves the party from one scene to another — gated by outcome tags, color-coded by result.

## Type Definition

```ts
type Transition = {
  id: string
  to: string
  label: string
  hint?: string
  kind: "success" | "lateral" | "fail"
  requires?: TransitionRequires
}

type TransitionRequires =
  | string
  | { all: TransitionRequires[] }
  | { any: TransitionRequires[] }
  | { not: TransitionRequires }
```

## Field Reference

| Property | Type | Required | Description |
|----------|------|----------|-------------|
| `id` | `string` | Yes | Unique within the scene. |
| `to` | `string` | Yes | Destination scene `id`. Must resolve to an existing scene in the adventure. |
| `label` | `string` | Yes | Button label. Shown on the branch chip. |
| `hint` | `string` | No | Subtitle hint. Displayed in smaller text below the label. |
| `kind` | `"success" \| "lateral" \| "fail"` | Yes | Colors the chip and determines the button style. |
| `requires` | `TransitionRequires` | No | Outcome tags that must (or must not) be present. If absent, transition is always available. |

## Kind Colors

| Kind | Chip Color | Button Label | Meaning |
|------|-----------|-------------|---------|
| `success` | Sage green | **GO** | The party achieved the goal. Best path forward. |
| `lateral` | Amber | **BRANCH** | An alternative path. Not failure, not optimal. |
| `fail` | Rose | **CLOSE** | Things went wrong. Still a valid path, but costly. |

## The `requires` DSL

The `requires` field gates transitions behind outcome tags. The [OutcomeEngine](/engine/outcome-engine) evaluates this DSL against the live `outcomes` set.

### Single Tag

```jsonc
"requires": "veraYielded"
```
Available when `outcomes` includes `"veraYielded"`.

### All-Of (AND)

```jsonc
"requires": { "all": ["veraYielded", "partyVictory"] }
```
Available only when **both** tags are present.

### Any-Of (OR)

```jsonc
"requires": { "any": ["veraYielded", "talkedDown"] }
```
Available when **either** tag is present.

### Negation (NOT)

```jsonc
"requires": { "not": "linKilled" }
```
Available when `"linKilled"` is **not** in `outcomes`.

### Nested Composition

```jsonc
"requires": {
  "all": [
    "partyVictory",
    { "not": "linKilled" }
  ]
}
```
Available when party won **and** Lin survived. The DSL composes arbitrarily.

## How Transitions Render

In Table mode, transitions appear as horizontal branch chips below the active beat detail:

```
 ┌──────────────────┐   ┌───────────────────┐   ┌──────────────────┐
 │  GO              │   │  BRANCH           │   │  LOCKED          │
 │  Vera yields     │   │  Sneak past       │   │  Kill Vera       │
 │  → The Archive   │   │  → Back Alleys    │   │  → Bloody Coda   │
 └──────────────────┘   └───────────────────┘   └──────────────────┘
     (available)            (available)              (locked)
```

- **Available transitions:** Full color, tap to navigate
- **Locked transitions:** Dimmed, `LOCKED` chip, lock icon

Tapping an available transition navigates to the destination scene with `activeBeatId` set to the first beat.

## No `requires` — Always Available

A transition with no `requires` field is always unlocked:

```jsonc
{
  "id": "default-forward",
  "to": "scene-2",
  "label": "Follow Lin",
  "kind": "success"
}
```

::: tip Always provide a default
At least one transition per scene should have no `requires`. This ensures the GM can always move forward, even if they miss every skill check and combat goes sideways.
:::

## Validation Invariants

- `to` must resolve to an existing scene `id` in the adventure
- `kind` must be one of `"success"`, `"lateral"`, `"fail"`
- If `requires` uses nested objects, all referenced tags should be declared by some end-condition or roll prompt outcome

## Related Pages

- [Outcome Engine](/engine/outcome-engine) — how the requires DSL is evaluated
- [Scene](/data-model/scene) — the parent container for transitions
- [Roll Prompt](/data-model/roll-prompt) — how outcome tags are written
- [End Condition](/data-model/end-condition) — combat resolution tags
- [Scene Runner](/guide/scene-runner) — transition chip rendering in Table mode
