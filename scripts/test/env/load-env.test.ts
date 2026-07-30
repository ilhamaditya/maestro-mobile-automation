import fs from "node:fs";
import os from "node:os";
import path from "node:path";
import { afterEach, beforeEach, describe, expect, it } from "vitest";
import { loadEnvironment, toMaestroArgs } from "../../src/env/load-env.js";

describe("loadEnvironment", () => {
  let envDir: string;

  beforeEach(() => {
    envDir = fs.mkdtempSync(path.join(os.tmpdir(), "maestro-env-test-"));
  });

  afterEach(() => {
    fs.rmSync(envDir, { recursive: true, force: true });
  });

  it("reads a real .env file when present", () => {
    fs.writeFileSync(path.join(envDir, ".env"), "APP_ID_ANDROID=org.example\n");

    const result = loadEnvironment({ envDir });

    expect(result["APP_ID_ANDROID"]).toBe("org.example");
  });

  it("falls back to .env.example when no real file exists", () => {
    fs.writeFileSync(path.join(envDir, ".env.example"), "APP_ID_ANDROID=org.wikipedia\n");

    const result = loadEnvironment({ envDir });

    expect(result["APP_ID_ANDROID"]).toBe("org.wikipedia");
  });

  it("prefers the real .env over .env.example when both exist", () => {
    fs.writeFileSync(path.join(envDir, ".env"), "SEARCH_QUERY=Real value\n");
    fs.writeFileSync(path.join(envDir, ".env.example"), "SEARCH_QUERY=Example value\n");

    const result = loadEnvironment({ envDir });

    expect(result["SEARCH_QUERY"]).toBe("Real value");
  });

  it("layers overrides on top of file-based values", () => {
    fs.writeFileSync(path.join(envDir, ".env"), "SEARCH_QUERY=Software testing\n");

    const result = loadEnvironment({
      envDir,
      overrides: { SEARCH_QUERY: "Overridden query" },
    });

    expect(result["SEARCH_QUERY"]).toBe("Overridden query");
  });

  it("throws a clear error when neither a real nor an example file exists", () => {
    expect(() => loadEnvironment({ envDir })).toThrow(/No environment file found/);
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
