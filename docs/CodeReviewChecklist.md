# Code Review Checklist

Questions for reviewing a PR that adds or changes a flow. Not a rulebook -
CI already enforces the mechanical rules (`npm run lint`); this is what a
human reviewer adds on top.

## Reusability

- Could this be a `flows/`/`helpers/` file instead of being inlined? Is a
  near-identical step already duplicated somewhere else in the diff or the
  existing tree?
- Does it extract a helper *speculatively* (nothing in this PR actually
  uses it yet)? If so, push back - see `docs/CreatingFlows.md`, "Never
  extract a helper speculatively."

## Selectors

- Does the selector follow the priority order in `docs/BestPractices.md`
  (id/text > relational anchor > guarded index)?
- Is there a comment saying what this was verified against, and when? If
  not, ask - "verified against a live Android Emulator, 2026-07-14" is the
  standard this repo holds every flow to.
- Any of the banned patterns (XPath, coordinate taps, raw `sleep`,
  unguarded index, hardcoded secret)? CI should already catch these, but
  double-check `npm run lint` actually ran on this branch.

## Readability

- Could a junior QA engineer or a business stakeholder open this file and
  understand what it does? A scenario file especially should read like a
  sentence.
- Does the `name:` field (for a scenario) actually describe the behavior,
  not the UI mechanics?
- Is the file named after the business behavior, not the UI action (see
  `docs/BestPractices.md`, "Naming")?

## Assertions

- Does it assert on something the app guarantees (an input echo, a static
  label), or on live network/third-party content that could make it flaky?
  See `docs/Assertions.md`.
- Would a reasonable person trust a green run of this test to mean the
  feature actually works?

## Structure

- Scenario file (`.maestro/scenarios/`): only `runFlow`/`tags`/`env`/
  lifecycle hooks - no selector.
- Correct layer for the change: `flows/` for capability-specific logic,
  `helpers/` for generic/shared interactions (`docs/Architecture.md`).
- Tagged appropriately (`docs/RunningTests.md`).

## Before approving

- [ ] `npm run typecheck && npm run lint && npm test` all pass (or you
      verified CI ran them)
- [ ] The PR description or file comments say what this was run against
- [ ] Nothing in the diff duplicates existing `flows/`/`helpers/` content
