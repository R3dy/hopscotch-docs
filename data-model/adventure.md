# Adventure

> The top-level type that ties together every scene, NPC, combat encounter, and marketplace detail into a single runnable unit.

## Type Definition

```ts
type Adventure = {
  id: string
  formatVersion: string
  title: string
  subtitle?: string
  blurb: string
  author: string
  studio?: string
  cover: AssetRef
  level: number
  duration: string
  players: string
  rating?: number
  runs?: number
  tone: string[]
  pillars: string[]
  scenes: Scene[]
  storefront?: StorefrontMeta
}
```

## Field Reference

| Property | Type | Required | Description |
|----------|------|----------|-------------|
| `id` | `string` | Yes | Stable identifier, used as the IndexedDB storage key. Must be globally unique. |
| `formatVersion` | `string` | Yes | Version of the `.hopscotch` spec this file targets, e.g. `"0.3"` |
| `title` | `string` | Yes | Display title shown in Library, storefront, and AdventureHome |
| `subtitle` | `string` | No | Tagline shown under the title on storefront cards |
| `blurb` | `string` | Yes | Editorial paragraph. Rendered at 17pt serif on AdventureHome. Keep under 200 words. |
| `author` | `string` | Yes | Author name. Displayed on Adventure Detail and creator pages. |
| `studio` | `string` | No | Brand line, e.g. `"Hopscotch Studio"`. Displayed next to author. |
| `cover` | `AssetRef` | Yes | Cover art reference — procedural id, bundled path, or remote URL |
| `level` | `number` | Yes | Recommended character level. Integer, 1–20. |
| `duration` | `string` | Yes | Display string for expected runtime, e.g. `"3–4 hours"`. Not parsed. |
| `players` | `string` | Yes | Display string for player count, e.g. `"3–5"`. Not parsed. |
| `rating` | `number` | No | Marketplace metric — average star rating. Set by the platform, not the author. |
| `runs` | `number` | No | Marketplace metric — number of times played. Set by the platform. |
| `tone` | `string[]` | Yes | Genre/tone tags, e.g. `["Heist", "Intrigue", "Urban"]`. Displayed as chips. |
| `pillars` | `string[]` | Yes | Gameplay pillar tags, e.g. `["Social", "Stealth", "Investigation"]`. Displayed as chips. |
| `scenes` | `Scene[]` | Yes | Ordered list of scenes. The first scene is the entry point. |
| `storefront` | `StorefrontMeta` | No | Marketplace metadata. Only present on catalog entries — stripped from owned adventures. |

## StorefrontMeta

```ts
type StorefrontMeta = {
  featured?: boolean
  rows?: { title: string; itemIds: string[] }[]
  categories?: string[]
  contentAdvisories?: string[]
  preview?: { hookText?: string }
}
```

| Property | Type | Description |
|----------|------|-------------|
| `featured` | `boolean` | Adventure appears in the storefront hero slot |
| `rows` | `object[]` | Named carousel rows this adventure belongs to (Trending, New, etc.) |
| `categories` | `string[]` | Filter categories: `"One-shot"`, `"Heist"`, `"Horror"`, etc. |
| `contentAdvisories` | `string[]` | Trigger/content warnings: `"Violence"`, `"Gambling"`, `"Body horror"` |
| `preview` | `object` | Hook text shown before purchase on the marketplace |

## Valid Values

### `formatVersion`

The version string must match the hopscotch-spec version the file was authored for:

```jsonc
"formatVersion": "0.3"   // valid
"formatVersion": "0.7"   // valid
"formatVersion": "1"     // valid
"formatVersion": "beta"  // invalid — must be a semver-ish string
```

### `level`

Must be an integer 1–20:

```jsonc
"level": 3    // valid
"level": 20   // valid
"level": 0    // invalid
"level": 3.5  // invalid — must be integer
```

### `tone` and `pillars`

Free-form string arrays. Common values:

**Tone:** `"Heist"`, `"Horror"`, `"Mystery"`, `"Intrigue"`, `"Urban"`, `"Romance"`, `"Court"`, `"Dungeon"`, `"Wilderness"`, `"Comedy"`

**Pillars:** `"Social"`, `"Stealth"`, `"Investigation"`, `"Combat"`, `"Exploration"`, `"Puzzle"`

## Minimal Valid Adventure

```jsonc
{
  "id": "midnight-express",
  "formatVersion": "0.7",
  "title": "The Midnight Express",
  "blurb": "A train heist goes sideways when the cargo turns out to be alive.",
  "author": "Royce",
  "cover": "midnight-express",
  "level": 5,
  "duration": "3–4 hours",
  "players": "3–5",
  "tone": ["Heist", "Horror"],
  "pillars": ["Social", "Stealth"],
  "scenes": []
}
```

::: warning Empty scenes
An adventure with `scenes: []` is technically valid but won't render anything in the Scene Runner. Every published adventure must have at least one scene.
:::

## Runtime Behavior

- The `Adventure` object is loaded from IndexedDB when the user opens an adventure
- `scenes` are rendered in order; the first scene is the entry point
- Marketplace metrics (`rating`, `runs`) are populated from the server catalog and stripped when the adventure is downloaded
- The `storefront` field is only present on catalog entries — owned adventures omit it

## Related Pages

- [Scene](/data-model/scene) — the next layer down, where all the action happens
- [Asset References](/data-model/asset-ref) — how `cover` references work
- [Run State](/data-model/run-state) — how adventure progress is tracked separately
- [Getting Started](/guide/getting-started) — introduction to the full platform
