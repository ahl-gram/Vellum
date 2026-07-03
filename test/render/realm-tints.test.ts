import { test } from "node:test";
import assert from "node:assert/strict";
import {
  assignRealmTints,
  realmCentroids,
  realmAdjacency,
  realmTintIndices,
  type Centroid,
} from "../../src/render/realm-tints.ts";
import { STYLES } from "../../src/render/style.ts";

const noConflict = (p: number): boolean[][] =>
  Array.from({ length: p }, () => new Array<boolean>(p).fill(false));
const noAdj = (n: number): Set<number>[] =>
  Array.from({ length: n }, () => new Set<number>());
const at = (x: number, y: number): Centroid => ({ x, y });

test("two close realms get different tints; a far realm may reuse one", () => {
  // A,B within the confusion distance -> must differ; C far from both -> free
  // to reuse a colour even though only 2 tints exist.
  const c = [at(0, 0), at(5, 0), at(100, 0)];
  const out = assignRealmTints(c, noAdj(3), noConflict(2), 10);
  assert.notEqual(out[0], out[1], "close pair must differ");
  assert.ok(out[2]! >= 0 && out[2]! < 2, "far realm reuses a valid tint");
});

test("far-apart close-pairs reuse the whole palette", () => {
  // {A,B} close, {C,D} close, but the two pairs are a sea apart: 2 tints suffice.
  const c = [at(0, 0), at(6, 0), at(200, 0), at(206, 0)];
  const out = assignRealmTints(c, noAdj(4), noConflict(2), 12);
  assert.notEqual(out[0], out[1]);
  assert.notEqual(out[2], out[3]);
  assert.equal(new Set(out).size, 2, "palette reused across the far pairs");
});

test("CVD-confusable tints never land on two close realms", () => {
  // tints 0 and 1 collapse under colour-blindness; two close realms must not
  // take that pair even though the indices differ.
  const conflict = noConflict(3);
  conflict[0]![1] = true;
  conflict[1]![0] = true;
  const out = assignRealmTints([at(0, 0), at(5, 0)], noAdj(2), conflict, 10);
  assert.notEqual(out[0], out[1]);
  assert.equal(
    conflict[out[0]!]![out[1]!],
    false,
    "assigned pair must not be colour-blind-confusable",
  );
});

test("a shared border forces difference even beyond the confusion distance", () => {
  // Two realms whose centroids are far apart but which share a land border.
  const adj = noAdj(2);
  adj[0]!.add(1);
  adj[1]!.add(0);
  const out = assignRealmTints([at(0, 0), at(1000, 0)], adj, noConflict(2), 10);
  assert.notEqual(out[0], out[1], "bordering realms differ regardless of distance");
});

test("distinct-tint guarantee wins over CVD avoidance when the palette is CVD-boxed", () => {
  // 3 close realms, 3 tints, but EVERY tint pair is colour-blind-confusable. The
  // soft CVD rule cannot be satisfied, yet the spec's hard rule (close realms get
  // different tints) still must - so all three take distinct indices.
  const conflict = [
    [false, true, true],
    [true, false, true],
    [true, true, false],
  ];
  const out = assignRealmTints([at(0, 0), at(4, 0), at(0, 4)], noAdj(3), conflict, 10);
  assert.equal(new Set(out).size, 3, "all three close realms differ despite CVD");
});

test("more mutually-close realms than tints: no throw, valid reuse", () => {
  // 3 realms all within the confusion distance, only 2 tints -> the fallback
  // must reuse a colour rather than fail, and use both tints.
  const out = assignRealmTints([at(0, 0), at(3, 0), at(0, 3)], noAdj(3), noConflict(2), 10);
  assert.equal(out.length, 3);
  assert.ok(out.every((c) => c >= 0 && c < 2));
  assert.equal(new Set(out).size, 2, "both tints used before any reuse");
});

test("assignment is pure and deterministic", () => {
  const c = [at(0, 0), at(3, 0), at(0, 3)];
  const a = assignRealmTints(c, noAdj(3), noConflict(2), 10);
  const b = assignRealmTints(c, noAdj(3), noConflict(2), 10);
  assert.deepEqual(a, b);
});

test("realmCentroids averages each realm's cells and ignores ocean", () => {
  // 5x2 grid: realm 0 = left 2 cols, realm 1 = right 2 cols, col 2 is ocean.
  const w = 5, h = 2;
  const labels = new Int16Array(w * h);
  const rows = [
    [0, 0, -1, 1, 1],
    [0, 0, -1, 1, 1],
  ];
  for (let y = 0; y < h; y++) for (let x = 0; x < w; x++) labels[x + y * w] = rows[y]![x]!;
  const cs = realmCentroids(labels, w, h, 2);
  assert.deepEqual(cs[0], { x: 0.5, y: 0.5 });
  assert.deepEqual(cs[1], { x: 3.5, y: 0.5 });
});

test("realmAdjacency links bordering realms and not sea-separated ones", () => {
  const w = 5, h = 1;
  // touching pair 0|1, then ocean, then isolated realm 2
  const labels = Int16Array.from([0, 1, -1, 2, 2]);
  const adj = realmAdjacency(labels, w, h, 3);
  assert.ok(adj[0]!.has(1) && adj[1]!.has(0), "0 and 1 share a border");
  assert.equal(adj[2]!.size, 0, "realm 2 is across water, borders no one");
});

test("realmAdjacency ignores out-of-range labels instead of throwing", () => {
  // Defense-in-depth: a label >= count must be skipped, not indexed into the
  // adjacency array (which would be a TypeError).
  const adj = realmAdjacency(Int16Array.from([0, 5]), 2, 1, 2);
  assert.equal(adj.length, 2);
  assert.equal(adj[0]!.size, 0, "the in-range realm borders no valid neighbour");
});

test("realmTintIndices is identity within the base palette (byte-stable)", () => {
  // <= 5 realms must map realm r -> tint r, matching the committed charts.
  const labels = new Int16Array(4).fill(0);
  assert.deepEqual(realmTintIndices(labels, 2, 2, 3, STYLES.antique), [0, 1, 2]);
  assert.deepEqual(realmTintIndices(labels, 2, 2, 5, STYLES.topographic), [0, 1, 2, 3, 4]);
});

test("realmTintIndices engages the assignment beyond the base palette", () => {
  // 6 column-block realms in a row on antique (7 tints): each borders its
  // neighbours, so consecutive realms must differ.
  const w = 12, h = 1, count = 6;
  const labels = new Int16Array(w);
  for (let x = 0; x < w; x++) labels[x] = Math.floor(x / 2) as number;
  const out = realmTintIndices(labels, w, h, count, STYLES.antique);
  assert.equal(out.length, 6);
  assert.ok(out.every((c) => c >= 0 && c < STYLES.antique.realmTints.length));
  for (let i = 0; i < 5; i++) {
    assert.notEqual(out[i], out[i + 1], `bordering realms ${i}/${i + 1} must differ`);
  }
});

test("palette additions: antique 7, topographic 8, ink & nautical frozen at 5", () => {
  assert.deepEqual(STYLES.antique.realmTints.slice(0, 5), [
    "#c46d5e", "#7d9a6a", "#bf9b4f", "#7a8aa6", "#a97ba6",
  ]);
  assert.deepEqual(STYLES.antique.realmTints.slice(5), ["#5f9e91", "#5f6b2e"]);
  assert.deepEqual(STYLES.topographic.realmTints.slice(0, 5), [
    "#e74c3c", "#27ae60", "#f39c12", "#2980b9", "#8e44ad",
  ]);
  assert.deepEqual(STYLES.topographic.realmTints.slice(5), ["#1abc9c", "#9bc53d", "#e84393"]);
  assert.equal(STYLES.ink.realmTints.length, 5);
  assert.equal(STYLES.nautical.realmTints.length, 5);
});
