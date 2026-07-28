# Android Sample App

**Placeholder app:** the Wikipedia Android app (`org.wikipedia`), bundled
inside Maestro's own official sample archive.

- Source: `https://storage.googleapis.com/mobile.dev/samples/samples.zip`
  (this is what `maestro download-samples` itself fetches - confirmed by
  reading `DownloadSamplesCommand.kt` in the `mobile-dev-inc/Maestro`
  repository, 2026-07-14)
- Fetched and checksummed by `scripts/src/apps/fetch-sample-apps.ts` into
  `apps/android/build/wikipedia.apk` (gitignored - never commit binaries)
- Run `npm run fetch:apps` from `scripts/` to download it

## Swapping in a real application

Replace this folder's fetch logic with your real APK's build/download
process, then update:
- `appId` in every `.maestro/{scenarios,flows,helpers}/**/*.yaml` file
  (currently `org.wikipedia`)
- `APP_ID_ANDROID` in `config/.env.*`
- The onboarding helper's selectors
  (`.maestro/helpers/complete-onboarding-android.yaml`) are specific to
  Wikipedia's first-run carousel and will not apply to a different app

See `docs/GettingStarted.md` for the full walkthrough.
