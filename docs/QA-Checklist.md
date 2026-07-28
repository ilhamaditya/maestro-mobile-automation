# QA Checklist

Self-check before opening a PR. Everything here is also covered from the
reviewer's side in `docs/CodeReviewChecklist.md` - use this one while
you're still writing.

## Naming

- [ ] File is kebab-case, `.yaml` extension
- [ ] Named after the business behavior, not the UI action
      (`clearing-a-search-query-resets-empty-state.yaml`, not
      `tap-clear-button.yaml`)
- [ ] No placeholder names (`test.yaml`, `temp.yaml`, `flow1.yaml`)

## Folder placement

- [ ] Scenario → `.maestro/scenarios/<capability>/`
- [ ] Capability-specific implementation → `.maestro/flows/<capability>/`
- [ ] Generic/shared building block → `.maestro/helpers/`
- [ ] Not creating a new top-level folder for something that could live in
      an existing one (see `docs/FolderStructure.md`)

## Reusable flow usage

- [ ] Checked `.maestro/flows/<capability>/` and `.maestro/helpers/README.md`
      for an existing flow/helper before writing a new one
- [ ] Didn't copy-paste steps that already exist elsewhere as a `runFlow`
      target
- [ ] Didn't extract a new helper speculatively - only for something this
      PR actually uses

## Assertions

- [ ] Asserts on something the app guarantees (input echo, static label),
      not live network/third-party content
- [ ] No `assertVisible`/`assertNotVisible` inside a scenario file -
      belongs in a `flows/` file

## Readability

- [ ] A junior QA engineer could open this file and understand what it
      does without asking you
- [ ] `name:` (scenario) or file-level comment (flow/helper) explains the
      *behavior*, not just restates the code
- [ ] Comment states what selector/interaction was verified against which
      device/simulator, and when

## Maintainability

- [ ] One responsibility per file
- [ ] No raw `sleep`, no coordinate taps, no XPath, no hardcoded secrets,
      no unguarded index selector
- [ ] Tagged per convention (`docs/RunningTests.md`)
- [ ] `npm run typecheck && npm run lint && npm test` pass locally
- [ ] Ran against a real device/simulator at least once, not just "looks
      right"
