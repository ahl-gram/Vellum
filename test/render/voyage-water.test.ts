import { test } from "node:test";
import assert from "node:assert/strict";
import { routeVoyage, type RoutedLeg } from "../../src/render/voyage-route.ts";
import { INLAND_STUB_CELLS } from "../../src/render/voyage-water.ts";
import type { Pt } from "../../src/core/rdp.ts";
import { leg, site, survey } from "../../test-support/voyage-route-fixtures.ts";

const polylineLength = (points: ReadonlyArray<Pt>): number => {
  let d = 0;
  for (let i = 1; i < points.length; i++) {
    d += Math.hypot(points[i]!.x - points[i - 1]!.x, points[i]!.y - points[i - 1]!.y);
  }
  return d;
};

/** The two overland stubs in grid cells, decoded from the span's fractions. */
const stubs = (l: RoutedLeg): { from: number; to: number } => {
  assert.ok(l.water, "a sea leg must carry its water span");
  const len = polylineLength(l.points);
  return { from: l.water.from * len, to: (1 - l.water.to) * len };
};

// The western port stands 5 cells from its shore, the eastern 2; the straight embark jump is the chain's first segment, so the stub lengths are exact.
const inlandRows = ["#####..........##", "#####..........##", "#####..........##"];

test("an inland port's sea leg knows where the water is: the span excludes both overland stubs", () => {
  const s = survey(inlandRows);
  const [routed] = routeVoyage([leg(0, 1)], [site(0, 0, 1), site(1, 16, 1)], s);
  assert.equal(routed!.mode, "sea");
  assert.ok(routed!.water, "the sea leg carries a water span");
  const { from, to } = routed!.water;
  assert.ok(from > 0 && from < to && to < 1, `span must sit strictly inside the leg: ${from}..${to}`);
  const st = stubs(routed!);
  assert.ok(Math.abs(st.from - 5) <= 0.8, `embark stub rides ~5 cells, got ${st.from}`);
  assert.ok(Math.abs(st.to - 2) <= 0.8, `landfall stub rides ~2 cells, got ${st.to}`);
  assert.equal(routed!.inlandHandoff, true, "a 5-cell stub is a genuine inland handoff");
});

test("the reverse leg mirrors the span: the long stub swaps ends with the direction", () => {
  const s = survey(inlandRows);
  const [routed] = routeVoyage([leg(1, 0)], [site(0, 0, 1), site(1, 16, 1)], s);
  assert.equal(routed!.mode, "sea");
  const st = stubs(routed!);
  assert.ok(Math.abs(st.from - 2) <= 0.8, `embark stub rides ~2 cells, got ${st.from}`);
  assert.ok(Math.abs(st.to - 5) <= 0.8, `landfall stub rides ~5 cells, got ${st.to}`);
  assert.equal(routed!.inlandHandoff, true);
});

test("a coastal crossing has a span too, but its cell-or-two stubs are no handoff", () => {
  const s = survey(["##..........##", "##..........##", "##..........##"]);
  const [routed] = routeVoyage([leg(0, 1)], [site(0, 1, 1), site(1, 12, 1)], s);
  assert.equal(routed!.mode, "sea");
  assert.ok(routed!.water, "coastal crossings still carry the span (the swap just hugs the port)");
  const st = stubs(routed!);
  assert.ok(
    st.from < INLAND_STUB_CELLS && st.to < INLAND_STUB_CELLS,
    `stubs ${st.from}/${st.to} stay under the handoff bar`,
  );
  assert.equal(routed!.inlandHandoff, false, "a coastal crossing is not an inland handoff");
});

test("road and straight legs never carry a water span", () => {
  const road = survey(["====", "####"]);
  const [r1] = routeVoyage([leg(0, 1)], [site(0, 0, 0), site(1, 3, 0)], road);
  assert.equal(r1!.mode, "road");
  assert.equal(r1!.water, null);
  assert.equal(r1!.inlandHandoff, false);

  const bare = survey(["#####"]);
  const [r2] = routeVoyage([leg(0, 1)], [site(0, 0, 0), site(1, 4, 0)], bare);
  assert.equal(r2!.mode, "straight");
  assert.equal(r2!.water, null);
  assert.equal(r2!.inlandHandoff, false);
});
