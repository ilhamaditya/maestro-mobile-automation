type Level = "DEBUG" | "INFO" | "WARN" | "ERROR";

const LEVEL_WEIGHT: Record<Level, number> = {
  DEBUG: 10,
  INFO: 20,
  WARN: 30,
  ERROR: 40,
};

function currentThreshold(): number {
  const configured = (process.env["LOG_LEVEL"] ?? "INFO").toUpperCase() as Level;
  return LEVEL_WEIGHT[configured] ?? LEVEL_WEIGHT.INFO;
}

function log(level: Level, scope: string, message: string): void {
  if (LEVEL_WEIGHT[level] < currentThreshold()) {
    return;
  }
  const line = `[${new Date().toISOString()}] ${level.padEnd(5)} (${scope}) ${message}`;
  if (level === "ERROR") {
    console.error(line);
  } else if (level === "WARN") {
    console.warn(line);
  } else {
    console.log(line);
  }
}

export function createLogger(scope: string): Record<Lowercase<Level>, (message: string) => void> {
  return {
    debug: (message: string) => log("DEBUG", scope, message),
    info: (message: string) => log("INFO", scope, message),
    warn: (message: string) => log("WARN", scope, message),
    error: (message: string) => log("ERROR", scope, message),
  };
}
