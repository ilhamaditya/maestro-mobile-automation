import fs from "node:fs";
import path from "node:path";
import dotenv from "dotenv";
import { CONFIG_ENV_DIR } from "../utils/paths.js";
import { createLogger } from "../utils/logger.js";

const logger = createLogger("env");

export const VALID_TARGETS = ["local", "dev", "qa", "uat", "staging", "production"] as const;
export type EnvironmentTarget = (typeof VALID_TARGETS)[number];

export function isEnvironmentTarget(value: string): value is EnvironmentTarget {
  return (VALID_TARGETS as readonly string[]).includes(value);
}

export interface LoadEnvOptions {
  /** Layered on top of file-based values - e.g. CI-injected secrets. */
  overrides?: Record<string, string>;
  /** Override the directory .env files are read from. Exposed for tests. */
  envDir?: string;
}

/**
 * Fills the one genuine gap in Maestro's own CLI: it has no native .env file
 * support (shell vars prefixed MAESTRO_ auto-import, but nothing reads a
 * file). Falls back to the committed `.example` file so a fresh clone can
 * run immediately against the Phase 1 placeholder app.
 */
export function loadEnvironment(
  target: EnvironmentTarget,
  options: LoadEnvOptions = {},
): Record<string, string> {
  const dir = options.envDir ?? CONFIG_ENV_DIR;
  const realFile = path.join(dir, `.env.${target}`);
  const exampleFile = path.join(dir, `.env.${target}.example`);
  const fileToRead = fs.existsSync(realFile) ? realFile : exampleFile;

  if (!fs.existsSync(fileToRead)) {
    throw new Error(
      `No environment file found for target "${target}" (looked for ${realFile} and ${exampleFile})`,
    );
  }
  if (fileToRead === exampleFile) {
    logger.warn(
      `No local .env.${target} found - falling back to the committed .env.${target}.example. Copy it to .env.${target} to customize.`,
    );
  }

  const parsed = dotenv.parse(fs.readFileSync(fileToRead, "utf-8"));
  return { ...parsed, ...options.overrides };
}

/** Converts a resolved env map into repeated `maestro test -e KEY=value` args. */
export function toMaestroArgs(env: Record<string, string>): string[] {
  return Object.entries(env).flatMap(([key, value]) => ["-e", `${key}=${value}`]);
}
