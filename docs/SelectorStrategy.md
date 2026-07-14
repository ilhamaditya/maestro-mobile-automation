# Selector Strategy

## Priority order

1. **Accessibility ID / resource ID** - most stable, survives text/locale
   changes. Example (Android): `id: "org.wikipedia:id/search_container"`.
2. **Visible text** - stable for user-facing labels that are part of the
   product's contract with its users. Example: `tapOn: "Search"`.
3. **Relational anchors** - `below:`, `containsChild:` - for elements without
   a stable id/text, anchored to one that has one.
4. **Index** - last resort, and only paired with an id/text selector, never
   alone (see the `no-unguarded-index` lint rule below). An index-only
   selector breaks the moment the list order changes.

## Explicitly banned

- **XPath.** Maestro has no XPath support at all - it reads the platform
  accessibility tree, not a DOM. (`no-xpath` lint rule.)
- **Coordinate/point taps** (`tapOn: point: "50%,50%"`). Breaks across screen
  sizes and layout changes. (`no-coordinate-taps` lint rule.)
- **Hardcoded credentials or secrets** in a selector or input value - use
  `${VAR}` from `config/environments/`. (`no-hardcoded-secrets` lint rule.)

## No arbitrary waits

Maestro has no native `sleep` command - it auto-retries against the
accessibility tree. Synchronize on state instead:

```yaml
- extendedWaitUntil:
    visible: "Test automation"
    timeout: 8000
```

The `no-raw-sleep` lint rule fails CI if a literal `sleep:` key appears
anywhere in `.maestro/flows/**/*.yaml`.

## Real example from this repo

`.maestro/flows/reusable/search/perform-search.yaml` taps by text
(`"Search Wikipedia"`) because that's the stable, user-facing label Maestro
exposes for that element - confirmed against a live emulator, where a
guessed resource id (`search_src_text`) was tried first, found not to exist,
and discarded before it ever reached this repository. See the file-level
comments throughout `.maestro/flows/` for more real vs. guessed examples.

## Enforcement

`tools/src/lint/check-flow-conventions.ts` implements every "banned" rule
above as an actual CI gate, not just this document. Run it locally with
`npm run lint:flows` from `tools/`.
