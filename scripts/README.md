# scripts/

Node/TypeScript orchestration layer. Deliberately outside `.maestro/` -
Maestro's own `runScript`/`evalScript` execute inside an embedded JVM JS
engine (Rhino/GraalJS) that cannot `require` npm packages, so anything
needing real dependencies (env loading, data factories, HTTP downloads,
YAML parsing for lint) lives here instead and orchestrates the `maestro`
CLI as a subprocess.

## Layout

| Path | Purpose |
|---|---|
| `src/env/` | Loads `config/.env.<target>`, the one genuine gap in Maestro's own CLI (no native `.env` support). |
| `src/data/factories/` | Resolves `data/*.json` into values flows consume via `-e` flags. |
| `src/apps/` | Fetches and checksums the placeholder sample apps. |
| `src/reporting/` | Aggregates native Maestro JUnit output across platforms into one summary. |
| `src/cli/` | `run-smoke.ts` - the thin orchestrator that ties env + data + device discovery + `maestro test` + reporting together. |
| `src/lint/` | Enforces this repo's conventions as CI gates, not just documentation - see `docs/BestPractices.md` and the individual scripts. |
| `src/utils/` | Shared path resolution and a leveled logger. |

## Commands

```bash
npm install
npm run typecheck        # tsc --noEmit
npm test                 # vitest run
npm run lint              # both convention checks (flow conventions + naming)
npm run fetch:apps        # download the placeholder apps
npm run smoke:android      # run the Android smoke suite end to end
npm run smoke:ios          # run the iOS pipeline-smoke flow end to end
npm run report:aggregate  # regenerate test-output/summary.json
```

See `docs/GettingStarted.md` for the full local setup walkthrough and
`docs/CI.md` for how these same commands run in GitHub Actions.
