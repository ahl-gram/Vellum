import { test } from "node:test";
import assert from "node:assert/strict";
import { composeAtlas, gazetteerNoteFor, prospectPlates } from "../../src/atlas/compose.ts";
import { prospectPlate } from "../../src/prospect/finished.ts";
import { STYLES } from "../../src/render/style.ts";
import { defaultRecipe, generateWorld } from "../../src/world/generate.ts";

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
    assert.ok(
      atlas.chronicleHtml.includes(`<span class="year">${e.year}</span>`),
      `year ${e.year} present`,
    );
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
  assert.ok(!composeAtlas(world, { bannerStyle: "nautical" }).bannersHtml.includes("<pattern"), "colour styles stay solid");
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

test("composeAtlas is deterministic for a seed", () => {
  const a = composeAtlas(generateWorld(defaultRecipe(7)));
  const b = composeAtlas(generateWorld(defaultRecipe(7)));

  assert.equal(a.hero.svg, b.hero.svg);
  assert.deepEqual(a.draughtings, b.draughtings);
  assert.deepEqual(a.themes, b.themes);
  assert.deepEqual(a.regions, b.regions);
  assert.deepEqual(a.prospects, b.prospects);
  assert.equal(a.gazetteerHtml, b.gazetteerHtml);
  assert.equal(a.bannersHtml, b.bannersHtml);
  assert.equal(a.chronicleHtml, b.chronicleHtml);
});

const unescape = (s: string): string =>
  s.replace(/&quot;/g, '"').replace(/&#39;/g, "'").replace(/&lt;/g, "<").replace(/&gt;/g, ">").replace(/&amp;/g, "&");

// The walk the notes are written in IS the printed order, so the order is load-bearing for gazetteerNoteFor (a note-agreement test alone is a self-consistent oracle: both sides walk the same order function; guard-prover on #463 part 4/4). The expectation is derived here with the test's own rank map, never read back from the composer.
test("the gazetteer's rows run capital, then the towns, then the villages, each rank alphabetical", () => {
  const world = generateWorld(defaultRecipe(42));
  const html = composeAtlas(world).gazetteerHtml;
  const rows = [...html.matchAll(/<td class="name (\w+)">([^<]*)/g)].map((m) => ({ kind: m[1]!, name: unescape(m[2]!) }));
  const RANK: Record<string, number> = { capital: 0, town: 1, village: 2, hamlet: 3 };
  const expected = world.settlements
    .map((s) => ({ kind: s.kind as string, name: s.name }))
    .sort((a, b) => RANK[a.kind]! - RANK[b.kind]! || a.name.localeCompare(b.name));
  assert.ok(rows.some((r) => r.kind === "town") && rows.some((r) => r.kind === "village"), "premise: seed 42 has more than one rank to order");
  assert.notDeepEqual(rows.map((r) => r.name), world.settlements.map((s) => s.name), "premise: the index order differs from the rank order, or this pin proves nothing");
  assert.deepEqual(rows, expected);
});

// #463 part 4/4: the Prospect room's engraver's note is the gazetteer's travellers' note for that town, so the two must agree for EVERY settlement, not only the one the writer happens to meet first (a fresh writer's prose depends on call order; the place-card.ts warning).
test("gazetteerNoteFor hands back the very note the bound atlas's gazetteer prints for that settlement", () => {
  const world = generateWorld(defaultRecipe(42));
  const html = composeAtlas(world).gazetteerHtml;
  const printed = new Map<string, string>();
  for (const m of html.matchAll(/<td class="name [^"]*">([^<]*)(?:<span class="former">[^<]*<\/span>)?<\/td>\s*<td>[^<]*<\/td>\s*<td>[^<]*<\/td>\s*<td class="note">([^<]*)<\/td>/g)) {
    printed.set(unescape(m[1]!), unescape(m[2]!));
  }
  assert.equal(printed.size, world.settlements.length, "premise: every settlement has a gazetteer row");
  const capital = world.settlements.findIndex((s) => s.kind === "capital");
  const lastRow = [...printed.keys()].at(-1)!;
  const lastIdx = world.settlements.findIndex((s) => s.name === lastRow);
  assert.notEqual(lastIdx, capital, "premise: the gazetteer's last row is not the capital, so a fresh writer would meet it in a different order");
  assert.equal(gazetteerNoteFor(world, lastIdx), printed.get(lastRow), `the note for ${lastRow}, the gazetteer's last row`);
  world.settlements.forEach((s, i) => {
    assert.equal(gazetteerNoteFor(world, i), printed.get(s.name), `the note for ${s.name}`);
  });
  assert.throws(() => gazetteerNoteFor(world, world.settlements.length), RangeError);
});

test("a single-realm world (city-state) still composes a banner and a survey", () => {
  const world = generateWorld(defaultRecipe(777, { mapType: "citystate" }));
  const atlas = composeAtlas(world);

  assert.match(atlas.hero.svg, /^<svg/);
  assert.ok(atlas.regions.length >= 1, "the capital environs at least");
  assert.equal(atlas.prospects.length, 1, "the capital's prospect");
  assert.match(atlas.bannersHtml, /Banners of the Realms/);
});
