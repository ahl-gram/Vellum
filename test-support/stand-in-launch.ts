import { mock } from "node:test";
import { chmodSync, mkdtempSync, readdirSync, rmSync, writeFileSync } from "node:fs";
import { join } from "node:path";
import { tmpdir } from "node:os";
import type { LaunchTuning } from "../e2e/support/launch.ts";
import { STAND_IN_BROWSER, STAND_IN_DIES_VAR, STAND_IN_SILENT_VAR } from "./stand-in-browser.ts";

// STAND_IN_TUNING gives a stand-in node child 3000ms to bind: on ten CI runs through 2026-10-03 (PR #735) the slowest second stand-in came up in about 420ms.
export const STAND_IN_TUNING: LaunchTuning = {
  attempts: 3,
  polls: 150,
  pollMs: 20,
  killGraceMs: 5000,
  retryPauseMs: 50,
};
export const EXEC_STAND_IN = `exec "${process.execPath}" "${STAND_IN_BROWSER}" "$@"`;

export interface StandInOptions {
  readonly silent?: number;
  readonly dies?: boolean;
  readonly body?: (dir: string) => string;
}

interface StandIn {
  readonly dir: string;
  readonly browser: string;
  lines(): string[];
  profiles(): string[];
  restore(): void;
}

const put = (name: string, value: string | undefined): void => {
  if (value === undefined) delete process.env[name];
  else process.env[name] = value;
};

export function standInBrowser(profilePrefix: string, options: StandInOptions = {}): StandIn {
  const dir = mkdtempSync(join(tmpdir(), "stand-in-launch-"));
  const saved = {
    tmp: process.env["TMPDIR"],
    silent: process.env[STAND_IN_SILENT_VAR],
    dies: process.env[STAND_IN_DIES_VAR],
  };
  put("TMPDIR", dir);
  put(STAND_IN_SILENT_VAR, String(options.silent ?? 0));
  put(STAND_IN_DIES_VAR, options.dies === true ? "1" : undefined);
  const browser = join(dir, "browser");
  writeFileSync(browser, `#!/bin/sh\n${(options.body ?? (() => EXEC_STAND_IN))(dir)}\n`);
  chmodSync(browser, 0o755);
  const logged = mock.method(console, "error", () => {});
  return {
    dir,
    browser,
    lines: () => logged.mock.calls.map((c) => String(c.arguments[0])),
    profiles: () => readdirSync(dir).filter((n) => n.startsWith(profilePrefix)),
    restore: () => {
      logged.mock.restore();
      put("TMPDIR", saved.tmp);
      put(STAND_IN_SILENT_VAR, saved.silent);
      put(STAND_IN_DIES_VAR, saved.dies);
      rmSync(dir, { recursive: true, force: true });
    },
  };
}
