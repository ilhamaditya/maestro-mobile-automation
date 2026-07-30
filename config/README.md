# Environment Configuration

One file: `config/.env`. Only `.env.example` is committed - the real `.env`
is gitignored (see root `.gitignore`) and populated locally or injected as a
CI secret. Never commit real credentials.

`scripts/src/env/load-env.ts` reads `config/.env` (falling back to the
checked-in `.env.example` when no real file exists, so a fresh clone runs out
of the box against the placeholder app) and turns it into
`maestro test -e KEY=value` arguments - this fills a real gap, since Maestro
has no native `.env` file support (see `docs/RunningTests.md`).

## Setup

```bash
cp config/.env.example config/.env   # then edit as needed
```

Skipping this is fine: the loader falls back to `.env.example` and logs a
warning.

## Why one file

The placeholder app (Wikipedia) is a single public app with no backend
environments to switch between - there is no real "qa vs staging" distinction
to exercise. Carrying six identical `.env.<target>` files was ceremony
without payoff, so this template keeps one.

Onboarding a real multi-environment application means reintroducing per-target
files and a `--env <target>` flag in `scripts/src/cli/run-smoke.ts`. The part
that would have been genuinely fiddly - translating a parsed file into
Maestro's repeated `-e` flags - already exists in `toMaestroArgs`, and is
independent of how many files there are.
