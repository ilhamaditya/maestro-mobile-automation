import fs from "node:fs";
import path from "node:path";
import fg from "fast-glob";
import yaml from "js-yaml";
import { MAESTRO_WORKSPACE_DIR } from "../utils/paths.js";
import { createLogger } from "../utils/logger.js";

const logger = createLogger("lint:flows");

export interface Violation {
  file: string;
  rule: string;
  detail: string;
}

const SECRET_KEY_PATTERN = /^(password|apiKey|api_key|secret|token)$/i;

function isTemplated(value: unknown): boolean {
  return typeof value === "string" && /\$\{.*\}/.test(value);
}

type ObjectVisitor = (obj: Record<string, unknown>, keyPath: string) => void;

/** Depth-first walk over every plain-object node in a parsed YAML document. */
function walkObjects(node: unknown, visit: ObjectVisitor, keyPath = "$"): void {
  if (Array.isArray(node)) {
    node.forEach((item, i) => walkObjects(item, visit, `${keyPath}[${i}]`));
    return;
  }
  if (node && typeof node === "object") {
    const obj = node as Record<string, unknown>;
    visit(obj, keyPath);
    for (const [key, value] of Object.entries(obj)) {
      walkObjects(value, visit, `${keyPath}.${key}`);
    }
  }
}

export function checkNoRawSleep(filePath: string, raw: string): Violation[] {
  if (/^\s*-?\s*sleep\s*:/m.test(raw)) {
    return [
      {
        file: filePath,
        rule: "no-raw-sleep",
        detail: "Found a literal `sleep:` command - synchronize on element/screen state (e.g. extendedWaitUntil) instead.",
      },
    ];
  }
  return [];
}

export function checkNoCoordinateTaps(filePath: string, commandsDoc: unknown): Violation[] {
  const violations: Violation[] = [];
  walkObjects(commandsDoc, (obj, keyPath) => {
    if ("point" in obj) {
      violations.push({
        file: filePath,
        rule: "no-coordinate-taps",
        detail: `Found a coordinate-based selector at ${keyPath} - use a stable id/text selector instead (see docs/BestPractices.md).`,
      });
    }
  });
  return violations;
}

export function checkNoXpath(filePath: string, commandsDoc: unknown): Violation[] {
  const violations: Violation[] = [];
  walkObjects(commandsDoc, (obj, keyPath) => {
    for (const key of Object.keys(obj)) {
      if (/xpath/i.test(key)) {
        violations.push({
          file: filePath,
          rule: "no-xpath",
          detail: `Found an xpath-looking selector key "${key}" at ${keyPath} - Maestro has no XPath support; use id/text instead.`,
        });
      }
    }
  });
  return violations;
}

export function checkNoUnguardedIndex(filePath: string, commandsDoc: unknown): Violation[] {
  const violations: Violation[] = [];
  walkObjects(commandsDoc, (obj, keyPath) => {
    if ("index" in obj && !("id" in obj) && !("text" in obj)) {
      violations.push({
        file: filePath,
        rule: "no-unguarded-index",
        detail: `Found an index-only selector at ${keyPath} - pair "index" with an "id" or "text" selector (see docs/BestPractices.md).`,
      });
    }
  });
  return violations;
}

export function checkNoHardcodedSecrets(filePath: string, commandsDoc: unknown): Violation[] {
  const violations: Violation[] = [];
  walkObjects(commandsDoc, (obj, keyPath) => {
    for (const [key, value] of Object.entries(obj)) {
      if (SECRET_KEY_PATTERN.test(key) && typeof value === "string" && !isTemplated(value)) {
        violations.push({
          file: filePath,
          rule: "no-hardcoded-secrets",
          detail: `Found a literal value for "${key}" at ${keyPath}.${key} - use \${VAR} instead of a hardcoded secret.`,
        });
      }
    }
  });
  return violations;
}

export function checkScenarioLayerIsSelectorFree(filePath: string, commandsDoc: unknown): Violation[] {
  if (!filePath.split(path.sep).includes("scenarios")) {
    return [];
  }
  if (!Array.isArray(commandsDoc)) {
    return [];
  }
  const violations: Violation[] = [];
  commandsDoc.forEach((step, i) => {
    if (typeof step !== "object" || step === null) {
      return;
    }
    const keys = Object.keys(step as Record<string, unknown>);
    if (!keys.every((key) => key === "runFlow")) {
      violations.push({
        file: filePath,
        rule: "scenario-layer-selector-free",
        detail: `Step ${i} uses "${keys.join(", ")}" - a scenario may only contain runFlow (see docs/CreatingFlows.md).`,
      });
    }
  });
  return violations;
}

function parseFlowFile(filePath: string): { config: unknown; commands: unknown } | null {
  const raw = fs.readFileSync(filePath, "utf-8");
  const docs = yaml.loadAll(raw);
  if (docs.length < 2) {
    return null;
  }
  return { config: docs[0], commands: docs[1] };
}

export function lintFlowFile(filePath: string): Violation[] {
  const raw = fs.readFileSync(filePath, "utf-8");
  const parsed = parseFlowFile(filePath);
  if (!parsed) {
    return [
      {
        file: filePath,
        rule: "parseable",
        detail: "File must contain a config section and a commands section separated by ---.",
      },
    ];
  }
  return [
    ...checkNoRawSleep(filePath, raw),
    ...checkNoCoordinateTaps(filePath, parsed.commands),
    ...checkNoXpath(filePath, parsed.commands),
    ...checkNoUnguardedIndex(filePath, parsed.commands),
    ...checkNoHardcodedSecrets(filePath, parsed.commands),
    ...checkScenarioLayerIsSelectorFree(filePath, parsed.commands),
  ];
}

export function lintAllFlows(workspaceDir: string = MAESTRO_WORKSPACE_DIR): Violation[] {
  const files = fg.sync("{scenarios,flows,helpers}/**/*.yaml", { cwd: workspaceDir, absolute: true });
  return files.flatMap((file) => lintFlowFile(file));
}

const isMainModule = import.meta.url === `file://${process.argv[1]}`;
if (isMainModule) {
  const violations = lintAllFlows();
  if (violations.length > 0) {
    for (const violation of violations) {
      logger.error(`${violation.file}: [${violation.rule}] ${violation.detail}`);
    }
    logger.error(`${violations.length} flow convention violation(s) found.`);
    process.exitCode = 1;
  } else {
    logger.info("All flow files pass convention checks.");
  }
}
