# Environment Configuration

One `.env.<target>` file per environment: `local`, `dev`, `qa`, `uat`,
`staging`, `production`. Only `.example` variants are committed - real files
are gitignored (see root `.gitignore`) and populated locally or injected as
CI secrets. Never commit real credentials.

`scripts/src/env/load-env.ts` reads `config/.env.<target>` (falling back to
the checked-in `.example` file when a real one doesn't exist locally, so a
fresh clone runs out of the box against the placeholder app) and turns it
into `maestro test -e KEY=value` arguments - this fills a real gap, since
Maestro has no native `.env` file support (see `docs/RunningTests.md`).

## Why all six files carry the same values today

The placeholder app (Wikipedia) is a single public app with no backend
environments to switch between - there is no real "qa vs staging"
distinction to exercise yet. All six files currently carry the same values
for `APP_ID_ANDROID`/`APP_ID_IOS`/`SEARCH_QUERY`. What's proven is the
*mechanism* (the loader, the six-target model, the `-e` flag translation) end
to end, so that onboarding a real multi-environment application later is a
matter of filling in per-target values, not building new plumbing.
