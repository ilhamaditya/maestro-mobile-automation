# Debugging Guide

**Status:** TODO - Phase 2.

Covers reading `--debug-output` artifacts (`maestro.log`, `commands-*.json`,
screenshots), replaying a failure locally, and using Maestro Studio for
interactive selector discovery.

**Immediate Phase 2 follow-up tracked here:** investigate why opening
Wikipedia-iOS's search overlay and asserting on its content was reproducibly
flaky against a real iPhone 15 / iOS 17.2 Simulator (2 of 2 runs failed
despite the text being visibly present in screenshots) while the identical
pattern is 100% reliable on Android - see the reproduction notes in
`.maestro/flows/features/search/ios-pipeline-smoke.yaml` and
`apps/ios/README.md`. Suspected cause: a WebDriverAgent/accessibility-tree
timing interaction with the "Add languages" coach-mark overlay. Try: a newer
Maestro CLI version, an `extendedWaitUntil` before asserting, or dismissing
the coach-mark explicitly first.
