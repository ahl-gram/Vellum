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
  latticeFromSettle,
  tableWindow,
  groupByWorld,
  type Rung,
  type SurveyItem,
  type ProspectItem,
  type TableItem,
} from "../../src/site/shared/table-address.ts";
import { chartTarget } from "../../src/site/prospect/address.ts";
import { LATTICE_DIVISIONS, LOD_BANDS, decideSettle, lodWindowFor, plotUvFromSheet, FULL_WINDOW, type LodBand } from "../../src/world/lod.ts";
import { finalizeHash } from "../../src/site/explorer/address.ts";

const REPO = resolve(import.meta.dirname, "..", "..");

// The two canonical items every round-trip test is built from: one survey wearing every field the grammar has, one prospect wearing every field of its own.
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
  for (const folio of [`${SURVEY}_nonsense_${PROSPECT}`, `nonsense_${SURVEY}_${PROSPECT}`, `${SURVEY}_${PROSPECT}_nonsense`]) {
    assert.deepEqual(parseTable(hashOf(folio)), [survey, prospect], `the neighbours are not punished for it: ${folio}`);
  }
  for (const bad of [
    "seed-42.style-antique.legend-1.arms-0.beasts-0.rung-2.lx-1.ly-1", // no kind, and NOTHING else missing
    "k-x.seed-42.style-antique",
    "k-s.-junk.seed-42.style-antique.legend-1.arms-0.beasts-0.rung-2.lx-1.ly-1",
    "k-s.style-antique.legend-1.arms-0.beasts-0.rung-2.lx-1.ly-1",
    "k-s.seed-4.2.style-antique.legend-1.arms-0.beasts-0.rung-2.lx-1.ly-1",
    "k-s.seed-42.legend-1.arms-0.beasts-0.rung-2.lx-1.ly-1",
    "k-s.seed-42.style-antique.legend-1.arms-0.lx-1.ly-1",
    "k-s.seed-42.style-antique.legend-1.arms-0.beasts-0.rung-2.ly-1",
    "k-s.seed-42.style-antique.legend-1.arms-0.beasts-0.rung-2.lx-1",
    "k-s.seed-42.style-antique.arms-0.beasts-0.rung-2.lx-1.ly-1", // a seal left unstated: the dress must be whole
    "k-s.seed-42.style-antique.legend-1.beasts-0.rung-2.lx-1.ly-1",
    "k-s.seed-42.style-antique.legend-1.arms-0.rung-2.lx-1.ly-1",
    "k-s.seed-42.style-antique.legend-1.arms-0.beasts-0.rung-2.lx-1.ly-1.lx-2",
    "k-p.seed-42",
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
    // Both axes, both directions: a guard that only watches lx is half a guard.
    for (const off of [`lx-${max + 1}.ly-1`, `lx--1.ly-1`, `lx-1.ly-${max + 1}`, `lx-1.ly--1`]) {
      assert.deepEqual(parseTable(hashOf(`k-s.seed-42.style-antique.legend-1.arms-0.beasts-0.rung-${rung}.${off}`)), [], off);
    }
    const edge = parseTable(hashOf(`k-s.seed-42.style-antique.legend-1.arms-0.beasts-0.rung-${rung}.lx-${max}.ly-0`)) as [SurveyItem];
    assert.equal(edge[0].lx, max, `index ${max} is the last real lattice step at rung ${rung}`);
  }
});

test("THE LATTICE CONTRACT: a filed survey redraws the very window the Glass committed", () => {
  // On a lattice point Math.round and Math.floor agree, so the nudge is 0.7 of a cell, in the half where they disagree: 0.3 would round down and prove nothing.
  // A stride that never lands on max leaves the top index unswept, where lodWindowFor's upper clamp is active, so every stride ends at max explicitly.
  const steps = (max: number, by: number): number[] => {
    const out: number[] = [];
    for (let i = 0; i <= max; i += by) out.push(i);
    if (out[out.length - 1] !== max) out.push(max);
    return out;
  };
  let checked = 0;
  let offGrid = 0;
  let atEdge = 0;
  for (const band of LOD_BANDS) {
    if (!band.isRegion) continue;
    const step = band.sizeUV / LATTICE_DIVISIONS;
    const max = LATTICE_DIVISIONS / band.sizeUV;
    for (const i of steps(max, 3)) {
      for (const j of steps(max, 5)) {
        // At the top index a camera nudged upward is off the sheet, which the grammar is right to refuse, so only the aligned centre is swept there.
        const edge = i === max || j === max;
        if (edge) atEdge++;
        for (const nudge of edge ? [0] : [0, 0.7]) {
          const camera = { cx: (i + nudge) * step, cy: (j + nudge) * step, k: band.k };
          if (nudge !== 0) offGrid++;
          const decided = decideSettle({ camera, currentWindow: lodWindowFor(0.5, 0.5, 1), currentBand: 0 });
          assert.equal(decided.action, "region", "the sweep must stay inside the region bands");
          const lattice = latticeFromCentre(camera.cx, camera.cy, band.index);
          assert.notEqual(lattice, null, `the Glass settled at ${camera.cx},${camera.cy} but the grammar refused it`);
          const filed = parseTable(
            hashOf(emitTable([{ ...survey, overrides: {}, rung: band.index as Rung, lx: lattice!.lx, ly: lattice!.ly }])),
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
  }
  assert.ok(checked > 100, `the sweep must actually sweep; it checked ${checked}`);
  assert.ok(offGrid > 100, `and it must sweep BETWEEN the lattice points, where the rounding shows; it checked ${offGrid}`);
  assert.ok(atEdge > 0 && offGrid < checked, `and it must reach the top lattice index, where the window clamps; ${atEdge} edge cameras of ${checked}`);
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
  assert.deepEqual(groups.map((g) => [g.seed, g.overrides]), [[1, {}], [2, {}]], "each group names its own world, so Sub 3 calls worldFor without reaching into an entry");
});

test("groupByWorld groups on the world the address states, so a key order cannot split one world in two", () => {
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

test("chartTarget carries the table home from the Prospect page (#401 ruling 7 depends on it; the Explorer's writer is Sub 2's half)", () => {
  const hash = `#seed=42&style=antique&${TABLE_KEY}=${SURVEY}&i=4&year=300`;
  assert.ok(chartTarget(hash).includes(`${TABLE_KEY}=${SURVEY}`), "chartTarget drops only i and year, so the table comes home");
  assert.deepEqual(parseTable(chartTarget(hash).replace("/explorer/", "")), [survey]);
});

// The address encodes the window as (rung, lattice centre) and there is no honest way back from the window, so the seat is taken at the settle; swept from the SHEET camera the Glass reports over EVERY seat, because at rung 1 lodWindowFor clamps hard enough that neighbouring seats share a window byte for byte and three chosen cameras let a window-midpoint shortcut pass.
test("every lattice seat round-trips through the settle it came from (#520)", () => {
  const m = { mx: 0.045, my: 0.045 };
  const toSheet = (plot: number, margin: number): number => plot * (1 - 2 * margin) + margin;
  const dress = { kind: "survey", seed: 42, overrides: {}, style: "antique", legend: true, arms: false, beasts: false, theme: null } as const;
  for (const rung of [1, 2, 3] as const) {
    const band = LOD_BANDS[rung] as LodBand;
    const step = band.sizeUV / LATTICE_DIVISIONS;
    const max = Math.round(LATTICE_DIVISIONS / band.sizeUV);
    let checked = 0;
    for (let lx = 0; lx <= max; lx++) {
      for (let ly = 0; ly <= max; ly++) {
        const cam = { cx: toSheet(lx * step, m.mx), cy: toSheet(ly * step, m.my), k: band.k };
        const seat = latticeFromSettle(cam, m, rung);
        assert.deepEqual(seat, { lx, ly }, `rung ${rung} seat (${lx},${ly}): the settle must name the seat it landed on`);
        const decision = decideSettle({ camera: plotUvFromSheet(cam, m), currentWindow: FULL_WINDOW, currentBand: 0 });
        assert.equal(decision.action, "region");
        assert.deepEqual(tableWindow({ ...dress, rung, lx, ly }), decision.window, `rung ${rung} seat (${lx},${ly}): the address must rebuild the settle's own window`);
        checked++;
      }
    }
    assert.equal(checked, (max + 1) ** 2, `rung ${rung}: the sweep must reach every seat`);
  }
});

// The control: the raw sheet-fraction camera is the wrong space, and the seat it names must differ, or the sweep above proves nothing about the conversion latticeFromSettle owns. Measured 2026-09-07 at every rung.
test("the sheet-fraction camera names a different seat, which is why the conversion is not the caller's (#520)", () => {
  const m = { mx: 0.045, my: 0.045 };
  for (const [rung, c] of [[1, 0.220], [2, 0.200], [3, 0.200]] as const) {
    const cam = { cx: c, cy: c, k: (LOD_BANDS[rung] as LodBand).k };
    assert.notDeepEqual(latticeFromSettle(cam, m, rung), latticeFromCentre(cam.cx, cam.cy, rung), `rung ${rung}: the two spaces must disagree at ${c}`);
  }
});

// The witness that makes the guard above bite. Measured 2026-09-07: at rung 3, 1200 of 4225 seats rebuild a DIFFERENT window from their own window's midpoint; rungs 1 and 2 have none, so a guard sampling only those two cannot see the hazard.
test("the window's own midpoint is NOT a way back to its seat (#520, the 1200 of 4225)", () => {
  const dress = { kind: "survey", seed: 42, overrides: {}, style: "antique", legend: true, arms: false, beasts: false, theme: null } as const;
  const band = LOD_BANDS[3] as LodBand;
  const max = Math.round(LATTICE_DIVISIONS / band.sizeUV);
  let lossy = 0;
  for (let lx = 0; lx <= max; lx++) {
    for (let ly = 0; ly <= max; ly++) {
      const w = tableWindow({ ...dress, rung: 3, lx, ly });
      const mid = latticeFromCentre((w.u0 + w.u1) / 2, (w.v0 + w.v1) / 2, 3);
      const rebuilt = mid ? tableWindow({ ...dress, rung: 3, lx: mid.lx, ly: mid.ly }) : null;
      if (!rebuilt || JSON.stringify(rebuilt) !== JSON.stringify(w)) lossy++;
    }
  }
  assert.equal(lossy, 1200, "the lossy count Sub 1 measured; if this moves, the grammar or the clamp moved with it");
  // The named witness, so the count above is not the only thing standing between this and a vacuous pass.
  const edge = tableWindow({ ...dress, rung: 3, lx: 0, ly: 0 });
  const midSeat = latticeFromCentre((edge.u0 + edge.u1) / 2, (edge.v0 + edge.v1) / 2, 3);
  assert.notDeepEqual(midSeat, { lx: 0, ly: 0 }, "band 3 seat (0,0) is the clamped edge case: its midpoint names a different seat");
});
