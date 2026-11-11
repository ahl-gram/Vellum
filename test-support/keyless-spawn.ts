import { spawnSync } from "node:child_process";
import { mkdtempSync, rmSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";

export type Run = { readonly status: number | null; readonly stdout: string; readonly stderr: string };

export const NO_KEY = "TYPESAFE_API_KEY is not set and ~/.config/typesafe/key holds no key";

export const runKeyless = (script: string, args: readonly string[], cwd: string, timeoutMs: number): Run => {
  const home = mkdtempSync(join(tmpdir(), "keyless-home-"));
  try {
    const env = Object.fromEntries(Object.entries(process.env).filter(([name]) => name !== "TYPESAFE_API_KEY"));
    const r = spawnSync(process.execPath, [script, ...args], {
      cwd,
      env: { ...env, HOME: home },
      encoding: "utf8",
      timeout: timeoutMs,
    });
    return { status: r.status, stdout: r.stdout, stderr: r.stderr };
  } finally {
    rmSync(home, { recursive: true, force: true });
  }
};
