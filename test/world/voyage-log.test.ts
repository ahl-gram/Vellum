import { test } from "node:test";
import assert from "node:assert/strict";
import {
  buildVoyageLog,
  SEA_ARRIVALS,
  LAND_ARRIVALS,
  DEPARTURES,
  HANDOFF_CLOSINGS,
  SEA_HOMECOMINGS,
  LAND_HOMECOMINGS,
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
// panel + the reveal-per-arrival wiring live in src/site/explorer/voyage.ts and are covered
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
  inlandHandoff: false,
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
  assert.ok(HANDOFF_CLOSINGS.length >= 3, "the handoff narrative has closings to cycle");
  for (const phrase of [...SEA_ARRIVALS, ...LAND_ARRIVALS, ...DEPARTURES, ...HANDOFF_CLOSINGS]) {
    assert.ok(!phrase.includes("—"), `no em-dash in pool phrase: "${phrase}"`);
  }
});

// --- the inland handoff narrative (#181, ratified 2026-07-24) -------------------

test("an inland handoff reads as the full ride-sail-ride narrative", () => {
  const handoff = port({ idx: 2, name: "Meamere", kind: "village", founded: 420, arrivalMode: "sea", inlandHandoff: true });
  const log = buildVoyageLog([origin, roadTown, handoff], 1059, 42, SUBTITLE);
  const text = log.entries[2]!.text;
  assert.match(
    text,
    /^Year 1059\. We rode from Haireno to the coast, took ship, and made landfall below Meamere, a village standing since 420, /,
    `the ratified three-part shape: "${text}"`,
  );
  assert.ok(!text.includes("made sail"), `a handoff never reads as a plain sail: "${text}"`);
  assert.ok(HANDOFF_CLOSINGS.some((c) => text.includes(c)), `the closing comes from the pool: "${text}"`);
});

test("the narrative names the PREVIOUS port: the ride to the coast departs where the survey last stood", () => {
  const other = port({ idx: 5, name: "Farhold", kind: "town", founded: 700, arrivalMode: "road" });
  const handoff = port({ idx: 2, name: "Meamere", kind: "village", founded: 420, arrivalMode: "sea", inlandHandoff: true });
  const log = buildVoyageLog([origin, other, handoff], 1059, 42, SUBTITLE);
  const text = log.entries[2]!.text;
  assert.ok(text.includes("rode from Farhold"), `the ride departs the previous port: "${text}"`);
});

test("only a sea arrival can hand off: the flag on a road leg still reads as a ride", () => {
  const rode = port({ idx: 1, name: "Haireno", kind: "village", founded: 860, arrivalMode: "road", inlandHandoff: true });
  const log = buildVoyageLog([origin, rode], 1059, 42, SUBTITLE);
  const text = log.entries[1]!.text;
  assert.ok(text.includes("rode on"), `a road arrival rides: "${text}"`);
  assert.ok(!text.includes("took ship"), `a road arrival never ships: "${text}"`);
});

test("handoff closings cycle without repeating until the pool is exhausted", () => {
  const n = HANDOFF_CLOSINGS.length;
  const handoffs = Array.from({ length: n }, (_, i) =>
    port({ idx: i + 1, name: "Same", kind: "town", founded: 500, arrivalMode: "sea", inlandHandoff: true }));
  const texts = buildVoyageLog([origin, ...handoffs], 1059, 42, SUBTITLE).entries.slice(1).map((e) => e.text);
  for (const text of texts) assert.ok(text.includes("took ship"), `every handoff narrates: "${text}"`);
  assert.equal(new Set(texts).size, n, "each handoff draws a fresh closing until the pool empties");
});

// --- the homecoming (#275, prose shape ratified by Alex 2026-07-24) -------------
//
// The survey now sails home, so the log gains ONE entry for the closing leg. It is an
// arrival at a port already logged, not a new port: the capital is `ports[0]` and stays
// there, and only the closing leg's character crosses the boundary. The invariant is
// `entries = legs + 1` (one departure plus one per leg), which for a round trip reads
// as ports + 1. Prose: a mode-aware pool exactly like SEA_ARRIVALS / LAND_ARRIVALS,
// with NO fixed closing sentence, and "whence we set out" in place of a descriptor.

const homeBySea = { arrivalMode: "sea", inlandHandoff: false } as const;
const homeByRoad = { arrivalMode: "road", inlandHandoff: false } as const;

test("the homecoming closes the log: one entry per leg plus the departure", () => {
  const log = buildVoyageLog(smallSurvey, 1059, 42, SUBTITLE, homeBySea);
  assert.equal(log.entries.length, smallSurvey.length + 1, "3 ports, 3 legs, 4 entries");
  const home = log.entries[log.entries.length - 1]!;
  assert.equal(home.idx, origin.idx, "the survey comes home to the capital it departed");
  assert.equal(home.year, 1059);
  assert.ok(home.text.includes(origin.name), `the homecoming names the capital: "${home.text}"`);
});

test("no homecoming given: the log is exactly the open-path log it always was", () => {
  const closed = buildVoyageLog(smallSurvey, 1059, 42, SUBTITLE, null);
  const open = buildVoyageLog(smallSurvey, 1059, 42, SUBTITLE);
  assert.deepEqual(closed, open);
  assert.equal(open.entries.length, smallSurvey.length);
});

test("the homecoming reads as a return, not a second founding", () => {
  const log = buildVoyageLog(smallSurvey, 1059, 42, SUBTITLE, homeBySea);
  const text = log.entries[log.entries.length - 1]!.text;
  assert.ok(text.includes("whence we set out"), `the capital is where the survey began: "${text}"`);
  assert.ok(!text.includes("seat of this survey"), `it must not re-found the capital: "${text}"`);
  assert.ok(!text.includes("standing since"), `it must not read as a fresh arrival: "${text}"`);
  assert.ok(!text.includes("set out from"), `it arrives, it does not depart again: "${text}"`);
});

test("a sea homecoming sails and a road homecoming rides, in their own registers", () => {
  const bySea = buildVoyageLog(smallSurvey, 1059, 42, SUBTITLE, homeBySea);
  const byRoad = buildVoyageLog(smallSurvey, 1059, 42, SUBTITLE, homeByRoad);
  const seaText = bySea.entries[bySea.entries.length - 1]!.text;
  const roadText = byRoad.entries[byRoad.entries.length - 1]!.text;
  assert.ok(seaText.includes("made sail"), `a sea homecoming sails: "${seaText}"`);
  assert.ok(roadText.includes("rode on"), `a road homecoming rides: "${roadText}"`);
  assert.ok(
    SEA_HOMECOMINGS.some((c) => seaText.includes(c)),
    `the sea closing comes from the sea pool: "${seaText}"`,
  );
  assert.ok(
    LAND_HOMECOMINGS.some((c) => roadText.includes(c)),
    `the road closing comes from the land pool: "${roadText}"`,
  );
});

test("a degraded straight closing leg comes home overland, never under sail", () => {
  const log = buildVoyageLog(smallSurvey, 1059, 42, SUBTITLE, {
    arrivalMode: "straight",
    inlandHandoff: false,
  });
  const text = log.entries[log.entries.length - 1]!.text;
  assert.ok(text.includes("overland"), `a straight homecoming presses overland: "${text}"`);
  assert.ok(!text.includes("made sail"), `it must never sail: "${text}"`);
  assert.ok(LAND_HOMECOMINGS.some((c) => text.includes(c)), `land register: "${text}"`);
});

test("a homecoming that hands off inland keeps #181's three-part ride-sail-ride shape", () => {
  const log = buildVoyageLog(smallSurvey, 1059, 42, SUBTITLE, {
    arrivalMode: "sea",
    inlandHandoff: true,
  });
  const text = log.entries[log.entries.length - 1]!.text;
  assert.match(
    text,
    /^Year 1059\. We rode from Meamere to the coast, took ship, and made landfall below Laukuwelua, whence we set out, /,
    `the ride departs the LAST port and lands below the capital: "${text}"`,
  );
  assert.ok(!text.includes("made sail"), `a handoff never reads as a plain sail: "${text}"`);
  assert.ok(HANDOFF_CLOSINGS.some((c) => text.includes(c)), `the closing comes from the pool: "${text}"`);
});

test("the homecoming draws off the same forked stream: deterministic per seed, varying across seeds", () => {
  const a = buildVoyageLog(smallSurvey, 1059, 42, SUBTITLE, homeBySea);
  const b = buildVoyageLog(smallSurvey, 1059, 42, SUBTITLE, homeBySea);
  assert.deepEqual(a, b, "same seed, same homecoming");
  const seeds = new Set(
    [42, 99, 7, 1234, 5, 88].map(
      (s) => buildVoyageLog(smallSurvey, 1059, s, SUBTITLE, homeBySea).entries.slice(-1)[0]!.text,
    ),
  );
  assert.ok(seeds.size > 1, "different seeds must be able to draw different homecomings");
});

test("the summary still counts PORTS, not entries: the homecoming is not a new port", () => {
  const log = buildVoyageLog(smallSurvey, 1059, 42, SUBTITLE, homeBySea);
  assert.ok(log.summary.includes(String(smallSurvey.length)), `summary counts ports: "${log.summary}"`);
  assert.ok(!log.summary.includes(String(smallSurvey.length + 1)), "the homecoming must not inflate the count");
});

test("homecoming pools are non-trivial and em-dash free (authored copy sanity)", () => {
  assert.ok(SEA_HOMECOMINGS.length >= 4, "the sea homecoming has closings to cycle");
  assert.ok(LAND_HOMECOMINGS.length >= 4, "the land homecoming has closings to cycle");
  for (const phrase of [...SEA_HOMECOMINGS, ...LAND_HOMECOMINGS]) {
    assert.ok(!phrase.includes("—"), `no em-dash in pool phrase: "${phrase}"`);
  }
});

test("no em-dashes in a log that comes home (house rule)", () => {
  const log = buildVoyageLog(smallSurvey, 1059, 42, SUBTITLE, homeBySea);
  for (const entry of log.entries) assert.ok(!entry.text.includes("—"), `no em-dash: "${entry.text}"`);
});

test("a one-port survey has no closing leg, so no homecoming is logged", () => {
  // The capital alone: buildVoyagePlan yields no legs, so the caller passes no homecoming
  // and the log is the single departure. Nothing to sail home from.
  const log = buildVoyageLog([origin], 1059, 42, SUBTITLE, null);
  assert.equal(log.entries.length, 1);
  assert.ok(log.entries[0]!.text.includes("set out"));
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
      inlandHandoff: i === 0 ? false : routed[i - 1]!.inlandHandoff,
    };
  });
  const closing = routed[routed.length - 1]!;
  const log = buildVoyageLog(logPorts, manifest.presentYear, world.recipe.seed, world.title.subtitle, {
    arrivalMode: closing.mode,
    inlandHandoff: closing.inlandHandoff,
  });

  assert.equal(plan.legs.length, plan.ports.length, "#275: the real world's tour closes too");
  assert.equal(closing.toIdx, plan.ports[0]!.idx, "the closing leg routes home to the capital");
  assert.equal(log.entries.length, plan.ports.length + 1, "one entry per port plus the homecoming");
  assert.ok(log.entries[0]!.text.includes("set out"), "the survey departs the capital");
  assert.ok(
    log.entries[log.entries.length - 1]!.text.includes("whence we set out"),
    "and comes home to it",
  );

  const firstSea = logPorts.findIndex((p) => p.arrivalMode === "sea");
  const firstRoad = logPorts.findIndex((p) => p.arrivalMode === "road");
  assert.ok(firstSea > 0, "seed 42 has a sea arrival");
  assert.ok(firstRoad > 0, "seed 42 has a road arrival");
  assert.ok(log.entries[firstSea]!.text.includes("made sail"), "the sea port sailed in");
  assert.ok(log.entries[firstRoad]!.text.includes("rode on"), "the road port rode in");
});
