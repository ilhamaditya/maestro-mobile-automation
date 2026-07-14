# Sub-Flows

Generic, app-agnostic technical interactions. These exist to be `runFlow`'d
from Reusable Flows or from a feature flow's `onFlowStart`/`onFlowComplete`
hooks - never invoked directly by `maestro test` (see `.maestro/config.yaml`,
which only globs `flows/features/**`).

## Built (Phase 1)

| File | Purpose | Verified against |
|---|---|---|
| `complete-onboarding-android.yaml` | Clears app state and dismisses Wikipedia-Android's 4-screen first-run carousel. | Live Android Emulator, 2026-07-14 |
| `complete-onboarding-ios.yaml` | Clears app state and dismisses Wikipedia-iOS's swipeable first-run carousel, plus two `when: visible`-guarded dismissals for non-deterministic promo/auth overlays. | iPhone 15 / iOS 17.2 Simulator, 2026-07-14 |
| `take-screenshot.yaml` | Named capture point, invoked from every feature flow's `onFlowComplete`. | Both platforms |
| `dismiss-keyboard.yaml` | Wraps native `hideKeyboard` behind a semantic name. | Android |

## Documented, not yet built (Phase 2+)

These are real, valuable, generic sub-flows that this Phase 1 slice has no
grounded need for - the placeholder app never surfaces them, and building a
flow against a selector nobody has verified would violate this platform's
"never guess" rule. Build the real thing once a business flow actually
exercises the interaction.

| Intended file | Purpose |
|---|---|
| `open-menu.yaml` | Open a hamburger/drawer menu. |
| `close-popup.yaml` | Dismiss a generic blocking popup that isn't already covered by a Common Component. |
| `accept-permission-dialog.yaml` | Accept an OS-level runtime permission prompt (camera, location, notifications). Not exercised by Wikipedia's search flow - confirmed no permission prompt appears on first launch in this app (2026-07-14). |
| `handle-biometric-prompt.yaml` | Confirm/cancel a Face ID / fingerprint prompt. |
| `handle-otp.yaml` | Read and enter a one-time-passcode, typically via a test-only backdoor endpoint or SMS relay. |
| `scroll-to-element.yaml` | Scroll a container until a target element is visible, wrapping `scrollUntilVisible`. |
| `logout.yaml` | Reset the app to a logged-out state at the end of a run. Requires an authenticated business flow to exist first - out of scope until a real target application with a deterministic (non-live-account) login is onboarded. See `docs/GettingStarted.md`. |

When you build one of these for real, move its row out of this table and
into the "Built" table above with the same evidence discipline (what you
verified it against, and when).
