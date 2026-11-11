import { spawnSync } from "node:child_process";

// A cap on a hang, never a budget (2026-09-27 and 2026-10-18: the listing ran in 6 to 7 ms on a Mac, so 30 s is three orders above it); a timed-out spawnSync returns status null rather than throwing, which the status check below turns into a throw.
const GIT_MS = 30_000;

export const listWorkingTree = (root: string, pathspecs: readonly string[] = [], timeoutMs = GIT_MS): string[] => {
  const run = spawnSync(
    "git",
    ["ls-files", "-z", "--cached", "--others", "--exclude-standard", "--deduplicate", "--", ...pathspecs],
    { cwd: root, encoding: "utf8", timeout: timeoutMs },
  );
  if (run.status !== 0)
    throw new Error(`git ls-files under ${root} failed (${run.status}, ${String(run.error ?? run.stderr).trim()})`);
  return run.stdout.split("\0").filter(Boolean).sort();
};
