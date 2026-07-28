# Maestro Workspace

This directory is the Maestro workspace root (the path you pass to
`maestro test`). Its layout is a strict hierarchy - see
`docs/Architecture.md` for the full rationale:

```
scenarios/  What you RUN. The only layer config.yaml treats as executable.
flows/      What you REUSE. One business capability per file, parameterized.
helpers/    Generic building blocks (onboarding, keyboard, screenshots, nav).
```

`config.yaml`'s `flows:` glob only matches `scenarios/**/*.yaml`. Everything
under `flows/` and `helpers/` exists solely to be `runFlow`'d - running
`maestro test .maestro` will never pick them up as standalone tests, which is
what prevents rogue, duplicated top-level flows from accumulating as the
platform grows.

Note: `scenarios/` (not `tests/`) is deliberate - Maestro's own CLI writes
its debug-output artifacts under `<debug-output-dir>/.maestro/tests/<timestamp>/`
internally (confirmed from this repo's own captured runs). Naming our source
folder `tests/` would risk colliding with that if `maestro test .maestro` is
ever run without an explicit `--debug-output` flag.
