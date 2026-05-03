# Run State

> Per-adventure persistence layer — tracks the GM's progress through scenes, beats, outcomes, and combat so they can resume mid-session.

## Type Definition

```ts
type RunState = {
  adventureId: string
  startedAt: number
  lastActiveAt: number
  currentSceneId: string
  scenes: Record<string, SceneRunState>
}

type SceneRunState = {
  activeBeatId: string
  outcomes: string[]
  combat?: CombatRunState
}

type CombatRunState = {
  state: "idle" | "live" | "resolved"
  round: number
  activeCombatantId: string
  combatants: Record<string, { hp: number; conditions: string[] }>
  resolution?: { id: string; tags: string[] }
}
```

## Field Reference

### RunState

| Property | Type | Description |
|----------|------|-------------|
| `adventureId` | `string` | The adventure this state belongs to. Storage key: `runState:{adventureId}`. |
| `startedAt` | `number` | Epoch ms when the GM first opened this adventure. |
| `lastActiveAt` | `number` | Epoch ms of the last state change. Used for "recent" sorting in Library. |
| `currentSceneId` | `string` | The scene the GM is currently on. Resume opens this scene. |
| `scenes` | `Record<string, SceneRunState>` | Per-scene state, keyed by scene `id`. |

### SceneRunState

| Property | Type | Description |
|----------|------|-------------|
| `activeBeatId` | `string` | The beat the GM is currently on within this scene. |
| `outcomes` | `string[]` | Accumulated tags for this scene. Includes roll prompt results, end-condition tags, and `'after'`. |
| `combat` | `CombatRunState` | Combat state for this scene. Only present for combat-bearing scenes. |

### CombatRunState

| Property | Type | Description |
|----------|------|-------------|
| `state` | `"idle" \| "live" \| "resolved"` | Current combat lifecycle state. |
| `round` | `number` | Current round number, starting at 1. |
| `activeCombatantId` | `string` | The combatant whose turn it is. |
| `combatants` | `Record<string, { hp, conditions }>` | Per-combatant mutable state. Keyed by combatant `id`. |
| `resolution` | `object` | Which end condition fired and what tags it produced. |

## State Transitions

### Starting an Adventure

```ts
const runState: RunState = {
  adventureId: "moonlight-heist",
  startedAt: Date.now(),
  lastActiveAt: Date.now(),
  currentSceneId: "scene-1",       // first scene
  scenes: {
    "scene-1": {
      activeBeatId: "b1",          // first beat
      outcomes: []
    }
  }
}
```

### Advancing a Beat

```ts
runState.scenes["scene-1"].activeBeatId = "b2"
runState.lastActiveAt = Date.now()
```

### Recording a Roll Outcome

```ts
runState.scenes["scene-1"].outcomes.push("veraHostile")
runState.lastActiveAt = Date.now()
```

### Starting Combat

```ts
runState.scenes["scene-2a"].combat = {
  state: "live",
  round: 1,
  activeCombatantId: "en_vera",      // highest initiative
  combatants: {
    "en_vera": { hp: 52, conditions: [] },
    "en_tomas": { hp: 38, conditions: [] },
    "pc_kell": { hp: 28, conditions: ["Bless"] },
    "pc_nyla": { hp: 22, conditions: ["Bless"] }
  }
}
```

### Resolving Combat

```ts
runState.scenes["scene-2a"].combat!.state = "resolved"
runState.scenes["scene-2a"].outcomes.push("veraYielded", "after")
runState.scenes["scene-2a"].combat!.resolution = {
  id: "vera-yields",
  tags: ["veraYielded"]
}
```

### Changing Scenes

```ts
runState.currentSceneId = "scene-3"
// Ensure scene-3 entry exists
if (!runState.scenes["scene-3"]) {
  runState.scenes["scene-3"] = {
    activeBeatId: "scene-3-beats.[0].id",
    outcomes: []
  }
}
```

## Storage

Run state is persisted to `localStorage`:

```ts
// Key structure
localStorage.setItem(`runState:${adventureId}`, JSON.stringify(runState))

// Multiple adventures don't collide
localStorage.setItem(`runState:moonlight-heist`, ...)
localStorage.setItem(`runState:hollowtide`, ...)
```

::: info Size estimate
A full run state for one adventure is ~5KB (JSON). With 50 installed adventures, total run state storage stays under 250KB — well within the 5MB localStorage origin budget.
:::

## Restart

The "Restart" action on an adventure card:
1. Removes `localStorage["runState:{adventureId}"]`
2. Keeps the adventure in Library
3. Keeps the adventure blob in IndexedDB
4. Does not affect run state for other adventures

## Related Pages

- [Preferences](/data-model/prefs) — global preferences stored alongside run state
- [Outcome Engine](/engine/outcome-engine) — how `outcomes` gates transitions
- [Combat Engine](/engine/combat-engine) — how `CombatRunState` is reduced
- [Architecture: Data Flow](/architecture/data-flow) — where run state fits in the pipeline
