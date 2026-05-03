# End Condition

> A data-driven predicate that determines when combat ends — evaluated after every state change, with composable logic and tagged outcomes.

## Type Definition

```ts
type EndCondition = {
  id: string
  predicate: Predicate
  endsCombat: boolean
  tags: string[]
  resolution?: {
    title: ReadAloudPassage
    subtitle: ReadAloudPassage
    tone: "win" | "lose" | "neutral"
  }
}

type Predicate =
  | { type: "allEnemiesDown" }
  | { type: "allPcsDown" }
  | { type: "combatantHpAtMost"; combatantId: string; hp: number; alive?: boolean }
  | { type: "combatantHpAtLeast"; combatantId: string; hp: number }
  | { type: "combatantDead"; combatantId: string }
  | { type: "roundAtLeast"; round: number }
  | { type: "tagPresent"; tag: string }
  | { type: "and"; of: Predicate[] }
  | { type: "or";  of: Predicate[] }
  | { type: "not"; of: Predicate }
```

## Field Reference

| Property | Type | Required | Description |
|----------|------|----------|-------------|
| `id` | `string` | Yes | Unique within `combat.endConditions[]`. |
| `predicate` | `Predicate` | Yes | The condition that triggers this end condition. |
| `endsCombat` | `boolean` | Yes | If `true`, this condition fires the resolution screen and ends combat. If `false`, only the `tags` are written (mid-fight event). |
| `tags` | `string[]` | Yes | Tags merged into `outcomes` when the predicate is true. |
| `resolution` | `object` | No | Resolution screen content. Required when `endsCombat: true`. |

## Predicate Types

### `allEnemiesDown`

True when every combatant with `side: "enemy"` has `hp ≤ 0`.

```jsonc
{ "type": "allEnemiesDown" }
```

### `allPcsDown`

True when every combatant with `side: "pc"` has `hp ≤ 0`.

```jsonc
{ "type": "allPcsDown" }
```

### `combatantHpAtMost`

True when the named combatant's HP is ≤ the threshold. `alive: true` adds the constraint that HP must be > 0.

```jsonc
// Vera is at or below 10 HP (and alive)
{ "type": "combatantHpAtMost", "combatantId": "en_vera", "hp": 10, "alive": true }

// Vera is at or below 0 HP (unconscious or dead)
{ "type": "combatantHpAtMost", "combatantId": "en_vera", "hp": 0 }
```

### `combatantHpAtLeast`

True when the named combatant's HP is ≥ the threshold. Used for "Tomas is still alive" checks.

```jsonc
// Tomas is at 1+ HP
{ "type": "combatantHpAtLeast", "combatantId": "en_tomas", "hp": 1 }
```

### `combatantDead`

True when the named combatant has `hp ≤ 0`. Typically used with `endsCombat: false` for mid-fight death events.

```jsonc
// Lin died during combat
{ "type": "combatantDead", "combatantId": "np_lin" }
```

### `roundAtLeast`

True when the combat has reached the specified round.

```jsonc
// It's round 6 — the third bell has rung
{ "type": "roundAtLeast", "round": 6 }
```

### `tagPresent`

True when a specific tag is in `outcomes`. Enables chaining: one end-condition's tag can trigger another.

```jsonc
// The "talkedDown" tag was written by a Persuasion check outcome
{ "type": "tagPresent", "tag": "talkedDown" }
```

### Composers: `and`, `or`, `not`

Combine predicates into complex conditions:

```jsonc
// Vera ≤ 10 HP AND Tomas is dead
{
  "type": "and",
  "of": [
    { "type": "combatantHpAtMost", "combatantId": "en_vera", "hp": 10 },
    { "type": "combatantDead", "combatantId": "en_tomas" }
  ]
}

// Vera ≤ 10 HP OR Tomas ≤ 5 HP
{
  "type": "or",
  "of": [
    { "type": "combatantHpAtMost", "combatantId": "en_vera", "hp": 10 },
    { "type": "combatantHpAtMost", "combatantId": "en_tomas", "hp": 5 }
  ]
}
```

## Evaluation Rules

1. Conditions are evaluated **in order** after every state change
2. All conditions whose predicate is true have their `tags` merged into `outcomes`
3. The **first** condition with `endsCombat: true` whose predicate is true fires the resolution screen
4. The Scene Runner always adds `'after'` to `outcomes` when combat resolves

## `endsCombat: false` — Mid-Fight Events

Not all end conditions end combat. Use `endsCombat: false` for events that should happen mid-fight:

```jsonc
// Lin dying is a narrative event, but combat continues
{
  "id": "lin-dies",
  "predicate": { "type": "combatantDead", "combatantId": "np_lin" },
  "endsCombat": false,
  "tags": ["linKilled"]
}
```

The tag `"linKilled"` is written to `outcomes` when Lin drops to 0 HP. Combat continues. Transitions can now check for `"linKilled"` in their `requires` field.

## Resolution Screen

When an end condition with `endsCombat: true` fires, the resolution screen displays:

```jsonc
"resolution": {
  "title": {
    "dramatic": "Vera's rapier clatters to the marble. She sinks to one knee, breathing hard — but the faintest smile plays at her lips.",
    "brisk": "Vera yields. Her rapier drops. She's done fighting.",
    "plain": "Vera is subdued. She yields."
  },
  "subtitle": {
    "dramatic": "'The Archive,' she whispers. 'You still don't know what you're walking into. But perhaps you've earned the right to find out.'",
    "brisk": "'The Archive,' she says. 'You don't know what you're walking into. But you've earned it.'",
    "plain": "Vera tells you about the Archive. She'll let you pass."
  },
  "tone": "neutral"
}
```

| Tone | Color | Use Case |
|------|-------|----------|
| `"win"` | Sage green | Party victory, objective achieved |
| `"lose"` | Rose | Party defeat, TPK |
| `"neutral"` | Amber | Outcome between win and lose (Vera yields, time runs out) |

## Complete End Conditions Example

```jsonc
"endConditions": [
  {
    "id": "tpk",
    "predicate": { "type": "allPcsDown" },
    "endsCombat": true,
    "tags": ["partyDown"],
    "resolution": {
      "title": "The Night Claims All",
      "subtitle": "Darkness swallows the chandelier's last light. The bells stop.",
      "tone": "lose"
    }
  },
  {
    "id": "vera-yields",
    "predicate": {
      "type": "and",
      "of": [
        { "type": "combatantHpAtMost", "combatantId": "en_vera", "hp": 10, "alive": true },
        { "type": "not", "of": { "type": "combatantHpAtLeast", "combatantId": "en_tomas", "hp": 1 } }
      ]
    },
    "endsCombat": true,
    "tags": ["veraYielded"],
    "resolution": {
      "title": "The Enforcer Bows",
      "subtitle": "Vera yields. Tomas is down, and she knows when the fight is lost.",
      "tone": "neutral"
    }
  },
  {
    "id": "victory",
    "predicate": { "type": "allEnemiesDown" },
    "endsCombat": true,
    "tags": ["partyVictory"],
    "resolution": {
      "title": "The Gallery is Yours",
      "subtitle": "The last agent falls. The way to the Archive is open.",
      "tone": "win"
    }
  },
  {
    "id": "lin-dies",
    "predicate": { "type": "combatantDead", "combatantId": "np_lin" },
    "endsCombat": false,
    "tags": ["linKilled"]
  }
]
```

::: tip Order matters
End conditions are evaluated in array order. The first matching `endsCombat: true` wins. Put the most specific conditions first (e.g., Vera yields) and general fallbacks last (e.g., all enemies down).
:::

## Validation Invariants

- Every `combatantId` in a predicate must reference a combatant in `combat.combatants`
- `endsCombat: true` conditions must have a `resolution` object
- `resolution.tone` must be `"win"`, `"lose"`, or `"neutral"`
- `hp` values in predicates must be positive integers
- `round` values must be positive integers
- No duplicate `id` values among end conditions

## Related Pages

- [Combat (Scene)](/data-model/combat) — parent container
- [Aftermath Rule](/data-model/aftermath) — post-combat banner keyed by outcome tags
- [Combat Engine](/engine/combat-engine) — how end conditions are evaluated
- [Outcome Engine](/engine/outcome-engine) — requires DSL for transition gating
- [Combat Runner](/guide/combat-runner) — resolution screen rendering
