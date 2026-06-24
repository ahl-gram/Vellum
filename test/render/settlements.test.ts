import { test } from "node:test";
import assert from "node:assert/strict";
import { defaultRecipe, generateWorld } from "../../src/world/generate.ts";
import { renderMap } from "../../src/render/map-renderer.ts";
import { FONT_SIZE } from "../../src/render/layers/settlements.ts";
import { STYLES, type StyleName } from "../../src/render/style.ts";

// Render-layer tests for #59: every realm gets a seat on the map. Structural
// (assert on the SVG string, like map-renderer.test.ts) but written test-first;
// they go red against the pre-#59 renderer.

const multi = generateWorld(defaultRecipe(42, { gridW: 160, gridH: 120 }));
const single = generateWorld(defaultRecipe(3, { gridW: 160, gridH: 120 }));

const count = (svg: string, needle: string): number => svg.split(needle).length - 1;
const ALL_STYLES: StyleName[] = ["antique", "topographic", "ink", "nautical"];

test("fixtures have the expected realm shape", () => {
  assert.ok(multi.realms.seats.length > 1, "seed 42 should be multi-realm");
  assert.equal(single.realms.seats.length, 1, "seed 3 should be single-realm");
});

test("a multi-realm chart marks one grand capital and one seat per other realm", () => {
  const svg = renderMap(multi, { style: "antique" });
  assert.equal(count(svg, 'class="settlement-capital"'), 1, "exactly one grand capital");
  assert.equal(
    count(svg, 'class="settlement-seat"'),
    multi.realms.seats.length - 1,
    "one seat mark per non-capital realm",
  );
});

test("all four styles tier the seat glyph (decision B)", () => {
  for (const style of ALL_STYLES) {
    const svg = renderMap(multi, { style });
    assert.equal(count(svg, 'class="settlement-capital"'), 1, `${style}: one grand capital`);
    assert.equal(
      count(svg, 'class="settlement-seat"'),
      multi.realms.seats.length - 1,
      `${style}: seats tiered`,
    );
  }
});

test("seats are haloed in their realm tint only under political-tint styles", () => {
  for (const style of ["antique", "topographic"] as const) {
    const svg = renderMap(multi, { style });
    assert.equal(
      count(svg, 'class="seat-halo"'),
      multi.realms.seats.length,
      `${style}: grand capital + each seat haloed`,
    );
    const fills = [...svg.matchAll(/class="seat-halo"[^>]*?\bfill="([^"]+)"/g)].map((m) => m[1]);
    assert.equal(fills.length, multi.realms.seats.length, `${style}: each halo carries a fill`);
    for (const f of fills) {
      assert.ok(
        STYLES[style].realmTints.includes(f!),
        `${style}: halo fill ${f} is a realm tint`,
      );
    }
  }
  for (const style of ["ink", "nautical"] as const) {
    const svg = renderMap(multi, { style });
    assert.equal(count(svg, 'class="seat-halo"'), 0, `${style}: no colored halo`);
    assert.equal(
      count(svg, 'class="settlement-seat"'),
      multi.realms.seats.length - 1,
      `${style}: but seats still tier their glyph`,
    );
  }
});

test("a single-realm chart shows the grand capital with no seats or halos", () => {
  for (const style of ["antique", "topographic"] as const) {
    const svg = renderMap(single, { style });
    assert.equal(count(svg, 'class="settlement-capital"'), 1, `${style}: the lone capital`);
    assert.equal(count(svg, 'class="settlement-seat"'), 0, `${style}: no seats`);
    assert.equal(count(svg, 'class="seat-halo"'), 0, `${style}: no halos`);
  }
});

test("seat labels are set in caps, below the grand capital in size (decisions A + 3)", () => {
  const svg = renderMap(multi, { style: "antique" });
  const seat = multi.settlements[multi.realms.seats[1]!]!;
  assert.ok(svg.includes(seat.name.toUpperCase()), "a provincial seat name appears in caps");
  assert.ok(FONT_SIZE.capital > FONT_SIZE.seat, "grand capital larger than a seat");
  assert.ok(FONT_SIZE.seat >= FONT_SIZE.town, "seat at least as large as a town");
  assert.ok(FONT_SIZE.town > FONT_SIZE.village, "town larger than a village");
});

test("the legend gains a Realm seat key only when multi-realm (decision C)", () => {
  const multiLegend = renderMap(multi, { style: "antique", legend: true });
  assert.ok(multiLegend.includes("Realm seat"), "multi-realm legend names the seat");
  const singleLegend = renderMap(single, { style: "antique", legend: true });
  assert.ok(!singleLegend.includes("Realm seat"), "single-realm legend omits the seat row");
});
