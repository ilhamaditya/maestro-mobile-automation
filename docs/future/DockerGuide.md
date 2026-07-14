# Docker Guide

**Status:** TODO - Phase 2.

Phase 1's `Dockerfile` builds a Java 17 + Node 20 + Maestro CLI + `adb`
client image, validated in CI only via a `docker build` sanity check (see
`docs/CI-CD.md`) - it is not used to execute tests. A full guide covering
local developer usage (mounting the repo, connecting to a host-machine
emulator via `adb connect`/`adb tcpip`), and a considered position on
Android-in-Docker (known Maestro device-detection flakiness - see
`docs/CI-CD.md`) versus native execution, belongs here once that workflow is
actually adopted by a team. Note going in: iOS Simulator cannot run in a
Linux container under any configuration - Xcode is macOS-only.
