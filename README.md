# Hopscotch Adventures — Documentation

Technical documentation for the [Hopscotch Adventures](https://github.com/R3dy/HopscotchAdventures) TTRPG platform. Built with [VitePress](https://vitepress.dev).

## Quick Start

```bash
npm install
npm run dev      # Start dev server at http://localhost:5173
npm run build    # Build static site to dist/
npm run preview  # Preview production build
```

## Structure

- `/guide/` — Getting started, Scene Runner, Combat Runner
- `/data-model/` — One page per node type (Adventure, Scene, Beat, NPC, Combat, etc.)
- `/engine/` — Combat engine and outcome engine internals
- `/format/` — `.hopscotch` parser and validator pipeline
- `/architecture/` — High-level architecture, data flow, key decisions
- `/mock-adventure/` — The "Moonlight Heist" showcase adventure used across all examples
