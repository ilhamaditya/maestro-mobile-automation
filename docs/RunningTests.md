# Running Tests

## What

```bash
cd scripts
npm run fetch:apps      # downloads the placeholder app once
npm run smoke:android    # or smoke:ios
```

That's the whole command surface for running tests locally.

## How: step by step

**1. Fetch the placeholder app** (once - it's gitignored, never committed):

```bash
cd scripts
npm run fetch:apps
```

Downloads `apps/android/build/wikipedia.apk` and
`apps/ios/build/Wikipedia.app`.

**2. Boot a device:**

```bash
# Android
emulator -avd <your-avd-name>

# iOS (macOS only)
xcrun simctl boot "<simulator name or UDID>"
```

**3. Install the app and run:**

```bash
adb install -r apps/android/build/wikipedia.apk         # Android
xcrun simctl install booted apps/ios/build/Wikipedia.app  # iOS

npm run smoke:android
npm run smoke:ios
```

`scripts/src/cli/run-smoke.ts` auto-discovers the first connected
device/booted simulator and passes it explicitly via `--device` - Maestro
does not reliably auto-select by platform when multiple devices are
connected (confirmed empirically). If you have both an emulator and a
simulator running at once, only one platform's `smoke:*` command will find
the right device; the other will need the other one stopped first.

## Reading the results

- **JUnit report:** `test-output/<platform>/report.xml`
- **Native Maestro debug output** (screenshots, view hierarchy, logs):
  `test-output/<platform>/debug/`
- **Combined summary:** `npm run report:aggregate` regenerates
  `test-output/summary.json` across both platforms.

## Running against a specific environment

```bash
cd scripts
npx tsx src/cli/run-smoke.ts --platform android --tags smoke --env qa
```

`--env` selects which `config/.env.<target>` file to load (`local`, `dev`,
`qa`, `uat`, `staging`, `production` - see `config/README.md`). If no local
`.env.<target>` file exists, the loader falls back to the committed
`.env.<target>.example` with a warning, so this always works on a fresh
clone.

## Running a subset by tag

```bash
npx tsx src/cli/run-smoke.ts --platform android --tags critical
```

Tag convention: `smoke`, `sanity`, `regression`, `critical`,
`production-safe`, `pipeline-check`, `wip` (excluded by default - see
`.maestro/config.yaml`). Add `--include-tags wip` to run in-progress flows
while iterating on them locally.

## Next

`docs/WritingTests.md` - write your first new scenario.
