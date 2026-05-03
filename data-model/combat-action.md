# Combat Action

> An enemy action in combat — attack, utility, or lair — with to-hit, damage, description, and narrative read-aloud.

## Type Definition

```ts
type CombatAction = {
  id: string
  name: string
  kind: "attack" | "utility" | "lair"
  toHit?: string
  dmg?: string
  avgDmg?: number
  range?: string
  desc?: string
  narrative?: ReadAloudPassage
}
```

## Field Reference

| Property | Type | Required | Description |
|----------|------|----------|-------------|
| `id` | `string` | Yes | Unique within the combatant's actions. |
| `name` | `string` | Yes | Display name. Shown on the action button. |
| `kind` | `"attack" \| "utility" \| "lair"` | Yes | Action category. Affects button styling. |
| `toHit` | `string` | No | Attack bonus, e.g. `"+5"`. Display string — not parsed. |
| `dmg` | `string` | No | Damage expression, e.g. `"1d8 + 2 piercing"`. Display string. |
| `avgDmg` | `number` | No | Pre-filled average damage for the DamagePad. |
| `range` | `string` | No | Range string, e.g. `"Melee"`, `"80/320"`. |
| `desc` | `string` | No | DM-facing mechanics note, e.g. `"Advantage if target unaware"`. |
| `narrative` | `ReadAloudPassage` | No | Three-voicing narrative text. Supports `{target}` substitution. |

## Action Kinds

| Kind | Button Style | Typical Use |
|------|-------------|-------------|
| `attack` | Rose accent, sword icon | Weapon attacks, spells that deal damage |
| `utility` | Lapis accent, gear icon | Buffs, debuffs, movement, crowd control |
| `lair` | Violet accent, hazard icon | Environmental actions, legendary actions |

## Narrative with `{target}`

The `narrative` field supports `{target}` token substitution. At render time, `{target}` is replaced with the currently-selected target's first name:

```jsonc
"narrative": {
  "dramatic": "Vera's rapier flickers like lightning — three precise thrusts aimed at {target}'s guard. 'You're slowing down.'",
  "brisk": "Three quick thrusts toward {target}. 'You're slowing down.'",
  "plain": "Vera attacks {target} with her rapier, three thrusts."
}
```

::: warning Token scope
`{target}` works **only** in `CombatAction.narrative`. It resolves to the first name of the combatant currently selected in the initiative ladder. For scene/beat read-aloud passages, `{target}` passes through as literal text.
:::

## Damage Pad Integration

When `avgDmg` is set, the DamagePad pre-fills the damage field when the GM taps this action:

```jsonc
{
  "id": "act-pin",
  "name": "Pin Cushion",
  "kind": "attack",
  "toHit": "+5",
  "dmg": "1d8 + 2 piercing",
  "avgDmg": 6,          // Pre-fill: 6 damage
  "range": "Melee"
}
```

The GM can override the pre-filled value before applying.

## Full Action Example

```jsonc
{
  "id": "act-slash",
  "name": "Whirlwind Slash",
  "kind": "attack",
  "toHit": "+7",
  "dmg": "2d6 + 4 slashing",
  "avgDmg": 11,
  "range": "Melee (5ft)",
  "desc": "Tomas spins with both blades. Hits all targets within 5ft. Recharge 5–6.",
  "narrative": {
    "dramatic": "Tomas spins on his heel, both shortswords carving circles in the air. The blades scream toward {target} — and anyone else unlucky enough to be close.",
    "brisk": "Tomas whirls, blades out. He hits everyone in reach.",
    "plain": "Tomas uses Whirlwind Slash, targeting all creatures within 5 feet."
  }
}
```

## Validation Invariants

- `kind` must be `"attack"`, `"utility"`, or `"lair"`
- `id` must be unique within the combatant's `actions[]`
- If `avgDmg` is provided, it should be a positive number
- `toHit` and `dmg` are display strings — no format validation (they match whatever notation the author uses)

## Related Pages

- [Combatant](/data-model/combatant) — the parent type that owns actions
- [Read Aloud Passage](/data-model/read-aloud) — three-voicing system and `{target}` substitution
- [Combat Runner](/guide/combat-runner) — DamagePad and NarrativePanel rendering
