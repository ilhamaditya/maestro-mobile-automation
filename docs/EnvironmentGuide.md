# Environment Guide

## The six targets

`local`, `dev`, `qa`, `uat`, `staging`, `production` - one
`config/environments/.env.<target>` file each. Only `.example` variants are
committed; real files are gitignored and populated locally or injected as CI
secrets. See `config/README.md` for the Phase 1 honesty note: the current
placeholder app has no real backend environments, so all six files carry
identical values today - what's proven is the mechanism, not environment
differentiation itself (that arrives with a real, multi-environment app).

## Why a custom loader exists at all

Maestro has no native `.env` file support - confirmed by reading the current
official CLI docs (2026-07-14). It does auto-import shell variables prefixed
`MAESTRO_` and supports `${VAR}` interpolation with JS-style fallbacks
(`${USERNAME || "default"}`) inside flow YAML, but nothing reads a file. This
is the one genuinely load-bearing piece of custom tooling in `tools/` rather
than a re-implementation of something Maestro already does.

## How it works

`tools/src/env/load-env.ts`:
1. Reads `config/environments/.env.<target>` if it exists, else falls back
   to the committed `.env.<target>.example` (with a `WARN`-level log line) -
   so a fresh clone runs immediately without any local setup.
2. Parses it with `dotenv.parse`.
3. Layers any explicit `overrides` (used for CI-injected secrets) on top.

`tools/src/cli/run-smoke.ts` then translates the resolved map into
`maestro test -e KEY=value` flags. Confirmed empirically (2026-07-14): a CLI
`-e` flag overrides a flow file's own `env:` header default - so
`SEARCH_QUERY` in `.env.local` genuinely controls what `${QUERY}` resolves to
inside `.maestro/flows/features/search/*.yaml`, not just in theory.

## Secrets

Never commit a real `.env.<target>` file (enforced by `.gitignore`) and
never hardcode a credential-looking literal inside a flow - the
`no-hardcoded-secrets` lint rule (`docs/SelectorStrategy.md`) fails CI on
any `password`/`apiKey`/`secret`/`token` key whose value isn't a `${VAR}`
reference.

## `production-safe` tag gating

The org-wide tagging convention includes `production-safe` for flows
allowed to run against the production environment. Phase 1's two Android
scenarios are both tagged `production-safe` since they are read-only
(search, no state mutation). Enforcing this as a CI gate - rejecting a
`maestro test` invocation against `.env.production` unless every selected
flow carries `production-safe` - is tracked as Phase 2 work once a second,
mutating flow exists to make the gate meaningful to test.
