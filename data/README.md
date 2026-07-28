# Test Data

Static, checked-in JSON consumed by factories in `scripts/src/data/factories/`.
Flows never read data files directly - a factory resolves an entry to a value
and the CLI orchestrator (`scripts/src/cli/run-smoke.ts`) injects it into
`maestro test` as an `-e` flag, keeping flow YAML free of embedded data.

## What's here today

`search-queries.json` backs the Search vertical slice. Both entries are
picked deliberately for long-term stability against Wikipedia's live content
(see the fixture's own `note` fields) rather than being arbitrary strings - a
flaky fixture would undermine the deterministic-execution goal as much as a
flaky selector would.

## Extension point

Add one JSON file per business domain as new flows are built (e.g.
`checkout-orders.json`), paired with a factory of the same name in
`scripts/src/data/factories/`. Prefer builders/factories over hand-maintained
giant fixture files once a domain needs generated or randomized-but-seeded
data.
