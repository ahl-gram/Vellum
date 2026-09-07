import test from "node:test";
import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { resolve } from "node:path";
import {
  TABLE_KEY,
  TABLE_CAP,
  parseTable,
  emitTable,
  latticeFromCentre,
  tableWindow,
  groupByWorld,
  type SurveyItem,
  type ProspectItem,
  type TableItem,
} from "../../src/site/shared/table-address.ts";
import { chartTarget } from "../../src/site/prospect/address.ts";
import { LATTICE_DIVISIONS, LOD_BANDS, decideSettle, lodWindowFor, type LodBand } from "../../src/world/lod.ts";
import { finalizeHash } from "../../src/site/explorer/address.ts";

const REPO = resolve(import.meta.dirname, "..", "..");

// The two canonical items every round-trip test is built from: one survey wearing every field
// the grammar has, one prospect wearing every field of its own.
const SURVEY = "k-s.seed-42.type-citystate.band-polar.land-350.coast-55.style-antique.legend-1.arms-0.beasts-1.theme-moisture.rung-2.lx-17.ly-13";
const PROSPECT = "k-p.seed-42.style-ink.i-3.year-814";

const survey: SurveyItem = {
  kind: "survey",
  seed: 42,
  overrides: { mapType: "citystate", band: "polar", landFraction: 0.35, coastWarp: 0.55 },
  style: "antique",
  legend: true,
  arms: false,
  beasts: true,
  theme: "moisture",
  rung: 2,
  lx: 17,
  ly: 13,
};

const prospect: ProspectItem = {
  kind: "prospect",
  seed: 42,
  overrides: {},
  style: "ink",
  index: 3,
  year: 814,
};

const hashOf = (value: string): string => `#seed=42&style=antique&${TABLE_KEY}=${value}`;

test("the key is the ruled one and the cap is the ruled six (#518's sitting, #401 ruling 5)", () => {
  assert.equal(TABLE_KEY, "table");
  assert.equal(TABLE_CAP, 6);
});

test("the grammar imports without a DOM: three bundles host it (#519, the #191 idiom)", async () => {
  // A contract, not decoration: nothing in this file may install a DOM shim, or the import stops proving anything.
  assert.equal(typeof (globalThis as { document?: unknown }).document, "undefined", "no DOM is installed here");
  const mod = await import("../../src/site/shared/table-address.ts");
  assert.equal(typeof mod.parseTable, "function");
});

test("parseTable reads a survey: the world, the dress, and the window as band plus lattice", () => {
  assert.deepEqual(parseTable(hashOf(SURVEY)), [survey]);
});

test("parseTable reads a prospect: the world, the plate's style, the settlement and the year", () => {
  assert.deepEqual(parseTable(hashOf(PROSPECT)), [prospect]);
});

test("parseTable: no table key is null, an empty one is an empty table (the hosts tell them apart)", () => {
  assert.equal(parseTable("#seed=42"), null, "a chart with no table has no table");
  assert.equal(parseTable(""), null);
  assert.deepEqual(parseTable(`#${TABLE_KEY}=`), [], "the key present and empty is a table with nothing on it");
});

test("parseTable: absent optional fields stay absent, never defaulted (the overrides are presence-gated in app.ts)", () => {
  const [item] = parseTable(hashOf("k-s.seed-7.style-antique.legend-1.arms-1.beasts-0.rung-1.lx-8.ly-8")) as [SurveyItem];
  assert.deepEqual(item.overrides, {}, "no type, band, land or coast means the world's own, not a stated default");
  assert.equal(item.theme, null, "no theme is the plain sheet");
  const [p] = parseTable(hashOf("k-p.seed-7.style-ink")) as [ProspectItem];
  assert.equal(p.index, null, "no i lets resolveProspectIndex pick the capital");
  assert.equal(p.year, null);
});

test("emitTable returns the key's value, in one canonical field order", () => {
  assert.equal(emitTable([survey]), SURVEY);
  assert.equal(emitTable([prospect]), PROSPECT);
  assert.equal(emitTable([survey, prospect]), `${SURVEY}_${PROSPECT}`);
  assert.equal(emitTable([]), "", "an empty table emits an empty value");
});

test("round trip, emit(parse(x)) === x for canonical input", () => {
  const canonical = `${SURVEY}_${PROSPECT}`;
  assert.equal(emitTable(parseTable(hashOf(canonical)) as ReadonlyArray<TableItem>), canonical);
});

test("round trip, parse(emit(items)) deep-equals items", () => {
  const items = [survey, prospect];
  assert.deepEqual(parseTable(hashOf(emitTable(items))), items);
});

test("the separators survive URLSearchParams and finalizeHash untouched, which is why they are _ . and -", () => {
  // Measured, not assumed: the urlencoded serializer leaves only A-Za-z0-9 * - . _ alone, so the
  // epic body's proposed `~` would have ridden as %7E and broken the round trip on the first write.
  const value = emitTable([survey, prospect]);
  const params = new URLSearchParams();
  params.set("seed", "42");
  params.set(TABLE_KEY, value);
  const written = finalizeHash(params);
  assert.ok(written.includes(`${TABLE_KEY}=${value}`), `the writer must not re-encode the value: ${written}`);
  assert.deepEqual(parseTable("#" + written), [survey, prospect]);
  assert.doesNotMatch(value, /%/, "nothing in an emitted table is percent-encoded");
});

test("six full items stay a workable link: the encoded length is pinned so a later field cannot quietly blow it out", () => {
  const wide: SurveyItem = {
    ...survey,
    seed: 4294967295,
    overrides: { mapType: "archipelago", band: "temperate", landFraction: 0.7, coastWarp: 1 },
    style: "topographic",
    theme: "vegetation",
    rung: 3,
    lx: 64,
    ly: 64,
  };
  const params = new URLSearchParams();
  params.set(TABLE_KEY, emitTable(Array<SurveyItem>(TABLE_CAP).fill(wide)));
  const encoded = finalizeHash(params);
  assert.ok(encoded.length <= 950, `six of the widest items encode to ${encoded.length} characters, over the 950 pin`);
});

test("the cap refuses the seventh sheet in both directions; the wording belongs to the hosts", () => {
  const seven = Array.from({ length: 7 }, (_, i) => ({ ...survey, seed: i }));
  assert.equal(emitTable(seven).split("_").length, TABLE_CAP, "emit lays only six");
  const parsed = parseTable(hashOf(seven.map((s) => emitTable([s])).join("_"))) as ReadonlyArray<TableItem>;
  assert.equal(parsed.length, TABLE_CAP, "parse takes only six");
  assert.deepEqual(parsed.map((i) => i.seed), [0, 1, 2, 3, 4, 5], "the six kept are the first six, in order");
});

test("a malformed item is dropped on its own; the rest of the folio survives", () => {
  const parsed = parseTable(hashOf(`${SURVEY}_nonsense_${PROSPECT}`)) as ReadonlyArray<TableItem>;
  assert.deepEqual(parsed, [survey, prospect], "the neighbours are not punished for it");
  for (const bad of [
    "seed-42.style-antique.rung-2.lx-1.ly-1.legend-1.arms-0", // no kind
    "k-x.seed-42.style-antique", // an unknown kind
    "k-s.style-antique.legend-1.arms-0.beasts-0.rung-2.lx-1.ly-1", // no seed
    "k-s.seed-4.2.style-antique.legend-1.arms-0.beasts-0.rung-2.lx-1.ly-1", // a seed that is not digits
    "k-s.seed-42.legend-1.arms-0.beasts-0.rung-2.lx-1.ly-1", // no style
    "k-s.seed-42.style-antique.legend-1.arms-0.lx-1.ly-1", // no rung
    "k-s.seed-42.style-antique.legend-1.arms-0.beasts-0.rung-2.ly-1", // half a centre
    "k-s.seed-42.style-antique.arms-0.beasts-0.rung-2.lx-1.ly-1", // a seal left unstated: the dress must be whole
    "k-s.seed-42.style-antique.legend-1.beasts-0.rung-2.lx-1.ly-1",
    "k-s.seed-42.style-antique.legend-1.arms-0.rung-2.lx-1.ly-1",
    "k-s.seed-42.style-antique.legend-1.arms-0.beasts-0.rung-2.lx-1.ly-1.lx-2", // one field, stated twice
    "k-p.seed-42", // a prospect with no style has no dress
  ]) {
    assert.deepEqual(parseTable(hashOf(bad)), [], `a required field missing drops the item: ${bad}`);
  }
});

test("the allowlists refuse a crafted recipe value by dropping the item, never by drafting a different world", () => {
  for (const bad of [
    "k-s.seed-42.style-gothic.legend-1.arms-0.beasts-0.rung-2.lx-1.ly-1",
    "k-s.seed-42.type-moon.style-antique.legend-1.arms-0.beasts-0.rung-2.lx-1.ly-1",
    "k-s.seed-42.band-arid.style-antique.legend-1.arms-0.beasts-0.rung-2.lx-1.ly-1",
    "k-s.seed-42.theme-politics.style-antique.legend-1.arms-0.beasts-0.rung-2.lx-1.ly-1",
    "k-s.seed-42.land-abc.style-antique.legend-1.arms-0.beasts-0.rung-2.lx-1.ly-1",
    "k-p.seed-42.style-nautical.year-0", // the room's own year grammar: 0 is not a year
    "k-p.seed-42.style-nautical.year-1e3",
    "k-p.seed-42.style-nautical.i-abc",
  ]) {
    assert.deepEqual(parseTable(hashOf(bad)), [], `a stated but unreadable field drops the item: ${bad}`);
  }
});

test("land and coast clamp to the engine's range, the way every other host clamps them", () => {
  const wide = parseTable(hashOf("k-s.seed-42.land-9999.coast-500.style-antique.legend-1.arms-0.beasts-0.rung-2.lx-1.ly-1")) as [SurveyItem];
  assert.deepEqual(wide[0].overrides, { landFraction: 0.7, coastWarp: 1 });
  const low = parseTable(hashOf("k-s.seed-42.land-10.coast-0.style-antique.legend-1.arms-0.beasts-0.rung-2.lx-1.ly-1")) as [SurveyItem];
  assert.deepEqual(low[0].overrides, { landFraction: 0.1, coastWarp: 0 });
});

test("the selects' own empty option is spelled by leaving the field out, never by an empty value", () => {
  // The Explorer's type, band and theme selects each offer value="" (seed's choice / none) and
  // writeHash omits the key for it. A keyed item does the same; a stated-but-empty field is a
  // crafted address, not seed's choice, so it drops the item rather than quietly picking a world.
  const seedsChoice = "k-s.seed-42.style-antique.legend-1.arms-0.beasts-0.rung-2.lx-1.ly-1";
  const [item] = parseTable(hashOf(seedsChoice)) as [SurveyItem];
  assert.deepEqual(item.overrides, {}, "no type and no band is the seed's own world");
  assert.equal(item.theme, null);
  assert.equal(emitTable([item]), seedsChoice, "and it emits back with the fields still absent");
  for (const empty of ["type-", "band-", "theme-", "style-", "seed-"]) {
    assert.deepEqual(parseTable(hashOf(`k-s.${empty}.style-antique.legend-1.arms-0.beasts-0.rung-2.lx-1.ly-1`)), []);
  }
});

test("an unknown field is ignored, not fatal: a later field must not empty an older reader's table", () => {
  assert.deepEqual(parseTable(hashOf(`${SURVEY}.pinned-1`)), [survey]);
});

test("the rung is the Glass's, 1 to 3: band 0 is a world sheet and no survey at all", () => {
  for (const rung of ["0", "4", "-1", "2.5", "abc"]) {
    assert.deepEqual(
      parseTable(hashOf(`k-s.seed-42.style-antique.legend-1.arms-0.beasts-0.rung-${rung}.lx-1.ly-1`)),
      [],
      `rung ${rung} is not a survey`,
    );
  }
  for (const rung of [1, 2, 3]) {
    const parsed = parseTable(hashOf(`k-s.seed-42.style-antique.legend-1.arms-0.beasts-0.rung-${rung}.lx-1.ly-1`)) as [SurveyItem];
    assert.equal(parsed[0].rung, rung);
  }
});

test("a lattice index off the lattice drops the item (the centre must name a real settle)", () => {
  for (const rung of [1, 2, 3]) {
    const size = (LOD_BANDS[rung] as LodBand).sizeUV;
    const max = LATTICE_DIVISIONS / size;
    assert.deepEqual(parseTable(hashOf(`k-s.seed-42.style-antique.legend-1.arms-0.beasts-0.rung-${rung}.lx-${max + 1}.ly-1`)), []);
    assert.deepEqual(parseTable(hashOf(`k-s.seed-42.style-antique.legend-1.arms-0.beasts-0.rung-${rung}.lx--1.ly-1`)), []);
    const edge = parseTable(hashOf(`k-s.seed-42.style-antique.legend-1.arms-0.beasts-0.rung-${rung}.lx-${max}.ly-0`)) as [SurveyItem];
    assert.equal(edge[0].lx, max, `index ${max} is the last real lattice step at rung ${rung}`);
  }
});

test("THE LATTICE CONTRACT: a filed survey redraws the very window the Glass committed", () => {
  // The reason centres never ride as floats. Sweep every camera decideSettle can settle at every
  // rung, file it through the grammar, and the window that comes back out must be the same object
  // the redraft was drawn from; anything else and a shared folio quietly draws a different corner.
  let checked = 0;
  for (const band of LOD_BANDS) {
    if (!band.isRegion) continue;
    const step = band.sizeUV / LATTICE_DIVISIONS;
    for (let i = 0; i <= LATTICE_DIVISIONS / band.sizeUV; i += 3) {
      for (let j = 0; j <= LATTICE_DIVISIONS / band.sizeUV; j += 5) {
        const camera = { cx: i * step, cy: j * step, k: band.k };
        const decided = decideSettle({ camera, currentWindow: lodWindowFor(0.5, 0.5, 1), currentBand: 0 });
        assert.equal(decided.action, "region", "the sweep must stay inside the region bands");
        const lattice = latticeFromCentre(camera.cx, camera.cy, band.index);
        assert.notEqual(lattice, null, `the Glass settled at ${camera.cx},${camera.cy} but the grammar refused it`);
        const filed = parseTable(
          hashOf(emitTable([{ ...survey, overrides: {}, rung: band.index, lx: lattice!.lx, ly: lattice!.ly }])),
        ) as [SurveyItem];
        assert.deepEqual(
          tableWindow(filed[0]),
          (decided as { window: unknown }).window,
          `rung ${band.index}, lattice ${lattice!.lx},${lattice!.ly}: the redraw window drifted from the committed one`,
        );
        checked++;
      }
    }
  }
  assert.ok(checked > 100, `the sweep must actually sweep; it checked ${checked}`);
});

test("latticeFromCentre refuses a centre that is not a settle, and a rung that is not the Glass's", () => {
  assert.equal(latticeFromCentre(0.5, 0.5, 0), null, "band 0 has no lattice");
  assert.equal(latticeFromCentre(0.5, 0.5, 4), null);
  assert.equal(latticeFromCentre(-0.1, 0.5, 2), null, "off the sheet is not a settle");
  assert.equal(latticeFromCentre(1.4, 0.5, 2), null);
  assert.deepEqual(latticeFromCentre(0.5, 0.5, 1), { lx: 8, ly: 8 }, "the middle of the sheet at rung 1");
});

test("groupByWorld orders for Sub 3's drafting: one run per world, worlds in first-seen order", () => {
  const a = { ...survey, seed: 1, overrides: {} };
  const b = { ...prospect, seed: 2, overrides: {} };
  const c = { ...survey, seed: 1, overrides: {}, lx: 3 };
  const groups = groupByWorld([a, b, c]);
  assert.equal(groups.length, 2, "two worlds, not three");
  assert.deepEqual(groups.map((g) => g.entries.map((e) => e.at)), [[0, 2], [1]], "seed 1 first, and it keeps both its sheets");
  assert.deepEqual(groups[0]!.entries.map((e) => e.item), [a, c]);
});

test("groupByWorld groups on the world the address states, so a key order cannot split one world in two", () => {
  // JSON.stringify would: {mapType, band} and {band, mapType} are the same world and different strings,
  // and splitting them regenerates the parent twice through the single-entry worldFor cache.
  const one = { ...survey, overrides: { mapType: "citystate", band: "polar" } } as SurveyItem;
  const two = { ...survey, overrides: { band: "polar", mapType: "citystate" }, lx: 4 } as SurveyItem;
  assert.equal(groupByWorld([one, two]).length, 1, "the same world, however the caller built the object");
  const other = { ...survey, overrides: { mapType: "citystate" } } as SurveyItem;
  assert.equal(groupByWorld([one, other]).length, 2, "a different override set IS a different world");
});

test("the allowlists mirror the Explorer's own selects, or a link the Explorer can write cannot be filed", () => {
  const page = readFileSync(resolve(REPO, "src/pages/explorer/index.astro"), "utf8");
  const optionsOf = (id: string): string[] => {
    const sel = new RegExp(`<select id="${id}">([\\s\\S]*?)</select>`).exec(page);
    assert.ok(sel, `the Explorer still has a #${id} select`);
    return [...(sel[1] as string).matchAll(/<option value="([^"]*)"/g)].map((m) => m[1] as string).filter((v) => v !== "");
  };
  for (const [id, field, sample] of [
    ["style", "style", "k-s.seed-42.style-VALUE.legend-1.arms-0.beasts-0.rung-2.lx-1.ly-1"],
    ["type", "type", "k-s.seed-42.type-VALUE.style-antique.legend-1.arms-0.beasts-0.rung-2.lx-1.ly-1"],
    ["band", "band", "k-s.seed-42.band-VALUE.style-antique.legend-1.arms-0.beasts-0.rung-2.lx-1.ly-1"],
    ["theme", "theme", "k-s.seed-42.theme-VALUE.style-antique.legend-1.arms-0.beasts-0.rung-2.lx-1.ly-1"],
  ] as const) {
    for (const value of optionsOf(id)) {
      assert.equal(
        (parseTable(hashOf(sample.replace("VALUE", value))) as ReadonlyArray<TableItem>).length,
        1,
        `the Explorer offers ${field}=${value} but the table's allowlist refuses it`,
      );
    }
  }
});

test("legend and arms ride as the Explorer writes them, 1 or 0, and nothing else reads as true", () => {
  const on = parseTable(hashOf("k-s.seed-42.style-antique.legend-1.arms-1.beasts-0.rung-2.lx-1.ly-1")) as [SurveyItem];
  assert.deepEqual([on[0].legend, on[0].arms], [true, true]);
  const off = parseTable(hashOf("k-s.seed-42.style-antique.legend-0.arms-0.beasts-0.rung-2.lx-1.ly-1")) as [SurveyItem];
  assert.deepEqual([off[0].legend, off[0].arms], [false, false]);
  assert.deepEqual(parseTable(hashOf("k-s.seed-42.style-antique.legend-yes.arms-0.beasts-0.rung-2.lx-1.ly-1")), [], "a stated but unreadable seal drops the item");
});

test("the table rides through the Prospect page and back (#401 ruling 7 depends on it)", () => {
  const hash = `#seed=42&style=antique&${TABLE_KEY}=${SURVEY}&i=4&year=300`;
  assert.ok(chartTarget(hash).includes(`${TABLE_KEY}=${SURVEY}`), "chartTarget drops only i and year, so the table comes home");
  assert.deepEqual(parseTable(chartTarget(hash).replace("/explorer/", "")), [survey]);
});
