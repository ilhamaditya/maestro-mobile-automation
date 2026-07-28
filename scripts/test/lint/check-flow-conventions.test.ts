import { describe, expect, it } from "vitest";
import {
  checkScenarioLayerIsSelectorFree,
  checkNoCoordinateTaps,
  checkNoHardcodedSecrets,
  checkNoRawSleep,
  checkNoUnguardedIndex,
  checkNoXpath,
} from "../../src/lint/check-flow-conventions.js";

describe("checkNoRawSleep", () => {
  it("flags a literal sleep command", () => {
    const raw = "appId: com.example\n---\n- sleep: 3000\n";
    expect(checkNoRawSleep("f.yaml", raw)).toHaveLength(1);
  });

  it("allows flows with no sleep command", () => {
    const raw = "appId: com.example\n---\n- tapOn: \"Login\"\n";
    expect(checkNoRawSleep("f.yaml", raw)).toHaveLength(0);
  });
});

describe("checkNoCoordinateTaps", () => {
  it("flags a point-based tap", () => {
    const commands = [{ tapOn: { point: "50%,50%" } }];
    expect(checkNoCoordinateTaps("f.yaml", commands)).toHaveLength(1);
  });

  it("allows an id-based tap", () => {
    const commands = [{ tapOn: { id: "com.example:id/button" } }];
    expect(checkNoCoordinateTaps("f.yaml", commands)).toHaveLength(0);
  });
});

describe("checkNoXpath", () => {
  it("flags an xpath-looking selector key", () => {
    const commands = [{ tapOn: { xpath: "//button" } }];
    expect(checkNoXpath("f.yaml", commands)).toHaveLength(1);
  });

  it("allows a text selector", () => {
    const commands = [{ tapOn: { text: "Login" } }];
    expect(checkNoXpath("f.yaml", commands)).toHaveLength(0);
  });
});

describe("checkNoUnguardedIndex", () => {
  it("flags an index selector used alone", () => {
    const commands = [{ tapOn: { index: 2 } }];
    expect(checkNoUnguardedIndex("f.yaml", commands)).toHaveLength(1);
  });

  it("allows an index selector paired with text", () => {
    const commands = [{ tapOn: { text: "Item", index: 2 } }];
    expect(checkNoUnguardedIndex("f.yaml", commands)).toHaveLength(0);
  });
});

describe("checkNoHardcodedSecrets", () => {
  it("flags a hardcoded password literal", () => {
    const commands = [{ inputText: { password: "hunter2" } }];
    expect(checkNoHardcodedSecrets("f.yaml", commands)).toHaveLength(1);
  });

  it("allows a templated password value", () => {
    const commands = [{ inputText: { password: "${LOGIN_PASSWORD}" } }];
    expect(checkNoHardcodedSecrets("f.yaml", commands)).toHaveLength(0);
  });
});

describe("checkScenarioLayerIsSelectorFree", () => {
  const scenarioFilePath = "/repo/.maestro/scenarios/search/search.yaml";

  it("flags a raw tapOn inside a scenario", () => {
    const commands = [{ tapOn: "Search" }];
    expect(checkScenarioLayerIsSelectorFree(scenarioFilePath, commands)).toHaveLength(1);
  });

  it("allows a scenario containing only runFlow steps", () => {
    const commands = [{ runFlow: "../../flows/search/perform-search.yaml" }];
    expect(checkScenarioLayerIsSelectorFree(scenarioFilePath, commands)).toHaveLength(0);
  });

  it("ignores files outside the scenarios layer", () => {
    const commands = [{ tapOn: "Search" }];
    expect(
      checkScenarioLayerIsSelectorFree("/repo/.maestro/flows/search/perform-search.yaml", commands),
    ).toHaveLength(0);
  });
});
