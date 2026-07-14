# Architecture

## Why this exists

This repository is the foundation of the company's mobile test automation
platform: BDD-first, Maestro-based, built to be maintained by many engineers
across many teams for years, not a one-off test script collection. Every
architectural decision below optimizes for that timeline over short-term
convenience.

## The five layers

```
Business Features (flows/features/**)
        |  runFlow
        v
Reusable Flows (flows/reusable/**)
        |  runFlow
        v
Sub Flows (flows/sub-flows/**)
        |  runFlow
        v
Common Components (flows/common-components/**)
        |
        v
Utilities / Configuration / Environment / Test Data
  (tools/, config/, test-data/)
```

**Business Features** are the only executable layer. `.maestro/config.yaml`'s
`flows:` key globs only `flows/features/**/*.yaml` - Maestro will never pick
up a reusable flow, sub-flow, or common-component file as a standalone test.
This is what makes the layering a structural guarantee instead of a
convention people can silently drift away from.

A Layer-1 file may contain **only** `runFlow`, `tags`, and lifecycle hooks
(`onFlowStart`/`onFlowComplete`) - no selector, ever. This is enforced by
`tools/src/lint/check-flow-conventions.ts` in CI (`feature-layer-selector-free`
rule), not just documented here. The result: a business stakeholder can open
any file under `flows/features/` and read what the app does without knowing
what a resource id is.

**Reusable Flows** are where selectors live - one business capability per
file (e.g. `perform-search.yaml`), parameterized via `env`. **Sub-Flows** are
generic, app-agnostic technical interactions (dismiss keyboard, take
screenshot) invoked from hooks or reusable flows. **Common Components** are
reusable UI-pattern interactions (a bottom nav, a dialog) that multiple
business capabilities might share.

## The BDD traceability model

```
Business Requirement -> features/*.feature (Gherkin, stakeholder-readable)
                              | @flow:<name> tag
                              v
                         Layer-1 flow file
```

Each Gherkin scenario carries a `@flow:<name>` tag naming its corresponding
Layer-1 flow file. `tools/src/lint/check-feature-flow-mapping.ts` fails CI if
either side references something that doesn't exist on the other -
traceability is enforced, not aspirational. Flows that aren't business
scenarios (e.g. `ios-pipeline-smoke.yaml`, a CI health check) are tagged
`pipeline-check` and explicitly exempted rather than forced into a fake
mapping.

## The tooling boundary

Two separate runtimes exist side by side and must not be confused:

- **Maestro's own JS engine** (`runScript`/`evalScript` in `.maestro/scripts/`)
  - embedded JVM (Rhino/GraalJS), cannot `require`/`import` npm packages.
- **Node/TypeScript** (`tools/`) - env loading, test data factories, sample
  app fetching, report aggregation, and the enforced-convention lint scripts.
  Orchestrates the `maestro` CLI as a subprocess; never executes inside a
  flow.

See `.maestro/README.md` and `tools/README.md` for the boundary from each
side, and `docs/FolderStructure.md` for the full directory-by-directory
reference.

## What Phase 1 deliberately does not cover

This repository's first slice proves the architecture end-to-end against a
public placeholder app (Wikipedia) rather than a real company application,
which does not exist yet for this platform. Cloud device farms, the full
15-document doc set, and additional business flows are explicitly deferred -
see `docs/future/` and `README.md` for what's next and why.
