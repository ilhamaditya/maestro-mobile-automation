# Installation

## What you need

| Tool | Why | Check you have it |
|---|---|---|
| [Maestro CLI](https://docs.maestro.dev) `1.39.7` | Runs the flows | `maestro --version` |
| Node.js 20+ (see `.nvmrc`) | Runs `scripts/` (env loading, lint, orchestration) | `node --version` |
| Android SDK + `adb` + at least one AVD | For Android runs | `adb devices` |
| Xcode + a Simulator runtime (macOS only) | For iOS runs | `xcrun simctl list` |

You don't need both Android and iOS tooling to get started - pick one
platform and follow the matching half of `docs/RunningTests.md`.

## Install

```bash
# 1. Maestro CLI
curl -fsSL "https://get.maestro.mobile.dev" | bash

# 2. Node dependencies for scripts/
cd scripts
npm install
```

That's it - two commands. Everything else (`.env` files, the placeholder
app) is fetched or defaulted automatically the first time you run something.

## Verify the install

```bash
cd scripts
npm run typecheck   # tsc --noEmit
npm run lint         # the two enforced-convention checks
npm test             # vitest run
```

All three should pass on a fresh clone with no further setup. If any of them
fail, something's wrong with the Node install, not with Maestro or a device -
see `docs/Troubleshooting.md`.

## Next

`docs/RunningTests.md` - boot a device and run the example scenarios.
