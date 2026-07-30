# Troubleshooting

## "No connected Android device/emulator found" / "No booted iOS Simulator found"

`scripts/src/cli/run-smoke.ts` explicitly discovers a device rather than
relying on Maestro's own `--platform` auto-selection - confirmed
empirically that `maestro --platform ios test ...` does **not** reliably
pick a booted iOS Simulator when an Android emulator is also connected (it
picked the Android device anyway). Boot the device/simulator you want
*before* running `npm run smoke:*` (see `docs/RunningTests.md`), and if
both an emulator and a simulator are running, be aware only one platform's
command will find the right one - stop the other if you get an unexpected
match.

## "No local config/.env found - falling back to the committed .env.example"

This is a warning, not an error - `scripts/src/env/load-env.ts` falls back
to the checked-in `config/.env.example` so a fresh clone runs without any
local setup. Run `cp config/.env.example config/.env` if you need to
override a value locally; the real `.env` is gitignored.

## Changing `SEARCH_QUERY` in `config/.env` has no effect

**Known limitation of Maestro 1.39.7, verified on a live emulator
(2026-07-30).** A flow-level `env:` value *shadows* the CLI `-e` flag - it is
not an overridable default, which is the opposite of what you'd expect.

Reproduction:

```bash
# Flow that declares `env: MYVAR: "from-flow-env"`
maestro test flow.yaml -e MYVAR=from-cli
#   -> assertTrue ${MYVAR == "from-cli"} FAILS (flow value won)

# Same flow with the `env:` block removed
maestro test flow.yaml -e MYVAR=from-cli
#   -> passes (so `-e` itself works fine)
```

Both Search scenarios declare `QUERY` in their own `env:` block, so the
`-e QUERY=...` that `run-smoke.ts` builds from `config/.env` is silently
ignored. Confirmed end to end: passing `-e QUERY=Automation testing` still
typed "Software testing" into the app.

**To change the query today,** edit the scenario's `env:` block. Removing
`QUERY` from the two scenarios would make `config/.env` authoritative, at the
cost of an undefined variable if a scenario is ever run without `-e`.

## `assertNotVisible: ${QUERY}` in the clearing scenario intermittently fails

`.maestro/flows/search/assert-search-empty-state.yaml` asserts the previous
query is gone after clearing. Wikipedia persists *recent searches*, so once
the same query has been run enough times, it can reappear in the empty
state's history list inside the assertion's retry window and fail with
`Assertion is false: "<query>" is visible`.

Observed 2026-07-30: the same scenario passed twice, then failed on a third
identical run with no code change. Clearing app data
(`adb shell pm clear org.wikipedia`) resets the history and the scenario
passes again. A durable fix would assert on the search *field* being empty
rather than on the query string being absent from the whole screen.

## `npm run lint` fails

Read the violation's `rule` name and `detail` - both point at the specific
line and the doc explaining why (`docs/BestPractices.md` for selector
rules, `docs/WritingTests.md`/`docs/CreatingFlows.md` for naming/structure
rules). Common ones:

- `scenario-layer-selector-free` - a file under `.maestro/scenarios/`
  contains something other than `runFlow`/`tags`/lifecycle hooks. Move the
  selector into a `flows/` file instead.
- `no-raw-sleep` / `no-xpath` / `no-coordinate-taps` / `no-unguarded-index`
  / `no-hardcoded-secrets` - see `docs/BestPractices.md` for the fix.
- `kebab-case` / `business-capability-name` - rename the file (see
  `docs/WritingTests.md`).

## iOS Search assertion is flaky / missing

**Known, documented limitation, not a bug you introduced.** Onboarding and
reaching the home screen are 100% reliable on iOS (3/3 consecutive runs
against iPhone 15 / iOS 17.2 Simulator). Opening the search overlay and
asserting on either its static text or the typed query was reproducibly
flaky - 2 of 2 runs failed even though the text was visibly present in
screenshots (suspected WebDriverAgent/accessibility-tree timing issue,
possibly interacting with the "Add languages" coach-mark overlay).
`.maestro/scenarios/search/ios-pipeline-smoke.yaml` therefore proves the CI
pipeline mechanically works on iOS without asserting on the flaky
interaction, rather than shipping a flaky assertion as this template's
flagship iOS example.

If you're picking this up: try a newer Maestro CLI version, an
`extendedWaitUntil` before asserting, or dismissing the coach-mark
explicitly first. See `.maestro/scenarios/search/ios-pipeline-smoke.yaml`'s
file comment for the full reproduction notes.

## Docker build works but tests don't run in the container

Deliberate. iOS Simulator cannot run in a Linux container under any
configuration (Xcode is macOS-only). Android-in-Docker requires
`--privileged` + `/dev/kvm` and has a known Maestro-specific
device-detection flakiness issue. `docker-build-check` in CI therefore only
validates that the image builds; the real smoke jobs run natively on
GitHub-hosted runners, which already have the right native access. See
`docs/CI.md`.

## A stray `.png` file appeared in `.maestro/`

`takeScreenshot` writes relative to the CLI's own working directory. If you
run `maestro test` manually from inside `.maestro/` instead of through
`npm run smoke:*`, screenshots land there instead of in `test-output/`.
Harmless and gitignored (`.maestro/*.png`) - delete it or just ignore it.

## Still stuck?

Check `docs/FAQ.md`, then the relevant guide linked from `docs/GettingStarted.md`.
