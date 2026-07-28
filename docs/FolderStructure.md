# Folder Structure

## What

```
maestro-mobile-automation/
├── .maestro/                  Maestro workspace root (.maestro/README.md)
│   ├── config.yaml            flows: globs ONLY scenarios/**/*.yaml
│   ├── scenarios/              RUN these. Selector-free. Grouped by capability.
│   ├── flows/                  REUSE these. Selectors live here.
│   └── helpers/                 Generic building blocks (onboarding, keyboard, nav...)
├── config/                     .env.<target>.example per environment
├── data/                       Static fixtures consumed by scripts/ factories
├── apps/{android,ios}/         Sample-app fetch destinations (gitignored binaries)
├── scripts/                    Node/TypeScript orchestration (scripts/README.md)
├── docs/                       This directory
├── Dockerfile, .dockerignore   Local/CI tooling runtime image
└── README.md                   Start here
```

## Why

**Why does every extension-point folder get a README instead of staying
silently empty?** `.maestro/helpers/README.md` states what's built, what
isn't, and why - never a silent empty directory and never a placeholder file
that looks implemented but isn't. When you add real content, move its
description out of the "not built yet" table and into the "Built" table,
with what you verified it against. This repo does **not** pre-create empty
folders for every UI pattern you might eventually need (an earlier draft
did, for 10 different UI-component types - 9 sat empty). Create a folder
when a real flow needs it, not before.

**Why `config/` and `data/` instead of `config/environments/` and
`test-data/fixtures/`?** One less nesting level for the same content. There
was never more than one thing in either folder's parent directory, so the
extra layer wasn't earning its keep.

**Why `scripts/` instead of `tools/`?** Same content, clearer name - it's
what most engineers expect a "scripts" folder in a repo root to mean (CLI
orchestration, lint, fetch, reporting), and it doesn't require knowing this
repo's internal vocabulary first.

## How: where a new file goes

| You're adding... | Goes in |
|---|---|
| A new business scenario | `.maestro/scenarios/<capability>/` - selector-free, named after the business behavior (see `docs/CreatingFlows.md`) |
| A new business capability's implementation | `.maestro/flows/<capability>/` |
| A new generic or reusable-UI-pattern building block | `.maestro/helpers/` |
| A new environment-loading or data-generation need | `scripts/src/env/` or `scripts/src/data/factories/` |
| A new enforced convention | `scripts/src/lint/`, wired into `.github/workflows/smoke.yml`'s `lint` job |

See `docs/CreatingFlows.md` for the full walkthrough.
