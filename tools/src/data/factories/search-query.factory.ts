import fs from "node:fs";
import path from "node:path";
import { TEST_DATA_DIR } from "../../utils/paths.js";

export interface SearchQueryFixture {
  id: string;
  term: string;
  note: string;
}

interface FixtureFile {
  queries: SearchQueryFixture[];
}

const FIXTURE_PATH = path.join(TEST_DATA_DIR, "fixtures", "search-queries.json");

function readFixtures(): SearchQueryFixture[] {
  const raw = fs.readFileSync(FIXTURE_PATH, "utf-8");
  const parsed = JSON.parse(raw) as FixtureFile;
  return parsed.queries;
}

/** Returns the default query fixture (first entry - see the fixture's own `note` fields for why). */
export function getDefaultSearchQuery(): SearchQueryFixture {
  const [first] = readFixtures();
  if (!first) {
    throw new Error(`No query fixtures found in ${FIXTURE_PATH}`);
  }
  return first;
}

/** Returns a specific fixture by id, e.g. "automation-testing". */
export function getSearchQueryById(id: string): SearchQueryFixture {
  const match = readFixtures().find((query) => query.id === id);
  if (!match) {
    throw new Error(`No query fixture with id "${id}" found in ${FIXTURE_PATH}`);
  }
  return match;
}
