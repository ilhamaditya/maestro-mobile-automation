import { describe, expect, it } from "vitest";
import { getDefaultSearchQuery, getSearchQueryById } from "../../src/data/factories/search-query.factory.js";

describe("search-query factory", () => {
  it("returns a default query with a non-empty term", () => {
    const query = getDefaultSearchQuery();
    expect(query.term.length).toBeGreaterThan(0);
  });

  it("returns a specific fixture by id", () => {
    const query = getSearchQueryById("automation-testing");
    expect(query.term).toBe("Automation testing");
  });

  it("throws a clear error for an unknown id", () => {
    expect(() => getSearchQueryById("does-not-exist")).toThrow(/No query fixture with id/);
  });
});
