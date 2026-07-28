import { describe, expect, it } from "vitest";
import { checkFileName } from "../../src/lint/check-naming-conventions.js";

describe("checkFileName", () => {
  it("flags a .yml extension", () => {
    const violations = checkFileName("/repo/.maestro/scenarios/search/search.yml");
    expect(violations.some((v) => v.rule === "yaml-extension")).toBe(true);
  });

  it("flags a non-kebab-case name", () => {
    const violations = checkFileName("/repo/.maestro/scenarios/search/SearchWikipedia.yaml");
    expect(violations.some((v) => v.rule === "kebab-case")).toBe(true);
  });

  it("flags a banned placeholder name", () => {
    const violations = checkFileName("/repo/.maestro/scenarios/search/test.yaml");
    expect(violations.some((v) => v.rule === "business-capability-name")).toBe(true);
  });

  it("flags a technical-implementation prefix", () => {
    const violations = checkFileName("/repo/.maestro/scenarios/search/tap-login.yaml");
    expect(violations.some((v) => v.rule === "business-capability-name")).toBe(true);
  });

  it("allows a well-formed business-capability flow name", () => {
    const violations = checkFileName(
      "/repo/.maestro/scenarios/search/search-wikipedia-returns-relevant-results.yaml",
    );
    expect(violations).toHaveLength(0);
  });
});
