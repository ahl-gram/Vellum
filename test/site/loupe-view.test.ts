import test from "node:test";
import assert from "node:assert/strict";
import { loupeView, type LoupeInput } from "../../src/site/explorer/loupe-view.ts";

const BOX = { width: 792.59375, height: 611.84375 };
const ZOOM = { x: -130.25, y: -77.5 };
const AT = { x: 301.7, y: 222.3 };
const DEPTHS = [1, 2.5, 24];
const POWERS = [2, 3];

const input = (k: number, power: number): LoupeInput => ({
  at: AT,
  box: BOX,
  zoom: { ...ZOOM, k },
  diameter: 240,
  power,
});

test("the sheet point under the pointer sits at the lens centre, at every depth and power (Issue #751)", () => {
  assert.notEqual(ZOOM.x, 0, "a camera off the origin, so a dropped term shows");
  for (const k of DEPTHS)
    for (const power of POWERS) {
      const v = loupeView(input(k, power));
      assert.ok(
        Math.abs((120 - v.sheet.x) / (k * power) - (AT.x - ZOOM.x) / k) < 1e-9,
        `x at depth ${k}, power ${power}: read ${(120 - v.sheet.x) / (k * power)}`,
      );
      assert.ok(
        Math.abs((120 - v.sheet.y) / (k * power) - (AT.y - ZOOM.y) / k) < 1e-9,
        `y at depth ${k}, power ${power}: read ${(120 - v.sheet.y) / (k * power)}`,
      );
    }
});

test("the copy is the gesture box at its own fractional size, magnified by depth times power, and the lens is centred on the pointer (Issue #751)", () => {
  assert.notEqual(BOX.width % 1, 0, "a fractional box, so whole pixels would show");
  for (const k of DEPTHS)
    for (const power of POWERS) {
      const v = loupeView(input(k, power));
      assert.ok(
        Math.abs(v.sheet.w - BOX.width * k * power) < 1e-9,
        `w at depth ${k}, power ${power}: read ${v.sheet.w}`,
      );
      assert.ok(
        Math.abs(v.sheet.h - BOX.height * k * power) < 1e-9,
        `h at depth ${k}, power ${power}: read ${v.sheet.h}`,
      );
      assert.equal(v.lens.x, AT.x - 120);
      assert.equal(v.lens.y, AT.y - 120);
    }
});
