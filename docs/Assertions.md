# Assertions

## What

Maestro's two core assertion commands:

```yaml
- assertVisible: "Search Wikipedia"
- assertNotVisible: "Software testing"
```

`assertVisible` also accepts a selector object (`id:`, `text:`, relational
anchors - see `docs/BestPractices.md`), not just a bare string.

## Why assert on the right thing

Real example, `.maestro/flows/search/assert-search-query-visible.yaml`:

```yaml
appId: ${APP_ID}
---
# Asserts the typed query is visible via the search input's own echo of what
# was typed. This deliberately does NOT assert on live Wikipedia search
# result titles/snippets - those come from a real network call and would
# make this flow flaky and non-deterministic. The input echo is guaranteed
# regardless of network/content state.
- assertVisible: ${QUERY}
```

**The rule:** assert on something the app itself guarantees, not on content
that depends on a live network call, a third-party service, or anything
outside this test's control. A flaky assertion is worse than no assertion -
it trains the team to ignore red builds.

Second real example, why an iOS assertion was deliberately *not* written
(see `.maestro/scenarios/search/ios-pipeline-smoke.yaml` and
`docs/Troubleshooting.md`): asserting on the search overlay's content was
reproducibly flaky against a real Simulator even though the text was
visibly present in screenshots. Shipping a flaky assertion as a template
example would be worse than shipping a smaller, 100%-reliable one.

## No arbitrary waits before an assertion

Maestro has no native `sleep` command - it auto-retries `assertVisible`
against the accessibility tree until the timeout. You never need to wait
before an assertion; if something *else* needs to settle first (an
animation, a network call before an element even starts existing), wait
explicitly on that state:

```yaml
- extendedWaitUntil:
    visible: "Test automation"
    timeout: 8000
```

`npm run lint:flows` fails CI if a literal `sleep:` key appears anywhere
under `.maestro/` (`no-raw-sleep` rule).

## Patterns used in this repo

| Pattern | Example | When |
|---|---|---|
| Assert visible by text | `assertVisible: "Search Wikipedia"` | Stable, user-facing label |
| Assert visible by input echo | `assertVisible: ${QUERY}` | Confirm something you typed took effect, without depending on network content |
| Assert not visible | `assertNotVisible: ${QUERY}` | Confirm a cleared/reset state |
| Wait for state, then assert | `extendedWaitUntil` → `assertVisible` | Something needs to finish loading/animating first |

## Don't

- Don't assert on content from a live network call/third-party API in a
  scenario tagged `smoke` or `critical` - it will flake independently of
  your app's correctness.
- Don't add a `sleep`/manual delay to "fix" a flaky assertion - find what
  state you're actually waiting on and use `extendedWaitUntil`.
- Don't assert inside a scenario file (`.maestro/scenarios/`) - assertions
  belong in `flows/`, referenced via `runFlow` (see
  `docs/Architecture.md`).
