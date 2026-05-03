# Getting Started

> Set up the Hopscotch Adventures development environment, understand the module layout, and learn the core concepts before diving in.

## What Hopscotch Is

Hopscotch Adventures is a **mobile-first Progressive Web App** that turns `.hopscotch` adventure files into a runnable GM instrument. One adventure file contains everything — scenes, beats, NPCs, read-aloud passages, combat encounters, and branching transitions. The app is an interpreter; adventures are data.

::: info North Star
**One Scene Runner renders any `.hopscotch` adventure.** There is zero adventure-specific code in the runtime. Every special case (Vera yields at 10 HP, Lin's death alters the ending) is declared in the adventure file as data-driven predicates.
:::

## Before You Begin

- **Node.js** 18+ and **npm** 9+
- **Git** for version control
- A modern browser (Chrome, Safari, Firefox, Edge)
- The repository: `git clone https://github.com/R3dy/HopscotchAdventures.git`

## Module Layout

The codebase divides into four layers:

```
src/          React + Vite PWA (screens, components, state)
format/       Pure TS: parser, validator, schemas (no React, no DOM)
engine/       Pure TS: combatEngine, outcomeEngine (no React, no DOM)
scripts/      Tooling (port, migration helpers)
tests/        Vitest + React Testing Library
```

| Layer | Runs in | Depends on | Purpose |
|-------|---------|------------|---------|
| `src/` | Browser | React, Vite, Zustand | The PWA — screens, UI components, state management |
| `format/` | Node + Browser | Nothing | Parse `.hopscotch` text → typed Adventure |
| `engine/` | Node + Browser | Nothing | Combat reducer, outcome evaluator, requires DSL |
| `tests/` | Node | Vitest, jsdom | Unit + integration tests |

::: tip Why separate `format/` and `engine/`?
These two packages have zero dependencies — no React, no DOM, no Vite. They can be tested in plain Node and reused in a future authoring tool without pulling in the entire PWA. Keep them pure.
:::

## Core Concepts

### Adventure Files (`.hopscotch`)

A `.hopscotch` file is the unit of distribution. It's a plain-text format (the [hopscotch-spec](https://github.com/R3dy/hopscotch-spec)) that defines every aspect of an adventure. Once parsed and validated, it becomes a typed `Adventure` object in memory. The app never mutates adventure files — run state is stored separately.

### Scene Runner

Every screen in the app that presents adventure content uses the **Scene Runner** — a single component that reads a `Scene` object and renders it. It adapts automatically:
- If a scene has `combat` → shows a Combat Trigger card at the appropriate beat
- If a beat has `initiatesCombat: true` → mounts the CombatOverlay
- If `outcomes` contains `'after'` → unlocks post-combat content

### Two Modes Per Scene

| Mode | Purpose | Audience |
|------|---------|----------|
| **Prep** | Editorial content, DM study | GM before the session |
| **Table** | Instrument, live at-the-table running | GM during the session |

The same content renders differently. Prep mode is a magazine; Table mode is a cockpit.

### Read-Aloud System

Every player-facing passage supports **three voicings** — Dramatic, Brisk, and Plain. The GM's choice is sticky across the entire app. The `ReadAloudBlock` component renders all three and lets the GM toggle with a tap.

## Development Quickstart

```bash
# Clone and install
git clone https://github.com/R3dy/HopscotchAdventures.git
cd HopscotchAdventures
npm install

# Start dev server
npm run dev

# Run tests
npm test

# Build for production
npm run build
```

The dev server starts on `localhost:5173` with HMR (<100ms).

## Architecture at a Glance

```
.hopscotch file → format/parser → format/validator → typed Adventure
                                                          │
                              useLibrary.add() ← ImportPreview
                                                          │
                                                          ▼
                                          localStorage + IndexedDB
                                                          │
                                                          ▼
                                                   SceneRunner
                                               (Prep | Table)
                                               CombatOverlay
```

## Next Steps

- [Scene Runner](/guide/scene-runner) — understand Prep and Table modes in detail
- [Data Model: Adventure](/data-model/adventure) — the top-level type that ties everything together
- [Architecture Overview](/architecture/overview) — stack, key decisions, and design rationale
