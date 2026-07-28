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

## "No local .env.\<target\> found - falling back to the committed .example"

This is a warning, not an error - `scripts/src/env/load-env.ts` falls back
to the checked-in `.env.<target>.example` file so a fresh clone runs
without any local setup. Copy the example to a real `.env.<target>` file in
`config/` if you need to override a value locally; it's gitignored.

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
