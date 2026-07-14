import { describe, expect, it } from "vitest";
import {
  checkFeatureLayerIsSelectorFree,
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

describe("checkFeatureLayerIsSelectorFree", () => {
  const featureFilePath = "/repo/.maestro/flows/features/search/search.yaml";

  it("flags a raw tapOn inside a Layer-1 feature flow", () => {
    const commands = [{ tapOn: "Search" }];
    expect(checkFeatureLayerIsSelectorFree(featureFilePath, commands)).toHaveLength(1);
  });

  it("allows a feature flow containing only runFlow steps", () => {
    const commands = [{ runFlow: "../../reusable/search/perform-search.yaml" }];
    expect(checkFeatureLayerIsSelectorFree(featureFilePath, commands)).toHaveLength(0);
  });

  it("ignores files outside the features layer", () => {
    const commands = [{ tapOn: "Search" }];
    expect(
      checkFeatureLayerIsSelectorFree("/repo/.maestro/flows/reusable/search/perform-search.yaml", commands),
    ).toHaveLength(0);
  });
});
