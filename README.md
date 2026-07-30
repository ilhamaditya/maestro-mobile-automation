# Maestro Mobile Automation

A Maestro mobile test automation starter template - built to be understood
in about 15 minutes, and to stay that simple as you add real tests to it.

## Overview

Tests ("scenarios") are selector-free YAML that read like a sentence. They
compose reusable, selector-holding flows and generic helpers via `runFlow`.
The layering is enforced by tooling, not just convention: Maestro will
never execute a flow or helper file as a standalone test, and CI fails the
build if a scenario contains a raw selector.

This repo proves that end to end - real scenarios, running against a real
Android emulator and iOS Simulator, with enforced conventions and working
CI - against a **public placeholder app** (Maestro's own official Wikipedia
sample), because no real target application exists for this template yet.
Swap in a real app and the same mechanism keeps working unchanged - see
`docs/GettingStarted.md`, "Swapping in a real application."

## Architecture

```
scenarios/  (what you RUN — selector-free, plain language)
    │  runFlow
    ▼
flows/      (what you REUSE — selectors live here, one capability per file)
    │  runFlow
    ▼
helpers/    (generic building blocks: onboarding, keyboard, screenshots, nav)
```

`.maestro/config.yaml` only executes `scenarios/**` - flows and helpers
exist solely to be composed into a scenario via `runFlow`. Full rationale:
`docs/Architecture.md`.

## Prerequisites

| Tool | Why |
|---|---|
| [Maestro CLI](https://docs.maestro.dev) `1.39.7` | Runs the flows |
| Node.js 20+ (`.nvmrc`) | Runs `scripts/` (env loading, lint, orchestration) |
| Android SDK + `adb` + an AVD | Android runs |
| Xcode + a Simulator (macOS only) | iOS runs |

Full details: `docs/Installation.md`.

## Install

```bash
curl -fsSL "https://get.maestro.mobile.dev" | bash   # Maestro CLI
cd scripts && npm install                              # Node tooling
```

## Run your first test

```bash
cd scripts
npm run fetch:apps        # downloads the placeholder app once
emulator -avd <your-avd-name>          # boot a device (or an iOS Simulator)
adb install -r ../apps/android/build/wikipedia.apk
npm run smoke:android
```

What a real passing run of this exact suite has produced (captured
`test-output/summary.json` from an actual local run - not a mockup):

```json
[
  { "platform": "android", "tests": 2, "failures": 0 },
  { "platform": "ios", "tests": 1, "failures": 0 }
]
```

Full walkthrough (both platforms, reading the reports, running against a
specific environment/tag): `docs/RunningTests.md`.

## Project layout

```
maestro-mobile-automation/
├── .maestro/          Maestro workspace: scenarios/, flows/, helpers/
├── config/            .env.example (copy to .env, gitignored)
├── data/              Static fixtures consumed by scripts/ factories
├── apps/               Sample-app fetch destinations (gitignored binaries)
├── scripts/            Node/TypeScript orchestration, lint, reporting
└── docs/               Everything below, explained
```

Full breakdown: `docs/FolderStructure.md`.

## Writing your first test

A scenario is selector-free - it only composes existing flows/helpers:

```yaml
appId: org.wikipedia
name: Search - a query typed into Wikipedia Search returns visible results
tags: [android, smoke, search]
env:
  APP_ID: org.wikipedia
  QUERY: "Software testing"
onFlowStart:
  - runFlow: ../../helpers/complete-onboarding-android.yaml
---
- runFlow:
    file: ../../helpers/navigate-to-search-tab.yaml
    env: { APP_ID: ${APP_ID} }
- runFlow:
    file: ../../flows/search/perform-search.yaml
    env: { APP_ID: ${APP_ID}, QUERY: ${QUERY} }
```

Full guide, checklist, and naming rules: `docs/WritingTests.md`.

## Creating a reusable flow

Selectors live in `flows/<capability>/`, one responsibility per file:

```yaml
appId: ${APP_ID}
---
# Verified: "Search Wikipedia" must be tapped to focus the input before
# inputText lands anywhere (confirmed on both platforms, live device).
- tapOn: "Search Wikipedia"
- inputText: ${QUERY}
```

When to extract a flow vs. a helper, composition patterns, and the
verification discipline this repo holds every selector to:
`docs/CreatingFlows.md`.

## Environment variables

One file - `config/.env` (only `.env.example` is committed; copy it to get
started). `scripts/src/env/load-env.ts` fills the one real gap in Maestro's
CLI: no native `.env` file support. Details: `config/README.md`,
`docs/RunningTests.md`.

```bash
cp config/.env.example config/.env
```

## Common commands

Run from `scripts/`:

| Command | Does |
|---|---|
| `npm install` | Install Node tooling dependencies |
| `npm run fetch:apps` | Download the placeholder app |
| `npm run smoke:android` / `smoke:ios` | Run the smoke suite end to end |
| `npm run lint` | Enforced flow/naming conventions (what CI runs) |
| `npm run typecheck` | `tsc --noEmit` |
| `npm test` | Unit tests for `scripts/` itself |
| `npm run report:aggregate` | Regenerate `test-output/summary.json` |

## Debugging

Reports land in `test-output/<platform>/report.xml` (JUnit) and
`test-output/<platform>/debug/` (screenshots, view hierarchy, logs - all
native Maestro output, no custom capture pipeline). Known issues and their
diagnoses: `docs/Troubleshooting.md`.

## CI

GitHub Actions runs lint → Android smoke (real emulator) → iOS smoke (real
Simulator) → a Docker build sanity check, with JUnit + screenshot/log
artifacts on every run. Details and the reasoning behind every CI decision:
`docs/CI.md`.

## Best practices

Selector priority order, banned patterns (enforced in CI: no XPath, no
coordinate taps, no raw sleep, no hardcoded secrets, no unguarded index),
and composition/naming rules: `docs/BestPractices.md`. Assertion patterns
specifically: `docs/Assertions.md`.

## FAQ

`docs/FAQ.md`.

## Contributing

Before opening a PR:

```bash
cd scripts && npm run typecheck && npm test && npm run lint
```

This is exactly what CI's `lint` job runs. Then check your change against
`docs/QA-Checklist.md` (author self-check) and
`docs/CodeReviewChecklist.md` (what a reviewer will look for). Follow the
verification discipline used throughout `.maestro/` - verify a selector
against a live device/simulator and cite what and when, rather than
guessing from a design mockup (see `docs/CreatingFlows.md`).

## Start here

- New to this repo → `docs/GettingStarted.md`
- Understand the architecture → `docs/Architecture.md`, `docs/FolderStructure.md`
- Write a test → `docs/WritingTests.md`
- Build a new reusable flow → `docs/CreatingFlows.md`
- Assertions → `docs/Assertions.md`
- Conventions → `docs/BestPractices.md`
- Something broke → `docs/Troubleshooting.md`, `docs/FAQ.md`
- Environments & CI → `config/README.md`, `docs/RunningTests.md`, `docs/CI.md`
- Reviewing a PR → `docs/CodeReviewChecklist.md`, `docs/QA-Checklist.md`
