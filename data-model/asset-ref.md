# Asset References

> How the app resolves art assets — from procedural SVG generators to bundled package files to remote CDN URLs.

## Type Definition

```ts
type AssetRef =
  | string
  | { kind: "bundled"; path: string }
  | { kind: "remote";  url: string }
```

## Forms

| Form | Type | Description | Example |
|------|------|-------------|---------|
| Procedural | `string` | A stable ID that maps to a deterministic SVG generator | `"moonlight"`, `"vera"` |
| Bundled | `{ kind: "bundled"; path: string }` | A file path inside the `.hopscotch` package | `{ kind: "bundled", path: "art/vera.png" }` |
| Remote | `{ kind: "remote"; url: string }` | A URL fetched at install time (marketplace only) | `{ kind: "remote", url: "https://cdn.example.com/art/vera.png" }` |

## Procedural ID (string)

When the asset reference is a plain string, it's treated as a **procedural ID**. The app runs it through a deterministic SVG generator:

```ts
// resolveAsset("vera") returns a <svg>...</svg> DOM string
// Same ID always produces the same output
```

The generator uses a hash of the ID to pick a color palette and glyph. This means:
- The prototype's mock data renders without real art files
- Imported adventures with no bundled assets still look presentable
- Studio adventures override the procedural fallback with real art

## Bundled

Adventures that ship with real art use the `bundled` form:

```jsonc
"cover": { "kind": "bundled", "path": "art/cover.png" }
```

The path is relative to the root of the `.hopscotch` package (which is a ZIP archive). When the adventure is imported, bundled assets are extracted and stored in IndexedDB alongside the adventure JSON.

## Remote

Marketplace catalog entries may reference remote assets:

```jsonc
"cover": { "kind": "remote", "url": "https://cdn.hopscotchadventures.com/art/moonlight-heist-cover.png" }
```

Remote assets are fetched during the adventure download flow and cached in IndexedDB. After download, the adventure runs offline — remote assets behave identically to bundled ones.

## Resolution Priority

When the app needs to display an asset:

1. Check IndexedDB for a real asset file (bundled or remote)
2. If no file exists, run the procedural SVG generator using the ID string
3. The generator always succeeds — there's always *something* to render

```ts
function resolveAsset(ref: AssetRef): Asset {
  const id = typeof ref === 'string' ? ref : ref.path || ref.url

  // Try real asset first
  const file = await idb.get(`asset:${id}`)
  if (file) return file

  // Fall back to procedural SVG
  return proceduralGenerator.generate(id)
}
```

## Where Assets Are Used

| Field | Type | AssetRef Usage |
|-------|------|----------------|
| `Adventure.cover` | `AssetRef` | Cover art on Storefront, Library, AdventureHome |
| `Npc.avatar` | `AssetRef` | NPC portrait in Cast rows and NPC sheet |
| `Combatant.avatar` | `AssetRef` | Token on initiative ladder and active card |

## Validation

- Bundle paths must not escape the package root (no `../` traversal)
- Remote URLs must use `https://` (no `http://`, no `file://`)

## Related Pages

- [Adventure](/data-model/adventure) — cover art usage
- [NPC](/data-model/npc) — avatar usage
- [Combatant](/data-model/combatant) — token portrait usage
- [Architecture Decisions](/architecture/decisions) — D8 procedural art fallbacks
