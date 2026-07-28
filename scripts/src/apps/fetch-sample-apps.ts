import fs from "node:fs";
import os from "node:os";
import path from "node:path";
import crypto from "node:crypto";
import { execa } from "execa";
import { APPS_DIR } from "../utils/paths.js";
import { createLogger } from "../utils/logger.js";

const logger = createLogger("fetch-apps");

// Confirmed by reading DownloadSamplesCommand.kt in mobile-dev-inc/Maestro
// (2026-07-14): this is the exact URL `maestro download-samples` itself
// fetches. samples.zip bundles both the Android APK and a pre-built iOS
// Simulator .app for the same Wikipedia sample - no Xcode build required.
const SAMPLES_URL = "https://storage.googleapis.com/mobile.dev/samples/samples.zip";

async function downloadFile(url: string, destination: string): Promise<void> {
  const response = await fetch(url);
  if (!response.ok) {
    throw new Error(`Failed to download ${url}: HTTP ${response.status}`);
  }
  const buffer = Buffer.from(await response.arrayBuffer());
  fs.writeFileSync(destination, buffer);
}

function sha256(filePath: string): string {
  const hash = crypto.createHash("sha256");
  hash.update(fs.readFileSync(filePath));
  return hash.digest("hex");
}

export async function fetchSampleApps(): Promise<void> {
  const androidBuildDir = path.join(APPS_DIR, "android", "build");
  const iosBuildDir = path.join(APPS_DIR, "ios", "build");
  fs.mkdirSync(androidBuildDir, { recursive: true });
  fs.mkdirSync(iosBuildDir, { recursive: true });

  const tmpDir = fs.mkdtempSync(path.join(os.tmpdir(), "maestro-samples-"));
  const zipPath = path.join(tmpDir, "samples.zip");

  try {
    logger.info(`Downloading ${SAMPLES_URL} ...`);
    await downloadFile(SAMPLES_URL, zipPath);
    // Maestro does not publish an official checksum for samples.zip, so this
    // hash is an audit-trail log line, not a verification gate against a
    // known-good value - documented as-is rather than faked.
    logger.info(`Downloaded samples.zip (sha256: ${sha256(zipPath)})`);

    await execa("unzip", ["-o", zipPath, "wikipedia.apk", "wikipedia.zip", "-d", tmpDir]);

    const apkDest = path.join(androidBuildDir, "wikipedia.apk");
    fs.copyFileSync(path.join(tmpDir, "wikipedia.apk"), apkDest);
    logger.info(`Android sample app ready: ${apkDest}`);

    await execa("unzip", ["-o", path.join(tmpDir, "wikipedia.zip"), "-d", iosBuildDir]);
    logger.info(`iOS sample app ready: ${path.join(iosBuildDir, "Wikipedia.app")}`);
  } finally {
    fs.rmSync(tmpDir, { recursive: true, force: true });
  }
}

const isMainModule = import.meta.url === `file://${process.argv[1]}`;
if (isMainModule) {
  fetchSampleApps().catch((error: unknown) => {
    logger.error(error instanceof Error ? error.message : String(error));
    process.exitCode = 1;
  });
}
