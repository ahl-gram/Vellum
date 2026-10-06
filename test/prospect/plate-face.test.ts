import { test } from "node:test";
import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { faceModulePath, faceModuleSource, PLATE_FACES, segmentDistance2, simplify, TOLERANCE } from "../../scripts/plate-face.ts";
import type { FaceName } from "../../src/prospect/letter/face.ts";

test("the committed face tables are exactly what npm run plate-face writes from the kit's plate faces", () => {
  for (const name of Object.keys(PLATE_FACES) as FaceName[]) {
    assert.equal(readFileSync(faceModulePath(name), "utf8"), faceModuleSource(name), `src/prospect/letter/face-${name}.ts is stale or hand-edited: run npm run plate-face`);
  }
});

test("the simplifier keeps a vertex only past the tolerance, measured on squared distance", () => {
  assert.equal(segmentDistance2([0, TOLERANCE], [-5, 0], [5, 0]), TOLERANCE * TOLERANCE, "premise: the probe sits exactly at the tolerance");
  assert.deepEqual(simplify([[-5, 0], [0, TOLERANCE], [5, 0]], TOLERANCE), [[-5, 0], [5, 0]], "a vertex exactly at the tolerance goes");
  assert.deepEqual(simplify([[-5, 0], [0, TOLERANCE + 0.01], [5, 0]], TOLERANCE), [[-5, 0], [0, TOLERANCE + 0.01], [5, 0]], "a vertex past it stays");
});

test("the generator opens every face table with the OFL notice as a legal comment, the one comment form the bundler keeps", () => {
  for (const name of Object.keys(PLATE_FACES) as FaceName[]) {
    const head = faceModuleSource(name).split("\n")[0] ?? "";
    assert.match(head, /^\/\*! The plate face, .*Igino Marini.*Reserved Font Name IM FELL DW Pica.*SIL Open Font License 1\.1/, `face-${name}.ts opens with the OFL notice`);
  }
});
