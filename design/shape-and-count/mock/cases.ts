// Issue #849: every case the round draws, and every direction in it. Seeds are read from the round's own
// measurements (`measurements/shape-sweep.json`, `measurements/landmass-sweep.json`), never typed here.
import { readFileSync } from "node:fs";
import type { MapType, UvWindow } from "../../../src/terrain/heightfield.ts";
import type { WorldRecipe } from "../../../src/world/types.ts";
import { foundWorld } from "../../../src/world/founding/found.ts";
import { hashString } from "../../../src/core/rng.ts";
import { lodWindowFor, quantizeCenter } from "../../../src/world/lod.ts";
import { crescent, japan, outlineField, texas, type Outline, type OutlineField } from "./outlines.ts";
import { bigFit, cellShare } from "./fits.ts";
import { LOBE_COVERAGE, placeLobes, type Edge, type LobeWobble } from "./terrain.ts";

export const MEASUREMENTS = "/Users/ahl/CodeProjects/Vellum/out/844/measurements";
// The close-up is band 1 of the Surveyor's Glass: a window half the sheet across, on the band's lattice (`lodWindowFor` and `quantizeCenter` in `src/world/lod.ts`).
export const BAND1 = 0.5;
export const band1Window = (cx: number, cy: number): UvWindow => {
  const q = quantizeCenter(cx, cy, BAND1);
  return lodWindowFor(q.cx, q.cy, BAND1);
};

export type Dir = {
  readonly key: string;
  readonly label: string;
  readonly pipeline: "engine" | "spike";
  readonly edge: Edge;
  readonly outline?: OutlineField;
  readonly landFraction?: number;
  readonly mine?: string;
  readonly asked?: { readonly n: number; readonly spread: "equal" | "varied"; readonly sunk: boolean; readonly coverage: number };
  readonly seed?: number;
  readonly coastWarp?: number;
};

export type Case = {
  readonly slug: string;
  readonly group: "shape" | "count" | "type" | "extra";
  readonly title: string;
  readonly why: string;
  readonly seed: number;
  readonly mapType: MapType;
  readonly coastWarp?: number;
  readonly overrides?: Partial<WorldRecipe>;
  readonly window: UvWindow;
  readonly outline?: OutlineField;
  readonly dirs: ReadonlyArray<Dir>;
  readonly primary: boolean;
};

const shapeSweep = JSON.parse(readFileSync(`${MEASUREMENTS}/shape-sweep.json`, "utf8")) as Record<string, { medianSeed: number; lowSeed: number; mapType: MapType }>;
const landSweep = JSON.parse(readFileSync(`${MEASUREMENTS}/landmass-sweep.json`, "utf8")) as { rows: Array<{ type: MapType; seed: number; counts: Record<string, number> }> };

// Today's count at 20 cells for a type: the lowest seed at the lower median, the lowest seed at the minimum, the lowest at the maximum.
function countSeeds(type: MapType): { median: number; sparse: number; dense: number; medianCount: number; sparseCount: number; denseCount: number } {
  const rows = landSweep.rows.filter((r) => r.type === type).map((r) => ({ seed: r.seed, n: r.counts["20"] as number }));
  const sorted = [...rows].sort((a, b) => a.n - b.n || a.seed - b.seed);
  const lowerMedian = (sorted[Math.floor((sorted.length - 1) / 2)] as { n: number }).n;
  const pick = (n: number): number => Math.min(...rows.filter((r) => r.n === n).map((r) => r.seed));
  const min = (sorted[0] as { n: number }).n;
  const max = (sorted[sorted.length - 1] as { n: number }).n;
  return { median: pick(lowerMedian), sparse: pick(min), dense: pick(max), medianCount: lowerMedian, sparseCount: min, denseCount: max };
}
export const COUNT_SEEDS = {
  archipelago: countSeeds("archipelago"),
  island: countSeeds("island"),
  continent: countSeeds("continent"),
  citystate: countSeeds("citystate"),
};

const CONTROL: Dir = { key: "control", label: "Today's dome (the control), drawn by the engine", pipeline: "engine", edge: { kind: "dome" } };
const CONTROL_PASS: Dir = { key: "control-pass", label: "Today's dome, its close-up drawn as Sub 1 will draw it (the spike passes the coast warp)", pipeline: "spike", edge: { kind: "dome" } };

function shapeDirs(f: OutlineField, big?: OutlineField): Dir[] {
  const dirs: Dir[] = [
    CONTROL,
    { key: "soft", label: "The soft likeness (ruled D7)", pipeline: "spike", edge: { kind: "soft", outline: f }, outline: f },
    { key: "hard", label: "The hard cut-out", pipeline: "spike", edge: { kind: "hard", outline: f }, outline: f },
    { key: "bias35", label: "A bias on today's dome, weak (0.35)", pipeline: "spike", edge: { kind: "bias", outline: f, strength: 0.35 }, outline: f },
    { key: "bias70", label: "A bias on today's dome, strong (0.7)", pipeline: "spike", edge: { kind: "bias", outline: f, strength: 0.7 }, outline: f },
  ];
  if (big !== undefined) dirs.push({ key: "soft-big", label: "The soft likeness, the outline drawn larger (to 0.06 from the edge, short of today's dome core)", pipeline: "spike", edge: { kind: "soft", outline: big }, outline: big, mine: "the designer's own: the fit is an unruled stand-in, and this shows what a larger one does" });
  return dirs;
}

type OutlineSpec = { key: string; make: (inset?: number) => Outline; mapType: MapType; centre: readonly [number, number] };
const OUTLINES: ReadonlyArray<OutlineSpec> = [
  { key: "crescent", make: (i) => crescent(i), mapType: "island", centre: [0.625, 0.5] },
  { key: "texas", make: (i) => texas(i), mapType: "island", centre: [0.5625, 0.625] },
  { key: "japan", make: (i) => japan(false, i), mapType: "archipelago", centre: [0.5, 0.5] },
];

export function shapeCases(): Case[] {
  const out: Case[] = [];
  for (const o of OUTLINES) {
    const sweep = shapeSweep[o.key];
    if (sweep === undefined) throw new Error(`no sweep for ${o.key}`);
    const f = outlineField(o.make());
    const big = outlineField(bigFit(o.make, o.mapType).outline);
    const window = band1Window(o.centre[0], o.centre[1]);
    out.push({ slug: `${o.key}-${sweep.medianSeed}`, group: "shape", title: `${f.outline.name}, seed ${sweep.medianSeed}, the ${o.mapType} type`, why: `seed ${sweep.medianSeed} is the lower median of the soft likeness over seeds 1 to 40 (measurements/shape-sweep.md)`, seed: sweep.medianSeed, mapType: o.mapType, window, outline: f, dirs: shapeDirs(f, big), primary: true });
    out.push({ slug: `${o.key}-${sweep.lowSeed}`, group: "shape", title: `${f.outline.name}, seed ${sweep.lowSeed}, the ${o.mapType} type`, why: `seed ${sweep.lowSeed} is the 10th percentile of the soft likeness over seeds 1 to 40 (measurements/shape-sweep.md)`, seed: sweep.lowSeed, mapType: o.mapType, window, outline: f, dirs: shapeDirs(f), primary: false });
  }
  const jp = shapeSweep["japan"] as { medianSeed: number };
  const turned = outlineField(japan(true));
  out.push({ slug: `japan-turned-${jp.medianSeed}`, group: "shape", title: `${turned.outline.name}, seed ${jp.medianSeed}, the archipelago type`, why: `the same seed as Japan north up, so the turn is the only difference; Sub 2 (Issue #851) leaves the turn to this sitting`, seed: jp.medianSeed, mapType: "archipelago", window: band1Window(0.5, 0.5), outline: turned, dirs: shapeDirs(turned), primary: false });
  const tx = shapeSweep["texas"] as { medianSeed: number };
  const tf = outlineField(texas());
  for (const cw of [0.1, 0.95]) {
    out.push({ slug: `texas-${tx.medianSeed}-coast${cw}`, group: "shape", title: `Texas, seed ${tx.medianSeed}, the island type, coast ${cw}`, why: `the Texas median seed with the coast slider at ${cw === 0.1 ? "calm" : "lobed"}, so the warp's interplay with the shape is seen, and today's close-up beside the pass-through one`, seed: tx.medianSeed, mapType: "island", coastWarp: cw, window: band1Window(0.5625, 0.625), outline: tf, dirs: [CONTROL, CONTROL_PASS, ...shapeDirs(tf).slice(1)], primary: false });
  }
  return out;
}

function lobeDir(seed: number, n: number, spread: "equal" | "varied", sunk: boolean, coverage: number = LOBE_COVERAGE, within?: OutlineField, landFraction?: number): Dir {
  const lobes = placeLobes(seed, n, spread, coverage, within);
  const label = `Asked ${n}, ${spread} sizes, ${sunk ? "the ground between sunk" : "as measured"}${within ? `, inside ${within.outline.name}` : ""}${landFraction !== undefined ? `, land share ${landFraction}` : ""}`;
  return {
    key: `n${n}-${spread}-${sunk ? "sunk" : "measured"}${within ? `-in-${within.outline.id}` : ""}${landFraction !== undefined ? `-share${landFraction}` : ""}`,
    label,
    pipeline: "spike",
    edge: { kind: "lobes", lobes, sunk, ...(within ? { within } : {}) },
    ...(within ? { outline: within } : {}),
    ...(landFraction !== undefined ? { landFraction } : {}),
    asked: { n, spread, sunk, coverage },
  };
}

export function countCases(): Case[] {
  const out: Case[] = [];
  const a = COUNT_SEEDS.archipelago;
  const centre = band1Window(0.5, 0.5);
  const grid: Dir[] = [CONTROL];
  for (const n of [2, 5, 20, 100]) for (const spread of ["equal", "varied"] as const) for (const sunk of [false, true]) grid.push(lobeDir(a.median, n, spread, sunk));
  out.push({ slug: `count-${a.median}`, group: "count", title: `The count on the archipelago, seed ${a.median}`, why: `seed ${a.median}: today's archipelago has ${a.medianCount} islands of 20 cells or more, the lower median of seeds 1 to 60 (measurements/landmass-sweep.md)`, seed: a.median, mapType: "archipelago", window: centre, dirs: grid, primary: true });
  for (const [which, seed, count] of [["sparse", a.sparse, a.sparseCount], ["dense", a.dense, a.denseCount]] as const) {
    const dirs: Dir[] = [CONTROL];
    for (const n of [5, 100]) for (const sunk of [false, true]) dirs.push(lobeDir(seed, n, "equal", sunk));
    out.push({ slug: `count-${seed}`, group: "count", title: `The count on the archipelago, seed ${seed} (today's ${which}est)`, why: `seed ${seed}: today's archipelago has ${count} islands of 20 cells or more, the ${which === "sparse" ? "fewest" : "most"} in seeds 1 to 60 (measurements/landmass-sweep.md)`, seed, mapType: "archipelago", window: centre, dirs, primary: false });
  }
  for (const type of ["island", "citystate", "continent"] as const) {
    const s = COUNT_SEEDS[type];
    const dirs: Dir[] = [CONTROL];
    for (const n of [20, 100]) for (const sunk of [false, true]) dirs.push(lobeDir(s.median, n, "equal", sunk));
    out.push({ slug: `type-${type}-${s.median}`, group: "type", title: `The count on the ${type === "citystate" ? "city-state" : type} type, seed ${s.median}`, why: `seed ${s.median}: today's ${type} has ${s.medianCount} islands of 20 cells or more, the lower median of seeds 1 to 60 (measurements/landmass-sweep.md); a count on every type is D14`, seed: s.median, mapType: type, window: centre, dirs, primary: true });
  }
  out.push({ slug: `share-${a.median}`, group: "extra", title: `The land share axis, seed ${a.median}`, why: "why a counted world keeps its type's default share (D8): the same asked count at the archipelago's 0.24 and at a founded \"vast\" 0.336", seed: a.median, mapType: "archipelago", window: centre, dirs: [CONTROL, lobeDir(a.median, 20, "equal", true), lobeDir(a.median, 20, "equal", true, LOBE_COVERAGE, undefined, 0.336), lobeDir(a.median, 100, "equal", true), lobeDir(a.median, 100, "equal", true, LOBE_COVERAGE, undefined, 0.336)], primary: false });
  const tx = shapeSweep["texas"] as { medianSeed: number };
  const tf = outlineField(texas());
  out.push({ slug: `count-in-texas-${tx.medianSeed}`, group: "extra", title: `A counted world with an outline, seed ${tx.medianSeed}, the archipelago type`, why: "lobes scattered inside the shape; the lobes' coverage is cut to the outline's own share of the sheet (a stand-in)", seed: tx.medianSeed, mapType: "archipelago", window: band1Window(0.5625, 0.625), outline: tf, dirs: [CONTROL, lobeDir(tx.medianSeed, 20, "equal", true, Math.min(LOBE_COVERAGE, cellShare(tf.outline)), tf), lobeDir(tx.medianSeed, 100, "equal", true, Math.min(LOBE_COVERAGE, cellShare(tf.outline)), tf)], primary: false });
  for (const cw of [0.1, 0.95]) {
    out.push({ slug: `count-${a.median}-coast${cw}`, group: "extra", title: `The coast slider on a counted world, seed ${a.median}, coast ${cw}`, why: "the coast slider is measured inert on lobes (measurements/count-through-outline-3.md); these show it, for D9's slider standing down", seed: a.median, mapType: "archipelago", coastWarp: cw, window: centre, dirs: [CONTROL, lobeDir(a.median, 20, "equal", true)], primary: false });
  }
  return out;
}

// The designer's own additions: where the count puts land on the border (measurements/count-types-fixed.md), and the
// epic's two sentences as D5 and D6 would found them (measurements/words.md), each beside what it founds today.
export function extraCases(): Case[] {
  const out: Case[] = [];
  const centre = band1Window(0.5, 0.5);
  for (const [type, seed] of [["archipelago", 8], ["continent", 3]] as const) {
    out.push({ slug: `border-${type}-${seed}`, group: "extra", title: `Where a small count reaches the border, seed ${seed}, the ${type} type`, why: `asked 2 makes lobes a quarter of the sheet across; with the ground between sunk they reach the edge on this seed (measurements/count-types-fixed.md lists every seed that does)`, seed, mapType: type, window: centre, dirs: [CONTROL, lobeDir(seed, 2, "equal", false), lobeDir(seed, 2, "equal", true)], primary: false });
  }
  const tx = foundWorld("tropical island in the shape of Texas");
  const hundred = foundWorld("exactly 100 equal sized round islands");
  if (!tx.ok || !hundred.ok) throw new Error("founding refused");
  const txSeed = hashString("");
  const hSeed = hashString("exactly");
  const tf = outlineField(texas());
  const txOver = { band: tx.overrides.band, culture: tx.overrides.culture } as Partial<WorldRecipe>;
  out.push({ slug: "example-texas", group: "extra", title: "\"tropical island in the shape of Texas\", founded", why: `today the sentence founds chart ${tx.seed} from its residual "${tx.residual}"; under D5 "in the shape of texas" is a shape phrase, the residual empties, and it founds chart ${txSeed} with the Texas outline`, seed: txSeed, mapType: "island", overrides: txOver, window: band1Window(0.5625, 0.625), outline: tf, dirs: [
    { key: "today", label: `What the sentence founds today (chart ${tx.seed}, the engine)`, pipeline: "engine", edge: { kind: "dome" }, seed: tx.seed },
    { ...CONTROL, label: `Chart ${txSeed} without the outline (what "a tropical island" founds today, the engine)` },
    { key: "soft", label: `Chart ${txSeed} with the Texas outline, the soft likeness (D5 and D7)`, pipeline: "spike", edge: { kind: "soft", outline: tf }, outline: tf },
    { key: "hard", label: `Chart ${txSeed} with the Texas outline, the hard cut-out`, pipeline: "spike", edge: { kind: "hard", outline: tf }, outline: tf },
  ], primary: false });
  out.push({ slug: "example-100", group: "extra", title: "\"exactly 100 equal sized round islands\", founded", why: `today the sentence founds chart ${hundred.seed} from its residual "${hundred.residual}"; under D6 the number rule takes "100 equal sized round islands", the residual is "exactly", and it founds chart ${hSeed} with about 100 islands alike`, seed: hSeed, mapType: "archipelago", window: centre, dirs: [
    { key: "today", label: `What the sentence founds today (chart ${hundred.seed}, the engine)`, pipeline: "engine", edge: { kind: "dome" }, seed: hundred.seed },
    { ...CONTROL, label: `Chart ${hSeed} without a count (the engine)` },
    { ...lobeDir(hSeed, 100, "equal", true), label: `Chart ${hSeed}, asked 100, alike, the ground between sunk (D6 and D8)` },
    { ...lobeDir(hSeed, 100, "equal", false), label: `Chart ${hSeed}, asked 100, alike, as measured` },
  ], primary: false });
  return out;
}

// The designer's own direction (not ruled): a wobble that bites, so a counted island stops reading as a disc and the coast slider has work on a counted world (D9 stands it down because the measured wobble is inert).
export const BITING: LobeWobble = { scale: 1, amp: 1.2 };
export function wobbleCases(): Case[] {
  const a = COUNT_SEEDS.archipelago;
  const seed = a.median;
  const wob = (n: number, cw: number | undefined, spread: "equal" | "varied" = "equal"): Dir => {
    const base = lobeDir(seed, n, spread, true);
    const edge = base.edge.kind === "lobes" ? { ...base.edge, wobble: BITING } : base.edge;
    return { ...base, key: `${base.key}-wobble${cw === undefined ? "" : `-coast${cw}`}`, label: `${base.label}, each coast wobbled at its own scale${cw === undefined ? "" : `, coast ${cw}`}`, edge, ...(cw !== undefined ? { coastWarp: cw } : {}), mine: "the designer's own: a wobble that bites" };
  };
  return [{ slug: `count-wobble-${seed}`, group: "extra", title: `A wobble that bites, seed ${seed}, the archipelago`, why: `the measured wobble leaves every counted island a disc (the count sheets); this one warps each island at its own scale (noise ${BITING.scale} unit across the mean lobe radius, ${BITING.amp} lobe radii at full slider), so the slider works again`, seed, mapType: "archipelago", window: band1Window(0.5, 0.5), dirs: [CONTROL, lobeDir(seed, 20, "equal", true), wob(20, 0.1), wob(20, undefined), wob(20, 0.95), wob(5, undefined), wob(100, undefined), wob(20, undefined, "varied")], primary: false }];
}
