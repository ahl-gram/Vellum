import assert from "node:assert/strict";
import { spawnSync } from "node:child_process";
import { resolve } from "node:path";

const REPO = resolve(import.meta.dirname, "..");
const GIT_TIMEOUT_MS = 30_000;

export function trackedUnder(...roots: string[]): ReadonlyArray<string> {
  const listing = spawnSync("git", ["ls-files", "-z", "--", ...roots], {
    cwd: REPO,
    encoding: "utf8",
    timeout: GIT_TIMEOUT_MS,
  });
  assert.equal(listing.status, 0, `git ls-files failed: ${listing.error?.message ?? listing.stderr}`);
  return listing.stdout.split("\0").filter(Boolean);
}
