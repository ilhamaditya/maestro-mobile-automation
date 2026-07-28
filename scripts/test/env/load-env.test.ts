import fs from "node:fs";
import os from "node:os";
import path from "node:path";
import { afterEach, beforeEach, describe, expect, it } from "vitest";
import { isEnvironmentTarget, loadEnvironment, toMaestroArgs, VALID_TARGETS } from "../../src/env/load-env.js";

describe("VALID_TARGETS / isEnvironmentTarget", () => {
  it("accepts every documented environment name", () => {
    for (const target of VALID_TARGETS) {
      expect(isEnvironmentTarget(target)).toBe(true);
    }
  });

  it("rejects an unknown environment name", () => {
    expect(isEnvironmentTarget("does-not-exist")).toBe(false);
  });
});

describe("loadEnvironment", () => {
  let envDir: string;

  beforeEach(() => {
    envDir = fs.mkdtempSync(path.join(os.tmpdir(), "maestro-env-test-"));
  });

  afterEach(() => {
    fs.rmSync(envDir, { recursive: true, force: true });
  });

  it("reads a real .env.<target> file when present", () => {
    fs.writeFileSync(path.join(envDir, ".env.local"), "APP_ID_ANDROID=org.example\n");

    const result = loadEnvironment("local", { envDir });

    expect(result["APP_ID_ANDROID"]).toBe("org.example");
  });

  it("falls back to the .example file when no real file exists", () => {
    fs.writeFileSync(path.join(envDir, ".env.qa.example"), "APP_ID_ANDROID=org.wikipedia\n");

    const result = loadEnvironment("qa", { envDir });

    expect(result["APP_ID_ANDROID"]).toBe("org.wikipedia");
  });

  it("layers overrides on top of file-based values", () => {
    fs.writeFileSync(path.join(envDir, ".env.local"), "SEARCH_QUERY=Software testing\n");

    const result = loadEnvironment("local", {
      envDir,
      overrides: { SEARCH_QUERY: "Overridden query" },
    });

    expect(result["SEARCH_QUERY"]).toBe("Overridden query");
  });

  it("throws a clear error when neither a real nor an example file exists", () => {
    expect(() => loadEnvironment("staging", { envDir })).toThrow(/No environment file found/);
  });
});

describe("toMaestroArgs", () => {
  it("converts an env map into repeated -e flag pairs", () => {
    expect(toMaestroArgs({ FOO: "bar", BAZ: "qux" })).toEqual(["-e", "FOO=bar", "-e", "BAZ=qux"]);
  });

  it("returns an empty array for an empty env map", () => {
    expect(toMaestroArgs({})).toEqual([]);
  });
});
