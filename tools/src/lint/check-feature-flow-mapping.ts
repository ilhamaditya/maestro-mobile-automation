import fs from "node:fs";
import path from "node:path";
import fg from "fast-glob";
import yaml from "js-yaml";
import { FEATURES_DIR, MAESTRO_WORKSPACE_DIR } from "../utils/paths.js";
import { createLogger } from "../utils/logger.js";

const logger = createLogger("lint:traceability");

export interface Violation {
  file: string;
  rule: string;
  detail: string;
}

const FLOW_TAG_PATTERN = /@flow:([a-z0-9-]+)/g;

// Flows tagged this way are CI health checks, not business scenarios, and so
// are intentionally exempt from needing a corresponding Gherkin scenario -
// see .maestro/flows/features/search/ios-pipeline-smoke.yaml.
const EXEMPT_TAG = "pipeline-check";

export function extractFlowReferences(featureFileContent: string): string[] {
  return [...featureFileContent.matchAll(FLOW_TAG_PATTERN)].map((match) => match[1] ?? "");
}

function readFlowTags(filePath: string): string[] {
  const raw = fs.readFileSync(filePath, "utf-8");
  const [config] = yaml.loadAll(raw) as [Record<string, unknown> | undefined];
  const tags = config?.["tags"];
  return Array.isArray(tags) ? tags.filter((t): t is string => typeof t === "string") : [];
}

export function checkFeatureFlowMapping(
  featuresDir: string = FEATURES_DIR,
  workspaceDir: string = MAESTRO_WORKSPACE_DIR,
): Violation[] {
  const violations: Violation[] = [];

  const featureFiles = fg.sync("*.feature", { cwd: featuresDir, absolute: true });
  const flowFiles = fg.sync("flows/features/**/*.yaml", { cwd: workspaceDir, absolute: true });
  const flowNamesOnDisk = new Set(flowFiles.map((file) => path.basename(file, ".yaml")));

  const referencedFlowNames = new Set<string>();

  for (const featureFile of featureFiles) {
    const content = fs.readFileSync(featureFile, "utf-8");
    for (const flowName of extractFlowReferences(content)) {
      referencedFlowNames.add(flowName);
      if (!flowNamesOnDisk.has(flowName)) {
        violations.push({
          file: featureFile,
          rule: "dangling-flow-reference",
          detail: `@flow:${flowName} does not match any file under .maestro/flows/features/**.`,
        });
      }
    }
  }

  for (const flowFile of flowFiles) {
    const flowName = path.basename(flowFile, ".yaml");
    if (referencedFlowNames.has(flowName)) {
      continue;
    }
    const tags = readFlowTags(flowFile);
    if (tags.includes(EXEMPT_TAG)) {
      continue;
    }
    violations.push({
      file: flowFile,
      rule: "orphaned-flow",
      detail: `No *.feature scenario references this flow via @flow:${flowName} - either add the tag or tag this flow "${EXEMPT_TAG}" if it is not a business scenario.`,
    });
  }

  return violations;
}

const isMainModule = import.meta.url === `file://${process.argv[1]}`;
if (isMainModule) {
  const violations = checkFeatureFlowMapping();
  if (violations.length > 0) {
    for (const violation of violations) {
      logger.error(`${violation.file}: [${violation.rule}] ${violation.detail}`);
    }
    logger.error(`${violations.length} traceability violation(s) found.`);
    process.exitCode = 1;
  } else {
    logger.info("Every feature scenario and flow file is correctly cross-referenced.");
  }
}
