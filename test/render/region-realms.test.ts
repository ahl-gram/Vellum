import { test } from "node:test";
import assert from "node:assert/strict";
import { defaultRecipe, generateWorld } from "../../src/world/generate.ts";
import { generateRegionWorld } from "../../src/world/region.ts";
import { LOD_BANDS, lodWindowFor, quantizeCenter } from "../../src/world/lod.ts";
import { renderMap } from "../../src/render/map-renderer.ts";
import { realmTintIndices } from "../../src/render/realm-tints.ts";
import { STYLES } from "../../src/render/style.ts";
import type { World } from "../../src/world/types.ts";

const world42 = generateWorld(defaultRecipe(42));

const windowAt = (world: World, x: number, y: number, band: number) => {
  const size = LOD_BANDS[band]!.sizeUV;
  const q = quantizeCenter(x / (world.recipe.gridW - 1), y / (world.recipe.gridH - 1), size);
  return lodWindowFor(q.cx, q.cy, size);
};

/** A window centred on a realm-vs-realm land boundary, so both tints and the interior border are in frame. */
const borderWindow = (world: World, band: number) => {
  const { w, h } = world.elev;
  const labels = world.realms.labels;
  for (let y = 0; y < h; y++) {
    for (let x = 0; x + 1 < w; x++) {
      const a = labels[x + y * w] as number;
      const b = labels[x + 1 + y * w] as number;
      if (a >= 0 && b >= 0 && a !== b) return windowAt(world, x, y, band);
    }
  }
  throw new Error("no realm border found on the parent grid");
};

const regionSvg = (world: World, window: ReturnType<typeof borderWindow>, legend = false): string => {
  const region = generateRegionWorld(world, { window, gridW: 320, gridH: 240, title: "t" });
  return renderMap(region, { style: "antique", legend });
};

test("a border-straddling region sheet draws both realm tints inside the land clip (#423)", () => {
  const svg = regionSvg(world42, borderWindow(world42, 2));
  const clippedTints = svg.match(
    /<g clip-path="url\(#region-land-clip\)"><g id="layer-realm-tints">([\s\S]*?)<\/g><\/g>/,
  );
  assert.ok(clippedTints, "the tint layer must render inside the region land clip");
  const fills = [...clippedTints[1]!.matchAll(/fill="(#[0-9a-fA-F]{6})"/g)].map((m) => m[1]);
  assert.ok(fills.length >= 2, `a border window should tint both realms; got ${fills.length} tint paths`);
  const style = STYLES.antique;
  const idx = realmTintIndices(
    world42.realms.labels,
    world42.elev.w,
    world42.elev.h,
    world42.realms.seats.length,
    style,
  );
  for (const fill of fills) {
    assert.ok(
      idx.some((tint) => style.realmTints[tint] === fill),
      `tint ${fill} is not one of the parent's assigned realm tints`,
    );
  }
});

test("the interior border strokes each seam ONCE, inside the land clip (#423)", () => {
  const window = borderWindow(world42, 2);
  const svg = regionSvg(world42, window);
  assert.match(
    svg,
    /<g clip-path="url\(#region-land-clip\)"><g id="layer-realm-borders">/,
    "the border layer must render inside the region land clip, which is what keeps ink off the coastline",
  );
  const borders = svg.match(/<g id="layer-realm-borders">([\s\S]*?)<\/g>/);
  assert.ok(borders && /stroke-dasharray/.test(borders[1]!), "the border must draw its dashed strokes");
  // One path per carried chain: strokes from per-realm rings trace every seam twice, and the plate-reader measured the coincident dash phases reading as a SOLID line on seed 42.
  const region = generateRegionWorld(world42, { window, gridW: 320, gridH: 240, title: "t" });
  const paths = [...borders[1]!.matchAll(/<path /g)].length;
  assert.equal(
    paths,
    region.region?.realmBorders?.length,
    "the border layer must stroke exactly the carried chains, one path each",
  );
});

test("a region sheet names the realm the window sits in (#423)", () => {
  const capital = world42.settlements.find((s) => s.kind === "capital")!;
  const svg = regionSvg(world42, windowAt(world42, capital.x, capital.y, 1));
  const realm = world42.realms.labels[capital.x + capital.y * world42.elev.w] as number;
  const name = world42.names.realms[realm]!;
  assert.ok(svg.includes(name.toUpperCase()), `the sheet should carry the realm name ${name.toUpperCase()}`);
});

test("the legend's realm row reaches region sheets (#423 lifts the #162 gate)", () => {
  const capital = world42.settlements.find((s) => s.kind === "capital")!;
  const svg = regionSvg(world42, windowAt(world42, capital.x, capital.y, 1), true);
  assert.ok(svg.includes("Realm &amp; border") || svg.includes("Realm & border"), "the legend should list the realm row");
});

test("the world sheet's realm layers are untouched: no clip wrapper, label-derived paths (#423)", () => {
  const svg = renderMap(world42, { style: "antique" });
  assert.ok(svg.includes('<g id="layer-realm-tints">'), "the world tint layer still renders");
  assert.ok(
    !svg.includes('<g clip-path="url(#region-land-clip)">'),
    "a world sheet has no region land clip; the wrapper must be the identity there",
  );
});

test("the tint index is the PARENT's, proven where recomputation would disagree (#423)", () => {
  // No natural seed exceeds 5 realms, so paint six stripes onto seed 42's land. Above BASE_TINTS
  // the assignment runs graph colouring, where a cropped window computes different centroids and
  // adjacency, which is exactly the #162 hazard #113 will make live.
  const { w, h } = world42.elev;
  const REALMS = 6;
  const labels = new Int16Array(w * h).fill(-1);
  for (let y = 0; y < h; y++) {
    for (let x = 0; x < w; x++) {
      if ((world42.elev.data[x + y * w] as number) <= world42.seaLevel) continue;
      labels[x + y * w] = Math.min(REALMS - 1, Math.floor((x / w) * REALMS));
    }
  }
  const seats = world42.realms.seats.slice(0, REALMS);
  while (seats.length < REALMS) seats.push(seats[seats.length - 1]!);
  const names = ["Aphel", "Brant", "Corve", "Drusk", "Ethen", "Farrow"];
  const doctored: World = {
    ...world42,
    realms: { labels, seats },
    names: { ...world42.names, realms: names },
    arms: [],
  };
  const style = STYLES.antique;
  const parentIdx = realmTintIndices(labels, w, h, REALMS, style);

  const capital = world42.settlements.find((s) => s.kind === "capital")!;
  const window = windowAt(doctored, capital.x, capital.y, 1);
  const region = generateRegionWorld(doctored, { window, gridW: 320, gridH: 240, title: "t" });
  const svg = renderMap(region, { style: "antique" });

  const visible = region.region?.realmRings?.map((r) => r.realm) ?? [];
  assert.ok(visible.length > 0, "the doctored region must carry rings");
  const tints = svg.match(/<g id="layer-realm-tints">([\s\S]*?)<\/g>/);
  assert.ok(tints, "the doctored region must draw tints");
  const fills = [...tints[1]!.matchAll(/fill="(#[0-9a-fA-F]{6})"/g)].map((m) => m[1]);
  assert.equal(fills.length, visible.length, "one tint path per carried realm, in realm order");
  fills.forEach((fill, i) => {
    const realm = visible[i]!;
    assert.equal(
      fill,
      style.realmTints[parentIdx[realm]!],
      `realm ${realm} must wear the PARENT's tint assignment, not one recomputed on the crop`,
    );
  });
});
