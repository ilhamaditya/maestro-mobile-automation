import path from "node:path";
import { fileURLToPath } from "node:url";

// Resolved from this file's own URL rather than process.cwd() so every
// script behaves identically whether invoked via `npm run` (cwd = tools/)
// or directly via `tsx tools/src/...` (cwd = repo root).
const TOOLS_DIR = fileURLToPath(new URL("../..", import.meta.url));
export const ROOT_DIR = path.resolve(TOOLS_DIR, "..");

export const MAESTRO_WORKSPACE_DIR = path.join(ROOT_DIR, ".maestro");
export const CONFIG_ENV_DIR = path.join(ROOT_DIR, "config", "environments");
export const TEST_DATA_DIR = path.join(ROOT_DIR, "test-data");
export const APPS_DIR = path.join(ROOT_DIR, "apps");
export const TEST_OUTPUT_DIR = path.join(ROOT_DIR, "test-output");
export const FEATURES_DIR = path.join(ROOT_DIR, "features");
