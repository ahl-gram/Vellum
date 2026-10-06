import { test } from "node:test";
import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { faceModulePath, faceModuleSource, PLATE_FACES, segmentDistance2, simplify, TOLERANCE } from "../../scripts/plate-face.ts";
import { GRID, type FaceName } from "../../src/prospect/letter/face.ts";
import { FACES } from "../../src/prospect/letter/letter.ts";

test("the committed face tables are exactly what npm run plate-face writes from the kit's plate faces", () => {
  for (const name of Object.keys(PLATE_FACES) as FaceName[]) {
    assert.equal(readFileSync(faceModulePath(name), "utf8"), faceModuleSource(name), `src/prospect/letter/face-${name}.ts is stale or hand-edited: run npm run plate-face`);
  }
});

function decode(d: string): Array<readonly [number, number]> {
  const pts: Array<readonly [number, number]> = [];
  let x = 0, y = 0, sx = 0, sy = 0, cmd = "";
  const toks = d.match(/[mlz]|-?\d+/g) ?? [];
  for (let i = 0; i < toks.length; ) {
    const t = toks[i]!;
    if (/[mlz]/.test(t)) { cmd = t; i++; if (t === "z") { x = sx; y = sy; } continue; }
    x += Number(toks[i]); y += Number(toks[i + 1]); i += 2;
    if (cmd === "m") { sx = x; sy = y; cmd = "l"; }
    pts.push([x * GRID, -y * GRID]);
  }
  return pts;
}

test("every glyph's outline decodes to its own ink box, so no two numbers in the path data run together", () => {
  for (const face of Object.values(FACES)) {
    for (const [key, g] of Object.entries(face.glyphs)) {
      if (g[5] === "") continue;
      const pts = decode(g[5]);
      const xs = pts.map((p) => p[0]), ys = pts.map((p) => p[1]);
      const slack = TOLERANCE + GRID;
      const off = [Math.min(...xs) - g[1], Math.max(...xs) - g[2], Math.min(...ys) - g[3], Math.max(...ys) - g[4]].map(Math.abs);
      assert.ok(off.every((o) => o <= slack), `${face.name} ${JSON.stringify(key)}: decoded box is off its record by ${JSON.stringify(off)}`);
    }
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
