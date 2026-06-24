import { test } from "node:test";
import assert from "node:assert/strict";
import { diffSvg, DRIFT_TOL, type SvgDiff } from "../../scripts/svg-drift.ts";

/**
 * Unit tests for the drift-guard comparison (svg-drift.ts). The hero-charts guard
 * (hero-charts.test.ts) exercises diffSvg against the real committed charts, but
 * on a single platform it only ever sees the byte-identical case. These pin the
 * behaviours that matter on CI and across machines — proven here with synthetic
 * inputs instead of by hand-perturbing committed files.
 */

function expectNumeric(d: SvgDiff | null): Extract<SvgDiff, { kind: "numeric" }> {
  if (d?.kind !== "numeric") assert.fail(`expected a numeric diff, got ${d?.kind ?? "null"}`);
  return d;
}

test("identical SVGs report no diff", () => {
  const s = "<svg><path d=\"M1.5 2.5L3.25 4.75\"/></svg>";
  assert.equal(diffSvg(s, s), null);
});

test("trailing-ULP numeric noise is within tolerance (the cross-platform case)", () => {
  // ~1e-13 delta — the magnitude CI measured (1.14e-13) between linux/node26 and
  // mac/node22. Near 1.0 a 1e-13 difference is hundreds of ULPs, so the two
  // strings parse to distinct doubles (unlike 1e-13 near 1157, which is sub-ULP).
  const a = "<path d=\"M1.0000000000001 0\"/>";
  const b = "<path d=\"M1.0000000000002 0\"/>";
  const d = expectNumeric(diffSvg(a, b));
  assert.equal(d.overTol, 0, "ULP noise must not count as drift");
  assert.ok(d.maxAbs > 0 && d.maxAbs < 1e-9, `expected a sub-1e-9 delta, got ${d.maxAbs}`);
});

test("a 0.01 rounding-boundary flip is tolerated", () => {
  // a 2-decimal coordinate nudged by one quantum (what a boundary flip looks like)
  const d = expectNumeric(diffSvg("<path d=\"M0.34 0\"/>", "<path d=\"M0.35 0\"/>"));
  assert.equal(d.overTol, 0, "a single rounding-quantum flip must be tolerated");
  assert.ok(Math.abs(d.maxAbs - 0.01) < 1e-9, `expected ~0.01 delta, got ${d.maxAbs}`);
});

test("a coordinate move beyond tolerance is reported as drift with its magnitude", () => {
  const d = expectNumeric(diffSvg("<path d=\"M1157.93 0\"/>", "<path d=\"M1257.93 0\"/>"));
  assert.equal(d.overTol, 1, "one number moved past tolerance");
  assert.equal(d.total, 2, "both numeric tokens (1157.93 and 0) are counted");
  assert.ok(Math.abs(d.maxAbs - 100) < 1e-9, `expected a 100px delta, got ${d.maxAbs}`);
  assert.ok(d.examples[0]?.includes("1157.93") && d.examples[0]?.includes("1257.93"));
});

test("a structural (non-numeric) change is reported as a structure diff at the divergence point", () => {
  const a = "<svg><path d=\"M1 2\"/></svg>";
  const b = "<svg data-drift=\"x\"><path d=\"M1 2\"/></svg>";
  const d = diffSvg(a, b);
  if (d?.kind !== "structure") assert.fail(`expected a structure diff, got ${d?.kind ?? "null"}`);
  assert.equal(d.at, 4, "divergence is right after `<svg`");
  assert.ok(d.committed.length > 0 && d.fresh.length > 0, "reports context on both sides");
});

test("a changed attribute value (no number change) is caught structurally", () => {
  const a = "<rect fill=\"#2f5a86\"/>";
  const b = "<rect fill=\"#3f6b46\"/>";
  assert.equal(diffSvg(a, b)?.kind, "structure", "a recoloured fill is real drift");
});

test("tolerance is configurable: the same 0.01 flip is drift under a tighter tol", () => {
  const tight = expectNumeric(diffSvg("<path d=\"M0.34 0\"/>", "<path d=\"M0.35 0\"/>", 0.001));
  assert.equal(tight.overTol, 1, "0.01 exceeds a 0.001 tolerance");
  // and the default tolerance is the documented 0.05
  assert.equal(DRIFT_TOL, 0.05);
});
