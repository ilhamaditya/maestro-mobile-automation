import path from "node:path";
import fg from "fast-glob";
import { MAESTRO_WORKSPACE_DIR } from "../utils/paths.js";
import { createLogger } from "../utils/logger.js";

const logger = createLogger("lint:naming");

export interface Violation {
  file: string;
  rule: string;
  detail: string;
}

const KEBAB_CASE = /^[a-z0-9]+(-[a-z0-9]+)*$/;

// Technical-implementation verbs called out as anti-patterns in
// docs/FlowGuide.md ("tap-login.yaml", "click-button.yaml" are Bad).
// Business flows describe capability, not the tap that implements it.
const BANNED_PREFIXES = ["tap-", "click-", "press-", "swipe-"];
const BANNED_NAMES = new Set(["test", "flow", "flow1", "flow2", "temp", "tmp", "foo", "bar", "new-flow"]);

export function checkFileName(filePath: string): Violation[] {
  const violations: Violation[] = [];
  const ext = path.extname(filePath);
  const base = path.basename(filePath, ext);

  if (ext === ".yml") {
    violations.push({
      file: filePath,
      rule: "yaml-extension",
      detail: 'Use ".yaml", not ".yml", for consistency across the workspace.',
    });
  }

  if (!KEBAB_CASE.test(base)) {
    violations.push({
      file: filePath,
      rule: "kebab-case",
      detail: `"${base}" is not kebab-case (expected lowercase words separated by single hyphens).`,
    });
  }

  if (BANNED_NAMES.has(base)) {
    violations.push({
      file: filePath,
      rule: "business-capability-name",
      detail: `"${base}" is not a business-capability name - describe what the flow does (e.g. "search-wikipedia-returns-relevant-results.yaml"), not a placeholder.`,
    });
  }

  const bannedPrefix = BANNED_PREFIXES.find((prefix) => base.startsWith(prefix));
  if (bannedPrefix) {
    violations.push({
      file: filePath,
      rule: "business-capability-name",
      detail: `"${base}" starts with the technical-implementation prefix "${bannedPrefix}" - name flows after the business capability, not the UI action.`,
    });
  }

  return violations;
}

export function checkAllFlowNames(workspaceDir: string = MAESTRO_WORKSPACE_DIR): Violation[] {
  const files = fg.sync("flows/**/*.{yaml,yml}", { cwd: workspaceDir, absolute: true });
  return files.flatMap((file) => checkFileName(file));
}

const isMainModule = import.meta.url === `file://${process.argv[1]}`;
if (isMainModule) {
  const violations = checkAllFlowNames();
  if (violations.length > 0) {
    for (const violation of violations) {
      logger.error(`${violation.file}: [${violation.rule}] ${violation.detail}`);
    }
    logger.error(`${violations.length} naming convention violation(s) found.`);
    process.exitCode = 1;
  } else {
    logger.info("All flow file names pass naming conventions.");
  }
}
