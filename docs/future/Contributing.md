# Contributing

**Status:** TODO - Phase 2.

Covers the PR process, code owners per layer/team, and the review checklist
for new flows once more than one team is contributing. Until then: run
`npm run typecheck && npm test && npm run lint` from `tools/` before opening
a PR (this is exactly what the `lint` CI job runs - see `docs/CI-CD.md`),
and follow the verification discipline demonstrated throughout
`.maestro/flows/` (verify against a live emulator/simulator, cite what and
when) rather than guessing selectors or behavior.
