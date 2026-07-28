# Writing Tests

A "test" in this repo is a **scenario**: a file under `.maestro/scenarios/`
that describes user-visible behavior in plain language, with zero selectors.
If you're building a new reusable flow or helper (something with actual
selectors in it), see `docs/CreatingFlows.md` instead - this doc assumes the
building blocks you need already exist and you're composing them into a new
scenario.

## What a scenario looks like

Real example, `.maestro/scenarios/search/search-wikipedia-returns-relevant-results.yaml`:

```yaml
appId: org.wikipedia
name: Search - a query typed into Wikipedia Search returns visible results
tags:
  - android
  - smoke
  - critical
  - search
  - production-safe
env:
  APP_ID: org.wikipedia
  QUERY: "Software testing"
onFlowStart:
  - runFlow: ../../helpers/complete-onboarding-android.yaml
onFlowComplete:
  - runFlow:
      file: ../../helpers/take-screenshot.yaml
      env:
        APP_ID: ${APP_ID}
        SCREENSHOT_NAME: search-wikipedia-returns-relevant-results
---
- runFlow:
    file: ../../helpers/navigate-to-search-tab.yaml
    env:
      APP_ID: ${APP_ID}
- runFlow:
    file: ../../flows/search/perform-search.yaml
    env:
      APP_ID: ${APP_ID}
      QUERY: ${QUERY}
- runFlow:
    file: ../../flows/search/assert-search-query-visible.yaml
    env:
      APP_ID: ${APP_ID}
      QUERY: ${QUERY}
```

Every line below `---` is a `runFlow` call. No `tapOn`, no `assertVisible`,
nothing that touches the screen directly. That's not a style choice - it's
enforced: `npm run lint` fails if a scenario file contains anything else.

## Why this shape

A non-technical reader can open this file and understand the scenario
without knowing what a resource id is: "open Search, type a query, see it
reflected." The `name:` field and `tags:` are the source of truth for what
it covers - there's no separate spec file to keep in sync.

## How: write a new scenario

1. **Pick the folder.** `.maestro/scenarios/<capability>/` - reuse an
   existing capability folder (e.g. `search/`) if this scenario belongs to
   it, or create a new one.
2. **Name the file after the behavior, not the UI action.**
   `search-wikipedia-returns-relevant-results.yaml`, not
   `tap-search-button.yaml`. `npm run lint` rejects filenames starting with
   `tap-`, `click-`, `press-`, `swipe-`, and placeholder names like `test`,
   `flow1`, `temp`.
3. **Check whether the flows/helpers you need already exist** - browse
   `.maestro/flows/<capability>/` and `.maestro/helpers/README.md` first.
   If they don't, see `docs/CreatingFlows.md` before writing a new scenario
   that assumes them.
4. **Compose them via `runFlow`.** Onboarding/setup goes in
   `onFlowStart`; a screenshot capture goes in `onFlowComplete` (see the
   example above - copy this pattern).
5. **Tag it.** At minimum one of `smoke`/`sanity`/`regression`, plus
   `android` or `ios`, plus `production-safe` if the scenario is read-only
   (see `docs/RunningTests.md` for the full tag convention). Use `wip` while
   the scenario is still in progress - it's excluded from CI by default.
6. **Run it locally** (`docs/RunningTests.md`), then `npm run lint` and
   `npm run typecheck` from `scripts/` before committing.

## Checklist before you commit

- [ ] File lives under `.maestro/scenarios/<capability>/`, kebab-case,
      named after the behavior
- [ ] Contains only `runFlow`, `tags`, `env`, `onFlowStart`/`onFlowComplete`
- [ ] `name:` describes the scenario in plain language
- [ ] Tagged with at least a suite tag (`smoke`/`sanity`/`regression`) and a
      platform tag
- [ ] Reuses existing `flows/`/`helpers/` rather than duplicating steps
- [ ] Ran locally and passed against a real device/simulator
- [ ] `npm run lint && npm run typecheck` pass from `scripts/`

See also `docs/CodeReviewChecklist.md` for what a reviewer will look for.
