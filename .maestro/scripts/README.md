# Maestro-native Scripts

`runScript`/`evalScript` execute inside Maestro's own embedded JS engine
(Rhino, or GraalJS via `jsEngine: graaljs` in a flow's config header) - this
is a separate runtime from the Node/TypeScript tooling in `tools/`. Scripts
here cannot `require`/`import` npm packages; they can only use plain
JS and the `output`/`maestro` globals Maestro provides.

**Status:** no script is needed for the Phase 1 Search vertical slice - its
query value is a static, deterministic string declared directly in each
feature flow's `env` block, which is simpler than a script for a single
fixed value. Add a script here (e.g. `generate-search-query.js`) if a future
flow needs data generated at run time (unique values, computed dates) rather
than known ahead of time. See Maestro's own
[`getSearchQuery.js`](https://github.com/mobile-dev-inc/Maestro/blob/main/e2e/workspaces/wikipedia/scripts/getSearchQuery.js)
for the canonical shape of a minimal script.
