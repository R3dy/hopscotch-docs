# Aftermath Rule

> Post-combat OutcomeBanner content keyed by outcome tag sets — the first rule whose `match` evaluates true determines what the GM sees after combat resolves.

## Type Definition

```ts
type AftermathRule = {
  match: TransitionRequires
  tone: "win" | "lose" | "neutral"
  title: string
  body: ReadAloudPassage
}
```

## Field Reference

| Property | Type | Required | Description |
|----------|------|----------|-------------|
| `match` | `TransitionRequires` | Yes | Same requires DSL as transitions. The first rule whose `match` evaluates true against `outcomes` wins. |
| `tone` | `"win" \| "lose" \| "neutral"` | Yes | Colors the banner: green for win, rose for lose, amber for neutral. |
| `title` | `string` | Yes | Banner title. Rendered in bold. |
| `body` | `ReadAloudPassage` | Yes | Banner body text. Three voicings. |

## How Matching Works

After combat resolves, the `outcomes` set contains all accumulated tags (from end-conditions, roll prompts, and the automatic `'after'` tag). The aftermath table is evaluated in order — the first rule whose `match` evaluates true against the live `outcomes` set determines the banner.

## Full Example

```jsonc
"aftermath": [
  {
    "match": { "all": ["partyVictory", "linKilled"] },
    "tone": "neutral",
    "title": "Victory, at a Cost",
    "body": {
      "dramatic": "The last enemy falls, but Lin's body lies still among the shattered glass. The Archive awaits — but someone else will have to guide you through it.",
      "brisk": "You won, but Lin is dead. The Archive is ahead, without your guide.",
      "plain": "Victory. Lin died in the fight. You'll need another way into the Archive."
    }
  },
  {
    "match": "partyVictory",
    "tone": "win",
    "title": "The Gallery is Yours",
    "body": {
      "dramatic": "Breathing hard, you survey the wreckage of the Collector's gallery. Lin straightens his collar and nods toward the painting. 'Shall we?'",
      "brisk": "You won. Lin gestures toward the painting. 'Shall we?'",
      "plain": "Victory. Lin leads you to the Archive entrance."
    }
  },
  {
    "match": "veraYielded",
    "tone": "neutral",
    "title": "The Enforcer Bows",
    "body": {
      "dramatic": "Vera rises slowly, wiping blood from her lip. 'I'll show you the way,' she says. 'But the Queen will hear of this.'",
      "brisk": "Vera yields. She'll guide you to the Archive — but warns the Queen will know.",
      "plain": "Vera surrendered. She'll show you to the Archive."
    }
  },
  {
    "match": "partyDown",
    "tone": "lose",
    "title": "The Gallery Claims Another",
    "body": {
      "dramatic": "Darkness. When you wake, the gallery is empty — Vera and her agents are gone. Lin is missing. And the painting... the painting is burned.",
      "brisk": "You wake up. Everyone is gone. The painting is destroyed.",
      "plain": "The party was knocked out. Vera escaped. The mission failed."
    }
  }
]
```

::: tip Order by specificity
Put the most specific match conditions first (with `all` or nested requires) and general fallbacks last (single tags). The first match wins, so order matters.
:::

## Fallback Banner

If no aftermath rule matches, a generic banner renders:

```
Combat ended
```

Provide at least one rule that covers common outcomes (`partyVictory`, `partyDown`) to avoid the generic fallback.

## Relation to Resolution Screen

The **resolution screen** (from `endConditions[].resolution`) appears during combat — fullscreen, with a "Return to scene" CTA.

The **aftermath banner** appears after combat — a compact strip at the top of Table mode in the Scene Runner.

They serve different moments in the flow:

| Moment | Component | Source |
|--------|-----------|--------|
| Combat ends | Resolution screen (fullscreen) | `endConditions[n].resolution` |
| GM returns to scene | OutcomeBanner (compact) | `aftermath[n]` |

## Validation Invariants

- `match` must use the same `TransitionRequires` DSL as transitions
- `tone` must be `"win"`, `"lose"`, or `"neutral"`
- `match` should reference tags that at least one end-condition declares
- Rules should be ordered by specificity (most specific first)

## Related Pages

- [End Condition](/data-model/end-condition) — where the tags come from
- [Transition](/data-model/transition) — same requires DSL
- [Outcome Engine](/engine/outcome-engine) — how requires are evaluated
- [Combat (Scene)](/data-model/combat) — parent container
- [Combat Runner](/guide/combat-runner) — OutcomeBanner rendering
