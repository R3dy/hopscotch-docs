# Trigger Note

> DM watch-list entry — something the GM should remember happens at a specific moment in combat.

## Type Definition

```ts
type TriggerNote = {
  id: string
  when: string
  what: string
}
```

## Field Reference

| Property | Type | Required | Description |
|----------|------|----------|-------------|
| `id` | `string` | Yes | Unique within `combat.triggers[]`. |
| `when` | `string` | Yes | Human-readable timing: `"Round 3, top"`, `"When Vera drops below 10 HP"`, `"After third bell"`. Display only. |
| `what` | `string` | Yes | What happens: `"Tomas reveals — joins as enemy if not subdued."`, `"The chandelier falls. DEX 14 or 3d6."`. |

## Usage

Trigger notes are a display-only DM aid. They appear as a watch-list in the combat overlay sidebar:

```jsonc
"triggers": [
  {
    "id": "trig1",
    "when": "Round 3, top",
    "what": "Tomas reveals his true allegiance — joins Vera's side if not already subdued."
  },
  {
    "id": "trig2",
    "when": "After third bell (Round 6)",
    "what": "Guards arrive. 4 city watch (use guard stat block). Roll perception: DC 15 to hear them on the stairs one round early."
  },
  {
    "id": "trig3",
    "when": "When Lin drops to 0 HP",
    "what": "Vera hesitates. She wanted him alive. Gives the party one round to surrender before pressing the attack."
  }
]
```

::: info Trigger notes are not evaluated by the engine
Unlike end conditions, trigger notes are **never parsed or evaluated.** They're purely informational — reminders for the GM. The engine does not check `when` strings or take any action based on trigger notes.
:::

## Related Pages

- [Combat (Scene)](/data-model/combat) — parent container
- [End Condition](/data-model/end-condition) — engine-evaluated conditions (for triggers that should have mechanical effects)
- [Combat Runner](/guide/combat-runner) — where trigger notes are displayed
