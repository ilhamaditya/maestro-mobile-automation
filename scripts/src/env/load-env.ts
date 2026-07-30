import fs from "node:fs";
import path from "node:path";
import dotenv from "dotenv";
import { CONFIG_ENV_DIR } from "../utils/paths.js";
import { createLogger } from "../utils/logger.js";

const logger = createLogger("env");

export interface LoadEnvOptions {
  /** Layered on top of file-based values - e.g. CI-injected secrets. */
  overrides?: Record<string, string>;
  /** Override the directory the .env file is read from. Exposed for tests. */
  envDir?: string;
}

/**
 * Fills the one genuine gap in Maestro's own CLI: it has no native .env file
 * support (shell vars prefixed MAESTRO_ auto-import, but nothing reads a
 * file). Reads `config/.env`, falling back to the committed `.env.example`
 * so a fresh clone can run immediately against the placeholder app.
 */
export function loadEnvironment(options: LoadEnvOptions = {}): Record<string, string> {
  const dir = options.envDir ?? CONFIG_ENV_DIR;
  const realFile = path.join(dir, ".env");
  const exampleFile = path.join(dir, ".env.example");
  const fileToRead = fs.existsSync(realFile) ? realFile : exampleFile;

  if (!fs.existsSync(fileToRead)) {
    throw new Error(
      `No environment file found (looked for ${realFile} and ${exampleFile})`,
    );
  }
  if (fileToRead === exampleFile) {
    logger.warn(
      "No local config/.env found - falling back to the committed .env.example. Copy it to config/.env to customize.",
    );
  }

  const parsed = dotenv.parse(fs.readFileSync(fileToRead, "utf-8"));
  return { ...parsed, ...options.overrides };
}

/** Converts a resolved env map into repeated `maestro test -e KEY=value` args. */
export function toMaestroArgs(env: Record<string, string>): string[] {
  return Object.entries(env).flatMap(([key, value]) => ["-e", `${key}=${value}`]);
}
