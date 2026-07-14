# Maestro Workspace

This directory is the Maestro workspace root (the path you pass to
`maestro test`). Its layout is a strict hierarchy - see
`docs/Architecture.md` for the full rationale:

```
flows/
├── features/           Layer 1 - business scenarios. The ONLY layer
│                       .maestro/config.yaml treats as executable tests.
├── reusable/           Layer 2 - one business capability per file.
├── sub-flows/          Layer 3 - generic, app-agnostic technical interactions.
└── common-components/  Layer 4 - reusable UI component interactions.
scripts/                Maestro-native JS (runScript/evalScript), NOT Node.
```

`config.yaml`'s `flows:` glob only matches `flows/features/**/*.yaml`.
Everything under `reusable/`, `sub-flows/`, and `common-components/` exists
solely to be `runFlow`'d - running `maestro test .maestro` will never pick
them up as standalone tests, which is what prevents rogue, duplicated
top-level flows from accumulating as the platform grows.
