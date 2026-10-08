import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { join, resolve } from "node:path";

const ROOT = resolve(import.meta.dirname, "..");

export const ciJob = (id: string): string => {
  const lines = readFileSync(join(ROOT, ".github/workflows/ci.yml"), "utf8").split("\n");
  const head = lines.findIndex((l) => new RegExp(`^ {2}${id}:\\s*$`).test(l));
  assert.notEqual(
    head,
    -1,
    `ci.yml has no ${id} job at two-space indent, so this reader is looking at the wrong shape`,
  );
  const next = lines.findIndex((l, i) => i > head && /^ {2}[A-Za-z0-9_-]+:\s*$/.test(l));
  return lines
    .slice(head, next === -1 ? lines.length : next)
    .filter((l) => !l.trim().startsWith("#"))
    .join("\n");
};
