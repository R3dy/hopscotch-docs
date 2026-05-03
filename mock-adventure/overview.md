# Moonlight Heist — Part I

> The showcase adventure that demonstrates every major system in the Hopscotch platform — a combat-bearing social heist set in a world of art, intrigue, and arcane secrets.

## Overview

*Moonlight Heist — Part I: A Promise in Silver* is the v1 demo adventure shipped with Hopscotch Adventures. It follows a crew of thieves and con artists hired to steal a painting from a reclusive collector — only to discover the painting is a portal anchor to a hidden archive of magical secrets.

::: info Part I is social-only; Part II ships with combat
The v1 demo (`moonlight-heist-part-1.hopscotch`) contains all the social, investigation, and exploration content. Embedded combat encounters ship with Part II post-launch. The combat-bearing scene pattern is fully implemented in the platform; the demo's combat references exist in the fixture but are disabled in the shipped adventure.
:::

## Adventure Structure

| Scene | Title | Kind | Duration | Highlights |
|-------|-------|------|----------|------------|
| **Scene 1** | The Gilded Swan | Hook | ~20 min | Meet Lin, learn the job, read the room |
| **Scene 2A** | The Collector's Offer | Social | ~45 min | Face Vera, negotiate, potential combat trigger |
| **Scene 2B** | The Back Alleys | Skill | ~30 min | Alternative entry — stealth and traversal |
| **Scene 3** | The Archive | Coda | ~20 min | The reveal, consequences of choices |

## Key NPCs

| NPC | Role | Voice | Key Tell |
|-----|------|-------|----------|
| **Lin** | The Fixer | Nervous, eager to please, hides fear with charm | Touches his collar when lying |
| **Vera** | The Enforcer | Cold, precise, predatory calm | Stands perfectly still before drawing |
| **Tomas** | The Muscle | Brash, loyal to Vera, not very bright | Cracks knuckles when preparing to fight |

## Systems Demonstrated

### Read-Aloud Voicing

Every scene opener and beat-level passage supports three voicings:

```jsonc
// Scene 1 opener — Dramatic
"The Gilded Swan exhales a haze of pipe-smoke and cheap perfume. Lantern light pools on scarred oak tables, and in the corner, a figure in grey silk lifts two fingers — beckoning."

// Same passage — Brisk
"The Swan is crowded tonight. Lin waves you over from the back corner."

// Same passage — Plain
"Meet Lin at the Gilded Swan. He's waiting in the corner."
```

### 4-Outcome Roll Prompts

Scene 1 demonstrates the full roll prompt system:

```jsonc
{
  "skill": "Insight",
  "dc": 14,
  "on": "Read Lin's body language — is he hiding something?",
  "crit": "Lin is terrified of his employer. He'll spill everything if you give him an out.",
  "pass": "Lin is holding back. He's afraid, not deceitful.",
  "fail": "Lin seems nervous but you can't tell why.",
  "fumble": "Lin catches you studying him. He clams up and gets defensive."
}
```

### NPC System

NPCs demonstrate the full sheet: stats grid, voice prose, numbered tells, and pre-authored lines:

```jsonc
{
  "id": "np_lin",
  "name": "Lin",
  "role": "The Fixer",
  "voice": "Quick, nervous, trails off mid-sentence. Laughs at his own jokes before the punchline.",
  "wants": "To deliver the job and get paid. He doesn't know about the Archive.",
  "tells": [
    "Touches his collar when lying.",
    "Looks at the door when he wants to leave.",
    "Orders a drink when he's stalling for time."
  ],
  "lines": [
    "\"The Collector doesn't meet people. The Collector has people meet you.\"",
    "\"I don't know what's in the painting. I'm not paid to know.\""
  ]
}
```

### Transition Branching

Scene 2A offers three paths:

| Transition | Kind | Condition | Destination |
|------------|------|-----------|-------------|
| Vera yields | GO | `veraYielded` | Scene 3 — The Archive (allied) |
| Sneak past | BRANCH | `stealthSuccess` | Scene 3 — The Archive (undetected) |
| Kill Vera | CLOSE | `linKilled` | Scene 3b — Bloody Coda |

## Combat-Bearing Scene Pattern (Part II)

The combat-bearing pattern is fully implemented in the platform but disabled in the v1 demo. When enabled:

- **Scene 2A, Beat 3** has `initiatesCombat: true` with `combatCue`
- The scene's `combat` block defines 5 combatants (Vera, Tomas, 3 agents vs. the party)
- End conditions include Vera yielding at ≤10 HP, Lin's mid-fight death, and standard TPK/victory
- Aftermath rules key OutcomeBanner content by tag set
- Battlefield zones: Gallery Floor, Spiral Stair, Landing, Archive Wings

The platform shows this working in the prototype at `hopscotch-adventures/project/`.

## What the Mock Adventure Teaches

### For Developers

The demo is the "golden run" test — the RTL integration test that drives the Scene Runner through a full scene start-to-finish. Every component is exercised: ReadAloudBlock, NpcSheet, RollChip, Transitions, PacingStrip, ColorLegend.

### For Authors

The `.hopscotch` file is the canonical authoring example. New authors should study:
- How voicings are written at different lengths and tones
- How tells make NPCs runnable at the table
- How transitions create meaningful player choice
- How end conditions turn combat into narrative

## Related Pages

- [Getting Started](/guide/getting-started) — how to run the demo
- [Scene Runner](/guide/scene-runner) — the component that renders this adventure
- [Data Model: Adventure](/data-model/adventure) — the top-level type
- [Combat Runner](/guide/combat-runner) — how embedded combat works
