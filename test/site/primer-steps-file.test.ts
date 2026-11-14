import test from "node:test";
import assert from "node:assert/strict";
import { mkdtempSync, readFileSync, rmSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { writePrimerSteps } from "../../scripts/primer-steps.ts";
import { handSteps } from "../../src/site/shared/primer/hand-steps.ts";
import { LADDERS } from "../../src/site/shared/primer/ladders.ts";

test("PK15 the build writes every step the hand reads as one data file", async () => {
  const tmp = mkdtempSync(join(tmpdir(), "vellum-primer-steps-"));
  try {
    await writePrimerSteps(tmp);
    const written: unknown = JSON.parse(readFileSync(join(tmp, "primer", "steps.json"), "utf8"));
    assert.deepEqual(written, handSteps(LADDERS));
  } finally {
    rmSync(tmp, { recursive: true, force: true });
  }
});
