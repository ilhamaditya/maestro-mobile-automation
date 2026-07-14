# Maestro Mobile Automation Platform

The company's Maestro-based mobile test automation platform: BDD-first,
strictly layered, built for long-term maintenance across many teams rather
than a one-off test script collection. See `docs/Architecture.md` for the
full rationale.

## Status: Phase 1 (Foundational Skeleton)

This repository proves the architecture end-to-end - real flows, running
against a real emulator/simulator, with enforced conventions and working
CI/CD - using a **public placeholder app** (Maestro's own official
Wikipedia sample), because no real target application exists for this
platform yet. Everything here is genuine, verified infrastructure, not a
demo: swap in a real application and Phase 1's mechanism keeps working
unchanged (see `docs/GettingStarted.md`, "Swapping in a real application").

**What Phase 1 delivers:**
- The full 5-layer flow architecture (Business Features -> Reusable Flows ->
  Sub-Flows -> Common Components -> Utilities/Config/Env/Test Data), proven
  via one vertical slice (Search) with two Android scenarios sharing
  reusable flows and sub-flows across both - the in-repo proof against
  duplication.
- BDD traceability enforced in CI: a Gherkin scenario without a matching
  flow (or vice versa) fails the build.
- Selector/convention rules enforced in CI, not just documented: no raw
  sleeps, no coordinates, no XPath, no unguarded index selectors, no
  hardcoded secrets, no selectors inside a business-layer flow.
- A working `.env.<target>` loader for all six standard environments
  (local/dev/qa/uat/staging/production), filling Maestro's one real gap
  (no native `.env` support).
- GitHub Actions CI: lint -> Android smoke (real emulator) + iOS smoke (real
  Simulator) + a Docker build sanity check, with JUnit + screenshot/log
  artifacts on every run.

**What Phase 1 deliberately defers** (see `docs/future/`): the full
15-document doc set, cloud device farms (BrowserStack/Firebase Test Lab/
Maestro Cloud), Allure reporting, additional business flows, and full iOS
Search parity (a real, reproducible flakiness in the current toolchain is
documented rather than papered over - see `docs/GettingStarted.md`).

## Start here

- New to this repo: `docs/GettingStarted.md`
- Understand the architecture: `docs/Architecture.md`,
  `docs/FolderStructure.md`
- Writing a new flow: `docs/FlowGuide.md`, `docs/SubFlowGuide.md`,
  `docs/SelectorStrategy.md`
- Environments & CI: `docs/EnvironmentGuide.md`, `docs/CI-CD.md`

## Repository layout

```
.maestro/       Maestro workspace (flows, in their 4 layers)
features/       Gherkin scenarios (business documentation of record)
config/         Per-environment .env.<target>.example files
test-data/      Fixtures consumed by tools/ factories
apps/           Sample-app fetch destinations (binaries gitignored)
tools/          Node/TypeScript orchestration, lint, reporting
docs/           Everything above, explained
```

See `docs/FolderStructure.md` for the full breakdown.
