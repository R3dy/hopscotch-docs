# Roll Prompt

> A skill check with four outcome bands — Crit, Pass, Fail, Fumble — each with a one-line consequence that the GM can tap to record.

## Type Definition

```ts
type RollPrompt = {
  skill: string
  dc: number
  target?: string
  on: string
  crit: string
  pass: string
  fail: string
  fumble: string
  outcomes?: Partial<Record<"crit" | "pass" | "fail" | "fumble", string[]>>
}
```

## Field Reference

| Property | Type | Required | Description |
|----------|------|----------|-------------|
| `skill` | `string` | Yes | Ability/skill name, e.g. `"Insight"`, `"Persuasion"`, `"Athletics"`. Displayed in uppercase on the chip header. |
| `dc` | `number` | Yes | Difficulty class, 1–30. Displayed in JetBrains Mono next to the skill. |
| `target` | `string` | No | Human label for what the roll targets, e.g. `"vera"`, `"painting"`, `"door"`. Display-only. |
| `on` | `string` | Yes | One-line description of what this roll is for. Shown in the expanded prompt. |
| `crit` | `string` | Yes | Nat 20 consequence. Color: mint green. Label: "Hell yes". |
| `pass` | `string` | Yes | ≥ DC consequence. Color: sage green. Label: "Yes". |
| `fail` | `string` | Yes | < DC consequence. Color: amber. Label: "No". |
| `fumble` | `string` | Yes | Nat 1 consequence. Color: rose. Label: "Oh fuck". |
| `outcomes` | `object` | No | Tags to write to `outcomes` when the GM taps a result band. Keyed by result band. |

## Outcome Bands

| Band | Trigger | Color | Label | Meaning |
|------|---------|-------|-------|---------|
| Crit | Nat 20 | Mint green (`#34D399`) | Hell yes | Best possible outcome — more than success |
| Pass | Roll ≥ DC | Sage green (`#34D399`) | Yes | The intended outcome |
| Fail | Roll < DC | Amber (`#FBBF24`) | No | The consequence of failure |
| Fumble | Nat 1 | Rose (`#F43F5E`) | Oh fuck | Worst possible outcome — more than failure |

## How the Chip Works

1. **Collapsed state:** Shows `SKILL · DC N` in a chip with the violet roll color.
2. **Tap to expand:** Four outcome bands appear with their consequences.
3. **Tap a band:** The chip collapses. If `outcomes[band]` is declared, those tags are written to the scene's `outcomes` set.
4. **v1 behavior:** UI feedback only — the collapsed chip shows a checkmark on the tapped band.
5. **v1.5:** Outcome tags surface in the OutcomeBanner.

## The `outcomes` Field

Tags written to the scene's `outcomes` set when the GM taps a result band:

```jsonc
{
  "skill": "Persuasion",
  "dc": 16,
  "on": "Convince Vera to stand down.",
  "crit": "Vera sheathes her rapier. She'll help you reach the Archive.",
  "pass": "Vera hesitates. She won't fight, but she won't help either.",
  "fail": "Vera scoffs. She's not convinced — but she's curious.",
  "fumble": "Vera laughs. 'You think words will save you?' Roll initiative.",
  "outcomes": {
    "crit": ["veraConvinced", "veraAlly"],
    "pass": ["veraHesitates"],
    "fumble": ["veraHostile"]
  }
}
```

In v1.5+, these tags feed into the transition gating system. A transition with `requires: "veraConvinced"` only unlocks if the GM got a crit on the Persuasion check.

## Plain String Shorthand

A prompt can be a plain string with no `skill` — it renders as a flat hint chip with no expansion:

```jsonc
// Supported but discouraged — no interactivity
"prompts": ["The room smells of ozone and old blood. Arcana DC 15 to identify the source."]
```

The chip shows the text as-is with no expand affordance. Use this sparingly — the structured form with four outcome bands is the canonical pattern.

## Validation Invariants

- `dc` must be an integer 1–30
- `skill` must be a non-empty string
- All four outcome strings (`crit`, `pass`, `fail`, `fumble`) must be non-empty
- `outcomes` keys must be valid band names (`"crit"`, `"pass"`, `"fail"`, `"fumble"`)
- `outcomes` values must be string arrays

## Related Pages

- [Beat](/data-model/beat) — the parent container for roll prompts
- [Outcome Engine](/engine/outcome-engine) — how outcome tags gate transitions
- [Transition](/data-model/transition) — transition gating with `requires`
- [Scene Runner](/guide/scene-runner) — roll chip rendering in Table mode
