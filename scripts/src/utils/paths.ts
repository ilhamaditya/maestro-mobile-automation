import path from "node:path";
import { fileURLToPath } from "node:url";

// Resolved from this file's own URL rather than process.cwd() so every
// script behaves identically whether invoked via `npm run` (cwd = scripts/)
// or directly via `tsx scripts/src/...` (cwd = repo root).
const SCRIPTS_DIR = fileURLToPath(new URL("../..", import.meta.url));
export const ROOT_DIR = path.resolve(SCRIPTS_DIR, "..");

export const MAESTRO_WORKSPACE_DIR = path.join(ROOT_DIR, ".maestro");
export const CONFIG_ENV_DIR = path.join(ROOT_DIR, "config");
export const DATA_DIR = path.join(ROOT_DIR, "data");
export const APPS_DIR = path.join(ROOT_DIR, "apps");
export const TEST_OUTPUT_DIR = path.join(ROOT_DIR, "test-output");
