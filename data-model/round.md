# Round

> A numbered combat round with an optional read-aloud opener — sets the narrative tone for each turn of the fight.

## Type Definition

```ts
type Round = {
  n: number
  opener?: ReadAloudPassage
}
```

## Field Reference

| Property | Type | Required | Description |
|----------|------|----------|-------------|
| `n` | `number` | Yes | Round number, starting at 1. |
| `opener` | `ReadAloudPassage` | No | Three-voicing read-aloud for the top of this round. |

## Purpose

Round openers let the author inject narrative momentum into long fights. At the top of each round, the `ReadAloudBlock` renders the opener for the current round.

```jsonc
"rounds": [
  {
    "n": 1,
    "opener": {
      "dramatic": "The chandelier sways as combat erupts. Glass shatters, steel sings, and somewhere a clock begins to chime — once, twice — counting down to something.",
      "brisk": "Fight! The crew moves into position. Three bells before the guard arrives.",
      "plain": "Round 1. Six rounds until guards arrive."
    }
  },
  {
    "n": 2,
    "opener": {
      "dramatic": "The first bell's echo still hangs in the air. Tomas presses forward, his twin blades catching the fractured light.",
      "brisk": "Tomas advances. The second chime is coming.",
      "plain": "Round 2. Tomas pushes the attack."
    }
  },
  {
    "n": 3
    // No opener for round 3 — nothing renders at round start
  }
]
```

## Missing Openers

If a round has no `opener`, **nothing renders** at the top of that round. The runner must never inject fallback text like "Round N begins." That's the author's domain.

::: danger Never hardcode round text
If a round lacks an opener in the adventure file, render nothing. The CombatOverlay must not generate "Round 3 begins" or similar fallback prose. Every word of narrative must come from the adventure file.
:::

## Round Count

The number of rounds is derived from `rounds.length`. If combat runs longer (no end-condition fires), rounds beyond the last defined one simply have no opener:

```jsonc
// 6 rounds declared
"rounds": [/* round 1 */, /* ... */, /* round 6 */]

// If combat hits round 7, the round bar shows "Round 7 of ~6"
// No opener renders because rounds[6] doesn't exist
```

## Round Bar Display

The CombatOverlay header shows:

```
⚔ COMBAT · Round 3 of ~6 · The Collector's Offer
```

The "~" before the total rounds indicates it's the author's estimate — combat may end earlier (end-condition fires) or run longer.

Round dots below the header show progress: filled rose for past, bright rose for current, dim for future.

## Related Pages

- [Combat (Scene)](/data-model/combat) — parent container for rounds
- [Read Aloud Passage](/data-model/read-aloud) — three-voicing system
- [Combat Runner](/guide/combat-runner) — round bar and opener rendering
