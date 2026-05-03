# Rule

> Mechanical reminder for the GM — a custom rule, special mechanic, or system reference relevant to the scene.

## Type Definition

```ts
type Rule = {
  id: string
  name: string
  text: string
}
```

## Field Reference

| Property | Type | Required | Description |
|----------|------|----------|-------------|
| `id` | `string` | Yes | Unique within the scene. |
| `name` | `string` | Yes | Short title, e.g. `"Wine"`, `"Chase"`, `"Silver"`. Displayed as a chip or section header. |
| `text` | `string` | Yes | Mechanical reminder — terse, actionable. |

## Usage

Rules appear in Prep mode as a reference section. They're GM-facing reminders for custom mechanics that apply during the scene:

```jsonc
"rules": [
  {
    "id": "rule-wine",
    "name": "Wine Poisoning",
    "text": "DC 13 CON save after each glass. Fail → Poisoned for 10 min. Fail by 5+ → Unconscious for 1 hr. Elves and dwarves have advantage."
  },
  {
    "id": "rule-silver",
    "name": "Silver",
    "text": "All silver surfaces in the Archive are shatterpoints. Striking one with force (DC 14 Athletics) opens a portal to the corresponding wing."
  },
  {
    "id": "rule-chase",
    "name": "Chase — Tower Stairs",
    "text": "Athletics or Acrobatics DC 14 per round. 3 successes before 2 failures. Each failure: 1d6 bludgeoning from falling debris. 3 failures: target escapes."
  }
]
```

## Rules vs Secrets

| Aspect | Rules | Secrets |
|--------|-------|---------|
| Content type | System mechanics, DCs, conditions | Narrative information, plot twists |
| Author intent | Remind the GM of a mechanic | Tell the GM something players don't know |
| Tone | Terse, reference-style | Prose, editorial |
| At the table | GM may reference during play | GM should know before the session |

::: tip Keep rules terse
Rules are reference material — the GM glances at them mid-session. Use bullet-point sentence fragments, not paragraphs. Include DCs, conditions, and durations. Skip flavor text.
:::

## Related Pages

- [Scene](/data-model/scene) — the parent container for rules
- [Secret](/data-model/secret) — narrative secrets (counterpart to mechanical rules)
- [Scene Runner](/guide/scene-runner) — Prep mode rendering
