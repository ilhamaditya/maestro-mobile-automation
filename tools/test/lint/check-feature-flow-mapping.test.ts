import fs from "node:fs";
import os from "node:os";
import path from "node:path";
import { afterEach, beforeEach, describe, expect, it } from "vitest";
import { checkFeatureFlowMapping, extractFlowReferences } from "../../src/lint/check-feature-flow-mapping.js";

describe("extractFlowReferences", () => {
  it("extracts every @flow tag from a feature file's content", () => {
    const content = [
      "@flow:search-wikipedia-returns-relevant-results",
      "Scenario: Searching returns relevant results",
      "",
      "@flow:clearing-a-search-query-resets-empty-state",
      "Scenario: Clearing a query resets the screen",
    ].join("\n");

    expect(extractFlowReferences(content)).toEqual([
      "search-wikipedia-returns-relevant-results",
      "clearing-a-search-query-resets-empty-state",
    ]);
  });

  it("returns an empty array when no @flow tags are present", () => {
    expect(extractFlowReferences("Scenario: Untagged\n")).toEqual([]);
  });
});

describe("checkFeatureFlowMapping", () => {
  let featuresDir: string;
  let workspaceDir: string;

  beforeEach(() => {
    featuresDir = fs.mkdtempSync(path.join(os.tmpdir(), "maestro-features-"));
    workspaceDir = fs.mkdtempSync(path.join(os.tmpdir(), "maestro-workspace-"));
    fs.mkdirSync(path.join(workspaceDir, "flows", "features", "search"), { recursive: true });
  });

  afterEach(() => {
    fs.rmSync(featuresDir, { recursive: true, force: true });
    fs.rmSync(workspaceDir, { recursive: true, force: true });
  });

  function writeFlow(name: string, tags: string[] = []): void {
    fs.writeFileSync(
      path.join(workspaceDir, "flows", "features", "search", `${name}.yaml`),
      `appId: org.example\ntags:\n${tags.map((t) => `  - ${t}`).join("\n")}\n---\n- runFlow: noop.yaml\n`,
    );
  }

  it("passes when every scenario and flow reference each other", () => {
    fs.writeFileSync(
      path.join(featuresDir, "search.feature"),
      "@flow:do-a-thing\nScenario: Do a thing\n",
    );
    writeFlow("do-a-thing");

    expect(checkFeatureFlowMapping(featuresDir, workspaceDir)).toHaveLength(0);
  });

  it("flags a @flow tag with no matching flow file", () => {
    fs.writeFileSync(
      path.join(featuresDir, "search.feature"),
      "@flow:does-not-exist\nScenario: Ghost scenario\n",
    );

    const violations = checkFeatureFlowMapping(featuresDir, workspaceDir);
    expect(violations.some((v) => v.rule === "dangling-flow-reference")).toBe(true);
  });

  it("flags a flow file with no scenario reference", () => {
    writeFlow("orphaned-flow");

    const violations = checkFeatureFlowMapping(featuresDir, workspaceDir);
    expect(violations.some((v) => v.rule === "orphaned-flow")).toBe(true);
  });

  it("exempts flows tagged pipeline-check from needing a scenario", () => {
    writeFlow("ci-health-check", ["pipeline-check"]);

    expect(checkFeatureFlowMapping(featuresDir, workspaceDir)).toHaveLength(0);
  });
});
