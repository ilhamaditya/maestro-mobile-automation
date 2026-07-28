# Architecture

## What

Three layers, one enforced rule: **only `scenarios/` is executable.**

```
scenarios/  (what you RUN)
    │  runFlow
    ▼
flows/      (what you REUSE — selectors live here)
    │  runFlow
    ▼
helpers/    (generic building blocks: onboarding, keyboard, screenshots, nav)
```

- **`scenarios/`** - business scenarios, in plain language. A scenario file
  may contain **only** `runFlow`, `tags`, and lifecycle hooks
  (`onFlowStart`/`onFlowComplete`) - no selector, ever.
- **`flows/`** - one business capability per file (e.g. `perform-search.yaml`),
  parameterized via `env`. Selectors live here.
- **`helpers/`** - generic, reusable building blocks: app-agnostic technical
  interactions (dismiss keyboard, take screenshot) and reusable UI-pattern
  interactions (a bottom nav, a dialog) alike.

## Why

**Why only three layers, and why merge "technical interaction" and "UI
component" into one `helpers/` folder?** An earlier draft of this repo split
those into two separate layers. In practice the distinction rarely mattered
day to day, and 9 of 10 "UI component" folders sat empty as placeholders no
one had built yet - conceptual overhead with no payoff. Fewer layers, same
guarantee: a new engineer needs to learn 3 ideas, not 4, to write their first
test.

**Why is "only `scenarios/` is executable" enforced by tooling, not just by
this doc?** `.maestro/config.yaml`'s `flows:` key globs only
`scenarios/**/*.yaml` - Maestro will never pick up a flow or helper file as a
standalone test. `scripts/src/lint/check-flow-conventions.ts` additionally
fails CI if a scenario file contains anything but `runFlow`/`tags`/lifecycle
hooks (the `scenario-layer-selector-free` rule). This is what makes the
layering a structural guarantee instead of a convention people can silently
drift away from - the same reason a business stakeholder can open any file
under `scenarios/` and read what the app does without knowing what a
resource id is.

**Why no Gherkin/`.feature` layer?** An earlier draft paired every scenario
with a Gherkin `.feature` file (requirement → `.feature` scenario →
`@flow:<name>` tag → scenario flow), enforced by a bespoke traceability lint
check. It was removed: this repo's real audience is QA/dev engineers, not
non-technical stakeholders reading `.feature` files as living documentation,
so the second file bought no readability that a selector-free,
capability-named scenario file doesn't already give - while adding a second
artifact to keep in sync and a bespoke lint check to maintain (Maestro has no
native Cucumber/Gherkin execution, so this was always a custom
approximation). The scenario file is the single source of truth for what it
covers. Cheap to reintroduce later if a real three-amigos process ever needs
stakeholder-facing living documentation - see git history.

## How

See `docs/CreatingFlows.md` for the practical "where does my new file go"
guide, and `docs/FolderStructure.md` for the full directory reference.

## The tooling boundary

Two separate runtimes exist side by side and must not be confused:

- **Maestro's own JS engine** (`runScript`/`evalScript`, used inside a flow
  file) - an embedded JVM (Rhino/GraalJS), cannot `require`/`import` npm
  packages.
- **Node/TypeScript** (`scripts/`) - env loading, test data factories,
  sample app fetching, report aggregation, and the enforced-convention lint
  scripts. Orchestrates the `maestro` CLI as a subprocess; never executes
  inside a flow.

See `scripts/README.md` for this boundary from the tooling side.

## What this repo deliberately does not (yet) cover

This repo proves the architecture end-to-end against a public placeholder
app (Wikipedia) rather than a real target application, which doesn't exist
for this template yet. Cloud device farms, additional business flows, and
full iOS Search parity are explicitly out of scope for now - see the root
`README.md` and `docs/Troubleshooting.md`.
