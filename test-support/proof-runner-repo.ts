import { mkdirSync, mkdtempSync, realpathSync, rmSync, writeFileSync } from "node:fs";
import { tmpdir } from "node:os";
import { dirname, join } from "node:path";
import { git } from "./sandbox-repo.ts";

export const writeFiles = (dir: string, files: Readonly<Record<string, string>>): void => {
  for (const [path, text] of Object.entries(files)) {
    mkdirSync(dirname(join(dir, path)), { recursive: true });
    writeFileSync(join(dir, path), text);
  }
};

export const commitAll = (dir: string, message: string): string => {
  git(["add", "-A"], dir);
  git(["commit", "-qm", message], dir);
  return git(["rev-parse", "HEAD"], dir);
};

export const withTempRepo = async <T>(
  files: Readonly<Record<string, string>>,
  body: (dir: string, sha: string) => T | Promise<T>,
): Promise<T> => {
  const made = mkdtempSync(join(tmpdir(), "proof-runner-"));
  const dir = realpathSync(made);
  try {
    git(["init", "-q", "-b", "main", "."], dir);
    git(["config", "user.email", "t@t"], dir);
    git(["config", "user.name", "t"], dir);
    git(["config", "commit.gpgsign", "false"], dir);
    writeFiles(dir, files);
    return await body(dir, commitAll(dir, "base"));
  } finally {
    rmSync(made, { recursive: true, force: true });
  }
};
