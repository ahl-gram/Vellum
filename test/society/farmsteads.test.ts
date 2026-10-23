import { test } from "node:test";
import assert from "node:assert/strict";
import { defaultRecipe, generateWorld } from "../../src/world/generate.ts";
import { generateRegionWorld, regionTitle } from "../../src/world/region.ts";
import { createChainCache } from "../../src/world/detail-chain.ts";
import { FULL_WINDOW, lodWindowFor } from "../../src/world/lod.ts";
import {
  FARMSTEAD_SPACING_WORLD_CELLS,
  MILL_REACH_WORLD_CELLS,
  farmsteadCandidates,
} from "../../src/society/farmsteads.ts";
import { hamletCandidates, worldNameSet } from "../../src/society/hamlets.ts";
import { renderMap } from "../../src/render/map-renderer.ts";
import { REGION_FONT_SIZE } from "../../src/render/layers/settlements.ts";
import { textBox, WIDTH_FACTOR, type Box } from "../../src/render/geometry.ts";
import { createProjection, marginFor } from "../../src/render/transform.ts";
import type { UvWindow } from "../../src/terrain/heightfield.ts";
import type { NamedSettlement, World } from "../../src/world/types.ts";

// Issue #952 pull request 2: the finer tier below the hamlets. A farmstead stands on a fixed world-space lattice, decided by the world alone; a mill is a farmstead beside a river the close-up draws.

const world = generateWorld(defaultRecipe(42));
const BAND_5 = 1 / 32;

function closeUp(w: World, window: UvWindow, chain: ReturnType<typeof createChainCache>): World {
  return generateRegionWorld(w, {
    window,
    gridW: 320,
    gridH: 240,
    title: regionTitle(w, window),
    detail: true,
    chainCache: chain,
  });
}

const WITNESS_WINDOW = lodWindowFor(0.51171875, 0.3984375, BAND_5);
const chain42 = createChainCache(16);
const WITNESS = closeUp(world, WITNESS_WINDOW, chain42);

const CENTER = { cx: 0.51171875, cy: 0.3984375 };
const W16_WINDOW = lodWindowFor(CENTER.cx, CENTER.cy, 1 / 16);
const W64_WINDOW = lodWindowFor(CENTER.cx, CENTER.cy, 1 / 64);
const W16 = generateRegionWorld(world, {
  window: W16_WINDOW,
  gridW: 320,
  gridH: 240,
  title: regionTitle(world, W16_WINDOW),
});
const W64 = generateRegionWorld(world, {
  window: W64_WINDOW,
  gridW: 320,
  gridH: 240,
  title: regionTitle(world, W64_WINDOW),
});

const isTier = (s: NamedSettlement): boolean => s.kind === "farmstead" || s.kind === "mill";

function riverWithin(region: World, s: NamedSettlement, reach: number): boolean {
  const { gridW, gridH } = region.recipe;
  for (let y = 0; y < gridH; y++) {
    for (let x = 0; x < gridW; x++) {
      if (region.riverCells[x + y * gridW] === 1 && Math.hypot(x - s.x, y - s.y) <= reach) return true;
    }
  }
  return false;
}

test("a band-5 close-up grows the finer tier, and a farmstead is a mill exactly when a river it draws is within reach (Issue #952)", () => {
  const marks = WITNESS.settlements.filter(isTier);
  assert.ok(marks.length >= 5, `the capital's band-5 close-up grows a healthy crop of marks (${marks.length})`);
  const mills = marks.filter((s) => s.kind === "mill");
  assert.ok(mills.length >= 1, "and at least one of them is a mill");
  assert.ok(marks.length > mills.length, "and at least one is a farmstead, so the rule is read in both directions");

  const { window } = WITNESS.region!;
  const cpw = (WITNESS.recipe.gridW - 1) / ((window.u1 - window.u0) * (world.recipe.gridW - 1));
  for (const s of marks) {
    const near = riverWithin(WITNESS, s, MILL_REACH_WORLD_CELLS * cpw);
    assert.equal(
      s.kind === "mill",
      near,
      `${s.name} at ${s.x},${s.y} is a mill exactly when a river cell lies within reach`,
    );
    assert.ok(!s.name.endsWith(" Mill"), `${s.name}: a mill's name in the data stays its farmstead's`);
    assert.ok(s.founded <= world.title.year - 8, `${s.name} was founded before the present`);
  }

  assert.equal(
    farmsteadCandidates(world, WITNESS_WINDOW).length,
    10,
    "the ruled density, scored on the rounded world cell, grows 10 candidates here",
  );
});

const WORLD_CELL_UV = 1 / (world.recipe.gridW - 1);
const EAST_WINDOW: UvWindow = {
  ...WITNESS_WINDOW,
  u0: WITNESS_WINDOW.u0 + WORLD_CELL_UV,
  u1: WITNESS_WINDOW.u1 + WORLD_CELL_UV,
};

function insetOf(window: UvWindow): UvWindow {
  const du = (window.u1 - window.u0) * 0.02;
  const dv = (window.v1 - window.v0) * 0.02;
  return { u0: window.u0 + du, u1: window.u1 - du, v0: window.v0 + dv, v1: window.v1 - dv };
}

const within = (c: { readonly u: number; readonly v: number }, w: UvWindow): boolean =>
  c.u >= w.u0 && c.u <= w.u1 && c.v >= w.v0 && c.v <= w.v1;

const PAUKILUA_WINDOW = lodWindowFor(0.4140625, 0.7109375, BAND_5);
const PAUKILUA = closeUp(world, PAUKILUA_WINDOW, chain42);

const world7 = generateWorld(defaultRecipe(7));
const LAULUME_WINDOW = lodWindowFor(0.578125, 0.10546875, BAND_5);
const LAULUME = closeUp(world7, LAULUME_WINDOW, createChainCache(16));

const draw = (region: World): string => renderMap(region, { style: "antique", legend: true });
const WITNESS_SVG = draw(WITNESS);
const PAUKILUA_SVG = draw(PAUKILUA);
const W16_SVG = draw(W16);
const LAULUME_SVG = draw(LAULUME);

const WHOLE = farmsteadCandidates(world, FULL_WINDOW);

test("farmstead candidates are window-independent: a point two windows share is identical in both (Issue #952)", () => {
  const first = farmsteadCandidates(world, WITNESS_WINDOW);
  const second = farmsteadCandidates(world, EAST_WINDOW);
  const shared = first.filter((c) => within(c, insetOf(EAST_WINDOW)));
  assert.ok(shared.length >= 3, `the two windows share a healthy crop of points (${shared.length})`);
  for (const c of shared)
    assert.deepEqual(
      second.find((d) => d.name === c.name),
      c,
      `${c.name} is the same in both windows`,
    );

  const deeper = farmsteadCandidates(world, W64_WINDOW);
  const inside = first.filter((c) => within(c, insetOf(W64_WINDOW)));
  assert.ok(inside.length >= 1, "the sixty-fourth's window keeps a point of the thirty-second's");
  assert.deepEqual(deeper, inside, "a deeper window grows exactly the points the wider one holds inside it");
});

test("farmstead candidates agree with the whole world's inside every window (Issue #952)", () => {
  const windows = [WITNESS_WINDOW, EAST_WINDOW, PAUKILUA_WINDOW, W64_WINDOW, lodWindowFor(0.534375, 0.409375, 1 / 64)];
  for (const w of windows) {
    assert.ok(
      w.u0 >= 0.02 && w.u1 <= 0.98 && w.v0 >= 0.02 && w.v1 <= 0.98,
      "the window lies inside the whole world's own inset",
    );
    const part = farmsteadCandidates(world, w);
    assert.ok(part.length >= 1, "and holds a point, so the equality is not between two empty lists");
    assert.deepEqual(
      part,
      WHOLE.filter((c) => within(c, insetOf(w))),
    );
  }
});

test("the finer tier grows on every window no larger than band 5's, and on none larger (Issue #952)", () => {
  assert.ok(
    farmsteadCandidates(world, W16_WINDOW).length > 0,
    "the thirty-second's lattice would hold points on the sixteenth's window",
  );
  assert.ok(
    W16.settlements.some((s) => s.kind === "hamlet"),
    "the sixteenth's window still grows hamlets",
  );
  assert.equal(W16.settlements.filter(isTier).length, 0, "but no farmstead or mill");
  assert.ok(W64.settlements.filter(isTier).length >= 1, "the sixty-fourth's window grows the tier");
});

test("no farmstead name collides with a world-sheet name, and each keeps its distance from the world's towns and hamlets (Issue #952)", () => {
  const { gridW, gridH } = world.recipe;
  const taken = worldNameSet(world);
  const spots = [
    ...world.settlements.map((s) => ({ x: s.x, y: s.y })),
    ...hamletCandidates(world, FULL_WINDOW).map((h) => ({ x: h.u * (gridW - 1), y: h.v * (gridH - 1) })),
  ];
  assert.ok(WHOLE.length > 1000, `the whole world grows a crop to test (${WHOLE.length})`);
  for (const c of WHOLE) {
    assert.ok(!taken.has(c.name.toLowerCase()), `${c.name} is not a world-sheet name`);
    const x = c.u * (gridW - 1);
    const y = c.v * (gridH - 1);
    for (const p of spots) {
      assert.ok(
        Math.hypot(p.x - x, p.y - y) >= FARMSTEAD_SPACING_WORLD_CELLS - 1e-9,
        `${c.name} keeps its distance from ${p.x},${p.y}`,
      );
    }
  }
});

const attr = (tag: string, name: string): string | null => tag.match(new RegExp(` ${name}="([^"]*)"`))?.[1] ?? null;

function layerOf(svg: string, id: string): string {
  const at = svg.indexOf(`<g id="${id}"`);
  assert.notEqual(at, -1, `${id} is drawn`);
  const next = svg.indexOf('<g id="', at + 10);
  return svg.slice(at, next === -1 ? undefined : next);
}

type Group = { readonly open: string; readonly body: string };

function settlementGroups(svg: string): Group[] {
  const layer = layerOf(svg, "layer-settlements");
  const opens = [...layer.matchAll(/<g class="settlement"[^>]*>/g)];
  return opens.map((m, i) => ({
    open: m[0],
    body: layer.slice(m.index + m[0].length, i + 1 < opens.length ? opens[i + 1]!.index : undefined),
  }));
}

const groupsOfTier = (svg: string, tier: string): Group[] =>
  settlementGroups(svg).filter((g) => attr(g.open, "data-tier") === tier);

test("farmstead and mill marks draw their own glyphs and are labelled like hamlets (Issue #952)", () => {
  const farms = groupsOfTier(WITNESS_SVG, "farmstead");
  const mills = groupsOfTier(WITNESS_SVG, "mill");
  assert.ok(
    farms.length >= 3 && mills.length >= 1,
    `the witness draws both kinds (${farms.length} farmsteads, ${mills.length} mills)`,
  );
  for (const g of farms) {
    assert.ok(g.body.includes("<path"), "a farmstead is a house in profile, a path");
    assert.ok(!g.body.includes("<circle"), "and not the hamlet's dot");
  }
  for (const g of mills) {
    assert.ok(
      g.body.includes("<circle") && /<circle[^>]* r="3\.9"/.test(g.body),
      "a mill's wheel is a circle of radius 3.9",
    );
    const spokes = g.body.match(/<path d="([^"]*)"/)?.[1] ?? "";
    assert.equal(spokes.split("M").length - 1, 2, "with two spokes, a cross");
  }
  const sizes = farms.map((g) => g.body.match(/<text[^>]*font-size="([\d.]+)"/)?.[1]).filter((v) => v !== undefined);
  assert.ok(sizes.length >= 1, "a farmstead is labelled");
  for (const size of sizes) assert.equal(Number(size), REGION_FONT_SIZE.farmstead, "at the hamlet's size");
  const named = mills.filter((g) => g.body.includes("<text"));
  assert.ok(named.length >= 1, "a mill is labelled");
  for (const g of named) {
    const name = attr(g.open, "data-name") as string;
    assert.ok(!name.endsWith(" Mill"), "its data name stays bare");
    assert.equal(
      g.body.match(/<text[^>]*>([^<]*)<\/text>/)?.[1],
      `${name} Mill`,
      "and its label reads the name and the word Mill",
    );
  }
});

test("the legend keys Farmstead and Mill only on sheets that have them (Issue #952)", () => {
  assert.ok(WITNESS_SVG.includes(">Farmstead<") && WITNESS_SVG.includes(">Mill<"), "the witness keys both");
  assert.ok(PAUKILUA_SVG.includes(">Farmstead<"), "Paukilua keys its farmsteads");
  assert.ok(!PAUKILUA_SVG.includes(">Mill<"), "and no mill, having none");
  assert.ok(W16_SVG.includes(">Hamlet<"), "the sixteenth's sheet still keys its hamlets");
  assert.ok(!W16_SVG.includes(">Farmstead<") && !W16_SVG.includes(">Mill<"), "and neither of the tier");
});

function textsOf(layer: string): string[] {
  return [...layer.matchAll(/<text[^>]*>([\s\S]*?)<\/text>/g)].map((m) => m[1]!.replace(/<[^>]*>/g, ""));
}

test("a farmstead's name gives way to every feature name (Issue #952, M7)", () => {
  assert.ok(PAUKILUA.settlements.filter(isTier).length >= 10, "Paukilua grows a crowd of marks");
  const bare = draw({ ...PAUKILUA, settlements: PAUKILUA.settlements.filter((s) => !isTier(s)) });
  const words = textsOf(layerOf(PAUKILUA_SVG, "layer-feature-labels"));
  assert.ok(words.length >= 2, "the sheet carries feature words (a lake and an archipelago)");
  assert.deepEqual(words, textsOf(layerOf(bare, "layer-feature-labels")), "the tier costs no feature word");
});

const MARK_BOX: Record<string, (px: number, py: number) => Box> = {
  farmstead: (px, py) => ({ x: px - 4.32, y: py - 8.64, w: 8.64, h: 8.64 }),
  mill: (px, py) => ({ x: px - 3.9, y: py - 3.9, w: 7.8, h: 7.8 }),
};

const overlap = (a: Box, b: Box): boolean => a.x < b.x + b.w && b.x < a.x + a.w && a.y < b.y + b.h && b.y < a.y + a.h;

function upright(tag: string, text: string): Box | null {
  if (attr(tag, "transform") !== null) return null;
  const caps = text === text.toUpperCase();
  return textBox(
    Number(attr(tag, "x")),
    Number(attr(tag, "y")),
    text,
    Number(attr(tag, "font-size")),
    (attr(tag, "text-anchor") ?? "start") as "start" | "middle" | "end",
    caps ? WIDTH_FACTOR.caps : WIDTH_FACTOR.mixed,
    Number(attr(tag, "letter-spacing") ?? "0"),
  );
}

function wordBoxes(layer: string): Box[] {
  const boxes: Box[] = [];
  for (const m of layer.matchAll(/<text([^>]*)>([^<]*)<\/text>/g)) {
    const box = upright(m[1]!, m[2]!);
    if (box !== null) boxes.push(box);
  }
  return boxes;
}

function wordsOverMarks(region: World, svg: string): string[] {
  const { gridW, gridH } = region.recipe;
  const proj = createProjection(gridW, gridH, 1500, marginFor(1500));
  const groups = settlementGroups(svg);
  const featureWords = wordBoxes(layerOf(svg, "layer-feature-labels"));
  const covered: string[] = [];
  region.settlements.forEach((s, i) => {
    if (!isTier(s)) return;
    const mark = MARK_BOX[s.kind]!(proj.px(s.x), proj.py(s.y));
    const others = groups.filter((g) => attr(g.open, "data-idx") !== String(i)).flatMap((g) => wordBoxes(g.body));
    if ([...others, ...featureWords].some((word) => overlap(mark, word))) covered.push(s.name);
  });
  return covered;
}

test("no word is printed over a farmstead's or a mill's mark (Issue #952, M11)", () => {
  const { gridW } = LAULUME.recipe;
  const cpw = (gridW - 1) / ((LAULUME_WINDOW.u1 - LAULUME_WINDOW.u0) * (world7.recipe.gridW - 1));
  const crowded = LAULUME.settlements.filter(
    (s) =>
      isTier(s) &&
      LAULUME.settlements.some(
        (o) => !isTier(o) && Math.hypot(o.x - s.x, o.y - s.y) / cpw < FARMSTEAD_SPACING_WORLD_CELLS,
      ),
  );
  assert.ok(
    crowded.length >= 1,
    "a mark stands within the spacing of another settlement's drawn cell (Toanui by Laulume)",
  );
  assert.deepEqual(wordsOverMarks(LAULUME, LAULUME_SVG), [], "Laulume's sheet prints no word over a mark");
});

test("a crowded farmstead or mill loses its name and is never forced into place (Issue #952, M7)", () => {
  const marks = [...groupsOfTier(PAUKILUA_SVG, "farmstead"), ...groupsOfTier(PAUKILUA_SVG, "mill")];
  const nameless = marks.filter((g) => !g.body.includes("<text"));
  assert.ok(nameless.length >= 1, "at least one mark on the crowded sheet went label-less (the drop path is live)");
  assert.ok(nameless.length < marks.length, "and the rest keep their names");
});
