# Scene Runner

> The single runtime component that renders any scene from any `.hopscotch` adventure — Prep mode for study, Table mode for running at the table.

## Overview

The Scene Runner is the heart of Hopscotch. It reads a `Scene` object, a `SceneRunState`, and user preferences, then renders the appropriate mode. There is **one** Scene Runner for every type of scene — Hook, Social, Skill, Combat, Plan, Coda. It adapts based on the data.

::: danger Architectural Rule
There is exactly one Scene Runner. No separate "Heist" screen, no adventure-specific components. If a behavior looks adventure-specific (like "Vera yields at HP ≤ 10"), it must be declared in the adventure's `combat.endConditions[]` — never hardcoded in the runner.
:::

## Mode Selection

The Scene Runner has a segmented control in its header: **Prep** and **Table**.

| Mode | Default | Behavior |
|------|---------|----------|
| Prep | — | Editorial layout. Study the scene before the session. |
| Table | Entry default | Instrument layout. Run the scene live at the table. |

Mode is per-scene state, persisted in `SceneRunState`. The runner defaults to **Table** when entering a scene for the first time.

## Prep Mode

Prep mode presents the scene as a magazine article — everything the GM needs to study.

### Layout (top to bottom)

1. **Title plate** — scene title in italic serif with ❦ glyph flourishes
2. **Goal & stakes** — italic block-quote with rose left border
3. **Scene opener** — `ReadAloudBlock` for the scene's opening passage, with a "Let players soak it in" cue
4. **Cast** — NPC rows (avatar, name, role, quick-read), tap → NPC sheet
5. **Beats** — numbered, each with summary, optional read-aloud, and roll prompts
6. **Secrets** — DM-only content with reveal conditions
7. **Transitions** — where this scene leads next, color-coded (success/lateral/fail)
8. **Footer hint** — "When the players sit down, switch to Table"

### Example: Prep Mode Entry Point

```tsx
// SceneRunner switches to Prep mode
// Renders scene.setup.goal, scene.readAloud, scene.npcs, scene.beats
<SceneRunner
  scene={scene}
  mode="prep"
  runState={sceneRunState}
/>
```

## Table Mode

Table mode is the cockpit — the instrument GMs use at the table. Every element is designed for one-glance comprehension.

### Layout (top to bottom)

1. **Pacing strip** — `Live · Beat N of M` + progress bar. Animates on beat change.
2. **Scene opener** — only on Beat 1 (combat not yet resolved). Gold ribbon, "Set the stage" meta.
3. **Cast stage** — split into "On stage" (NPCs in `beat.stage[]`) and "In the wings" (the rest)
4. **Beats nav** — horizontal chip strip. Tap to jump. Rose = active, sage+✓ = complete, dim = locked.
5. **Read-aloud** — for the active beat, directly under beats nav
6. **Active beat detail** — summary + expandable roll prompts
7. **Transitions** — branch chips (GO / BRANCH / CLOSE). Locked transitions render dimmed.
8. **Session note stub** — v1.1, not interactive in v1

### Color Legend Strip

Below the header in Table mode, a compact legend:

| Element | Color | Meaning |
|---------|-------|---------|
| Read aloud | Gold 🟡 | Player-facing prose |
| NPC | Lapis 🔵 | NPC names, sheets, cast |
| Roll | Violet 🟣 | DC checks, 4-outcome prompts |
| Live | Rose 🔴 | Active state, combat triggers |

## NPC Sheet (Modal)

Tapping any NPC opens a bottom sheet with:

- Avatar + name + role
- Stats grid (AC, HP, Insight, Deception, …) in JetBrains Mono
- Voice description (italic serif)
- Wants (character motivation)
- Tells (numbered cues for the GM)
- Quotable lines (gold cards, italic serif)

::: tip Drag to dismiss
Swipe down or tap the backdrop to close the NPC sheet. The animation uses a `0.28s cubic-bezier(.2,.7,.2,1)` slide.
:::

## Roll Prompt Chip (4-Outcome)

Each beat can have multiple roll prompts. Tapping a prompt chip expands it to show four outcome bands:

| Band | Roll | Color | Label |
|------|------|-------|-------|
| Crit | Nat 20 | Mint green | Hell yes |
| Pass | ≥ DC | Sage green | Yes |
| Fail | < DC | Amber | No |
| Fumble | Nat 1 | Rose | Oh fuck |

Each band shows a one-line consequence. Tapping a band writes the outcome tag to `outcomes`.

## Combat-Bearing Scenes

When a scene has a `combat` block, the Scene Runner adapts:

- Beats with `initiatesCombat: true` render a **Combat Trigger card** instead of normal detail
- Beats with `requiresCombatResolved: true` are locked until `outcomes` contains `'after'`
- When combat resolves, an **OutcomeBanner** appears at the top of Table mode

See [Combat Runner](/guide/combat-runner) for the full combat lifecycle.

## Transitions

Transitions appear as branch chips below the active beat:

| Kind | Color | Label |
|------|-------|-------|
| `success` | Green | GO |
| `lateral` | Gold | BRANCH |
| `fail` | Rose | CLOSE |

A transition with a `requires` field checks the `outcomeEngine`. Locked transitions render dimmed with a `LOCKED` chip and lock icon.

```ts
// Example: this transition only unlocks when veraYielded is in outcomes
{
  id: "go-coda",
  to: "scene-3",
  label: "Coda: The Archive",
  kind: "success",
  requires: "veraYielded"
}
```

## Related Pages

- [Combat Runner](/guide/combat-runner) — fullscreen combat overlay and lifecycle
- [Data Model: Scene](/data-model/scene) — Scene type reference
- [Data Model: Beat](/data-model/beat) — Beat type reference
- [Data Model: Read Aloud Passage](/data-model/read-aloud) — three-voicing system
