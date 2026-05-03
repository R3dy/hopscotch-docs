# Validator

> The component that walks an AST from the parser and produces either a typed `Adventure` or a list of diagnostic errors — enforcing all semantic invariants.

## Overview

The validator takes the raw AST from the parser and checks every semantic constraint: ID uniqueness, reference integrity, value ranges, required fields, and type coercions. It returns either a fully-typed `Adventure` or a list of `Diagnostic[]` errors.

```
AST → validate → Adventure | Diagnostic[]
```

## Pipeline Position

```
                    ┌──────────┐     ┌───────────┐
.hopscotch file ──► │  parser  │ ──► │ validator │ ──► typed Adventure
                    └──────────┘     └───────────┘
                                          │
                                    Diagnostic[]
                                    (with path + message)
```

## Interface

```ts
// format/validator.ts
function validate(ast: AstNode): Result<Adventure, Diagnostic[]>

type Diagnostic = {
  path: string          // "scenes[2].beats[1].prompts[0].dc"
  message: string       // "DC must be between 1 and 30, got 42"
  severity: "error" | "warning"
}
```

## Validation Rules

### ID Uniqueness

No two siblings may share an `id`:

```
✅ scenes[0].id !== scenes[1].id
✅ Within a scene: npcs[0].id !== npcs[1].id
✅ Within a scene: beats[0].id !== beats[1].id
❌ Two scenes with id "s1"
❌ Two NPCs with id "lin" in the same scene
```

### Reference Integrity

Every reference must resolve to an existing entity:

```
✅ transition.to → existing scene.id
✅ beat.stage[] → existing npc.id (on the same scene)
✅ endConditions[].predicate.combatantId → existing combatant.id
❌ transition.to = "scene-99" but no scene has id "scene-99"
```

### Value Ranges

| Field | Constraint |
|-------|------------|
| `level` | Integer 1–20 |
| `dc` (RollPrompt) | Integer 1–30 |
| `hp` (Combatant) | Positive integer, ≤ `hpMax` |
| `hpMax` | Positive integer |
| `ac` | Positive integer |
| `init` | Positive integer |

### Required Fields

Every object type has required fields that must be present and non-empty:

```
❌ Scene with no beats
❌ Beat with no summary
❌ RollPrompt with missing crit/pass/fail/fumble strings
❌ Combatant with no side
❌ EndCondition with no predicate
```

### Read-Aloud Minimum

If a read-aloud passage is declared as an object, at least one of `dramatic`, `brisk`, or `plain` must be present:

```jsonc
// ✅ Valid — at least one voicing
{ "dramatic": "Darkness.", "brisk": "", "plain": "" }

// ❌ Invalid — no voicings
{ "dramatic": "", "brisk": "", "plain": "" }
```

### Combat Consistency

When `scene.combat` is present:
- At least one end condition must have `endsCombat: true` (combat must be able to end)
- Every `endsCombat: true` condition must have a `resolution` object
- Every combatant referenced in predicates must exist

## Diagnostic Format

Diagnostics include a `path` string using JavaScript object notation:

```ts
{ path: "scenes[2].beats[1].prompts[0].dc", message: "DC must be between 1 and 30, got 42" }
{ path: "scenes[0].transitions[0].to", message: "Scene 'scene-99' not found" }
{ path: "combat.combatants[3].hp", message: "HP (99) exceeds hpMax (28)" }
```

ImportPreview uses these paths to display errors inline next to the relevant field.

## Schema Single Source of Truth

The validator uses Zod schemas in `format/schema.ts` for both TypeScript type inference and runtime validation:

```ts
// format/schema.ts
import { z } from 'zod'

const RollPromptSchema = z.object({
  skill: z.string().min(1),
  dc: z.number().int().min(1).max(30),
  // ...
})

// Type is derived from schema — no drift
type RollPrompt = z.infer<typeof RollPromptSchema>
```

This ensures the TypeScript types and runtime validation never diverge.

## Testing

Validator tests use a fixture corpus:

```ts
describe('validator', () => {
  it('validates the moonlight heist demo', () => {
    const ast = parse(readFixture('moonlight-heist-part-1.hopscotch'))
    const result = validate(ast)
    expect(result.ok).toBe(true)
  })

  it('rejects a scene with duplicate beat IDs', () => {
    const result = validate(parse(fixtureWithDuplicateBeats))
    expect(result.errors).toHaveLength(1)
    expect(result.errors[0].path).toBe('scenes[0].beats')
  })

  it('rejects a transition to a non-existent scene', () => {
    const result = validate(parse(fixtureWithBadTransition))
    expect(result.errors[0].path).toBe('scenes[0].transitions[1].to')
  })

  it('rejects a combatant with hp > hpMax', () => {
    const result = validate(parse(fixtureWithBadHp))
    expect(result.errors[0].path).toBe('combat.combatants[0].hp')
  })
})
```

## Related Pages

- [Parser](/format/parser) — the preceding step in the pipeline
- [Architecture: Data Flow](/architecture/data-flow) — where the validator fits
- [Data Model: Adventure](/data-model/adventure) — the output type
- [Architecture Decisions](/architecture/decisions) — D1 and D2 (format as public contract, untrusted text)
