# iOS Sample App

**Phase 1 placeholder:** the Wikipedia iOS app (`org.wikimedia.wikipedia`),
bundled inside the same official Maestro sample archive as the Android app -
`samples.zip` contains a pre-built `Wikipedia.app` Simulator bundle
(universal `x86_64`/`arm64`, `MinimumOSVersion: 16.6`), so no Xcode build
from source is required.

- Source: `https://storage.googleapis.com/mobile.dev/samples/samples.zip`
  (`wikipedia.zip` inside it, `Wikipedia.app` inside that)
- Fetched by `tools/src/apps/fetch-sample-apps.ts` into
  `apps/ios/build/Wikipedia.app` (gitignored - never commit binaries)
- Run `npm run fetch:apps` from `tools/` to download it

## Known Phase 1 limitation (verified, not assumed)

Onboarding and reaching the home screen are 100% reliable (3/3 consecutive
runs against iPhone 15 / iOS 17.2 Simulator, 2026-07-14). Opening the search
overlay and asserting on either its static text or the typed query was
reproducibly flaky (2/2 failed) even though the content was visibly present
in screenshots - see the comment in
`.maestro/flows/features/search/ios-pipeline-smoke.yaml` for the full
reproduction notes. Phase 1's iOS flow therefore stops at the home screen;
full iOS Search parity with Android is tracked as Phase 2 work (see
`docs/future/DebuggingGuide.md`).

## Swapping in a real application

Replace this folder's fetch logic with your real app's build/download
process, then update:
- `appId` in every iOS-tagged `.maestro/flows/**/*.yaml` file (currently
  `org.wikimedia.wikipedia`)
- `APP_ID_IOS` in `config/environments/.env.*`
- `.maestro/flows/sub-flows/complete-onboarding-ios.yaml`, which is specific
  to Wikipedia's first-run carousel

See `docs/GettingStarted.md` for the full walkthrough.
