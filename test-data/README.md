# Test Data

`fixtures/` holds static, checked-in JSON consumed by factories in
`tools/src/data/factories/`. Flows never read fixture files directly - a
factory resolves a fixture entry to a value and the CLI orchestrator
(`tools/src/cli/run-smoke.ts`) injects it into `maestro test` as an `-e`
flag, keeping flow YAML free of embedded data.

## Phase 1

`fixtures/search-queries.json` backs the Search vertical slice. Both entries
are picked deliberately for long-term stability against Wikipedia's live
content (see the fixture's own `note` fields) rather than being arbitrary
strings - a flaky fixture would undermine the platform's deterministic-
execution mandate as much as a flaky selector would.

## Extension point

Add one fixture file per business domain as new flows are built (e.g.
`fixtures/checkout-orders.json`), paired with a factory of the same name.
Prefer builders/factories over hand-maintained giant fixture files once a
domain needs generated or randomized-but-seeded data.
