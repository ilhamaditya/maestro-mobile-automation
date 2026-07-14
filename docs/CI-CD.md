# CI/CD

## Workflow: `.github/workflows/smoke.yml`

Four jobs, run on every push and pull request:

1. **`lint`** (`ubuntu-latest`) - `npm ci`, `npm run typecheck`, `npm run lint`
   (all three convention checks), `npm test`. Gates everything below.
2. **`android-smoke`** (`ubuntu-latest`, needs `lint`) - installs Maestro,
   fetches the sample app, boots an emulator via
   `reactivecircus/android-emulator-runner` (native KVM access on the
   runner), installs the APK, runs `npm run smoke:android`, uploads
   `test-output/` as an artifact (`if: always()`, so failures still produce
   evidence).
3. **`ios-smoke`** (`macos-14`, needs `lint`) - installs Maestro, fetches the
   sample app, boots a Simulator natively (GitHub-hosted macOS runners ship
   Xcode + Simulator - this is not nested virtualization, unlike Android's
   KVM requirement), installs the app, runs `npm run smoke:ios`, uploads
   artifacts.
4. **`docker-build-check`** (`ubuntu-latest`, needs `lint`) - `docker build`
   sanity check only. See "Docker's role" below for why it doesn't run tests.

## Why every job explicitly discovers and passes a device id

Confirmed empirically (2026-07-14): `maestro --platform ios test ...` does
**not** reliably select a booted iOS Simulator when an Android emulator is
also connected - it picked the Android device anyway. `run-smoke.ts`
therefore always explicitly discovers the device (`adb devices` /
`xcrun simctl list devices booted`) and passes `--device <id>` rather than
relying on `--platform` auto-selection. This matters in CI as much as
locally, since a self-hosted runner could plausibly have both an Android and
iOS toolchain available simultaneously in the future.

## Docker's role (deliberately not test execution)

Android-in-Docker requires `--privileged` + `/dev/kvm` and has a
Maestro-specific device-detection flakiness issue (`adb devices` sees the
emulator, `maestro test` doesn't - a known upstream issue). iOS Simulator
cannot run in a Linux container at all - Xcode/Simulator is macOS-only, with
no workaround. `docker-build-check` therefore only validates that the image
builds; the smoke jobs run natively on the GitHub-hosted runners, which
already have the right native access. See `docs/future/DockerGuide.md`.

## Adding a new tag to a CI job

Edit the `--tags`/`--include-tags` value in the relevant workflow step (or
`tools/src/cli/run-smoke.ts`'s default `["smoke"]`), following the org-wide
tagging convention (`@smoke`, `@sanity`, `@regression`, `@critical`,
`@android`, `@ios`, `@production-safe`, etc. - written without the `@` in
Maestro's own `tags:` YAML field).

## Maestro Cloud (not wired up)

`maestro cloud` / the official `mobile-dev-inc/action-maestro-cloud` GitHub
Action is Maestro's own hosted device-farm offering. It is documented here
for accuracy but intentionally not configured - Phase 1 targets local
emulator/simulator execution only (see the plan that produced this repo).
Revisit once cloud device-farm scaling is actually needed.
