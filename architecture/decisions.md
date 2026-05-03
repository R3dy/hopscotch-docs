# Architecture Decisions

> The rationale behind every major design choice — why we chose each technology, pattern, and constraint.

## D1. `.hopscotch` is the unit of distribution and source of truth

**What:** The `.hopscotch` format ([hopscotch-spec](https://github.com/R3dy/hopscotch-spec)) is the public contract. The app never mutates adventure files at runtime — run state is stored separately.

**Why:**
- An adventure can be re-imported or overwritten without losing run state on other adventures
- Studio updates can ship as new package versions without breaking in-flight runs
- Authors with no app integration can produce content using external tooling
- The format doubles as a portable backup — export from one device, import on another

**Trade-off:** Format versioning is a migration burden. Every breaking change to the spec requires either backward-compatible parsing or explicit migration tooling.

## D2. Adventure content is untrusted text

**What:** Never `eval` or `new Function` adventure content. The parser produces a typed AST; the validator enforces invariants. Combat predicates are a declarative DSL, not user-executable code.

**Why:**
- Importing arbitrary files from the community is a supply-chain risk
- `eval` would make format validation meaningless
- A declarative DSL is easier for authors to write and tools to verify

**What we disallow:** JavaScript expressions, inline code execution, arbitrary function calls, dynamic imports.

**What we allow:** Typed data structures, predicate trees (`and`/`or`/`not`), tag references, numeric comparisons.

## D3. The Scene Runner is generic

**What:** There is exactly one Scene Runner. It renders any scene from any adventure — Hook, Social, Skill, Combat, Plan, Coda. No adventure-specific screen components exist.

**Why:**
- The prototype's `heist-scene.jsx` was a test fixture, not the production pattern
- Hardcoding "if NPC is Vera, do X" creates an exponential maintenance problem as adventures multiply
- Authors need guarantees that their adventures will render identically to studio content

**How it works:** Every behavior that looks adventure-specific lives in the data:
- "Vera yields at HP ≤ 10" → `combat.endConditions[].predicate: { type: "combatantHpAtMost", combatantId: "en_vera", hp: 10 }`
- "Killing Lin adds a tag" → `endCondition with endsCombat: false, tags: ["linKilled"]`
- "Post-combat banner text" → `combat.aftermath[]` table keyed by outcome tags

## D4. Read-aloud voicing is a user preference

**What:** The GM's voicing choice (dramatic / brisk / plain) is sticky across the entire app. Cycling on one `ReadAloudBlock` updates the global preference.

**Why:**
- The GM's style doesn't change scene-to-scene — a brisk GM stays brisk
- Per-passage settings would create friction (constant toggling)
- The `forceStyle` prop on `ReadAloudBlock` handles edge cases where a specific passage needs a locked voicing

**Persistence:** `localStorage["prefs"]` → `{ readAloudVoicing: "brisk" }`

## D5. Offline-first

**What:** Once an adventure is in the Library, it must run in airplane mode. Network calls in the run path are a bug.

**Why:**
- Gaming stores have spotty WiFi
- Conventions are notoriously bad for connectivity
- Battery life improves without network polling
- Trust: GMs won't adopt a tool that fails mid-session because of connectivity

**What requires network:** Marketplace browsing, adventure purchasing, Service Worker app-shell updates.

**What doesn't:** Running any owned adventure, switching scenes, combat, roll prompts, NPC sheets, read-aloud.

## D6. Narrow state slices

**What:** Three Zustand stores instead of one mega-store:

| Store | Contents | Owner |
|-------|----------|-------|
| `useLibrary` | List of installed adventures + metadata | LibraryScreen, AdventureHome |
| `useRunState` | Per-adventure run state (scene/beat/combat/outcomes) | SceneRunner, CombatOverlay |
| `usePrefs` | Global preferences (voicing, theme, text scale) | ReadAloudBlock, Layout |

**Why:**
- Each slice has a clear owner — no guessing who owns what
- Persistence is per-slice — `useRunState` persists on every beat change, `usePrefs` persists on voicing toggle
- Zustand's `persist` middleware handles serialization natively
- No Redux boilerplate for apps at this scale

## D7. Combat engine is a pure reducer

**What:** `combatEngine` is a pure function: `(CombatState, Action) → CombatState`. It has zero React imports and zero DOM dependencies.

**Why:**
- Unit-testable without jsdom or React Testing Library
- The entire combat state machine can be verified with table-driven tests
- Reusable in a future authoring preview tool (validation of end-condition logic)
- Side effects (persistence) happen in the component layer, not the engine

**Action types:**
- `applyHp(targetId, delta)` — increments/decrements HP, clamped to [0, hpMax]
- `addCondition(targetId, tag)` / `removeCondition`
- `selectActive(combatantId)` — change active combatant
- `endTurn()` — advance initiative
- `setRound(n)` — used on resume

After every reduction, `evaluateEndConditions()` runs automatically inside the reducer. The first matching condition with `endsCombat: true` sets `state.resolution`.

## D8. Procedural art fallbacks

**What:** `CoverArt` and `AvatarArt` generate deterministic procedural SVG from an identifier when no real asset exists.

**Why:**
- Imported adventures often lack bundled art
- The prototype's mock data must render without art assets
- Studio adventures ship real art packaged in the `.hopscotch` file
- Procedural fallbacks prevent blank spaces and broken-image icons

**Implementation:** A simple deterministic hash of the `id` selects a color palette and glyph. Same `id` → same artwork every time.

## D9. Mobile-first PWA, browser-agnostic

**What:** One web build serves iOS Safari, Android Chrome, and desktop browsers. The same code installs as a PWA via "Add to Home Screen."

**iOS PWA quirks accounted for:**
- `100dvh` not `100vh` (iOS Safari URL-bar resize)
- `apple-touch-icon` for nice install appearance
- `<meta name="viewport" content="viewport-fit=cover">` for notch handling
- `overscroll-behavior: none` on the run path to disable pull-to-refresh
- Status bar style declared in the manifest

**What we avoid:** Native-only APIs, platform-specific feature branches. If a browser doesn't support a feature, the app degrades.

**Post-v1 option:** Capacitor wrap for App Store / Play Store distribution if revenue justifies the platform cuts and review delays. The architecture survives the wrap.

## D10. No animations on the run path

**What:** At the table, the GM glances. Animations beyond the read-aloud collapse and combat overlay slide-in are excluded.

**Why:**
- Battery drain — a 4-hour session with constant micro-animations adds up
- Cognitive load — animations that look polished in testing become distracting at the table
- Performance — the run path must hit ≤ 80ms beat-to-beat tap response

**What remains:**
- Read-aloud collapse/expand (0.15s)
- Combat overlay slide-in (0.3s)
- NPC sheet slide-up (0.28s)
- Outcome banner fade-in

**What's excluded:** Beat transitions, mode switches, tab changes, cast stage changes, roll chip expansion.

## Related Pages

- [Architecture Overview](/architecture/overview) — stack and module layout
- [Data Flow](/architecture/data-flow) — end-to-end pipeline
- [Combat Engine](/engine/combat-engine) — pure reducer internals
