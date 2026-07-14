# Sub-Flow & Common Component Guide

## When to extract a sub-flow vs. inline a step

Extract when the interaction is (a) generic/app-agnostic and (b) used by
more than one Reusable Flow, or is invoked from a lifecycle hook
(`onFlowStart`/`onFlowComplete`). Keep it inline in a Reusable Flow when it's
a single, capability-specific step used exactly once. Never extract
speculatively - every sub-flow in this repo was built because a real flow
needed it, verified against a live device, not written ahead of need.

## Built (Phase 1)

See `.maestro/flows/sub-flows/README.md` for the authoritative, up-to-date
table (file, purpose, what it was verified against). Summary: onboarding
completion (Android + iOS, app-specific), a named screenshot capture point,
and a keyboard-dismiss wrapper.

## Common Components built (Phase 1)

`flows/common-components/bottom-nav/navigate-to-search-tab.yaml` - the only
component with real, verified content in Phase 1. Every other component
folder (`toast/`, `dialog/`, `drawer/`, `modal/`, `top-nav/`, `date-picker/`,
`dropdown/`, `permission-dialog/`, `pin-keyboard/`, `otp-screen/`) is an
extension point: a `README.md` stating it isn't built yet and why, rather
than a guessed implementation. Wikipedia's Search capability never surfaces
these patterns - build the real thing once a business flow actually needs
it, verified the same way `bottom-nav` was.

## Documented, not yet built (Phase 2+)

`open-menu.yaml`, `close-popup.yaml`, `accept-permission-dialog.yaml`,
`handle-biometric-prompt.yaml`, `handle-otp.yaml`, `scroll-to-element.yaml`,
`logout.yaml` - see `.maestro/flows/sub-flows/README.md` for why each one
specifically isn't applicable to the Phase 1 placeholder app (e.g. no OS
permission prompt appears on first launch; `logout` requires an
authenticated flow that doesn't exist yet).

## The discipline this repo follows

Every "built" row in the sub-flow and common-component READMEs states what
device/simulator it was verified against and when. When you add a new one,
keep that discipline - a comment like "verified against a live Android
Emulator, 2026-07-14" is what lets the next engineer trust the flow instead
of re-verifying it themselves.
