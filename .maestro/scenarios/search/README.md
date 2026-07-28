# Scenarios: Search

The only layer `.maestro/config.yaml` treats as executable. Every file here
must contain nothing but `runFlow`, `tags`, and lifecycle hooks
(`onFlowStart`/`onFlowComplete`) - no raw selectors, no `tapOn` with an
`id`/`text`, no assertions inline. Enforced by
`scripts/src/lint/check-flow-conventions.ts` in CI, not just documented here.

| File | Scenario | Platform | Tags |
|---|---|---|---|
| `search-wikipedia-returns-relevant-results.yaml` | Searching returns relevant results | Android | `smoke`, `critical`, `search` |
| `clearing-a-search-query-resets-empty-state.yaml` | Clearing a query resets the screen back to its empty state | Android | `smoke`, `search` |
| `ios-pipeline-smoke.yaml` | Not a real scenario - a CI pipeline health check. See the comment in the file for why iOS Search parity isn't covered yet. | iOS | `smoke`, `pipeline-check` |

The `name:` field and `tags:` on each file, plus this table, are the source
of truth for what a scenario covers - there is deliberately no separate
Gherkin/`.feature` file to keep in sync alongside it (see
`docs/Architecture.md`, "Why no Gherkin layer").

Both Android scenarios share `helpers/complete-onboarding-android.yaml` (via
`onFlowStart`), `helpers/take-screenshot.yaml` (via `onFlowComplete`), and
`flows/search/perform-search.yaml` - the concrete, in-repo proof that this
layering avoids duplication rather than just claiming to.
