# Data Flow

> How `.hopscotch` files become typed Adventures, how state is persisted, and how the Scene Runner and engines consume it all — end to end.

## Pipeline Diagram

```
.hopscotch file ─► format/parser ─► AST ─► format/validator ─► typed Adventure
                                                                       │
                       useLibrary.add() ◄── ImportPreview ◄────────────┘
                                                                       │
                                                                       ▼
                                                   localStorage + IndexedDB
                                                                       │
                                                                       ▼
                                          ┌────────── SceneRunner ─────────┐
                                          │  reads useRunState               │
                                          │  renders Prep | Table             │
                                          │  on combat trigger:               │
                                          │     mounts CombatOverlay         │
                                          │  combatEngine evaluates           │
                                          │  endConditions on every change   │
                                          │  outcomeEngine evaluates          │
                                          │  transition.requires              │
                                          └──────────────────────────────────┘
```

## Step 1: Import and Parse

A `.hopscotch` file enters the system through one of two paths:

| Path | Trigger | Source |
|------|---------|--------|
| Marketplace purchase | Tapping "Buy" in Browse | CDN URL → `fetch` → IndexedDB |
| Sideloaded import | File picker in Import screen | Local file → `FileReader` → IndexedDB |

The raw bytes are fed to `format/parser.ts`, which tokenizes the `.hopscotch` text format and emits an Abstract Syntax Tree (AST).

```
bytes → parser.tokenize() → tokens → parser.parse() → AST
```

## Step 2: Validate

The validator walks the AST and produces either:

- **A typed `Adventure`** — the parser and validator agree the file is well-formed
- **`Diagnostic[]`** — errors with file paths and human-readable messages

```ts
// format/validator.ts
function validate(ast: AstNode): Result<Adventure, Diagnostic[]> {
  // Check: every transition.to resolves to a real scene
  // Check: every beat.stage[] id refers to an NPC on the scene
  // Check: every combat.endCondition predicate references real combatants
  // Check: all DCs are 1-30, all HP ≤ hpMax
  // Check: no duplicate IDs within siblings
  // Check: read-aloud objects have at least one voicing
}
```

Invalid files produce a red error card in ImportPreview. The diagnostic includes a `path` (e.g., `"scenes[2].beats[1].prompts[0].dc"`) so the error can be displayed inline.

## Step 3: Persist

Validated adventures are stored in two places:

| Store | Key | Contents |
|-------|-----|----------|
| **IndexedDB** (`idb-keyval`) | `adventureId` | Full parsed `Adventure` object (the blob) |
| **localStorage** | `library` | Metadata: `{ id, title, author, cover, source, addedAt }` |

Run state is stored separately in localStorage, keyed by adventure id:

```
localStorage["runState:adventureId"] → { currentSceneId, scenes: {...}, lastActiveAt }
```

::: tip Why separate run state?
Storing run state separately from the adventure blob means:
- Re-importing or updating an adventure file doesn't wipe run progress
- Removing an adventure preserves run state for other adventures
- Studio updates can ship new package versions without breaking in-flight runs
:::

## Step 4: Mount the Scene Runner

When the user opens a scene, the Scene Runner loads:

```ts
// Simplified
function SceneRunner({ adventureId, sceneId }) {
  const adventure = useLibrary().get(adventureId)       // from IndexedDB
  const scene = adventure.scenes.find(s => s.id === sceneId)
  const runState = useRunState().scenes[sceneId]        // from localStorage
  const combatState = runState.combat                   // current combat if live

  // Detect combat-bearing
  const isCombatScene = scene.combat !== undefined
  const activeBeat = scene.beats.find(b => b.id === runState.activeBeatId)

  // Render mode
  return (
    <SceneRunnerLayout>
      {mode === 'prep' ? <PrepView scene={scene} /> : <TableView ... />}
      {combatState?.state === 'live' && <CombatOverlay ... />}
    </SceneRunnerLayout>
  )
}
```

## Step 5: Combat State Machine

When a beat with `initiatesCombat: true` is activated, the `CombatOverlay` mounts. All combat state changes flow through the `combatEngine` reducer:

```ts
// engine/combatEngine.ts
function reduce(state: CombatState, action: CombatAction): CombatState {
  let next = { ...state }

  switch (action.type) {
    case 'applyHp':
      next.combatants[action.targetId].hp = clamp(
        next.combatants[action.targetId].hp + action.delta,
        0,
        next.combatants[action.targetId].hpMax
      )
      break
    case 'endTurn':
      advanceInitiative(next)
      break
    case 'addCondition':
      next.combatants[action.targetId].conditions.push(action.tag)
      break
    // ...
  }

  // Auto-detect resolution after every state change
  return evaluateEndConditions(next, action.adventure.combat.endConditions)
}
```

## Step 6: Outcome Gating

After combat resolves (or when the GM taps a roll prompt outcome), tags accumulate in `outcomes`. The `outcomeEngine` evaluates transitions against this set:

```ts
// engine/outcomeEngine.ts
function evaluate(requires: TransitionRequires, outcomes: string[]): boolean {
  if (typeof requires === 'string') {
    return outcomes.includes(requires)          // tag present
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

## State Persistence Triggers

State is written to localStorage on every transition:

| Action | What Persists |
|--------|---------------|
| Scene change | `currentSceneId`, `activeBeatId` per adventure |
| Beat advance | `activeBeatId`, `outcomes` |
| Roll outcome tap | Tag appended to `outcomes` |
| Combat state change | Full `CombatRunState` (HP, conditions, round, active combatant) |
| Combat resolve | `combatState = 'resolved'`, resolution data, `outcomes` merged |
| Voicing toggle | `prefs.readAloudVoicing` (global) |

::: warning localStorage budget
The 5MB origin budget is adequate for v1. A full adventure (JSON) is ~50KB; run state per adventure is ~5KB. Even with 50 installed adventures, total localStorage usage stays under 3MB.
:::

## Related Pages

- [Architecture Overview](/architecture/overview) — stack and module layout
- [Format: Parser](/format/parser) — parser internals
- [Format: Validator](/format/validator) — validation rules and diagnostics
- [Combat Engine](/engine/combat-engine) — reducer and end-condition evaluation
- [Outcome Engine](/engine/outcome-engine) — requires DSL evaluator
