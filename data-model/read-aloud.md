# Read Aloud Passage

> The three-voicing system that adapts every player-facing passage to the GM's style — Dramatic, Brisk, or Plain.

## Type Definition

```ts
type ReadAloudPassage =
  | string
  | {
      dramatic: string
      brisk: string
      plain: string
    }
```

## Field Reference

| Form | Type | Description |
|------|------|-------------|
| `string` | Legacy | A single text block. No voicing picker shown. Rendered as-is. |
| `object` | Canonical | Three distinct voicings. The picker appears in the `ReadAloudBlock` header. |

### Object Voicings

| Voicing | Key | Purpose | Typical Length | Tone |
|---------|-----|---------|---------------|------|
| Dramatic | `dramatic` | Full mood-piece prose — cinematic, immersive | Longest | Literary, evocative |
| Brisk | `brisk` | Clipped, fast-paced — for tables that move quickly | Medium | Direct, energetic |
| Plain | `plain` | Neutral GM summary — shortest, no flourish | Shortest | Functional, terse |

::: tip Less is more for brisk and plain
A common mistake is making `brisk` a slightly-shorter `dramatic`. They should feel like different modes entirely. `plain` should be a one-sentence functional summary. If all three read similarly, the system adds no value.
:::

## How Voicing is Selected

1. The user's global preference (`prefs.readAloudVoicing`) is the default
2. The `ReadAloudBlock` renders the current voicing
3. Tapping the left 30% of the block cycles voicing backward
4. Tapping the right zone cycles forward
5. Tapping a dot in the header jumps directly to that voicing
6. Voicing choice is sticky — persisted to `localStorage`

## forceStyle Prop

The `ReadAloudBlock` accepts a `forceStyle` prop that locks a passage to one voicing:

```tsx
<ReadAloudBlock
  passage={scene.readAloud}
  forceStyle="dramatic"  // always dramatic, no picker shown
/>
```

Use cases:
- Author intends a specific voicing for a critical moment
- Accessibility — the `plain` voicing can be forced for screen reader passes

## Fallback Chain

When a passage is declared as an object but a specific voicing is missing:

```
current preference → dramatic → brisk → plain → fallback
```

The renderer walks this chain until it finds a non-empty string. If the entire object is empty strings, nothing renders.

## Object vs String

```jsonc
// String form — no voicing picker (legacy, discouraged for new content)
"readAloud": "The tavern is dim and smoky. A figure in the corner beckons."

// Object form — full voicing support (canonical)
"readAloud": {
  "dramatic": "The Gilded Swan exhales a haze of pipe-smoke and cheap perfume. Lantern light pools on scarred oak tables. In the corner, half-hidden by shadow, a slender figure in grey silk raises two fingers — and beckons.",
  "brisk": "The Swan is crowded and smoky tonight. Lin waves you over from a back corner.",
  "plain": "Meet Lin at the Gilded Swan tavern. He's waiting in the corner."
}
```

## Token Substitution (`{target}`)

In combat narrative passages only, `{target}` is replaced with the selected target's first name:

```jsonc
"narrative": {
  "dramatic": "Vera's rapier flickers toward {target} — three precise thrusts.",
  "brisk": "Three quick thrusts at {target}.",
  "plain": "Vera attacks {target}, three thrusts."
}
```

The substitution happens at render time. `{target}` in non-combat contexts is passed through as literal text.

::: warning Token substitution is combat-narrative only
`{target}` is not a general-purpose template variable. It works only in `CombatAction.narrative` and only resolves to the currently-selected target's first name. Do not use it in scene openers, beat read-aloud, or NPC lines.
:::

## Related Pages

- [Beat](/data-model/beat) — beat-level read-aloud usage
- [Scene](/data-model/scene) — scene opener read-aloud
- [Combat Action](/data-model/combat-action) — narrative with `{target}` substitution
- [Preferences](/data-model/prefs) — how the voicing choice is stored
- [Scene Runner](/guide/scene-runner) — ReadAloudBlock rendering in Prep and Table modes
