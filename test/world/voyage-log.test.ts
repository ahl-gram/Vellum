import { test } from "node:test";
import assert from "node:assert/strict";
import {
  buildVoyageLog,
  SEA_ARRIVALS,
  LAND_ARRIVALS,
  DEPARTURES,
  type VoyageLogPort,
} from "../../src/world/voyage-log.ts";
import { defaultRecipe, generateWorld } from "../../src/world/generate.ts";
import { buildPlaceManifest } from "../../src/render/place-manifest.ts";
import { buildVoyagePlan } from "../../src/render/voyage.ts";
import { buildSurvey } from "../../src/render/survey.ts";
import { routeVoyage } from "../../src/render/voyage-route.ts";

// Unit tests for #121 (Sub 4 of the Wayfarer's Passage epic #117): the surveyor's
// margin log. A pure post-world module on the daily-hunt pattern: it forks its own
// RNG off the recipe seed, so it adds no World field, is never imported by
// generate.ts, and cannot move a chart byte (golden checksum untouched). The scrollable
// panel + the reveal-per-arrival wiring live in public/explorer/voyage.js and are covered
// by the Explorer e2e; only the deterministic prose lives here.
//
// The prose consumes the leg mode from #120: a sea arrival reads as a voyage, a road (or
// the degraded "straight") arrival as a ride, and the origin as a departure. Flavor is
// drawn from small authored pools with no repeat until the pool is exhausted.

const SUBTITLE =
  "Being a true & faithful chart of these waters, as surveyed by " +
  "Taiki the Wayfarer in the year 1059 of the Cedar Age";

const port = (over: Partial<VoyageLogPort> = {}): VoyageLogPort => ({
  idx: 0,
  name: "Aelmoor",
  kind: "town",
  founded: 300,
  arrivalMode: "road",
  ...over,
});

// A small ordered survey: the capital origin (departs), a road-arrival village, a
// sea-arrival village. Ordered as visited, exactly as buildVoyagePlan hands them over.
const origin = port({ idx: 0, name: "Laukuwelua", kind: "capital", founded: 451, arrivalMode: null });
const roadTown = port({ idx: 1, name: "Haireno", kind: "village", founded: 860, arrivalMode: "road" });
const seaVillage = port({ idx: 2, name: "Meamere", kind: "village", founded: 420, arrivalMode: "sea" });
const smallSurvey = [origin, roadTown, seaVillage];

test("one entry per port, in visit order", () => {
  const log = buildVoyageLog(smallSurvey, 1059, 42, SUBTITLE);
  assert.equal(log.entries.length, smallSurvey.length);
  assert.deepEqual(
    log.entries.map((e) => e.idx),
    smallSurvey.map((p) => p.idx),
  );
});

test("the log opens with the surveyor's attribution (the #116 subtitle)", () => {
  const log = buildVoyageLog(smallSurvey, 1059, 42, SUBTITLE);
  assert.equal(log.attribution, SUBTITLE);
});

test("every entry carries the survey year and the port name", () => {
  const log = buildVoyageLog(smallSurvey, 1059, 42, SUBTITLE);
  for (const [i, entry] of log.entries.entries()) {
    assert.equal(entry.year, 1059, "every entry is stamped with the survey year");
    assert.match(entry.text, /Year 1059\./, `"${entry.text}" must carry the year`);
    assert.ok(entry.text.includes(smallSurvey[i]!.name), `"${entry.text}" must name the port`);
  }
});

test("the origin entry is a departure, not an arrival", () => {
  const log = buildVoyageLog(smallSurvey, 1059, 42, SUBTITLE);
  const first = log.entries[0]!.text;
  assert.ok(first.includes("set out"), `origin must depart: "${first}"`);
  assert.ok(!first.includes("made sail") && !first.includes("rode on"), `origin must not arrive: "${first}"`);
  assert.ok(first.includes("seat of this survey"), `origin names the seat: "${first}"`);
});

test("a sea arrival reads as a voyage; a road arrival reads as a ride", () => {
  const log = buildVoyageLog(smallSurvey, 1059, 42, SUBTITLE);
  const road = log.entries[1]!.text;
  const sea = log.entries[2]!.text;
  assert.ok(road.includes("rode on"), `road arrival must ride: "${road}"`);
  assert.ok(sea.includes("made sail"), `sea arrival must sail: "${sea}"`);
  assert.notEqual(road.split(".")[1], sea.split(".")[1], "the arrival clauses must differ by mode");
});

test("a degraded straight leg reads as an overland crossing, never a sail", () => {
  const straight = [origin, port({ idx: 1, name: "Farhold", kind: "town", founded: 700, arrivalMode: "straight" })];
  const log = buildVoyageLog(straight, 1059, 42, SUBTITLE);
  const text = log.entries[1]!.text;
  assert.ok(text.includes("overland"), `straight must read overland: "${text}"`);
  assert.ok(!text.includes("made sail"), `straight must never sail: "${text}"`);
});

test("town and village descriptors differ", () => {
  const survey = [
    origin,
    port({ idx: 1, name: "Samewick", kind: "town", founded: 500, arrivalMode: "road" }),
    port({ idx: 2, name: "Samewick", kind: "village", founded: 500, arrivalMode: "road" }),
  ];
  const log = buildVoyageLog(survey, 1059, 42, SUBTITLE);
  assert.ok(log.entries[1]!.text.includes("town"), "a town is a town");
  assert.ok(log.entries[2]!.text.includes("village"), "a village is a village");
});

test("no em-dashes anywhere in the log (house rule)", () => {
  const log = buildVoyageLog(smallSurvey, 1059, 42, SUBTITLE);
  assert.ok(!log.attribution.includes("—"), "no em-dash in the attribution");
  assert.ok(!log.summary.includes("—"), "no em-dash in the summary");
  for (const entry of log.entries) {
    assert.ok(!entry.text.includes("—"), `no em-dash: "${entry.text}"`);
  }
});

test("the summary names the port count", () => {
  const log = buildVoyageLog(smallSurvey, 1059, 42, SUBTITLE);
  assert.ok(log.summary.includes(String(smallSurvey.length)), `summary counts ports: "${log.summary}"`);
});

test("deterministic per seed: same inputs, same log", () => {
  const a = buildVoyageLog(smallSurvey, 1059, 42, SUBTITLE);
  const b = buildVoyageLog(smallSurvey, 1059, 42, SUBTITLE);
  assert.deepEqual(a, b);
});

test("varies across seeds: a different seed changes the flavor", () => {
  // A survey long enough that flavor is drawn several times, so two seeds almost
  // certainly diverge on at least one clause.
  const long = [origin, ...Array.from({ length: 8 }, (_, i) =>
    port({ idx: i + 1, name: `Port${i + 1}`, kind: "village", founded: 800 + i, arrivalMode: "road" }))];
  const a = buildVoyageLog(long, 1059, 42, SUBTITLE).entries.map((e) => e.text);
  const b = buildVoyageLog(long, 1059, 99, SUBTITLE).entries.map((e) => e.text);
  assert.notDeepEqual(a, b, "different seeds must yield different journals");
});

test("no flavor repeats within one voyage until the pool is exhausted", () => {
  // Identical road ports, so entries differ ONLY by their drawn flavor clause. The
  // first LAND_ARRIVALS.length arrivals must all be distinct (no repeat until the pool
  // empties); one more forces a reuse, proving the cycler wraps rather than throws.
  const n = LAND_ARRIVALS.length;
  const clones = (count: number) =>
    Array.from({ length: count }, (_, i) => port({ idx: i + 1, name: "Same", kind: "town", founded: 500, arrivalMode: "road" }));
  const exact = buildVoyageLog([origin, ...clones(n)], 1059, 42, SUBTITLE).entries.slice(1).map((e) => e.text);
  assert.equal(new Set(exact).size, n, "no repeat before the pool is exhausted");
  const over = buildVoyageLog([origin, ...clones(n + 1)], 1059, 42, SUBTITLE).entries.slice(1).map((e) => e.text);
  assert.equal(new Set(over).size, n, "the (n+1)th arrival reuses a phrase, so the cycler wraps");
});

test("pools are non-trivial and em-dash free (authored copy sanity)", () => {
  assert.ok(SEA_ARRIVALS.length >= 6 && LAND_ARRIVALS.length >= 6 && DEPARTURES.length >= 3);
  for (const phrase of [...SEA_ARRIVALS, ...LAND_ARRIVALS, ...DEPARTURES]) {
    assert.ok(!phrase.includes("—"), `no em-dash in pool phrase: "${phrase}"`);
  }
});

test("empty survey yields an attributed but empty log", () => {
  const log = buildVoyageLog([], 1059, 42, SUBTITLE);
  assert.deepEqual(log.entries, []);
  assert.equal(log.attribution, SUBTITLE);
});

// --- real-world integration: the mode wiring on seed 42 ------------------------

test("on a real routed world the mode-aware voice reaches the right ports (seed 42)", () => {
  const world = generateWorld(defaultRecipe(42));
  const manifest = buildPlaceManifest(world, 1500);
  const plan = buildVoyagePlan(manifest.places, manifest.presentYear);
  const survey = buildSurvey(world.elev, world.seaLevel, world.roads);
  const sites = manifest.places.map((p) => ({ idx: p.idx, x: p.gx, y: p.gy }));
  const routed = routeVoyage(plan.legs, sites, survey);
  const byIdx = new Map(manifest.places.map((p) => [p.idx, p]));
  const logPorts: VoyageLogPort[] = plan.ports.map((pt, i) => {
    const pm = byIdx.get(pt.idx)!;
    return {
      idx: pm.idx,
      name: pm.name,
      kind: pm.kind,
      founded: pm.founded,
      arrivalMode: i === 0 ? null : routed[i - 1]!.mode,
    };
  });
  const log = buildVoyageLog(logPorts, manifest.presentYear, world.recipe.seed, world.title.subtitle);

  assert.equal(log.entries.length, plan.ports.length, "one entry per port");
  assert.ok(log.entries[0]!.text.includes("set out"), "the survey departs the capital");

  const firstSea = logPorts.findIndex((p) => p.arrivalMode === "sea");
  const firstRoad = logPorts.findIndex((p) => p.arrivalMode === "road");
  assert.ok(firstSea > 0, "seed 42 has a sea arrival");
  assert.ok(firstRoad > 0, "seed 42 has a road arrival");
  assert.ok(log.entries[firstSea]!.text.includes("made sail"), "the sea port sailed in");
  assert.ok(log.entries[firstRoad]!.text.includes("rode on"), "the road port rode in");
});
