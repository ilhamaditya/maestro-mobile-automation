# Getting Started

## Prerequisites

- [Maestro CLI](https://docs.maestro.dev) (this repo was built and verified
  against `1.39.7`)
- Node.js 20+ (see `.nvmrc`)
- Android SDK with `adb` and at least one AVD, for Android runs
- Xcode with at least one Simulator runtime, for iOS runs (macOS only)

## 1. Install tooling dependencies

```bash
cd tools
npm install
```

## 2. Fetch the Phase 1 placeholder app

This platform has no real target application yet (see `README.md`). Phase 1
proves the architecture against Maestro's own official Wikipedia sample app:

```bash
npm run fetch:apps
```

This downloads `apps/android/build/wikipedia.apk` and
`apps/ios/build/Wikipedia.app` (both gitignored - never commit binaries).

## 3. Boot a device

```bash
# Android
emulator -avd <your-avd-name>

# iOS (macOS only)
xcrun simctl boot "<simulator name or UDID>"
```

`tools/src/cli/run-smoke.ts` auto-discovers the first connected
device/booted simulator - see `docs/CI-CD.md` for why an explicit `--device`
is required (Maestro does not reliably auto-select by platform when
multiple devices are connected, confirmed 2026-07-14).

## 4. Install the app and run the smoke suite

```bash
adb install -r apps/android/build/wikipedia.apk        # Android
xcrun simctl install booted apps/ios/build/Wikipedia.app # iOS

npm run smoke:android
npm run smoke:ios
```

Reports land in `test-output/<platform>/report.xml` (JUnit) and
`test-output/<platform>/debug/` (Maestro's native screenshots, view
hierarchy, and logs - see `docs/CI-CD.md` for why no custom capture pipeline
was built). `npm run report:aggregate` regenerates `test-output/summary.json`.

## Known iOS limitation (verified, not assumed)

Android has full Search parity: typing a query and asserting it's visible is
100% reliable. On iOS, reaching the home screen after onboarding is equally
reliable (3/3 consecutive runs against iPhone 15 / iOS 17.2 Simulator), but
opening the search overlay and asserting on its content was reproducibly
flaky (2/2 runs failed even though the text was visibly present in
screenshots - suspected WebDriverAgent/accessibility-tree timing issue).
`.maestro/flows/features/search/ios-pipeline-smoke.yaml` therefore proves the
CI pipeline mechanically works on iOS without asserting on the flaky
interaction. Full parity is tracked in `docs/future/DebuggingGuide.md`.

## Swapping in a real application

1. Replace `tools/src/apps/fetch-sample-apps.ts` with your app's real
   build/download process.
2. Update `appId` in every `.maestro/flows/**/*.yaml` file.
3. Update `APP_ID_ANDROID`/`APP_ID_IOS` in `config/environments/.env.*`.
4. Rewrite `.maestro/flows/sub-flows/complete-onboarding-{android,ios}.yaml`
   and everything under `.maestro/flows/reusable/search/` - these are
   Wikipedia-specific and will not apply to a different app.
5. Follow the same verify-against-a-live-device discipline used to build
   this slice (see the file-level comments throughout `.maestro/flows/` for
   what "verified" looks like in practice) rather than guessing selectors
   from a design mockup.
