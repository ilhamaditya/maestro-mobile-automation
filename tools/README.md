# tools/

Node/TypeScript orchestration layer. This is deliberately outside
`.maestro/` - Maestro's own `runScript`/`evalScript` execute inside an
embedded JVM JS engine (Rhino/GraalJS) that cannot `require` npm packages,
so anything needing real dependencies (env loading, data factories, HTTP
downloads, YAML parsing for lint) lives here instead and orchestrates the
`maestro` CLI as a subprocess. See `.maestro/scripts/README.md` for the
boundary from the other side.

## Layout

| Path | Purpose |
|---|---|
| `src/env/` | Loads `config/environments/.env.<target>`, the one genuine gap in Maestro's own CLI (no native `.env` support). |
| `src/data/factories/` | Resolves `test-data/fixtures/*.json` into values flows consume via `-e` flags. |
| `src/apps/` | Fetches and checksums the Phase 1 placeholder sample apps. |
| `src/reporting/` | Aggregates native Maestro JUnit output across platforms into one summary. |
| `src/cli/` | `run-smoke.ts` - the thin orchestrator that ties env + data + device discovery + `maestro test` + reporting together. |
| `src/lint/` | Enforces this platform's conventions as CI gates, not just documentation - see `docs/BestPractices.md` (Phase 2) and the individual scripts. |
| `src/utils/` | Shared path resolution and a leveled logger. |

## Commands

```bash
npm install
npm run typecheck        # tsc --noEmit
npm test                 # vitest run
npm run lint              # all three convention checks
npm run fetch:apps        # download the Phase 1 placeholder apps
npm run smoke:android      # run the Android smoke suite end to end
npm run smoke:ios          # run the iOS pipeline-smoke flow end to end
npm run report:aggregate  # regenerate test-output/summary.json
```

See `docs/GettingStarted.md` for the full local setup walkthrough and
`docs/CI-CD.md` for how these same commands run in GitHub Actions.
