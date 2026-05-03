# Combat Engine

> The pure TypeScript state reducer that drives all combat — initiative tracking, HP changes, condition management, and automatic end-condition evaluation.

## Overview

The combat engine is a **pure reducer**: it takes a `CombatState` and an `Action`, returns a new `CombatState`. It has zero imports from React, zero DOM dependencies, and runs identically in Node and the browser.

```ts
// engine/combatEngine.ts
function reduce(state: CombatState, action: CombatAction): CombatState
```

## Architecture Principle

The combat engine is testable without React, jsdom, or a browser. A test suite with table-driven inputs can verify every end-condition predicate, every action type, and every edge case — in plain Node with Vitest.

## CombatState

```ts
type CombatState = {
  adventure: Pick<Adventure, 'combat'>  // readonly — the adventure's combat config
  runState: CombatRunState              // mutable — persisted after every reduction
}

type CombatRunState = {
  state: "idle" | "live" | "resolved" | "paused"
  round: number
  activeCombatantId: string
  combatants: Record<string, {
    hp: number
    hpMax: number        // derived from adventure, cached for convenience
    conditions: string[]
    side: "pc" | "enemy" | "ally"
  }>
  resolution?: {
    conditionId: string
    tags: string[]
  }
}
```

## Actions

### `applyHp`

Adjust a combatant's HP. Clamped to `[0, hpMax]`. Triggers end-condition evaluation.

```ts
type ApplyHpAction = {
  type: "applyHp"
  targetId: string
  delta: number          // negative = damage, positive = healing
}
```

Behavior:
- `hp = clamp(hp + delta, 0, hpMax)`
- If delta is negative and target reaches 0, the combatant is "down" but not "dead" (both states are `hp ≤ 0`)
- Healing cannot exceed `hpMax`

```ts
// Reduce Kell's HP by 12 (damage)
const next = reduce(state, { type: "applyHp", targetId: "pc_kell", delta: -12 })
// next.combatants["pc_kell"].hp === 16  (was 28)

// Heal Vera for 5
const next = reduce(state, { type: "applyHp", targetId: "en_vera", delta: 5 })
// hp clamped to hpMax if overhealing
```

### `addCondition` / `removeCondition`

Manage condition tags on a combatant:

```ts
type AddConditionAction = {
  type: "addCondition"
  targetId: string
  tag: string
}

type RemoveConditionAction = {
  type: "removeCondition"
  targetId: string
  tag: string
}
```

Duplicates are silently ignored. Removing a non-existent condition is a no-op.

```ts
// Add Frightened to Nyla
const next = reduce(state, { type: "addCondition", targetId: "pc_nyla", tag: "Frightened" })
```

### `selectActive`

Change which combatant is currently active:

```ts
type SelectActiveAction = {
  type: "selectActive"
  combatantId: string
}
```

No validation — the component layer prevents selecting invalid combatants.

### `endTurn`

Advance to the next combatant in initiative order. If the last combatant's turn ends, increment the round.

```ts
type EndTurnAction = {
  type: "endTurn"
}
```

Logic:
1. Get all combatants sorted by `init` descending (ties: `side` order — pc > ally > enemy, then alphabetical)
2. Find current active's index
3. If next index < length → set `activeCombatantId` to next combatant
4. If next index === length → increment `round`, set `activeCombatantId` to first combatant

### `setRound`

Used on resume to restore round number:

```ts
type SetRoundAction = {
  type: "setRound"
  round: number
}
```

### `initCombat`

Initialize combat state from the adventure's combat config:

```ts
type InitCombatAction = {
  type: "initCombat"
}
```

Sets `state` to `"live"`, `round` to 1, populates `combatants` from `adventure.combat.combatants` with their starting HP.

### `pause` / `resume`

Pause and resume combat without resetting state:

```ts
type PauseAction = { type: "pause" }
type ResumeAction = { type: "resume" }
```

Pause sets `state` to `"paused"`. Resume sets it back to `"live"`.

## End-Condition Evaluation

After **every** state-changing action (`applyHp`, `addCondition`, `removeCondition`, `endTurn`), the reducer runs `evaluateEndConditions()`:

```ts
function evaluateEndConditions(state: CombatState): CombatState {
  const conditions = state.adventure.combat.endConditions
  let next = { ...state }

  for (const condition of conditions) {
    if (evaluatePredicate(condition.predicate, state)) {
      // Merge tags
      next = mergeTags(next, condition.tags)

      if (condition.endsCombat) {
        next.runState.state = "resolved"
        next.runState.resolution = {
          conditionId: condition.id,
          tags: condition.tags
        }
        break  // First matching endsCombat wins
      }
    }
  }

  return next
}
```

### Predicate Evaluation

```ts
function evaluatePredicate(pred: Predicate, state: CombatState): boolean {
  switch (pred.type) {
    case "allEnemiesDown":
      return getCombatantsBySide(state, "enemy").every(c => c.hp <= 0)

    case "allPcsDown":
      return getCombatantsBySide(state, "pc").every(c => c.hp <= 0)

    case "combatantHpAtMost": {
      const c = state.runState.combatants[pred.combatantId]
      if (pred.alive !== undefined && pred.alive !== (c.hp > 0)) return false
      return c.hp <= pred.hp
    }

    case "combatantHpAtLeast": {
      const c = state.runState.combatants[pred.combatantId]
      return c.hp >= pred.hp
    }

    case "combatantDead":
      return state.runState.combatants[pred.combatantId].hp <= 0

    case "roundAtLeast":
      return state.runState.round >= pred.round

    case "tagPresent":
      return state.runState.outcomes?.includes(pred.tag)

    case "and":
      return pred.of.every(p => evaluatePredicate(p, state))

    case "or":
      return pred.of.some(p => evaluatePredicate(p, state))

    case "not":
      return !evaluatePredicate(pred.of, state)
  }
}
```

## Testing Strategy

The combat engine is tested with table-driven Vitest tests:

```ts
describe('combatEngine', () => {
  it('allEnemiesDown fires when all enemies reach 0 HP', () => {
    const state = createFixture([/* combatants */])
    const next = applyDamageToAllEnemies(state)
    expect(next.runState.state).toBe('resolved')
    expect(next.runState.resolution?.conditionId).toBe('all-dead')
  })

  it('veraYielded fires when Vera ≤ 10 HP and Tomas is down', () => {
    // ... table-driven test for nested predicate
  })
})
```

## Related Pages

- [Outcome Engine](/engine/outcome-engine) — requires DSL for transition gating
- [End Condition](/data-model/end-condition) — predicate type reference
- [Run State](/data-model/run-state) — how combat state is persisted
- [Combat Runner](/guide/combat-runner) — how the overlay consumes the engine
- [Architecture Decisions](/architecture/decisions) — D7 pure reducer rationale
