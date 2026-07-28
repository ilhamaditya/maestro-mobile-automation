# iOS Sample App

**Placeholder app:** the Wikipedia iOS app (`org.wikimedia.wikipedia`),
bundled inside the same official Maestro sample archive as the Android app -
`samples.zip` contains a pre-built `Wikipedia.app` Simulator bundle
(universal `x86_64`/`arm64`, `MinimumOSVersion: 16.6`), so no Xcode build
from source is required.

- Source: `https://storage.googleapis.com/mobile.dev/samples/samples.zip`
  (`wikipedia.zip` inside it, `Wikipedia.app` inside that)
- Fetched by `scripts/src/apps/fetch-sample-apps.ts` into
  `apps/ios/build/Wikipedia.app` (gitignored - never commit binaries)
- Run `npm run fetch:apps` from `scripts/` to download it

## Known limitation (verified, not assumed)

Onboarding and reaching the home screen are 100% reliable (3/3 consecutive
runs against iPhone 15 / iOS 17.2 Simulator, 2026-07-14). Opening the search
overlay and asserting on either its static text or the typed query was
reproducibly flaky (2/2 failed) even though the content was visibly present
in screenshots - see `docs/Troubleshooting.md` and the comment in
`.maestro/scenarios/search/ios-pipeline-smoke.yaml` for the full
reproduction notes. The iOS scenario therefore stops at the home screen;
full iOS Search parity with Android is a tracked follow-up.

## Swapping in a real application

Replace this folder's fetch logic with your real app's build/download
process, then update:
- `appId` in every iOS-tagged `.maestro/{scenarios,flows,helpers}/**/*.yaml`
  file (currently `org.wikimedia.wikipedia`)
- `APP_ID_IOS` in `config/.env.*`
- `.maestro/helpers/complete-onboarding-ios.yaml`, which is specific to
  Wikipedia's first-run carousel

See `docs/GettingStarted.md` for the full walkthrough.
