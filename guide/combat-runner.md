# Combat Runner

> Run turn-based combat inside any scene — initiative ladder, HP tracking, conditions, battlefield zones, and data-driven resolution.

## Overview

The Combat Runner is a **fullscreen overlay** that mounts inside the Scene Runner when a beat with `initiatesCombat: true` is activated. It manages initiative order, tracks HP and conditions, handles damage application, and evaluates end-conditions automatically after every state change.

::: info Combat is embedded, not separate
Combat is part of a scene, not a detour. The CombatOverlay slides over the Scene Runner. When combat resolves, it collapses back into the scene — and post-combat beats unlock based on the outcome tags.
:::

## Combat Lifecycle

```
idle → (trigger) → live → (pause/resume) → live → (end-condition fires) → resolved
```

1. **Idle** — combat hasn't started. The Scene Runner shows normal beats.
2. **Trigger** — GM taps "Roll initiative" on a Combat Trigger card. Overlay slides in.
3. **Live** — initiative tracking, HP changes, round openers, turn management.
4. **Resolved** — an end-condition fires. Resolution screen appears. Overlay dismisses.
5. **After** — `outcomes` includes `'after'`. Post-combat beats unlock.

## Combat Trigger Card

When a beat has `initiatesCombat: true`, the Scene Runner renders a Combat Trigger card instead of the normal beat detail:

- Hatched-rose top edge
- `beat.combatCue` — read-aloud passage (3 voicings, italic serif)
- Primary CTA: **Roll initiative · enter combat** (rose, dice icon)

```jsonc
// Beat that triggers combat
{
  "id": "b3",
  "label": "Ambush",
  "summary": "The crew springs their trap.",
  "initiatesCombat": true,
  "combatCue": {
    "dramatic": "Shadows stretch across the marble floor as Vera's rapier catches the chandelier light. 'You've made a mistake,' she murmurs.",
    "brisk": "Vera draws. The crew moves into position. Combat begins.",
    "plain": "Vera and her agents attack. Roll initiative."
  }
}
```

## Top Bar

The combat overlay header displays:

- **⚔ COMBAT · Round N of ~M** — current round / total rounds
- Scene title below
- **Pause button** (right) — dismisses the overlay with `combatState = 'live'` (resumable)

## Round Openers

At the top of each round, the `ReadAloudBlock` renders the round's opener from `combat.rounds[n - 1].opener`. If the current round has no opener, the row is skipped.

::: warning Never hardcode fallback prose
If a round doesn't have an opener in the adventure file, render nothing. The runner must not inject generic text like "Round N begins." That's the author's job.
:::

## Initiative Ladder

Horizontal scroll with 72px combatant tokens:

```
┌─────────┐  ┌─────────┐  ┌─────────┐  ┌─────────┐
│ 22 Vera │  │ 18 Kell │  │ 15 Nyla │  │ 12 Tomas│
│  [ENEMY]│  │   [PC]  │  │   [PC]  │  │ [ENEMY] │
└─────────┘  └─────────┘  └─────────┘  └─────────┘
```

Visual conventions:
- **PCs**: round avatars, cyan (lapis-blue) side stripe
- **Enemies**: square avatars (-2° rotation), rose hatched side stripe
- **Allies**: round avatars, gold/emerald side stripe
- Init number in top-left (JetBrains Mono)
- Active combatant has a glowing ring

## Active Combatant Card

The currently-active combatant gets a full card below the ladder:

- Avatar + name + role
- HP stepper (tap to adjust, hold for damage pad)
- AC badge
- Conditions chips (tap to open ConditionsPicker)
- Action buttons (for enemies: Attack, Utility, Lair actions)
- DM notes (italic gold text)

### HP Stepper

- **Tap** the HP display to open the DamagePad
- **-1 / +1** stepper buttons for quick adjustments
- Automatically clamps to `[0, hpMax]`

### Conditions Picker

Tap the conditions chip area to open a tag-grid modal. Common conditions are pre-listed (Blessed, Frightened, Poisoned, etc.). The GM can also type custom conditions.

## Damage Pad

Full-width slide-up pad for precise damage entry:

```
┌─────────────────────────┐
│  Damage to Vera         │
│                         │
│  [7] [8] [9]           │
│  [4] [5] [6]  Apply    │
│  [1] [2] [3]           │
│  [0]                    │
│                         │
│  [Apply] [Cancel]       │
└─────────────────────────┘
```

## Narrative Panel

For combat actions that have narrative descriptions, tap the action to open a panel showing:

- Action name + to-hit / damage
- `ReadAloudBlock` with the action's 3 voicings
- `{target}` substitution — replaced with the selected target's first name

```jsonc
{
  "id": "act-pin",
  "name": "Pin Cushion",
  "kind": "attack",
  "toHit": "+5",
  "dmg": "1d8 + 3 piercing",
  "narrative": {
    "dramatic": "Vera's rapier flickers like lightning — three precise thrusts aimed at {target}'s guard. 'You're slowing down.'",
    "brisk": "Three quick thrusts toward {target}. 'You're slowing down.'",
    "plain": "Vera attacks {target} with her rapier, three thrusts."
  }
}
```

## End Conditions

After every state change (HP adjustment, condition add/remove, turn advance), the combat engine evaluates `combat.endConditions[]` in order.

The first condition whose predicate evaluates true and has `endsCombat: true` fires the **resolution screen**.

Conditions with `endsCombat: false` only add tags to `outcomes` (e.g., a mid-fight death that doesn't end the encounter).

See [End Condition](/data-model/end-condition) for the full predicate schema.

## Resolution Screen

When an end-condition fires:

1. Fullscreen card with title + subtitle (italic serif)
2. Tone color: green for party victory, rose for party defeat, gold for neutral
3. "Return to scene" CTA
4. Tags from the winning condition are merged into `outcomes`
5. `'after'` is added to `outcomes`
6. `combatState` is set to `'resolved'`
7. Overlay dismisses

## Battlefield Zones

The battlefield view shows 4 zones (v1 read-only, v1.5 drag-to-move):

```
┌──────────┬──────────┐
│  Floor   │  Stair   │
│ [Vera]   │          │
├──────────┼──────────┤
│ Landing  │  Wings   │
│ [Kell]   │ [Tomas]  │
│ [Nyla]   │          │
└──────────┴──────────┘
```

Combatants are placed per `combat.battlefield.positions[]` (combatantId → zoneId).

## After Combat

When the GM returns to the Scene Runner after resolution:

1. **OutcomeBanner** at top of Table mode — title, body, and tone from `combat.aftermath[]`
2. Tag chips display the raw outcome set (collapsible in production)
3. Locked beats (`requiresCombatResolved: true`) unlock
4. The runner auto-routes to the first unlocked post-combat beat

::: tip Aftermath rules match outcome tags
The aftermath table uses the same `requires` DSL as transitions. The first rule whose `match` evaluates true against the live `outcomes` set determines the banner content.
:::

## Related Pages

- [Scene Runner](/guide/scene-runner) — how combat integrates into scenes
- [Data Model: Combat](/data-model/combat) — Combat type reference
- [Data Model: End Condition](/data-model/end-condition) — predicate system
- [Combat Engine](/engine/combat-engine) — engine internals and reducer
