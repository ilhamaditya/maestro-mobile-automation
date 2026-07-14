# Flow Guide

## Layer rules

**Layer 1 - Business Features** (`flows/features/<capability>/`)
- Only `runFlow`, `tags`, `onFlowStart`, `onFlowComplete` - no selector, ever.
- One file per scenario. Name it after the business behavior
  (`search-wikipedia-returns-relevant-results.yaml`), never the UI action
  (`tap-search-button.yaml`).
- Must be referenced by a `@flow:<name>` tag in a `features/*.feature` file,
  unless tagged `pipeline-check` (a CI health check, not a business scenario
  - see `.maestro/flows/features/search/ios-pipeline-smoke.yaml`).

**Layer 2 - Reusable Flows** (`flows/reusable/<capability>/`)
- One business capability per file, parameterized via `env`.
- Selectors are allowed here.
- Compose Sub-Flows and Common Components via `runFlow`; don't reimplement
  a generic interaction a sub-flow already covers.

**Layer 3 - Sub-Flows** (`flows/sub-flows/`) and **Layer 4 - Common
Components** (`flows/common-components/<pattern>/`) - see
`docs/SubFlowGuide.md`.

## `runFlow` composition patterns used in this repo

**Static sub-flow reference** (when the child needs no parameters):
```yaml
- runFlow: ../../sub-flows/dismiss-keyboard.yaml
```

**Parameterized reference** (when the child's `appId`/`env` values are
templated, e.g. `appId: ${APP_ID}`):
```yaml
- runFlow:
    file: ../../reusable/search/perform-search.yaml
    env:
      APP_ID: org.wikipedia
      QUERY: ${QUERY}
```

**Conditional guard** (dismiss a non-deterministic overlay only if present -
see `.maestro/flows/sub-flows/complete-onboarding-ios.yaml`):
```yaml
- runFlow:
    when:
      visible:
        text: "Explore your Wikipedia Year in Review"
    commands:
      - tapOn: "Done"
```

## Why every flow file - including sub-flows - declares its own `appId`

Maestro requires a config section with a non-null `appId` in every flow
file, even ones only ever invoked via `runFlow` (confirmed empirically,
2026-07-14 - a file with no `appId` fails to parse). Genuinely generic files
(`take-screenshot.yaml`, `dismiss-keyboard.yaml`) declare `appId: ${APP_ID}`
and rely on the caller passing `env: { APP_ID: ... }`; app-specific files
(the onboarding sub-flows) hardcode the literal id directly, matching
Maestro's own official example flows for this app. This means the same
literal `appId` string is repeated across several feature-flow-level
`runFlow` call sites rather than declared once - a known, deliberate
trade-off (see the "Known duplication" note below), not an oversight.

## One responsibility per flow

`perform-search.yaml` only focuses the input and types a query.
`assert-search-query-visible.yaml` only asserts. `clear-search-query.yaml`
only clears. This is what let `clearing-a-search-query-resets-empty-state.yaml`
reuse `perform-search.yaml` verbatim instead of duplicating its steps - the
concrete, in-repo proof that this layering avoids duplication.

## Known duplication (tracked, not silent)

Every `runFlow` call site that crosses into a generic (`${APP_ID}`-templated)
file re-specifies `env: { APP_ID: <literal> }`. A cleaner alternative -
declaring `APP_ID` once in the feature flow's own `env:` header and having
every downstream file forward `${APP_ID}` - was spiked and confirmed to work
for child flows invoked via `runFlow`'s `env:` map, but was not adopted
platform-wide for Phase 1 to avoid introducing an under-tested pattern late
in this slice's build. Revisit in Phase 2 once more flows exist to justify
the abstraction.

## Enforcement

`tools/src/lint/check-flow-conventions.ts` and
`tools/src/lint/check-naming-conventions.ts` turn the rules above into CI
gates. Run them locally with `npm run lint` from `tools/`.
