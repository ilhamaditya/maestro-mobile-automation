# Business Feature: Search

Layer 1 - the only layer `.maestro/config.yaml` treats as an executable test
suite. Every file here must contain nothing but `runFlow`, `tags`, and
lifecycle hooks (`onFlowStart`/`onFlowComplete`) - no raw selectors, no
`tapOn` with an `id`/`text`, no assertions inline. This is enforced by
`tools/src/lint/check-flow-conventions.ts` in CI, not just documented here.

| File | Maps to | Platform | Tags |
|---|---|---|---|
| `search-wikipedia-returns-relevant-results.yaml` | `features/search-wikipedia.feature` scenario "Searching returns relevant results" | Android | `smoke`, `critical`, `search` |
| `clearing-a-search-query-resets-empty-state.yaml` | `features/search-wikipedia.feature` scenario "Clearing a query resets the screen" | Android | `smoke`, `search` |
| `ios-pipeline-smoke.yaml` | Not a business scenario - a CI pipeline health check. See the comment in the file for why iOS Search parity is deferred to Phase 2. | iOS | `smoke`, `pipeline-check` |

Both Android scenarios share `sub-flows/complete-onboarding-android.yaml`
(via `onFlowStart`), `sub-flows/take-screenshot.yaml` (via `onFlowComplete`),
and `reusable/search/perform-search.yaml` - the concrete, in-repo proof that
this layering avoids duplication rather than just claiming to.
