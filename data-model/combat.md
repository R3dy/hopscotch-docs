# Combat (Scene)

> Embedded combat configuration that turns any scene into a combat-bearing scene — initiative, combatants, rounds, end conditions, and aftermath.

## Type Definition

```ts
type Combat = {
  id: string
  setup?: { goal: string; pillars?: string[]; stakes?: string }
  terrain?: {
    lighting?: string
    hazards?: string[]
    cover?: string
    rooms?: string[]
  }
  objective?: { primary: string; secondary?: string; escape?: string }

  combatants: Combatant[]
  rounds: Round[]
  triggers?: TriggerNote[]
  endConditions: EndCondition[]
  aftermath?: AftermathRule[]
  battlefield?: Battlefield
  transitions?: Transition[]
}
```

::: danger Combat-Bearing Detection
A scene is combat-bearing **iff `scene.combat` is present.** The Scene Runner checks this boolean property — not the scene `kind`. Even a `Social` scene can have an embedded combat block.
:::

## Field Reference

| Property | Type | Required | Description |
|----------|------|----------|-------------|
| `id` | `string` | Yes | Unique within the adventure. Typically matches the scene `id`. |
| `setup` | `object` | No | Combat goal, pillars, and stakes — same shape as `Scene.setup`. |
| `terrain` | `object` | No | Environmental conditions: lighting, hazards, cover, room progression. |
| `objective` | `object` | No | Victory conditions beyond "kill everything." |
| `combatants` | `Combatant[]` | Yes | All participants in this combat. |
| `rounds` | `Round[]` | Yes | Round openers. Array length determines expected combat duration. |
| `triggers` | `TriggerNote[]` | No | DM watch-list — things that happen at specific moments. |
| `endConditions` | `EndCondition[]` | Yes | **Data-driven resolution predicates.** Evaluated after every state change. |
| `aftermath` | `AftermathRule[]` | No | OutcomeBanner content keyed by outcome tag sets. |
| `battlefield` | `Battlefield` | No | 4-zone map. v1 read-only; v1.5 drag-to-move. |
| `transitions` | `Transition[]` | No | Combat-specific transitions. Usually inherited from the parent scene. |

## Terrain

```jsonc
"terrain": {
  "lighting": "Dim light throughout. Chandelier provides bright light in 20ft radius.",
  "hazards": [
    "Shattered glass on floor (difficult terrain, DC 10 Acrobatics or 1d4 slashing)",
    "Unstable balcony (collapse on 20+ damage in one round)"
  ],
  "cover": "Half cover behind overturned tables. Three-quarters behind pillars.",
  "rooms": ["Gallery Floor", "Spiral Stair", "Landing", "Archive Wings"]
}
```

`rooms` are the ordered progression of areas (start → … → exit). Displayed in the battlefield zone view.

## Objective

When combat is about more than "kill all enemies":

```jsonc
"objective": {
  "primary": "Subdue Vera before she destroys the silver map.",
  "secondary": "Keep Lin alive.",
  "escape": "The Archive entrance is behind the painting on the landing."
}
```

## Transitions

Combat can have its own transitions that override the parent scene's. If `combat.transitions` is empty or absent, the parent scene's transitions are used.

```jsonc
"transitions": [
  {
    "id": "victory-path",
    "to": "scene-3",
    "label": "To the Archive",
    "kind": "success",
    "requires": "partyVictory"
  },
  {
    "id": "yield-path",
    "to": "scene-3b",
    "label": "Vera's Deal",
    "kind": "lateral",
    "requires": "veraYielded"
  }
]
```

## Minimal Valid Combat Block

```jsonc
"combat": {
  "id": "combat-s2a",
  "combatants": [],
  "rounds": [],
  "endConditions": [
    {
      "id": "all-dead",
      "predicate": { "type": "allEnemiesDown" },
      "endsCombat": true,
      "tags": ["partyVictory"],
      "resolution": {
        "title": "Victory",
        "subtitle": "The enemies are defeated.",
        "tone": "win"
      }
    },
    {
      "id": "tPK",
      "predicate": { "type": "allPcsDown" },
      "endsCombat": true,
      "tags": ["partyDown"],
      "resolution": {
        "title": "Defeat",
        "subtitle": "The party has fallen.",
        "tone": "lose"
      }
    }
  ]
}
```

::: warning End conditions are required
A combat block without `endConditions` has no way to resolve. The CombatOverlay will run forever. Always include at least `allEnemiesDown` and `allPcsDown`.
:::

## Combat Lifecycle Integration

1. A beat with `initiatesCombat: true` triggers the overlay
2. `combatState` becomes `'live'`
3. After every HP change, `combatEngine` evaluates `endConditions` in order
4. First matching condition with `endsCombat: true` fires resolution
5. Tags from the condition are merged into `outcomes`, plus `'after'`
6. `combatState` becomes `'resolved'`
7. Post-combat beats unlock; OutcomeBanner renders

## Related Pages

- [Combatant](/data-model/combatant) — participant type reference
- [End Condition](/data-model/end-condition) — predicate system for resolution
- [Aftermath Rule](/data-model/aftermath) — post-combat banner content
- [Round](/data-model/round) — round opener passages
- [Combat Runner](/guide/combat-runner) — how the overlay operates at runtime
