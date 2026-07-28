# CI

## What: `.github/workflows/smoke.yml`

Four jobs, run on every push and pull request:

1. **`lint`** (`ubuntu-latest`) - `npm ci`, `npm run typecheck`,
   `npm run lint` (both convention checks), `npm test`. Gates everything
   below.
2. **`android-smoke`** (`ubuntu-latest`, needs `lint`) - installs Maestro,
   fetches the sample app, boots an emulator via
   `reactivecircus/android-emulator-runner` (native KVM access on the
   runner), installs the APK, runs `npm run smoke:android`, uploads
   `test-output/` as an artifact (`if: always()`, so failures still produce
   evidence).
3. **`ios-smoke`** (`macos-14`, needs `lint`) - installs Maestro, fetches
   the sample app, boots a Simulator natively (GitHub-hosted macOS runners
   ship Xcode + Simulator - not nested virtualization, unlike Android's KVM
   requirement), installs the app, runs `npm run smoke:ios`, uploads
   artifacts.
4. **`docker-build-check`** (`ubuntu-latest`, needs `lint`) - `docker build`
   sanity check only. See "Why Docker doesn't run tests" below.

## Why every job explicitly discovers and passes a device id

Confirmed empirically: `maestro --platform ios test ...` does **not**
reliably select a booted iOS Simulator when an Android emulator is also
connected - it picked the Android device anyway. `run-smoke.ts` therefore
always explicitly discovers the device (`adb devices` /
`xcrun simctl list devices booted`) and passes `--device <id>` rather than
relying on `--platform` auto-selection. This matters as much in CI as
locally, since a self-hosted runner could plausibly have both toolchains
available at once in the future.

## Why Docker doesn't run tests

Android-in-Docker requires `--privileged` + `/dev/kvm` and has a
Maestro-specific device-detection flakiness issue (`adb devices` sees the
emulator, `maestro test` doesn't - a known upstream issue). iOS Simulator
cannot run in a Linux container at all - Xcode/Simulator is macOS-only, no
workaround. `docker-build-check` therefore only validates that the image
builds; the smoke jobs run natively on GitHub-hosted runners, which already
have the right native access.

## Adding a new tag to a CI job

Edit the `--tags`/`--include-tags` value in the relevant workflow step (or
`scripts/src/cli/run-smoke.ts`'s default `["smoke"]`), following the
org-wide tagging convention (see `docs/RunningTests.md`).

## Maestro Cloud (not wired up)

`maestro cloud` / the official `mobile-dev-inc/action-maestro-cloud` GitHub
Action is Maestro's own hosted device-farm offering. Documented here for
accuracy but intentionally not configured - this template targets local
emulator/simulator execution only. Straightforward to add later if
cloud device-farm scaling is actually needed.
