import { test } from "node:test";
import assert from "node:assert/strict";
import { resolve } from "node:path";
import { mediaEdges, meetings, nearest, plainShift, routesUnder, strideWidths } from "../../e2e/suites/corners/geometry.ts";
import type { Box, CornerRead } from "../../e2e/suites/corners/geometry.ts";

const REPO = resolve(import.meta.dirname, "..", "..");
const box = (x: number, y: number, r: number, b: number, t = "ink"): Box => ({ x, y, r, b, t });

test("the corners sweep reads every page the tree builds, home and a nested room among them", () => {
  const routes = routesUnder(resolve(REPO, "src/pages"));
  for (const route of ["/", "/explorer/", "/print-room/", "/print-room/portfolio/", "/seed-of-the-day/", "/specimen/"]) {
    assert.ok(routes.includes(route), `${route} is one of ${routes.join(", ")}`);
  }
  assert.ok(routes.every((r) => r.startsWith("/") && r.endsWith("/")), "directory form, as the layout's path prop is");
});

test("a media edge is read on both of its sides, inside the stretch only, widest first", () => {
  assert.deepEqual(mediaEdges(["(max-width: 720px)", "screen and (max-width: 600px)", "(min-width: 901px)", "(max-height: 640px)", "print"], 480, 900), [900, 721, 720, 601, 600], "a min-width edge's lower side falls inside this stretch");
  assert.deepEqual(mediaEdges(["(min-width: 901px)", "(min-width: 1024px)"], 900, 1280), [1024, 1023, 901]);
  assert.deepEqual(mediaEdges(["(max-width: 340px)"], 480, 900), [], "an edge below the stretch is the 1px sweep's, not this list's");
});

test("two corners meet only when their boxes overlap on both axes, touching edges included as clear", () => {
  assert.equal(meetings([box(16, 42, 172.5, 58, "motto")], [box(120, 42, 304, 74.6, "seed")]).length, 1);
  const [m] = meetings([box(16, 42, 172.5, 58, "motto")], [box(120, 42, 304, 74.6, "seed")]);
  assert.ok(m && Math.abs(m.w - 52.5) < 1e-9 && Math.abs(m.h - 16) < 1e-9 && m.a === "motto" && m.b === "seed");
  assert.deepEqual(meetings([box(16, 76, 150, 90)], [box(120, 42, 304, 76)]), [], "a box ending exactly where the other begins is touching, not overlapping");
  assert.equal(meetings([box(16, 75.6, 150, 90)], [box(120, 42, 304, 76)]).length, 1, "a 0.4px line-box overlap counts: the ruled 2px allowance is not carried (the close-up arm on Issue #638)");
  assert.deepEqual(meetings([box(16, 14, 140, 42)], [box(148, 14, 304, 33)]), [], "side by side on one row is clear");
});

test("the nearest approach is the true distance between two boxes, zero when they meet", () => {
  assert.equal(nearest([box(0, 0, 10, 10)], [box(13, 14, 20, 20)]), 5);
  assert.equal(nearest([box(0, 0, 10, 10)], [box(5, 5, 20, 20)]), 0);
  assert.equal(nearest([box(0, 0, 10, 10)], [box(18, 0, 20, 10), box(10, 30, 20, 40)]), 8);
});

const read = (innerW: number, left: Box[], right: Box[]): CornerRead => ({ innerW, clientW: innerW, vw: innerW, left, right, clusterBottom: 100, bandH: null });

test("a plain shift is the cluster standing still while the corner slides with the right edge, and nothing else", () => {
  const wide = read(900, [box(16, 14, 140, 42, "Vellum")], [box(700, 14, 884, 33, "room")]);
  assert.ok(plainShift(wide, read(868, [box(16, 14, 140, 42, "Vellum")], [box(668, 14, 852, 33, "room")])));
  assert.ok(!plainShift(wide, read(868, [box(16, 14, 120, 42, "Vellum")], [box(668, 14, 852, 33, "room")])), "the cluster changed size: a wrap or a media edge between the two reads");
  assert.ok(!plainShift(wide, read(868, [box(16, 14, 140, 42, "Vellum")], [box(668, 14, 852, 52, "room")])), "the corner grew a line");
  assert.ok(!plainShift(wide, read(868, [box(16, 14, 140, 42, "Vellum")], [box(700, 14, 884, 33, "room")])), "the corner did not move with the edge");
  assert.ok(!plainShift(wide, read(868, [box(16, 14, 140, 42, "Vellum"), box(16, 50, 60, 60, "more")], [box(668, 14, 852, 33, "room")])), "a box appeared");
});

test("the stride list keeps both ends and every edge, widest first, with no width twice", () => {
  assert.deepEqual(strideWidths(900, 481, 128, [721, 720, 601, 600]), [900, 772, 721, 720, 644, 601, 600, 516, 481]);
  assert.deepEqual(strideWidths(1280, 901, 200, [1024, 1023, 901]), [1280, 1080, 1024, 1023, 901]);
});
