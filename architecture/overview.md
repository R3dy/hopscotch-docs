# Architecture Overview

> The Hopscotch Adventures stack, module layout, hosting strategy, and key design decisions that shape every line of code.

## North Star

> **One Scene Runner renders any `.hopscotch` adventure. Adventure content is data; the app is an interpreter. No adventure-specific code in the runtime.**

This rule breaks ties on every architectural question. If a proposed feature requires special-casing a particular adventure (e.g., "if the NPC is Vera, then…"), the design is wrong — that special case belongs in the adventure file as data.

## Stack

### Client — Progressive Web App (PWA)

| Technology | Role | Why |
|------------|------|-----|
| **React 18** | UI framework | Prototype is already React; components port directly |
| **Vite 5** | Build tool | Instant HMR (<100ms), ESM-native, zero-config TS |
| **TypeScript (strict)** | Language | Adventure content is untrusted at the boundary — types enforced and validated |
| **React Router v6** | Routing | Nested routes for tab bar shell + scene-runner stack |
| **Zustand + persist** | State management | One slice per concern (`library`, `runState`, `prefs`); no Redux needed |
| **idb-keyval** | Storage | IndexedDB wrapper for `.hopscotch` file blobs |
| **vite-plugin-pwa** | Offline | Service Worker via Workbox; caches app shell + static assets |
| **Sentry** | Crash reporting | `@sentry/react` from day one |
| **PostHog** | Analytics | `posthog-js` with event names locked to spec |
| **Stripe Checkout** | Payments | Hosted checkout page; webhook to Netlify Functions |

### Hosting — Netlify

- **Static CDN** for the Vite build output
- **Per-PR deploy previews** (equivalent to TestFlight / Play Internal Testing)
- **Continuous deploy** from `main` (gated by green CI)
- **Netlify Functions** (TypeScript) for Stripe webhooks, marketplace catalog API
- **Edge Functions** reserved for auth checks, redirect logic

### Backend (post-v1)

- **Supabase** for auth, DB, storage once cross-device sync ships
- v1 marketplace catalog is static JSON on Netlify CDN

### What We Do NOT Use

- **No React Native / Expo** — PWA path is faster, cheaper, same codebase across platforms
- **No App Store / Play Store builds in v1** — Netlify deploy previews + production URL are how we ship
- **No native-only APIs** — everything works in modern Safari / Chrome / Edge

## Module Layout

```
src/                       React + Vite PWA
  /screens                 One file per screen (matches SPEC.md)
  /components              Reusable components
    /combat                Combat-specific components
    /art                   Procedural fallback generators
    /icons                 Inline SVG icon set
  /design                  CSS tokens + typography primitives
  /state                   Zustand slices (useLibrary, useRunState, usePrefs)
  /lib                     IndexedDB wrapper, SW helpers
  /routes                  React Router config
  main.tsx                 Entry point
  index.css                Global styles

format/                    Pure TS, no React, no DOM
  parser.ts                Text → AST
  validator.ts             AST → typed Adventure | Diagnostic[]
  schema.ts                Zod schemas — single source of truth

engine/                    Pure TS combat + scene engine
  combatEngine.ts          Evaluates endConditions, applies damage, advances turns
  outcomeEngine.ts         Evaluates transition.requires DSL

public/                    Static assets
  manifest.webmanifest     PWA manifest

tests/
  format.test.ts
  engine.test.ts
  screens/*.test.tsx       RTL + Vitest jsdom

netlify.toml               Netlify build config
vite.config.ts             Vite config with vite-plugin-pwa
```

## Key Decisions

### D1. `.hopscotch` is the unit of distribution

The format ([R3dy/hopscotch-spec](https://github.com/R3dy/hopscotch-spec)) is the public contract. We never mutate adventure files at runtime — run state is stored separately, keyed by adventure id.

### D2. Adventure content is untrusted text

Never `eval` or `new Function` content. The parser produces a typed AST; the validator checks shapes and enforces invariants. Combat predicates are a declarative DSL evaluated by `/engine`.

### D3. The Scene Runner is generic

"Moonlight Heist" is just a combat-bearing scene. The prototype's hardcoded outcome detection (Vera HP ≤ 10 → `veraYielded`) moves into the adventure file as `combat.endConditions[]`.

### D4. Read-aloud voicing is a user preference

Sticky across the app via `usePrefs` (persisted to localStorage). Cycling on one block updates the preference globally.

### D5. Offline-first

Once an adventure is in the Library, it runs in airplane mode. Network calls in the run path are a bug.

### D6. Narrow state slices

Three Zustand stores — `useLibrary`, `useRunState`, `usePrefs` — each with a single owner. No mega-store.

### D7. Combat engine is a pure reducer

`combatEngine` accepts `CombatState + Action` and returns `CombatState'`. Unit-testable without React. End-condition evaluation runs inside the reducer.

### D8. Procedural art fallbacks

`CoverArt` and `AvatarArt` generate deterministic SVG from an `id` when no real asset exists. Imported adventures with missing art still render.

### D9. Mobile-first PWA

Layouts use viewport units, safe-area insets, and touch-first gestures. Tested on iOS Safari (iPhone 12+), Android Chrome (Pixel 6+), and desktop.

### D10. No animations on the run path

At the table, the GM glances. Animations beyond read-aloud collapse and combat overlay slide-in are excluded. Saves battery, saves focus.

## Performance Budget

| Metric | Target |
|--------|--------|
| LCP | ≤ 1.5s on iPhone 12 / Pixel 6 over 4G |
| FCP | ≤ 0.8s |
| TTI | ≤ 2.0s |
| Scene navigation | ≤ 150ms |
| Beat-to-beat tap | ≤ 80ms |
| Memory | ≤ 200MB (4-hour combat, 8 combatants) |
| Battery drain | ≤ 15% (4-hour session, screen-on 50% brightness) |
| Initial JS | ≤ 250KB gzipped (excluding adventure) |

## Related Pages

- [Data Flow](/architecture/data-flow) — how bytes become typed Adventures and how the engine processes state
- [Architecture Decisions](/architecture/decisions) — rationale behind each design choice
- [Data Model: Adventure](/data-model/adventure) — top-level type reference
- [Combat Engine](/engine/combat-engine) — pure reducer internals
