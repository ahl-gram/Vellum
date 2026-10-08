import { execFileSync, spawnSync } from "node:child_process";
import { mkdtempSync, realpathSync, rmSync, writeFileSync } from "node:fs";
import { tmpdir } from "node:os";
import { join, resolve } from "node:path";

export const BOUND_MS = 30_000;
export const SCRIPT = resolve(import.meta.dirname, "..", "scripts", "agent-sandbox.ts");

export const git = (args: string[], cwd: string): string =>
  execFileSync("git", args, { cwd, encoding: "utf8", timeout: BOUND_MS }).trim();

export const withRepo = (body: (main: string, linked: string) => void): void => {
  const made = mkdtempSync(join(tmpdir(), "agent-sandbox-"));
  const dir = realpathSync(made); // git reports realpaths, and on macOS tmpdir() is /var, a symlink to /private/var, so an unresolved fixture path never equals what resolveRoot returns

  try {
    git(["init", "-q", "-b", "main", "."], dir);
    git(["config", "user.email", "t@t"], dir);
    git(["config", "user.name", "t"], dir);
    writeFileSync(join(dir, "f.txt"), "one\n");
    git(["add", "-A"], dir);
    git(["commit", "-qm", "c1"], dir);
    const linked = join(dir, "linked");
    git(["worktree", "add", "-q", "--detach", linked, "HEAD"], dir);
    writeFileSync(join(linked, "f.txt"), "two\n");
    git(["add", "-A"], linked);
    git(["commit", "-qm", "c2"], linked);
    body(dir, linked);
  } finally {
    rmSync(made, { recursive: true, force: true });
  }
};

export const cli = (args: string[], cwd: string): { status: number; out: string; err: string } => {
  const r: { status: number | null; stdout: string | undefined; stderr: string | undefined } = spawnSync(
    process.execPath,
    [SCRIPT, ...args],
    { cwd, encoding: "utf8", timeout: BOUND_MS },
  );
  return { status: r.status ?? -1, out: r.stdout ?? "", err: r.stderr ?? "" };
};
