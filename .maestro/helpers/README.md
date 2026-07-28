# Helpers

Generic, reusable building blocks - app-agnostic technical interactions
(dismiss the keyboard, complete onboarding) and reusable UI-pattern
interactions (a bottom nav, a dialog) alike. They exist to be `runFlow`'d
from a flow, or from a scenario's `onFlowStart`/`onFlowComplete` hooks -
never invoked directly by `maestro test` (`.maestro/config.yaml` only globs
`scenarios/**`).

## When to add one

Extract a helper when the interaction is (a) generic/app-agnostic or a
reusable UI pattern, and (b) used by more than one flow, or invoked from a
lifecycle hook. Keep it inline in a flow when it's a single,
capability-specific step used exactly once. Never extract speculatively -
every helper in this repo was built because a real flow needed it, verified
against a live device. See `docs/CreatingFlows.md`.

## Built

| File | Purpose | Verified against |
|---|---|---|
| `complete-onboarding-android.yaml` | Clears app state and dismisses Wikipedia-Android's 4-screen first-run carousel. | Live Android Emulator, 2026-07-14 |
| `complete-onboarding-ios.yaml` | Clears app state and dismisses Wikipedia-iOS's swipeable first-run carousel, plus two `when: visible`-guarded dismissals for non-deterministic promo/auth overlays. | iPhone 15 / iOS 17.2 Simulator, 2026-07-14 |
| `take-screenshot.yaml` | Named capture point, invoked from every scenario's `onFlowComplete`. | Both platforms |
| `dismiss-keyboard.yaml` | Wraps native `hideKeyboard` behind a semantic name. | Android |
| `navigate-to-search-tab.yaml` | Taps the "Search" tab - identical visible text on Android and iOS, so this one helper is genuinely cross-platform. | Live Android Emulator and iOS Simulator, 2026-07-14 |

## Not built yet

Real, valuable helpers this repo has no grounded need for yet - the
placeholder app never surfaces them, and building one against a selector
nobody has verified would violate this platform's "never guess" rule (see
`docs/BestPractices.md`). Build the real thing once a flow actually
exercises the interaction, then move its row up into the table above with
the same evidence discipline.

| Intended file | Purpose |
|---|---|
| `open-menu.yaml` | Open a hamburger/drawer navigation menu. |
| `close-popup.yaml` | Dismiss a generic blocking popup/dialog/modal not covered by a more specific helper. |
| `accept-permission-dialog.yaml` | Accept an OS-level runtime permission prompt (camera, location, notifications). Not exercised by Wikipedia's search flow - confirmed no permission prompt appears on first launch (2026-07-14). |
| `accept-in-app-permission-upsell.yaml` | Dismiss an in-app (not OS-level) permission upsell interstitial. |
| `handle-biometric-prompt.yaml` | Confirm/cancel a Face ID / fingerprint prompt. |
| `handle-otp.yaml` | Read and enter a one-time-passcode on an OTP entry screen, typically via a test-only backdoor endpoint or SMS relay. |
| `scroll-to-element.yaml` | Scroll a container until a target element is visible, wrapping `scrollUntilVisible`. |
| `select-date.yaml` | Native or custom date-picker selection. |
| `select-dropdown-option.yaml` | Dropdown / select-menu option selection. |
| `assert-toast-message.yaml` | Transient toast/snackbar message assertions. |
| `enter-pin.yaml` | Numeric PIN-entry keypad interactions. |
| `assert-top-nav-title.yaml` | App bar / toolbar interactions (title assertions, overflow menu, back navigation). |
| `logout.yaml` | Reset the app to a logged-out state at the end of a run. Requires an authenticated flow to exist first. |
