# Common Component: Permission Dialog

**Status:** extension point - not built in Phase 1.

In-app (not OS-level) permission upsell interstitials - distinct from
`sub-flows/accept-permission-dialog.yaml` (documented, also not yet built),
which will handle the OS-level runtime permission prompt.

This platform's Phase 1 vertical slice (Wikipedia Search) never surfaces this
UI pattern, so there is nothing real to verify a flow against yet (per this
platform's "never guess" rule - see `docs/SelectorStrategy.md`). Build the
real flow files here once a business flow actually exercises this component,
verified against a live emulator/simulator, not assumed from documentation.
