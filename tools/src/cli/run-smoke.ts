import fs from "node:fs";
import path from "node:path";
import { execa } from "execa";
import { isEnvironmentTarget, loadEnvironment, VALID_TARGETS, type EnvironmentTarget } from "../env/load-env.js";
import { MAESTRO_WORKSPACE_DIR, TEST_OUTPUT_DIR } from "../utils/paths.js";
import { createLogger } from "../utils/logger.js";
import { aggregateReports } from "../reporting/aggregate-reports.js";

const logger = createLogger("run-smoke");

type Platform = "android" | "ios";

interface CliOptions {
  platform: Platform;
  tags: string[];
  environment: EnvironmentTarget;
}

export function parseArgs(argv: string[]): CliOptions {
  let platform: Platform | undefined;
  let tags = ["smoke"];
  let environment = "local";

  for (let i = 0; i < argv.length; i++) {
    const arg = argv[i];
    if (arg === "--platform") {
      const value = argv[++i];
      if (value !== "android" && value !== "ios") {
        throw new Error(`--platform must be "android" or "ios", got "${String(value)}"`);
      }
      platform = value;
    } else if (arg === "--tags") {
      const value = argv[++i];
      if (!value) {
        throw new Error("--tags requires a comma-separated value");
      }
      tags = value
        .split(",")
        .map((t) => t.trim())
        .filter(Boolean);
    } else if (arg === "--env") {
      environment = argv[++i] ?? environment;
    }
  }

  if (!platform) {
    throw new Error("--platform android|ios is required");
  }
  if (!isEnvironmentTarget(environment)) {
    throw new Error(`--env must be one of: ${VALID_TARGETS.join(", ")} (got "${environment}")`);
  }

  return { platform, tags, environment };
}

/** Finds the first non-offline, non-unauthorized connected Android device/emulator serial. */
async function findAndroidDevice(): Promise<string> {
  const { stdout } = await execa("adb", ["devices"]);
  const line = stdout
    .split("\n")
    .slice(1)
    .find((candidate) => /\tdevice$/.test(candidate.trim()));
  if (!line) {
    throw new Error(
      "No connected Android device/emulator found. Boot one first - see docs/GettingStarted.md.",
    );
  }
  return line.split("\t")[0]?.trim() ?? "";
}

/** Finds the UDID of the first booted iOS Simulator. */
async function findIosDevice(): Promise<string> {
  const { stdout } = await execa("xcrun", ["simctl", "list", "devices", "booted"]);
  const match = /\(([0-9A-Fa-f-]{36})\)\s*\(Booted\)/.exec(stdout);
  if (!match || !match[1]) {
    throw new Error("No booted iOS Simulator found. Boot one first - see docs/GettingStarted.md.");
  }
  return match[1];
}

export async function runSmoke(options: CliOptions): Promise<void> {
  const env = loadEnvironment(options.environment);
  const deviceId =
    options.platform === "android" ? await findAndroidDevice() : await findIosDevice();
  logger.info(`Targeting ${options.platform} device ${deviceId}`);

  const platformOutputDir = path.join(TEST_OUTPUT_DIR, options.platform);
  fs.mkdirSync(platformOutputDir, { recursive: true });

  // The env file's SEARCH_QUERY key maps onto the flow's ${QUERY} variable.
  // Omitted entirely (rather than passed as empty) when absent, so the
  // flow's own header default ("Software testing") applies instead.
  const dataArgs = env["SEARCH_QUERY"] ? ["-e", `QUERY=${env["SEARCH_QUERY"]}`] : [];

  // Confirmed empirically (2026-07-14): Maestro's --include-tags is OR-only,
  // even across repeated flags - `--include-tags android,smoke` (or
  // `--include-tags android --include-tags smoke`) matches ANY flow with
  // EITHER tag, so it would incorrectly pull in the other platform's flows
  // too. `--include-tags` + `--exclude-tags` is the only combination that
  // behaves as AND, so platform scoping goes through the exclude side.
  const oppositePlatform: Platform = options.platform === "android" ? "ios" : "android";

  const args = [
    "--device",
    deviceId,
    "test",
    MAESTRO_WORKSPACE_DIR,
    "--include-tags",
    options.tags.join(","),
    "--exclude-tags",
    oppositePlatform,
    "--format",
    "junit",
    "--output",
    path.join(platformOutputDir, "report.xml"),
    "--debug-output",
    path.join(platformOutputDir, "debug"),
    ...dataArgs,
  ];

  logger.info(`Running: maestro ${args.join(" ")}`);
  // takeScreenshot writes relative to the CLI's own working directory
  // (confirmed empirically, 2026-07-14 - stray .png files otherwise land
  // wherever `npm run smoke:*` happened to be invoked from). Running with
  // cwd set to the platform's output directory colocates screenshots with
  // that run's report.xml instead of polluting the repo.
  await execa("maestro", args, { stdio: "inherit", cwd: platformOutputDir });

  aggregateReports();
}

const isMainModule = import.meta.url === `file://${process.argv[1]}`;
if (isMainModule) {
  try {
    const options = parseArgs(process.argv.slice(2));
    await runSmoke(options);
  } catch (error) {
    logger.error(error instanceof Error ? error.message : String(error));
    process.exitCode = 1;
  }
}
