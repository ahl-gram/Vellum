import { test } from "node:test";
import assert from "node:assert/strict";
import { scaleTicks } from "../../src/site/shared/instrument-scale.ts";
import { SEAM_U } from "../../src/render/ages-track.ts";

// #462 ruling 6: the strip's scale carries the survey's days on the left and the annals' years on the right, a star at the seam. The bar's domain puts the seam at the midpoint (ages.ts: [0, 2 * yearSpan]), and the ages half is linear in years, so a year's u is 0.5 + 0.5 * (y - min) / (max - min).

test("the seam stands at the midpoint, the first day at the left end, the last day just short of the seam", () => {
  const t = scaleTicks({ days: { first: 1, last: 44 }, years: { min: 435, max: 876 } });
  const seam = t.find((k) => k.kind === "seam");
  assert.ok(seam && seam.u === SEAM_U && SEAM_U === 0.5, "the seam is the bar's own SEAM_U (ages-track.ts), the midpoint");
  const days = t.filter((k) => k.kind === "day");
  assert.deepEqual(days.map((d) => d.label), ["day 1", "day 44"]);
  assert.equal(days[0].u, 0);
  assert.equal(days[1].u, SEAM_U, "the last day stands where the bar puts it: on the seam (uFor clamps the survey half to SEAM_U)");
});

test("the years are the centuries between, plus the present at the right end, linear in the ages half", () => {
  const t = scaleTicks({ days: { first: 1, last: 44 }, years: { min: 435, max: 876 } });
  const years = t.filter((k) => k.kind === "year");
  assert.deepEqual(years.map((y) => y.label), ["500", "600", "700", "800", "876"]);
  const at = (y: number) => 0.5 + 0.5 * (y - 435) / (876 - 435);
  for (const y of years) assert.ok(Math.abs(y.u - at(Number(y.label))) < 1e-9, `${y.label} sits at its year`);
});

test("a world with no survey marks no days, and a one-year span still yields the present", () => {
  const t = scaleTicks({ days: null, years: { min: 900, max: 900 } });
  assert.equal(t.filter((k) => k.kind === "day").length, 0);
  const years = t.filter((k) => k.kind === "year");
  assert.deepEqual(years.map((y) => [y.label, y.u]), [["900", 1]]);
});
