# Combatant

> A participant in combat — player character, enemy, or ally — with initiative, HP, AC, conditions, and (for enemies) actions.

## Type Definition

```ts
type Combatant = {
  id: string
  side: "pc" | "enemy" | "ally"
  name: string
  role: string
  init: number
  hp: number
  hpMax: number
  ac: number
  conditions: string[]
  avatar: AssetRef
  notes?: string
  actions?: CombatAction[]
}
```

## Field Reference

| Property | Type | Required | Description |
|----------|------|----------|-------------|
| `id` | `string` | Yes | Unique within the combat. Used in end-condition predicates and battlefield positions. |
| `side` | `"pc" \| "enemy" \| "ally"` | Yes | Determines avatar shape, token color, and how end-conditions classify the combatant. |
| `name` | `string` | Yes | Display name. Truncated to first word on the initiative ladder token. |
| `role` | `string` | Yes | Short descriptor, e.g. `"Rogue"`, `"Lieutenant"`, `"Dire Wolf"`. Shown on the active card. |
| `init` | `number` | Yes | Initiative score. Determines turn order (highest first). |
| `hp` | `number` | Yes | Current hit points. Must be ≤ `hpMax`. |
| `hpMax` | `number` | Yes | Maximum hit points. |
| `ac` | `number` | Yes | Armor class. Display-only on the active card. |
| `conditions` | `string[]` | Yes | Active conditions: `"Bless"`, `"Frightened"`, `"Poisoned"`, etc. Can be empty. |
| `avatar` | `AssetRef` | Yes | Token portrait. Procedural fallback if asset missing. |
| `notes` | `string` | No | DM-facing italic gold note on the active card. |
| `actions` | `CombatAction[]` | No | Available actions. Typically only on enemies; PCs and allies use the generic action set. |

## Side Conventions

| Side | Token Shape | Side Stripe | Meaning |
|------|-------------|-------------|---------|
| `pc` | Round | Solid lapis-blue | Player character |
| `enemy` | Square (-2° tilt) | Hatched rose | Hostile NPC or creature |
| `ally` | Round | Emerald/gold | Friendly NPC on the party's side |

## Initiative Ladder Token

Each combatant renders as a 72px token on the horizontal initiative ladder:

```
┌──────────┐
│  init    │  → JetBrains Mono number, top-left
│ ┌──────┐ │
│ │ AVATAR│ │  → Square (enemy) or round (PC/ally)
│ └──────┘ │
│  Name    │  → Truncated to first word
│  Side    │  → Colored stripe on top edge
└──────────┘
```

## Conditions

The `conditions` array holds string tags. Common values:

```jsonc
"conditions": ["Bless", "Frightened", "Grappled"]
```

The ConditionsPicker modal shows pre-listed common conditions. The GM can type custom ones.

Conditions are **not parsed** by the engine — they're display-only tags. The end-condition system doesn't check for specific conditions (use `combatantDead` or `combatantHpAtMost` instead).

## Notes

The `notes` field is DM-facing only:

```jsonc
"notes": "Will flee if reduced below 10 HP. Has a potion of invisibility."
```

Rendered in italic gold on the active combatant card.

## PC vs Enemy Actions

- **PCs and allies** typically have `actions: undefined` or `actions: []`. The GM handles PC actions manually; the active card shows an HP stepper and condition manager.
- **Enemies** should define actions. Each action appears as a button on the active card; tapping it opens the NarrativePanel or DamagePad.

## Minimal Valid Combatant

```jsonc
{
  "id": "pc_kell",
  "side": "pc",
  "name": "Kell",
  "role": "Rogue",
  "init": 18,
  "hp": 28,
  "hpMax": 28,
  "ac": 16,
  "conditions": [],
  "avatar": "kell"
}
```

## Validation Invariants

- `id` must be unique within `combat.combatants`
- `side` must be `"pc"`, `"enemy"`, or `"ally"`
- `hp` must be ≤ `hpMax`
- `hp`, `hpMax`, `ac` must be positive numbers
- `init` must be a positive integer
- If `actions` is present, every action `id` must be unique within the combatant

## Related Pages

- [Combat (Scene)](/data-model/combat) — parent container
- [Combat Action](/data-model/combat-action) — enemy action reference
- [End Condition](/data-model/end-condition) — predicates that reference combatant ids
- [Battlefield](/data-model/battlefield) — zone positions
- [Combat Runner](/guide/combat-runner) — initiative ladder rendering
