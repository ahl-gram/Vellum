import { spawnSync } from "node:child_process";
import { fileURLToPath } from "node:url";

export const SUITE = "test/**/*.test.ts";

export const unitArgs = (forwarded: readonly string[]): string[] => [
  "--import",
  "./test-support/source-read-guard.ts",
  "--test",
  "--test-timeout=600000",
  ...forwarded,
  ...(forwarded.some((arg) => !arg.startsWith("-")) ? [] : [SUITE]),
];

if (process.argv[1] === fileURLToPath(import.meta.url)) {
  const run = spawnSync(process.execPath, unitArgs(process.argv.slice(2)), { stdio: "inherit" });
  process.exitCode = run.status ?? 1;
}
