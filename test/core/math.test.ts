import { test } from "node:test";
import assert from "node:assert/strict";
import { clamp, lerp, smoothstep } from "../../src/core/math.ts";

test("clamp", () => {
  assert.equal(clamp(5, 0, 10), 5);
  assert.equal(clamp(-1, 0, 10), 0);
  assert.equal(clamp(11, 0, 10), 10);
});

test("lerp", () => {
  assert.equal(lerp(0, 10, 0), 0);
  assert.equal(lerp(0, 10, 1), 10);
  assert.equal(lerp(0, 10, 0.5), 5);
});

test("smoothstep eases between edges", () => {
  assert.equal(smoothstep(0, 1, -1), 0);
  assert.equal(smoothstep(0, 1, 2), 1);
  assert.equal(smoothstep(0, 1, 0.5), 0.5);
  assert.ok(smoothstep(0, 1, 0.25) < 0.25, "ease-in below linear");
  assert.ok(smoothstep(0, 1, 0.75) > 0.75, "ease-out above linear");
});
