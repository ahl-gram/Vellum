import { test } from "node:test";
import assert from "node:assert/strict";
import { scaleTicks } from "../../src/site/shared/instrument-scale.ts";
import { SEAM_U } from "../../src/render/ages-track.ts";
import { El, installShim } from "../../test-support/element-shim.ts";

// #462 ruling 6: the strip's scale, the seam the bar's own (SEAM_U), the ages half linear in years.

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

// The class the seed-42 fixture is drawn from the safe side of (skeptic on PR #492): a century within LABEL_GAP_U of the present (seed 90: 900 against 901) or of the seam keeps its tick and loses its label.
test("a century crowding the present or the seam keeps its tick and drops its label", async () => {
  const { LABEL_GAP_U } = await import("../../src/site/shared/instrument-scale.ts");
  const nearPresent = scaleTicks({ days: null, years: { min: 435, max: 901 } });
  const nine = nearPresent.filter((k) => k.kind === "year" && Math.abs(k.u - (0.5 + 0.5 * (900 - 435) / (901 - 435))) < 1e-9);
  assert.equal(nine.length, 1, "the 900 tick stands");
  assert.equal(nine[0].label, undefined, "but unlabelled: 901 is 0.001u away");
  assert.deepEqual(nearPresent.filter((k) => k.label !== undefined && k.kind === "year").map((k) => k.label), ["500", "600", "700", "800", "901"]);
  const nearSeam = scaleTicks({ days: null, years: { min: 199, max: 876 } });
  const two = nearSeam.filter((k) => k.kind === "year").find((k) => Math.abs(k.u - (0.5 + 0.5 * (200 - 199) / (876 - 199))) < 1e-9);
  assert.ok(two && two.label === undefined, "200 stands 0.0007u right of the star, so its label goes");
  assert.ok(LABEL_GAP_U > 0.02 && LABEL_GAP_U < 0.06, "the gap is a label's width plus a breath on a 1440 scale");
});

test("a world with no survey marks no days, and a one-year span still yields the present", () => {
  const t = scaleTicks({ days: null, years: { min: 900, max: 900 } });
  assert.equal(t.filter((k) => k.kind === "day").length, 0);
  const years = t.filter((k) => k.kind === "year");
  assert.deepEqual(years.map((y) => [y.label, y.u]), [["900", 1]]);
});

test("renderScale lays the ticks with their hooks: first and last days, the seam, the present", async () => {
  const { renderScale } = await import("../../src/site/shared/instrument-scale.ts");
  installShim();
  const el = new El("div") as unknown as HTMLElement;
  renderScale(el, scaleTicks({ days: { first: 1, last: 44 }, years: { min: 435, max: 876 } }));
  const kids = (el as unknown as El).children;
  const byClass = (c: string) => kids.filter((k: El) => k.classes.has(c));
  assert.deepEqual(byClass("day").map((k: El) => [k.style.left, k.classes.has("first"), k.classes.has("last")]), [["0.000%", true, false], ["50.000%", false, true]], "the first day hugs the left end, the last day stands on the seam and wears .last");
  assert.equal(byClass("seam").length, 1, "one star at the seam");
  assert.equal(byClass("seam")[0].style.left, "50.000%");
  const years = byClass("year");
  assert.ok(years.length >= 2 && years[years.length - 1].classes.has("last") && years[years.length - 1].style.left === "100.000%", "the present stands at the right end and wears .last");
  assert.ok(years.slice(0, -1).every((k: El) => !k.classes.has("last")), "no century wears .last");
});
