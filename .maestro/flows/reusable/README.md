# Reusable Flows

One business capability per folder (e.g. `search/`). Each file has a single
responsibility, takes its inputs via `env`, and is composed via `runFlow`
from Layer-1 feature flows. Selectors are allowed at this layer - feature
flows above must stay selector-free (enforced by
`tools/src/lint/check-flow-conventions.ts`).

## Extension point

Add a new folder per business capability as the platform grows (e.g.
`reusable/saved-articles/`, `reusable/language-settings/`). Keep each
capability's files scoped to that folder rather than growing a monolithic
shared file - this is what keeps reuse composable instead of coupled.
