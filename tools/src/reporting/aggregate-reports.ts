import fs from "node:fs";
import path from "node:path";
import fg from "fast-glob";
import { TEST_OUTPUT_DIR } from "../utils/paths.js";
import { createLogger } from "../utils/logger.js";

const logger = createLogger("reporting");

export interface PlatformSummary {
  platform: string;
  tests: number;
  failures: number;
}

/**
 * Maestro already produces JUnit XML natively (`maestro test --format
 * junit`) - this only organizes per-platform reports (expected at
 * `<outputDir>/<platform>/report.xml`, per run-smoke.ts) into one combined
 * summary.json for CI artifact upload / PR comment rendering. It does not
 * re-parse or re-generate the reports themselves.
 */
function parseJUnitCounts(xml: string): { tests: number; failures: number } {
  const match = xml.match(/<testsuite[^>]*\btests="(\d+)"[^>]*\bfailures="(\d+)"/);
  if (!match || !match[1] || !match[2]) {
    return { tests: 0, failures: 0 };
  }
  return { tests: Number(match[1]), failures: Number(match[2]) };
}

export function aggregateReports(outputDir: string = TEST_OUTPUT_DIR): PlatformSummary[] {
  const reportFiles = fg.sync("*/report.xml", { cwd: outputDir, absolute: true });

  const summaries = reportFiles.map((filePath): PlatformSummary => {
    const platform = path.basename(path.dirname(filePath));
    const { tests, failures } = parseJUnitCounts(fs.readFileSync(filePath, "utf-8"));
    return { platform, tests, failures };
  });

  fs.mkdirSync(outputDir, { recursive: true });
  const summaryPath = path.join(outputDir, "summary.json");
  fs.writeFileSync(summaryPath, JSON.stringify(summaries, null, 2));
  logger.info(`Wrote ${summaryPath}`);

  return summaries;
}

const isMainModule = import.meta.url === `file://${process.argv[1]}`;
if (isMainModule) {
  const summaries = aggregateReports();
  if (summaries.length === 0) {
    logger.warn(`No report.xml files found under ${TEST_OUTPUT_DIR}/*/report.xml`);
  }
  for (const summary of summaries) {
    logger.info(`${summary.platform}: ${summary.tests - summary.failures}/${summary.tests} passed`);
  }
}
