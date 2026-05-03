# Battlefield

> A 4-zone tactical map — combatants are placed in zones, rendered as a grid in the combat overlay.

## Type Definition

```ts
type Battlefield = {
  zones: { id: string; label: string }[]
  positions: Record<string, string>
}
```

## Field Reference

| Property | Type | Required | Description |
|----------|------|----------|-------------|
| `zones` | `object[]` | Yes | Named zones on the battlefield grid. Typically 4 zones. |
| `zones[].id` | `string` | Yes | Zone identifier, referenced in `positions`. |
| `zones[].label` | `string` | Yes | Display label, e.g. `"Gallery Floor"`. |
| `positions` | `Record<string, string>` | Yes | Combatant ID → zone ID mapping. Every combatant must have a position. |

## Zone Layout

The battlefield renders as a 2×2 grid:

```
┌──────────────┬──────────────┐
│   zone[0]    │   zone[1]    │
│  [Vera]      │              │
│              │              │
├──────────────┼──────────────┤
│   zone[2]    │   zone[3]    │
│  [Kell]      │  [Tomas]     │
│  [Nyla]      │              │
└──────────────┴──────────────┘
```

## Example

```jsonc
"battlefield": {
  "zones": [
    { "id": "floor", "label": "Gallery Floor" },
    { "id": "stair", "label": "Spiral Stair" },
    { "id": "landing", "label": "Landing" },
    { "id": "wings", "label": "Archive Wings" }
  ],
  "positions": {
    "en_vera": "floor",
    "en_tomas": "wings",
    "pc_kell": "landing",
    "pc_nyla": "landing",
    "pc_rinn": "stair"
  }
}
```

## v1 vs v1.5

| Capability | v1 | v1.5 |
|------------|-----|------|
| Zone display | Read-only grid | Read-only grid |
| Drag to move | Not available | Drag combatants between zones |
| Zone effects | Not implemented | Per-zone environmental effects |
| Line of sight | Not implemented | Visual indicators between zones |

::: tip v1 is read-only
In v1, combatants are placed where the adventure file puts them. The GM views the battlefield but cannot move tokens. Position changes are tracked on a physical battle map or in the GM's head. Drag-to-move ships in v1.5.
:::

## Validation Invariants

- Every combatant in `combat.combatants` must have an entry in `positions`
- Every `positions` value must match a zone `id`
- `zones` array should have exactly 4 entries (2×2 grid)
- Zone `id` values must be unique

## Related Pages

- [Combat (Scene)](/data-model/combat) — parent container
- [Combatant](/data-model/combatant) — combatant identifiers used in positions
- [Combat Runner](/guide/combat-runner) — battlefield zone rendering
