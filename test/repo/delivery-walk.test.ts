import assert from "node:assert/strict";
import { mkdirSync, mkdtempSync, rmSync, writeFileSync } from "node:fs";
import { tmpdir } from "node:os";
import { dirname, join } from "node:path";
import { test } from "node:test";
import { walkDelivery } from "../../scripts/delivery/walk.ts";

test("a folder or a file whose name begins with a dot stays off the delivery, which is how the comparison's extracted base source stays off the page (Issue #1309)", () => {
  const dir = mkdtempSync(join(tmpdir(), "delivery-walk-"));
  try {
    const put = (rel: string): void => {
      mkdirSync(dirname(join(dir, rel)), { recursive: true });
      writeFileSync(join(dir, rel), "x");
    };
    for (const rel of [
      "still-judge/base.tar",
      "still-judge/stills/1-sheet-today.png",
      "still-judge/.base/package.json",
      "still-judge/.base/src/cli/main.ts",
      ".hidden.txt",
      "notes.md",
    ])
      put(rel);
    const listed = walkDelivery(dir, "walk")
      .sections.flatMap((s) => s.items)
      .map((i) => i.rel)
      .sort();
    assert.deepEqual(listed, ["still-judge/base.tar", "still-judge/stills/1-sheet-today.png"]);
  } finally {
    rmSync(dir, { recursive: true, force: true });
  }
});
