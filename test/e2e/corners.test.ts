import { test } from "node:test";
import assert from "node:assert/strict";
import { resolve } from "node:path";
import { fillBetween, floorEdges, mediaEdges, meetings, MOTTO, nearest, pageFaults, plainShift, routesUnder, squeezes, strideWidths, unreadWidthConditions, verdict } from "../../e2e/suites/corners/geometry.ts";
import type { Box, CornerRead, Row } from "../../e2e/suites/corners/geometry.ts";
import { FLOOR_PAGES } from "../../e2e/suites/corners/floor.ts";
import { ATLAS_ROUTE, DISCOVERY_ROUTES } from "../../scripts/generate-discovery.ts";

const REPO = resolve(import.meta.dirname, "..", "..");
const box = (x: number, y: number, r: number, b: number, t = "ink"): Box => ({ x, y, r, b, t });
const read = (innerW: number, left: Box[], right: Box[], more: Partial<CornerRead> = {}): CornerRead => ({ innerW, clientW: innerW, vw: innerW, scrollW: innerW, left, right, clusterBottom: 100, bandH: null, ...more });

test("the corners sweep reads every page the tree builds, home and a nested room among them, in a stable order", () => {
  const routes = routesUnder(resolve(REPO, "src/pages"));
  for (const route of ["/", "/explorer/", "/explorer/portfolio/", "/print-room/", "/seed-of-the-day/", "/specimen/"]) {
    assert.ok(routes.includes(route), `${route} is one of ${routes.join(", ")}`);
  }
  assert.ok(routes.every((r) => r.startsWith("/") && r.endsWith("/")), "directory form, as the layout's path prop is");
  assert.deepEqual(routes, [...routes].sort());
});

test("a media edge is read on both of its sides, inside the stretch only, widest first, in the form the browser hands back", () => {
  assert.deepEqual(mediaEdges(["(width <= 720px)", "screen and (width <= 720px)", "(width <= 900px)", "(max-height: 640px)", "print"], 480, 900), [900, 721, 720], "Chrome reads the layout's minified queries back in range syntax (measured on the built pages, 2026-10-03, by the guard prover on Issue #638)");
  assert.deepEqual(mediaEdges(["(max-width: 600px)", "(min-width: 901px)"], 480, 900), [900, 601, 600], "a page sheet's own queries keep the legacy form; a min-width edge's lower side falls inside this stretch");
  assert.deepEqual(mediaEdges(["(min-width: 901px)", "(min-width: 1024px)"], 900, 1280), [1024, 1023, 901]);
  assert.deepEqual(mediaEdges(["(width < 600px)", "(width > 700px)", "(width >= 800px)"], 480, 900), [800, 799, 701, 700, 600, 599]);
  assert.deepEqual(mediaEdges(["(600px <= width)", "(700px > width)", "(500px < width <= 560px)"], 480, 900), [700, 699, 600, 599, 561, 560, 501, 500]);
  assert.deepEqual(mediaEdges(["(max-width: 719.98px)"], 480, 900), [720, 719], "a fractional edge lands on the last whole width it holds and the first it does not");
  assert.deepEqual(mediaEdges(["(min-width: 900.02px)"], 480, 1280), [901, 900], "and so does a fractional lower edge");
  assert.deepEqual(mediaEdges(["(700px >= width)"], 480, 900), [701, 700]);
  assert.deepEqual(mediaEdges(["(min-width: 601px) and (max-width: 900px)"], 480, 1280), [901, 900, 601, 600], "every comparison in one condition, not the first");
  assert.deepEqual(mediaEdges(["(width <= 340px)"], 480, 900), [], "an edge below the stretch is the 1px sweep's, not this list's");
});

test("a width condition the edge reader cannot parse is named, so no media edge hides from the sweep", () => {
  assert.deepEqual(unreadWidthConditions(["(width <= 720px)", "(max-width: 900px)", "(500px < width <= 560px)", "(600px <= width)", "(700px > width)", "(max-height: 640px)", "print", "(prefers-reduced-motion: reduce)"]), []);
  assert.deepEqual(unreadWidthConditions(["(width <= 45em)", "(min-device-width: 400px)", "(max-width: 30rem)"]), ["(width <= 45em)", "(min-device-width: 400px)", "(max-width: 30rem)"]);
});

test("two corners meet only when their boxes overlap on both axes; boxes that only touch are clear", () => {
  const [m] = meetings([box(16, 42, 172.5, 58, "motto")], [box(120, 42, 304, 74.6, "seed")]);
  assert.ok(m && Math.abs(m.w - 52.5) < 1e-9 && Math.abs(m.h - 16) < 1e-9 && m.a === "motto" && m.b === "seed");
  assert.deepEqual(meetings([box(16, 76, 150, 90)], [box(120, 42, 304, 76)]), [], "one box ending exactly where the other begins vertically is touching, not overlapping");
  assert.deepEqual(meetings([box(16, 42, 120, 58)], [box(120, 42, 304, 74)]), [], "and the same horizontally");
  assert.equal(meetings([box(16, 75.6, 150, 90)], [box(120, 42, 304, 76)]).length, 1, "a 0.4px line-box overlap counts: the ruled 2px allowance is not carried (the close-up arm on Issue #638)");
  assert.deepEqual(meetings([box(16, 14, 140, 42)], [box(148, 14, 304, 33)]), [], "side by side on one row is clear");
  assert.deepEqual(meetings([box(16, 14, 150, 30)], [box(120, 52, 304, 70)]), [], "one above the other in the same columns is clear");
  assert.equal(meetings([box(0, 0, 10, 10, "a")], [box(5, 5, 12, 12, "small"), box(0, 0, 10, 10, "big")])[0]?.b, "big", "the largest meeting is named first");
});

test("the nearest approach is the true distance between two boxes, zero when they meet", () => {
  assert.equal(nearest([box(0, 0, 10, 10)], [box(13, 14, 20, 20)]), 5);
  assert.equal(nearest([box(0, 0, 10, 10)], [box(5, 5, 20, 20)]), 0);
  assert.equal(nearest([box(0, 0, 10, 10)], [box(18, 0, 20, 10), box(10, 30, 20, 40)]), 8);
});

const wide = read(900, [box(16, 14, 140, 42, "Vellum")], [box(700, 14, 884, 33, "room")]);

test("a plain shift is the cluster standing still while the corner slides with the right edge, and nothing else", () => {
  assert.ok(plainShift(wide, read(868, [box(16, 14, 140, 42, "Vellum")], [box(668, 14, 852, 33, "room")])));
  assert.ok(plainShift(wide, read(868, [box(16, 14, 140, 42, "Vellum")], [box(668.04, 14, 852.04, 33, "room")])), "subpixel drift under 0.05px is still a plain shift");
  assert.ok(!plainShift(wide, read(868, [box(16, 14, 140, 42, "Vellum")], [box(668.5, 14, 852.5, 33, "room")])), "half a pixel is not");
  assert.ok(!plainShift(wide, read(868, [box(16, 14, 120, 42, "Vellum")], [box(668, 14, 852, 33, "room")])), "the cluster changed size: a wrap or a media edge between the two reads");
  assert.ok(!plainShift(wide, read(868, [box(16, 14, 140, 42, "Vellum")], [box(668, 14, 852, 52, "room")])), "the corner grew a line");
  assert.ok(!plainShift(wide, read(868, [box(16, 14, 140, 42, "Vellum")], [box(700, 14, 884, 33, "room")])), "the corner did not move with the edge");
  assert.ok(!plainShift(wide, read(868, [box(16, 14, 140, 42, "Vellum"), box(16, 50, 60, 60, "more")], [box(668, 14, 852, 33, "room")])), "a box appeared");
  assert.ok(!plainShift(wide, read(868, [box(16, 14, 140, 42, "Vellum")], [box(668, 14, 852, 33, "another room")])), "the same geometry carrying different words is not the same layout");
  assert.ok(!plainShift(wide, read(868, [box(16, 14, 140, 42, "Vellum")], [box(640, 14, 852, 33, "room")])), "a left edge that moved on its own");
  assert.ok(!plainShift(wide, read(868, [box(16, 14, 140, 42, "Vellum")], [box(668, 20, 852, 33, "room")])), "a top edge that moved on its own");
  assert.ok(!plainShift(read(900, [box(16, 14, 140, 42, "Vellum"), box(16, 50, 60, 60, "more")], [box(700, 14, 884, 33, "room")]), read(868, [box(16, 14, 140, 42, "Vellum")], [box(668, 14, 852, 33, "room")])), "a box that went away");
});

test("between two reads that are not a plain shift every width is filled in, widest first, and nothing otherwise", () => {
  const plain: Row = { w: 868, read: read(868, [box(16, 14, 140, 42, "Vellum")], [box(668, 14, 852, 33, "room")]) };
  const changed: Row = { w: 864, read: read(864, [box(16, 14, 120, 42, "Vellum")], [box(664, 14, 848, 33, "room")]) };
  assert.deepEqual(fillBetween({ w: 900, read: wide }, plain), []);
  assert.deepEqual(fillBetween({ w: 868, read: plain.read }, changed), [867, 866, 865]);
  assert.deepEqual(fillBetween({ w: 865, read: plain.read }, changed), [], "adjacent widths have nothing between them");
  assert.deepEqual(fillBetween({ w: 866, read: plain.read }, changed), [865], "two apart leaves one width between");
});

test("the stride list keeps both ends and every edge, widest first, with no width twice", () => {
  assert.deepEqual(strideWidths(900, 481, 128, [721, 720, 601, 600]), [900, 772, 721, 720, 644, 601, 600, 516, 481]);
  assert.deepEqual(strideWidths(1280, 901, 200, [1024, 1023, 901]), [1280, 1080, 1024, 1023, 901]);
});

const room = (more: Partial<CornerRead> = {}): Row => ({ w: 390, read: read(390, [box(16, 14, 140, 42, "Vellum"), box(16, 42, 172, 58, `${MOTTO} cartography`)], [box(240, 14, 374, 33, "The Explorer")], more) });

test("a width passes only clear, laid out at the width set, with ink in both corners, the band over the cluster, and the motto kept on every page (Issue #762)", () => {
  assert.equal(verdict(room()), null);
  assert.match(verdict({ w: 380, read: room().read }) ?? "", /laid out at 390, not 380/);
  assert.match(verdict(room({ scrollW: 412 })) ?? "", /at 390 the page scrolls sideways to 412/, "a narrow desktop window never widens its layout, so an overflowing page shows as a sideways scroll instead (Issue #761)");
  assert.match(verdict(room({ left: [box(16, 14, 140, 42, "Vellum")] })) ?? "", /found 1 cluster and 1 corner inks/);
  assert.match(verdict(room({ right: [] })) ?? "", /found 2 cluster and 0 corner inks/);
  assert.match(verdict(room({ right: [box(120, 14, 374, 33, "The Explorer")] })) ?? "", /"Vellum" meets "The Explorer" by 20\.0 x 19\.0/);
  assert.match(verdict(room({ clusterBottom: 130, bandH: 124.8 })) ?? "", /cluster ends at 130, past the band's 124\.8/);
  assert.equal(verdict(room({ clusterBottom: 124.8, bandH: 124.8 })), null, "a cluster ending on the band's edge is covered");
  assert.match(verdict(room({ left: [box(16, 14, 140, 42, "Vellum"), box(16, 52, 43, 68, "Explorer")] })) ?? "", /motto is gone/, "every page keeps its motto at every width (Issue #762 ruling 1)");
});

test("a corner control is squeezed when it renders narrower than its own width by more than rounding", () => {
  assert.deepEqual(squeezes(1023, [{ t: "input#pr-seed", w: 110.78, natural: 110.78 }, { t: "select#pr-style", w: 118.2, natural: 118.39 }]), [], "whole, or under half a pixel short");
  assert.deepEqual(squeezes(1023, [{ t: "input#pr-seed", w: 63.44, natural: 110.78 }, { t: "button#pr-random", w: 38.39, natural: 38.39 }]), ["at 1023 the corner's input#pr-seed is squeezed to 63.4 from its own 110.8"], "the step 11 plate read's figure on the Print Room before its row wrapped");
  assert.equal(squeezes(1023, [{ t: "select#pr-style", w: 117.8, natural: 118.4 }]).length, 1, "six tenths of a pixel short is a squeeze");
  assert.deepEqual(squeezes(1023, [{ t: "button#x", w: 38, natural: 38.5 }]), [], "exactly half a pixel short is rounding");
});

test("a width condition that tells two windows at or below the 1024 floor apart is named, in either form, and one that switches above the floor is not (Issue #763 ruling 2A)", () => {
  const floored = ["(max-width: 900px)", "(min-width: 901px)", "(max-width: 1023px)", "(min-width: 1024px)", "(width < 1024px)", "(width >= 1024px)", "(1024px <= width)", "(600px <= width <= 900px)", "(max-width: 1023.98px)", "(min-width: 900.02px)", "screen and (width <= 720px)"];
  const above = ["(max-width: 1024px)", "(min-width: 1025px)", "(width < 1025px)", "(width > 1024px)", "(1024px < width)", "(1100px <= width <= 1400px)", "(max-height: 640px)", "print", "(prefers-reduced-motion: reduce)"];
  assert.deepEqual(floorEdges([...floored, ...above], 1024), floored);
  assert.deepEqual(floorEdges(["(min-width: 1024px)"], 1023), [], "the floor is the caller's, not a number of the function's own");
});

test("a page's faults are its unreadable width conditions, its conditions that switch at or below the floor and its failed width reads, each named, so CO1 and its control count one list (Issue #763)", () => {
  const ok: Row = room();
  assert.deepEqual(pageFaults(["print", "(min-width: 1280px)"], [ok], 1024), [], "a clean page with a passing read has no fault");
  const faults = pageFaults(["(max-width: 900px)", "(width <= 45em)", "(max-width: 900px)"], [ok, { w: 380, read: room().read }], 1024);
  assert.deepEqual(faults, [
    "a width condition the edge reader cannot parse: (width <= 45em)",
    "a width condition that switches at or below the 1024 floor: (max-width: 900px)",
    "laid out at 390, not 380",
  ], "each kind of fault counted once per condition, in this order");
});

test("FL1 reads every page the site serves, every page the tree builds and every discovery route, the served atlas among them, so a new page joins the floor by existing (Issue #763 ruling 3B)", () => {
  const tree = routesUnder(resolve(REPO, "src/pages"));
  const served = [...new Set([...tree, ...DISCOVERY_ROUTES])].sort();
  assert.ok(served.includes(ATLAS_ROUTE) && !tree.includes(ATLAS_ROUTE), "the atlas is no longer a page outside the tree, so this roster no longer reaches past it");
  assert.deepEqual([...FLOOR_PAGES].sort(), served);
});
