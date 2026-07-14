# Common Component: Bottom Navigation

## Built (Phase 1)

- `navigate-to-search-tab.yaml` - taps the "Search" tab, confirmed identical
  visible text on Android and iOS (see the vertical-slice call graph in
  `docs/FlowGuide.md`).

## Extension points (Phase 2+)

Add one file per destination tab as real business flows need them, e.g.
`navigate-to-explore-tab.yaml`, `navigate-to-saved-tab.yaml`. Note that the
tab set genuinely differs per platform (Android has "Edits"/"More", iOS has
"Places"/"History" instead) - do not assume parity without verifying against
a live device first.
