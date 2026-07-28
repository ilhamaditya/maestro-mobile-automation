# Best Practices

## Selector priority order

1. **Accessibility ID / resource ID** - most stable, survives text/locale
   changes. `id: "org.wikipedia:id/search_container"`.
2. **Visible text** - stable for user-facing labels that are part of the
   product's contract with its users. `tapOn: "Search"`.
3. **Relational anchors** - `below:`, `containsChild:` - for elements
   without a stable id/text, anchored to one that has one.
4. **Index** - last resort, and only paired with an id/text selector, never
   alone. An index-only selector breaks the moment list order changes.

## Explicitly banned (enforced in CI, not just documented)

| Rule | Why | Lint check |
|---|---|---|
| No XPath | Maestro has no XPath support - it reads the platform accessibility tree, not a DOM | `no-xpath` |
| No coordinate/point taps (`tapOn: point: "50%,50%"`) | Breaks across screen sizes and layout changes | `no-coordinate-taps` |
| No hardcoded credentials/secrets | Use `${VAR}` from `config/` instead | `no-hardcoded-secrets` |
| No raw `sleep:` | Synchronize on state instead - see `docs/Assertions.md` | `no-raw-sleep` |
| No unguarded index selector | Must be paired with `id`/`text` | `no-unguarded-index` |

Run `npm run lint:flows` from `scripts/` to check locally - this is exactly
what CI runs.

## Verify, don't guess

Real example: `.maestro/flows/search/perform-search.yaml` taps by text
(`"Search Wikipedia"`) because that's the stable, user-facing label Maestro
exposes for that element - confirmed against a live emulator, where a
guessed resource id (`search_src_text`) was tried first, found not to
exist, and discarded before it ever reached this repo. Every flow's
comments should say what selector you verified and against what device -
see `docs/CreatingFlows.md`, "Verification discipline."

## Composition and file size

- One responsibility per flow file (`docs/CreatingFlows.md`).
- Compose via `runFlow`, don't reimplement an interaction a helper already
  covers.
- Never extract a helper speculatively - build it because a real flow needs
  it now (`docs/CreatingFlows.md`).
- Keep scenario files selector-free (`docs/Architecture.md`,
  `docs/WritingTests.md`).

## Naming

- Kebab-case filenames, `.yaml` (not `.yml`).
- Name scenarios after the business behavior
  (`clearing-a-search-query-resets-empty-state.yaml`), never the UI action
  (`tap-clear-button.yaml`).
- No placeholder names (`test.yaml`, `temp.yaml`, `flow1.yaml`).

All of the above is enforced by `npm run lint:naming` - see
`docs/CreatingFlows.md` for the full rule set.

## Tags

At minimum: a suite tag (`smoke`/`sanity`/`regression`), a platform tag
(`android`/`ios`), and `production-safe` if the scenario is read-only. See
`docs/RunningTests.md` for the full convention and how tags map to CI jobs.
