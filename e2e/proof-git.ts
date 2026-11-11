import { execFileSync } from "node:child_process";
import { resolve } from "node:path";

const ROOT = resolve(import.meta.dirname, "..");
const GIT_TIMEOUT_MS = 30_000;

export const git = (args: string[]): string =>
  execFileSync("git", args, { cwd: ROOT, encoding: "utf8", timeout: GIT_TIMEOUT_MS, maxBuffer: 64 * 1024 * 1024 });
