# FAQ

**Q: What's the difference between a scenario, a flow, and a helper?**
A scenario is what you run (selector-free, plain language). A flow is one
business capability's implementation (selectors live here). A helper is a
generic building block shared across capabilities. See
`docs/Architecture.md`.

**Q: Where do I put a new test?**
`.maestro/scenarios/<capability>/`. See `docs/WritingTests.md`.

**Q: I need a new selector/interaction that doesn't exist yet. Where does
it go?**
`.maestro/flows/<capability>/` if it's specific to one capability,
`.maestro/helpers/` if it's generic or a reusable UI pattern. See
`docs/CreatingFlows.md`.

**Q: Why can't I just write `tapOn`/`assertVisible` directly in my
scenario file?**
`npm run lint` will fail the build - scenarios are structurally
selector-free by design, enforced by `scripts/src/lint/check-flow-conventions.ts`
and by `.maestro/config.yaml` only executing `scenarios/**`. See
`docs/Architecture.md` for why.

**Q: Why does every flow file need its own `appId`?**
Maestro requires a non-null `appId` in every flow file's config section,
even ones only ever invoked via `runFlow` - a file with no `appId` fails to
parse. See `docs/CreatingFlows.md`.

**Q: How do I run against a different environment (qa, staging, etc.)?**
There's one `config/.env` file - this template deliberately doesn't ship
multi-environment support, because the placeholder app has no backend
environments to switch between. To add it, reintroduce per-target files and
an `--env <target>` flag in `scripts/src/cli/run-smoke.ts`; the `-e` flag
translation in `toMaestroArgs` already works regardless of file count. See
`config/README.md`.

**Q: Why is this using a Wikipedia app instead of our real app?**
No real target application exists for this template yet. Wikipedia is
Maestro's own official public sample app, so the architecture, CI, and
conventions can be proven end to end against something real and stable
rather than described in the abstract. See the root `README.md` and
`docs/GettingStarted.md`, "Swapping in a real application."

**Q: Why isn't there a Gherkin/`.feature` file per scenario?**
There used to be one; it was removed. See `docs/Architecture.md`, "Why no
Gherkin layer."

**Q: Can I run tests in Docker?**
The `Dockerfile` builds a reproducible tooling image (Node + Java + Maestro
CLI + `adb`), validated in CI as a build-sanity check only - it doesn't
execute tests, because iOS Simulator can't run in Linux containers at all
and Android-in-Docker has a known Maestro device-detection flakiness issue.
See `docs/CI.md`.

**Q: My flow works locally but fails in CI. What's different?**
CI always boots a fresh emulator/simulator with no prior state, and always
passes an explicit `--debug-output`/`--device`. If it's platform-specific,
check `docs/Troubleshooting.md` first - the known iOS flakiness is
documented there, not something you broke.

**Q: How do I know if my new flow is "good enough" to merge?**
`docs/CodeReviewChecklist.md` and `docs/QA-Checklist.md`.
