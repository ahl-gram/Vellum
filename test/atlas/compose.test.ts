import { test } from "node:test";
import assert from "node:assert/strict";
import { createHash } from "node:crypto";
import { composeAtlas, prospectPlates, ribbonPlates } from "../../src/atlas/compose.ts";
import { RIBBON_H, RIBBON_W } from "../../src/itinerary/finished.ts";
import { prospectPlate } from "../../src/prospect/finished.ts";
import { renderMap } from "../../src/render/map-renderer.ts";
import { recipeFromSvg } from "../../src/render/recipe-meta.ts";
import { STYLES } from "../../src/render/style.ts";
import { ribbonResultFor } from "../../src/site/explorer/ribbon-job.ts";
import { serializableAtlas } from "../../src/site/explorer/serializable-atlas.ts";
import { runInline } from "../../src/site/explorer/worker-client.ts";
import { plateAspect } from "../../src/site/print-room/plate-aspect.ts";
import type { UvWindow } from "../../src/terrain/heightfield.ts";
import { defaultRecipe, generateWorld } from "../../src/world/generate.ts";
import { decideSettle, FULL_WINDOW } from "../../src/world/lod.ts";
import { generateRegionWorld, regionTitle } from "../../src/world/region.ts";
import type { World } from "../../src/world/types.ts";

const digest = (svg: string): string => `${createHash("sha256").update(svg).digest("hex").slice(0, 16)}/${svg.length}`;
const PLATE_RENDER = { style: "antique", widthPx: 1500, legend: true } as const;

function glassWindow(world: World, name: string): UvWindow {
  const s = world.settlements.find((t) => t.name === name);
  assert.ok(s, `${name} is a settlement of chart ${world.recipe.seed}`);
  const camera = { cx: s.x / (world.recipe.gridW - 1), cy: s.y / (world.recipe.gridH - 1), k: 4 };
  const settled = decideSettle({ camera, currentWindow: FULL_WINDOW, currentBand: 0 });
  assert.equal(settled.action, "region", `a Glass centred on ${name} at k=4 settles onto a region`);
  assert.equal(settled.band, 2, "k=4 is the second close-up");
  return settled.window;
}

test("composeAtlas yields the hero, the other draughtings, and the surveys", () => {
  const world = generateWorld(defaultRecipe(42));
  const atlas = composeAtlas(world);

  assert.equal(atlas.hero.key, "antique");
  assert.match(atlas.hero.svg, /^<svg/);

  assert.deepEqual(
    atlas.draughtings.map((d) => d.key),
    ["topographic", "ink", "nautical"],
  );
  for (const d of atlas.draughtings) assert.match(d.svg, /^<svg/);

  assert.deepEqual(
    atlas.themes.map((t) => t.key),
    ["theme-vegetation", "theme-climate", "theme-moisture", "theme-population"],
  );
  for (const t of atlas.themes) assert.match(t.svg, /^<svg/);

  // seed 42 is an island with a capital and towns: two regional surveys
  assert.equal(atlas.regions.length, 2);
  for (const r of atlas.regions) {
    assert.match(r.key, /^region-\d+$/);
    assert.match(r.title, /^The Environs of /);
    assert.match(r.svg, /^<svg/);
  }

  assert.deepEqual(atlas.ribbons, ribbonPlates(world, "antique"));
});

test("the gazetteer fragment has one row per settlement", () => {
  const world = generateWorld(defaultRecipe(42));
  const atlas = composeAtlas(world);

  assert.match(atlas.gazetteerHtml, /<h2>Gazetteer<\/h2>/);
  // a header row in <thead> plus one body row per settlement
  const rows = (atlas.gazetteerHtml.match(/<tr>/g) ?? []).length;
  assert.equal(rows, world.settlements.length + 1);
});

test("the chronicle fragment lists the world's dated events in order", () => {
  const world = generateWorld(defaultRecipe(42));
  const atlas = composeAtlas(world);

  assert.match(atlas.chronicleHtml, /<h2>Chronicle<\/h2>/);
  const items = (atlas.chronicleHtml.match(/<li>/g) ?? []).length;
  assert.equal(items, world.history.events.length);
  for (const e of world.history.events) {
    assert.ok(atlas.chronicleHtml.includes(`<span class="year">${e.year}</span>`), `year ${e.year} present`);
  }
});

test("the banners fragment carries one banner per realm seat", () => {
  const world = generateWorld(defaultRecipe(42));
  const atlas = composeAtlas(world);

  assert.ok(world.arms.length >= 1, "fixture should have at least one realm");
  assert.match(atlas.bannersHtml, /Banners of the Realms/);
  const banners = (atlas.bannersHtml.match(/class="banner"/g) ?? []).length;
  assert.equal(banners, world.arms.length);
});

test("#25 banners default to colour, and hatch only when bannerStyle is ink", () => {
  const world = generateWorld(defaultRecipe(42));
  assert.ok(!composeAtlas(world).bannersHtml.includes("<pattern"), "default banners are colour");
  assert.ok(
    !composeAtlas(world, { bannerStyle: "nautical" }).bannersHtml.includes("<pattern"),
    "colour styles stay solid",
  );
  const ink = composeAtlas(world, { bannerStyle: "ink" }).bannersHtml;
  assert.ok(ink.includes("<pattern"), "ink banners hatch the field");
  const ids = [...ink.matchAll(/<pattern id="([^"]+)"/g)].map((m) => m[1]);
  assert.equal(ids.length, new Set(ids).size, `banner pattern ids must be unique, got ${ids.join(", ")}`);
});

test("#412 the atlas carries the capital's prospect at the present year", () => {
  const world = generateWorld(defaultRecipe(42));
  const atlas = composeAtlas(world);

  assert.equal(atlas.prospects.length, 1);
  const plate = atlas.prospects[0]!;
  const capital = world.settlements.findIndex((s) => s.kind === "capital");
  assert.ok(capital >= 0, "fixture should have a capital");
  assert.equal(plate.key, "prospect-capital");
  assert.equal(plate.title, `The Prospect of ${world.settlements[capital]!.name}`);
  assert.equal(plate.svg, prospectPlate(world, capital, STYLES.antique, world.title.year, 1500));
});

test("#412 the prospect's dress follows the banners: ink banners open an ink plate", () => {
  const world = generateWorld(defaultRecipe(42));
  const capital = world.settlements.findIndex((s) => s.kind === "capital");

  const ink = composeAtlas(world, { bannerStyle: "ink" });
  assert.equal(ink.prospects[0]?.svg, prospectPlate(world, capital, STYLES.ink, world.title.year, 1500));

  const nautical = composeAtlas(world, { bannerStyle: "nautical" });
  assert.equal(
    nautical.prospects[0]?.svg,
    prospectPlate(world, capital, STYLES.antique, world.title.year, 1500),
    "only ink banners change the dress: a colour atlas keeps the antique plate",
  );
});

test("#412 the prospect opens at the atlas plate width, not its intrinsic 520", () => {
  const world = generateWorld(defaultRecipe(42));
  const root = (svg: string): string => svg.slice(0, svg.indexOf(">") + 1);

  const composed = root(composeAtlas(world).prospects[0]!.svg);
  assert.ok(composed.includes('width="1500"'), `default atlas width, got ${composed}`);
  assert.ok(composed.includes('height="1108"'), "height keeps the 520:384 aspect, integer for the #329 frame");
  assert.ok(composed.includes('viewBox="0 0 520 384"'), "the drawing space is untouched");

  const narrow = root(composeAtlas(world, { width: 750 }).prospects[0]!.svg);
  assert.ok(narrow.includes('width="750"'), "the plate follows the composition width");
  assert.ok(narrow.includes('height="554"'), `aspect held at 750 wide, got ${narrow}`);
});

// The composed plate is year-insensitive within an era (a hardcoded same-era year renders byte-identically), so this pins the year on a world where it visibly matters: present 400 predates the founding, baring the ground.
test("#412 the composer reads the world's own present year, not a fixed one", () => {
  const world = generateWorld(defaultRecipe(42));
  const capital = world.settlements.findIndex((s) => s.kind === "capital");
  const early = { ...world, title: { ...world.title, year: 400 } };

  const plates = prospectPlates(early, "antique", 1500);
  assert.equal(plates.length, 1);
  assert.equal(plates[0]!.svg, prospectPlate(early, capital, STYLES.antique, 400, 1500));
  assert.notEqual(
    plates[0]!.svg,
    prospectPlate(world, capital, STYLES.antique, world.title.year, 1500),
    "year 400 predates the founding, so its plate must differ from the present one",
  );
});

test("#433 the atlas carries the road from the capital: the Ribbon's own plate for its bare-visit journey, at its own 1060 by 740", () => {
  const world = generateWorld(defaultRecipe(42));
  const plates = ribbonPlates(world, "antique");
  const res = ribbonResultFor(world, { from: null, to: null, dress: "antique" });

  assert.equal(plates.length, 1);
  assert.equal(plates[0]!.key, "ribbon-capital");
  assert.equal(plates[0]!.title, `The Road from ${res.fromName} to ${res.toName}`);
  assert.equal(plates[0]!.svg, res.svg);
  assert.equal(plateAspect(plates[0]!.svg), RIBBON_W / RIBBON_H);
});

test("#433 the road takes the proof's dress folded to the plate's two: an ink proof draws the plain impression, a nautical one the painted", () => {
  const world = generateWorld(defaultRecipe(42));
  const res = (dress: "ink" | "antique") => ribbonResultFor(world, { from: null, to: null, dress }).svg;
  assert.notEqual(res("ink"), res("antique"), "premise: the two impressions differ, or this pin proves nothing");

  assert.equal(ribbonPlates(world, "ink")[0]!.svg, res("ink"));
  assert.equal(ribbonPlates(world, "nautical")[0]!.svg, res("antique"));
});

test("#433 the worker hand-off carries every part of the composition across but the world, the road included", () => {
  const atlas = composeAtlas(generateWorld(defaultRecipe(42)));
  assert.equal(atlas.ribbons.length, 1, "premise: the composition holds a road to lose");
  const carried = serializableAtlas(atlas) as Record<string, unknown>;
  for (const [key, value] of Object.entries(atlas)) {
    if (key === "world") continue;
    assert.deepEqual(carried[key], value, `${key} crosses the worker boundary`);
  }
});

test("#450 each regional plate is the Glass's second close-up over its town, drawn as the Glass's own region job draws it", () => {
  const world = generateWorld(defaultRecipe(42));
  const plates = composeAtlas(world).regions;
  const towns = ["Laukuwelua", "Toatauhe"];
  assert.equal(plates.length, towns.length);
  plates.forEach((plate, i) => {
    const town = towns[i]!;
    const window = glassWindow(world, town);
    const glass = runInline({
      kind: "region",
      seed: 42,
      overrides: {},
      window,
      gridW: 320,
      gridH: 240,
      band: 2,
      render: PLATE_RENDER,
    });
    assert.equal(digest(plate.svg), digest(glass.svg), `${town}'s plate is the Glass's band-2 sheet, cell for cell`);
    assert.equal(plate.title, glass.title, "and carries the Glass's own title");
  });
});

test("#450 a regional plate carries its stamp, and the stamp alone redraws it byte for byte, its title derived from its window", () => {
  const world = generateWorld(defaultRecipe(2));
  assert.notEqual(
    regionTitle(world, glassWindow(world, "Nydstagrad")),
    "The Environs of Nydstagrad",
    "premise: chart 2's far-town plate is named for the town nearest its window's centre, or this pin cannot see a plate named for its anchor",
  );
  const plates = composeAtlas(world).regions;
  assert.equal(plates.length, 2);
  for (const plate of plates) {
    const parsed = recipeFromSvg(plate.svg);
    assert.ok(parsed, `${plate.title} carries its recipe`);
    const region = parsed.region;
    assert.ok(region, "and its region stamp");
    const chained = region.detail > 0;
    assert.equal(region.detail, 2, "stamped at band 2's depth");
    const reworld = generateWorld(parsed.recipe);
    const redrawn = renderMap(
      generateRegionWorld(reworld, {
        window: region.window,
        gridW: parsed.recipe.gridW,
        gridH: parsed.recipe.gridH,
        title: regionTitle(reworld, region.window),
        detail: chained,
      }),
      { style: parsed.style, widthPx: 1500, legend: true, regionRecipe: region },
    );
    assert.equal(digest(redrawn), digest(plate.svg), `${plate.title} redraws from its stamp alone`);
  }
});

test("composeAtlas is deterministic for a seed", () => {
  const a = composeAtlas(generateWorld(defaultRecipe(7)));
  const b = composeAtlas(generateWorld(defaultRecipe(7)));

  assert.equal(a.hero.svg, b.hero.svg);
  assert.deepEqual(a.draughtings, b.draughtings);
  assert.deepEqual(a.themes, b.themes);
  assert.deepEqual(a.regions, b.regions);
  assert.deepEqual(a.prospects, b.prospects);
  assert.deepEqual(a.ribbons, b.ribbons);
  assert.equal(a.gazetteerHtml, b.gazetteerHtml);
  assert.equal(a.bannersHtml, b.bannersHtml);
  assert.equal(a.chronicleHtml, b.chronicleHtml);
});

const unescape = (s: string): string =>
  s
    .replace(/&quot;/g, '"')
    .replace(/&#39;/g, "'")
    .replace(/&lt;/g, "<")
    .replace(/&gt;/g, ">")
    .replace(/&amp;/g, "&");

// The walk the notes are written in IS the printed order (a writer's prose depends on call order), so the order is what keeps the bound atlas's gazetteer byte-stable; the expectation is derived with the test's own rank map, never read back from the composer.
test("the gazetteer's rows run capital, then the towns, then the villages, each rank alphabetical", () => {
  const world = generateWorld(defaultRecipe(42));
  const html = composeAtlas(world).gazetteerHtml;
  const rows = [...html.matchAll(/<td class="name (\w+)">([^<]*)/g)].map((m) => ({
    kind: m[1]!,
    name: unescape(m[2]!),
  }));
  const RANK: Record<string, number> = { capital: 0, town: 1, village: 2, hamlet: 3 };
  const expected = world.settlements
    .map((s) => ({ kind: s.kind, name: s.name }))
    .sort((a, b) => RANK[a.kind]! - RANK[b.kind]! || a.name.localeCompare(b.name));
  assert.ok(
    rows.some((r) => r.kind === "town") && rows.some((r) => r.kind === "village"),
    "premise: seed 42 has more than one rank to order",
  );
  assert.notDeepEqual(
    rows.map((r) => r.name),
    world.settlements.map((s) => s.name),
    "premise: the index order differs from the rank order, or this pin proves nothing",
  );
  assert.deepEqual(rows, expected);
});

test("a single-realm world (city-state) still composes a banner and a survey", () => {
  const world = generateWorld(defaultRecipe(777, { mapType: "citystate" }));
  const atlas = composeAtlas(world);

  assert.match(atlas.hero.svg, /^<svg/);
  assert.ok(atlas.regions.length >= 1, "the capital environs at least");
  assert.equal(atlas.prospects.length, 1, "the capital's prospect");
  assert.match(atlas.bannersHtml, /Banners of the Realms/);
});
