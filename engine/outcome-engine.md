# Outcome Engine

> The pure TypeScript evaluator for the `requires` DSL — gates transitions based on accumulated outcome tags.

## Overview

The outcome engine evaluates the `TransitionRequires` DSL against a set of outcome tags. It answers one question: "Given these accumulated tags, is this transition unlocked?"

```ts
// engine/outcomeEngine.ts
function evaluate(requires: TransitionRequires, outcomes: string[]): boolean
```

The engine has zero knowledge of scenes, beats, or combat — it's a pure function that checks set membership and composes boolean logic.

## The `requires` DSL

```ts
type TransitionRequires =
  | string
  | { all: TransitionRequires[] }
  | { any: TransitionRequires[] }
  | { not: TransitionRequires }
```

### String: Tag Membership

A plain string means "this tag must be in the outcomes set."

```ts
evaluate("veraYielded", ["veraYielded", "after"])       // true
evaluate("veraYielded", ["partyVictory", "after"])      // false
evaluate("after", ["partyVictory", "after"])            // true
```

### `all`: Logical AND

All sub-requirements must be satisfied:

```ts
evaluate(
  { all: ["veraYielded", "partyVictory"] },
  ["veraYielded", "partyVictory", "after"]
)
// true — both tags present

evaluate(
  { all: ["veraYielded", "linKilled"] },
  ["veraYielded", "after"]
)
// false — linKilled not present
```

### `any`: Logical OR

At least one sub-requirement must be satisfied:

```ts
evaluate(
  { any: ["veraYielded", "talkedDown"] },
  ["veraYielded", "after"]
)
// true — veraYielded is present

evaluate(
  { any: ["veraYielded", "talkedDown"] },
  ["partyVictory", "after"]
)
// false — neither tag is present
```

### `not`: Logical Negation

The sub-requirement must NOT be satisfied:

```ts
evaluate(
  { not: "linKilled" },
  ["veraYielded", "after"]
)
// true — linKilled is NOT present

evaluate(
  { not: "linKilled" },
  ["linKilled", "veraYielded", "after"]
)
// false — linKilled IS present
```

### Nested Composition

The DSL composes arbitrarily:

```ts
evaluate(
  {
    all: [
      "after",
      {
        any: ["veraYielded", "partyVictory"]
      },
      {
        not: "linKilled"
      }
    ]
  },
  ["veraYielded", "after"]
)
// true — after ✓, veraYielded ✓, linKilled not present ✓
```

## Implementation

```ts
function evaluate(requires: TransitionRequires, outcomes: string[]): boolean {
  if (typeof requires === 'string') {
    return outcomes.includes(requires)
  }

  if ('all' in requires) {
    return requires.all.every(r => evaluate(r, outcomes))
  }

  if ('any' in requires) {
    return requires.any.some(r => evaluate(r, outcomes))
  }

  if ('not' in requires) {
    return !evaluate(requires.not, outcomes)
  }

  return false
}
```

## Where It's Used

| Context | Type | Usage |
|---------|------|-------|
| Transition gating | `Transition.requires` | Determines if a transition chip is enabled or locked |
| Aftermath matching | `AftermathRule.match` | Determines which OutcomeBanner to show after combat |

Both use the exact same DSL and the exact same evaluator.

## Testing

The outcome engine is tested with table-driven inputs:

```ts
describe('outcomeEngine.evaluate', () => {
  it('single tag present', () => {
    expect(evaluate('veraYielded', ['veraYielded'])).toBe(true)
  })

  it('single tag absent', () => {
    expect(evaluate('veraYielded', ['partyVictory'])).toBe(false)
  })

  it('allOf with all tags present', () => {
    expect(evaluate(
      { all: ['a', 'b'] },
      ['a', 'b', 'c']
    )).toBe(true)
  })

  it('allOf with one tag missing', () => {
    expect(evaluate(
      { all: ['a', 'b'] },
      ['a', 'c']
    )).toBe(false)
  })

  it('anyOf with one match', () => {
    expect(evaluate(
      { any: ['a', 'b'] },
      ['a']
    )).toBe(true)
  })

  it('not with tag absent', () => {
    expect(evaluate(
      { not: 'a' },
      ['b']
    )).toBe(true)
  })

  it('nested composition', () => {
    expect(evaluate(
      { all: ['a', { any: ['b', 'c'] }] },
      ['a', 'c']
    )).toBe(true)
  })
})
```

## Edge Cases

### Empty outcomes

No tags → no requirements are satisfied (except `{ not: ... }`):

```ts
evaluate("anything", [])                         // false
evaluate({ any: ["a", "b"] }, [])                // false
evaluate({ all: [] }, [])                        // true — vacuous truth
evaluate({ not: "a" }, [])                       // true — a is not present
```

::: warning Empty `all` is vacuously true
`{ all: [] }` always evaluates to `true` (every element of an empty array satisfies the condition). Authors should not rely on this — use an un-gated transition (no `requires` field) instead.
:::

### Case sensitivity

Tags are case-sensitive. `"VeraYielded"` ≠ `"veraYielded"`. Standardize on `camelCase`.

## Related Pages

- [Transition](/data-model/transition) — transition gating with `requires`
- [Aftermath Rule](/data-model/aftermath) — aftermath matching with `match`
- [End Condition](/data-model/end-condition) — where outcome tags originate
- [Combat Engine](/engine/combat-engine) — how combat writes tags to outcomes
- [Run State](/data-model/run-state) — where outcomes are persisted
