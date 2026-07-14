# Test Data Guide

**Status:** TODO - Phase 2.

Phase 1 has one fixture/factory pair (`test-data/fixtures/search-queries.json`
+ `tools/src/data/factories/search-query.factory.ts` - see
`test-data/README.md`). A full guide covering builder patterns for generated
(non-fixture) data, seeded randomization for uniqueness (e.g. unique emails
per run without external state), and per-environment data scoping belongs
here once more than one domain's worth of test data exists to generalize
from.
