# Parser

> The component that converts raw `.hopscotch` file bytes into an Abstract Syntax Tree — the first step in the format pipeline.

## Overview

The parser takes raw file bytes, tokenizes them into a stream, and emits an Abstract Syntax Tree (AST). It does not know about React, the DOM, or any browser APIs. It runs in Node for validation tooling and in the browser for the Import flow.

```
bytes → tokenize → tokens → parse → AST
```

## Pipeline Position

```
                    ┌──────────┐     ┌───────────┐
.hopscotch file ──► │  parser  │ ──► │ validator │ ──► typed Adventure
                    └──────────┘     └───────────┘
                         │
                    Intermediate AST
                    (untrusted, unchecked)
```

The parser's job is **syntax**: does the file conform to the `.hopscotch` grammar? It does not validate semantic constraints — that's the [validator's](/format/validator) job.

## Module Location

```
format/
  parser.ts       — tokenizer + AST emitter
  validator.ts    — AST → Adventure | Diagnostic[]
  schema.ts       — Zod schemas, single source of truth
```

## Interface

```ts
// format/parser.ts
function parse(input: string): Result<AstNode, ParseError[]>

type ParseError = {
  message: string
  line: number
  column: number
  offset: number
}
```

The parser returns either:
- A valid AST — the file conforms to the grammar
- A list of parse errors with line/column/offset for inline display in ImportPreview

## What the Parser Does

1. **Tokenize** — break the input string into tokens (keywords, identifiers, strings, numbers, punctuation)
2. **Parse** — consume tokens according to the `.hopscotch` grammar, building a nested AST
3. **Report errors** — for any token that doesn't match the expected grammar, emit a parse error with location

## What the Parser Does NOT Do

- **Semantic validation** — checking that `transition.to` references a real scene, that DCs are 1–30, that HP ≤ hpMax. That's the validator.
- **Type coercion** — the AST is raw. Numbers stay as `AstNumber` nodes, strings as `AstString` nodes. The validator converts them to TypeScript types.
- **Asset resolution** — the parser doesn't know what a "procedural ID" is. It just sees strings.

## Error Format

Parse errors include line, column, and offset for inline error display:

```ts
{
  message: "Unexpected token '}' at line 12, column 5",
  line: 12,
  column: 5,
  offset: 284
}
```

ImportPreview can highlight the exact position in the file where the error occurred.

## Runtime Constraints

- The parser must complete in <200ms for a 50KB `.hopscotch` file
- AST size is proportional to input size — no exponential blowup
- No dynamic evaluation — the parser is a deterministic state machine from input to AST

## Testing

Parser tests use round-trip verification:

```ts
describe('parser', () => {
  it('round-trips a minimal adventure', () => {
    const input = readFixture('minimal.hopscotch')
    const ast = parse(input)
    const output = serializeAst(ast)  // AST → text
    const ast2 = parse(output)
    expect(ast2).toEqual(ast)         // parse → serialize → parse produces same AST
  })

  it('rejects malformed input with location', () => {
    const result = parse('adventure { scenes [ ] }')  // missing colon
    expect(result.errors).toHaveLength(1)
    expect(result.errors[0].line).toBe(1)
  })
})
```

The test corpus includes:
- `moonlight-heist-part-1.hopscotch` — the demo adventure
- 4 adversarial inputs (malformed syntax, missing delimiters, invalid characters)

## Related Pages

- [Validator](/format/validator) — the next step in the pipeline
- [Architecture: Data Flow](/architecture/data-flow) — where the parser fits in the full pipeline
- [R3dy/hopscotch-spec](https://github.com/R3dy/hopscotch-spec) — the formal grammar specification
