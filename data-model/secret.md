# Secret

> DM-only information hidden from players — revealed when a specific condition is met.

## Type Definition

```ts
type Secret = {
  id: string
  text: string
  revealOn: string
}
```

## Field Reference

| Property | Type | Required | Description |
|----------|------|----------|-------------|
| `id` | `string` | Yes | Unique within the scene. |
| `text` | `string` | Yes | The secret content. DM-only — never shown to players. |
| `revealOn` | `string` | Yes | Human-readable condition: `"Investigation 13 / arcane sight"`, `"Perception 15 / detect magic"`. Purely informational — not parsed by the engine. |

## Usage

Secrets appear in Prep mode under the "Secrets" section — a list of hidden information the GM should know. They are not rendered in Table mode (the GM is at the table with players nearby).

```jsonc
"secrets": [
  {
    "id": "sec1",
    "text": "Lin is working for the Queen under duress. His sister is a hostage in the Spire.",
    "revealOn": "Insight 18 or if they ask directly about his family."
  },
  {
    "id": "sec2",
    "text": "The painting in Vera's chamber is a portal anchor. Touching it with silver reveals the Archive entrance.",
    "revealOn": "Arcana 15 or Detect Magic."
  }
]
```

::: tip Secrets are for Prep mode
Don't put anything in secrets that the GM needs during Table mode. Secrets are meant to be studied beforehand — they're not accessible from the at-the-table instrument view.
:::

## Related Pages

- [Scene](/data-model/scene) — the parent container for secrets
- [Rule](/data-model/rule) — mechanical reminders (the counterpart to narrative secrets)
- [Scene Runner](/guide/scene-runner) — Prep mode rendering
