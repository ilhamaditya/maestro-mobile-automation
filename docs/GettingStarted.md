# Getting Started

New here? This is the map. Three steps, in order:

1. **[Installation.md](Installation.md)** - install Maestro, Node, and a
   device/emulator. ~10 minutes if you already have Android Studio or Xcode.
2. **[RunningTests.md](RunningTests.md)** - run the two existing example
   scenarios and see them pass.
3. **[WritingTests.md](WritingTests.md)** - write your first new scenario.

That's the full path from clone to your first green test. If something
breaks along the way, check **[Troubleshooting.md](Troubleshooting.md)**
before assuming you did something wrong - a few known issues (especially on
iOS) are already diagnosed there.

## The one-paragraph version

This repo is a Maestro mobile test automation starter template. Tests
("scenarios") live in `.maestro/scenarios/`, are selector-free, and compose
reusable `flows/` and `helpers/` via `runFlow`. Everything is proven end to
end against a public placeholder app (Wikipedia) - see the root `README.md`
for why, and `docs/Architecture.md` for the full reasoning behind every
structural decision.

## Swapping in a real application

Once you're ready to point this template at your own app instead of the
Wikipedia placeholder:

1. Replace `scripts/src/apps/fetch-sample-apps.ts` with your app's real
   build/download process.
2. Update `appId` in every `.maestro/**/*.yaml` file.
3. Update `APP_ID_ANDROID`/`APP_ID_IOS` in `config/.env` (and
   `config/.env.example`, which is the committed default).
4. Rewrite `.maestro/helpers/complete-onboarding-{android,ios}.yaml` and
   everything under `.maestro/flows/search/` - these are Wikipedia-specific
   and won't apply to a different app.
5. Follow the same verify-against-a-live-device discipline used throughout
   `.maestro/` (see the file-level comments for what "verified" looks like
   in practice - a real device/simulator run, cited with what and when)
   rather than guessing selectors from a design mockup.
