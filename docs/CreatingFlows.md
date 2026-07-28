# Creating Flows and Helpers

This covers building new `flows/` (capability implementations, selectors
allowed) and `helpers/` (generic building blocks). If you're composing
existing ones into a scenario, see `docs/WritingTests.md` instead.

## Flows vs. helpers - which do I need?

- **Add to `flows/<capability>/`** if it's specific to one business
  capability (e.g. "perform a search," "submit a form"). One responsibility
  per file.
- **Add to `helpers/`** if it's generic/app-agnostic (dismiss the keyboard,
  take a screenshot) or a reusable UI pattern used by more than one
  capability (a bottom nav, a dialog), or it's invoked from a scenario's
  `onFlowStart`/`onFlowComplete`.

**Never extract a helper speculatively.** Build it because a real flow needs
it right now, verified against a live device - not because you might need it
someday. `.maestro/helpers/README.md`'s "Not built yet" table is exactly
this: real, plausible helpers this repo doesn't build until something
actually exercises them.

## One responsibility per file

`perform-search.yaml` only focuses the input and types a query.
`assert-search-query-visible.yaml` only asserts. `clear-search-query.yaml`
only clears. This is what lets
`clearing-a-search-query-resets-empty-state.yaml` reuse `perform-search.yaml`
verbatim instead of duplicating its steps - the concrete, in-repo proof that
this granularity avoids duplication.

## `runFlow` composition patterns

**Static reference** (child needs no parameters):

```yaml
- runFlow: ../../helpers/dismiss-keyboard.yaml
```

**Parameterized reference** (child's `appId`/values are templated):

```yaml
- runFlow:
    file: ../../flows/search/perform-search.yaml
    env:
      APP_ID: ${APP_ID}
      QUERY: ${QUERY}
```

**Conditional guard** (dismiss a non-deterministic overlay only if present -
see `.maestro/helpers/complete-onboarding-ios.yaml`):

```yaml
- runFlow:
    when:
      visible:
        text: "Explore your Wikipedia Year in Review"
    commands:
      - tapOn: "Done"
```

## Why every flow file declares its own `appId`

Maestro requires a config section with a non-null `appId` in every flow
file, even ones only ever invoked via `runFlow` (confirmed empirically - a
file with no `appId` fails to parse). Genuinely generic files
(`take-screenshot.yaml`, `dismiss-keyboard.yaml`) declare `appId: ${APP_ID}`
and rely on the caller passing `env: { APP_ID: ... }`. App-specific files
(the onboarding helpers) hardcode the literal id directly, matching
Maestro's own official example flows for this app.

Forward `APP_ID` from your scenario's own `env:` header rather than
retyping the literal at every call site - see the example in
`docs/WritingTests.md` (`env: APP_ID: ${APP_ID}` at each `runFlow`).

## Verification discipline

Every "Built" row in `.maestro/flows/`'s and `.maestro/helpers/README.md`'s
tables states what device/simulator a selector was verified against and
when. When you add a new flow or helper, keep that discipline - a comment
like "verified against a live Android Emulator, 2026-07-14" is what lets the
next engineer trust the flow instead of re-verifying it themselves. See
`docs/BestPractices.md` for selector strategy specifics.

## Enforcement

`scripts/src/lint/check-flow-conventions.ts` and
`check-naming-conventions.ts` turn the naming and structural rules above
into CI gates. Run them locally with `npm run lint` from `scripts/`.
