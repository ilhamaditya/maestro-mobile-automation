# Folder Structure

```
maestro-mobile-automation/
├── .github/workflows/        GitHub Actions CI (docs/CI-CD.md)
├── .maestro/                 Maestro workspace root (.maestro/README.md)
│   ├── config.yaml
│   ├── flows/
│   │   ├── features/          Layer 1 - business scenarios (executable)
│   │   ├── reusable/          Layer 2 - one business capability per file
│   │   ├── sub-flows/         Layer 3 - generic technical interactions
│   │   └── common-components/ Layer 4 - reusable UI-pattern interactions
│   └── scripts/               Maestro-native JS (runScript/evalScript)
├── config/environments/       .env.<target>.example per environment
├── test-data/fixtures/        Static JSON consumed by tools/ factories
├── apps/{android,ios}/        Sample-app fetch destinations (gitignored binaries)
├── tools/                     Node/TypeScript orchestration (tools/README.md)
├── docs/                      This directory
├── Dockerfile, .dockerignore  Local/CI tooling runtime image
└── README.md                  Start here
```

## Every extension-point folder follows the same convention

Empty layers (e.g. `flows/common-components/toast/`) contain a `README.md`
stating what's built, what isn't, and why - never a silent empty directory
and never a placeholder file that looks implemented but isn't. When you add
real content, move its description out of the "not yet built" table and into
the "built" table in that same file, with what you verified it against.

## Where a new file belongs

| You're adding... | Goes in |
|---|---|
| A new business scenario | `.maestro/flows/features/<capability>/` - selector-free, named and tagged after the business behavior (see `docs/FlowGuide.md`) |
| A new business capability's implementation | `.maestro/flows/reusable/<capability>/` |
| A new generic technical interaction (not UI-pattern-specific) | `.maestro/flows/sub-flows/` |
| A new reusable UI pattern (nav, dialog, picker) | `.maestro/flows/common-components/<pattern>/` |
| A new environment-loading or data-generation need | `tools/src/env/` or `tools/src/data/factories/` |
| A new enforced convention | `tools/src/lint/`, wired into `.github/workflows/smoke.yml`'s `lint` job |

See `docs/FlowGuide.md` and `docs/SubFlowGuide.md` for the rules governing
each layer's content.
