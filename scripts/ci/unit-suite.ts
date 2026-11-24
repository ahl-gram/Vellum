import { spawnSync } from "node:child_process";
import { globSync } from "node:fs";
import { fileURLToPath } from "node:url";
import { shardOf } from "./unit-shards.ts";

export const SUITE = "test/**/*.test.ts";

const SHARD = /^--test-shard=(\d+)\/(\d+)$/;
const CLOCK = fileURLToPath(new URL("./unit-file-clock.ts", import.meta.url));

export const unitArgs = (forwarded: readonly string[]): string[] => {
  const prelude = ["--import", "./test-support/source-read-guard.ts", "--test", "--test-timeout=600000"];
  const hasPath = forwarded.some((arg) => !arg.startsWith("-"));
  const shard = hasPath ? undefined : forwarded.map((arg) => SHARD.exec(arg)).find((m) => m !== null);
  if (!shard) return [...prelude, ...forwarded, ...(hasPath ? [] : [SUITE])];
  const rest = forwarded.filter((arg) => !SHARD.test(arg));
  const clock = rest.some((arg) => arg.startsWith("--test-reporter"))
    ? []
    : [
        "--test-reporter=spec",
        "--test-reporter-destination=stdout",
        `--test-reporter=${CLOCK}`,
        "--test-reporter-destination=stdout",
      ];
  return [...prelude, ...clock, ...rest, ...shardOf(globSync(SUITE).sort(), Number(shard[1]), Number(shard[2]))];
};

if (import.meta.main) {
  const run = spawnSync(process.execPath, unitArgs(process.argv.slice(2)), { stdio: "inherit" });
  process.exitCode = run.status ?? 1;
}
