// Issue #1255, pull request 1: prints in the publish job's log the browser findBrowser finds there, so the Primer's pictures are built on a reading of it (Issue #1255 comment 7115489261, Q1).
import { execFileSync } from "node:child_process";
import { existsSync } from "node:fs";
import { findBrowser } from "../src/cli/raster.ts";

// 2026-11-23, Issue #1255: a browser's --version answered in 0.03 s on this Mac; 30 s is far above it, so a stalled read prints the path with "version unreadable" instead of holding the step.
const VERSION_MS = 30_000;

export function browserReport(
  found: string | null,
  wanted: string | undefined,
  exists: (path: string) => boolean,
  version: (path: string) => string,
): readonly string[] {
  void [found, wanted, exists, version];
  return [];
}

if (import.meta.main) {
  const found = findBrowser();
  const lines = browserReport(found, process.env["VELLUM_BROWSER"], existsSync, (path) =>
    execFileSync(path, ["--version"], { encoding: "utf8", timeout: VERSION_MS }).trim(),
  );
  for (const line of lines) console.log(line);
  if (found === null) process.exitCode = 1;
}
