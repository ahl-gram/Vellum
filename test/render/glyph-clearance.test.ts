import { test } from "node:test";
import assert from "node:assert/strict";
import { BIOMES } from "../../src/climate/biomes.ts";
import { realmNameBox, marksClearOf, type MarkGround } from "../../src/render/layers/glyph-clearance.ts";
import { glyphSymbolDefs, SYMBOL_EXTENT } from "../../src/render/layers/glyph-symbols.ts";
import { markStandsOn } from "../../src/render/layers/glyphs.ts";
import type { SvgNode } from "../../src/render/svg.ts";
import { STYLES } from "../../src/render/style.ts";

const N = { x: 100, y: 100, w: 60, h: 20 };
const MTN = { x: 130, y: 125, symbol: "gl-mtn-1", scale: 1, kind: "mtn" } as const;
const ground = (over: Partial<MarkGround> = {}): MarkGround => ({
  pad: 2,
  reach: () => 30,
  stands: () => true,
  ...over,
});

const ARITY: Readonly<Record<string, number>> = { M: 2, L: 2, H: 1, Q: 4, Z: 0 };

function quadExtremum(p0: number, p1: number, p2: number): number | null {
  const denom = p0 - 2 * p1 + p2;
  if (denom === 0) return null;
  const t = (p0 - p1) / denom;
  if (t <= 0 || t >= 1) return null;
  return (1 - t) * (1 - t) * p0 + 2 * (1 - t) * t * p1 + t * t * p2;
}

function pathBounds(d: string): readonly [number, number, number, number] {
  const xs: number[] = [];
  const ys: number[] = [];
  let cur = { x: 0, y: 0 };
  const visit = (x: number, y: number): void => {
    xs.push(x);
    ys.push(y);
    cur = { x, y };
  };
  let cmd = "";
  let args: number[] = [];
  for (const tok of d.match(/[A-Za-z]|-?\d*\.?\d+/g) ?? []) {
    if (/[A-Za-z]/.test(tok)) {
      if (!(tok in ARITY)) throw new Error(`path command ${tok} is not one G1 reads`);
      cmd = tok;
      args = [];
      continue;
    }
    args.push(Number(tok));
    if (args.length < (ARITY[cmd] as number)) continue;
    if (cmd === "H") visit(args[0] as number, cur.y);
    else if (cmd === "Q") {
      const [cx, cy, ex, ey] = args as [number, number, number, number];
      const mx = quadExtremum(cur.x, cx, ex);
      const my = quadExtremum(cur.y, cy, ey);
      if (mx !== null) xs.push(mx);
      if (my !== null) ys.push(my);
      visit(ex, ey);
    } else visit(args[0] as number, args[1] as number);
    args = [];
  }
  return [Math.min(...xs), Math.min(...ys), Math.max(...xs), Math.max(...ys)];
}

function symbolBounds(symbol: SvgNode): readonly [number, number, number, number] {
  const boxes = symbol.children.map((c) => {
    assert.ok(typeof c !== "string" && c.tag === "path", `${symbol.attrs["id"]} holds only paths`);
    return pathBounds(String(c.attrs["d"]));
  });
  return [
    Math.min(...boxes.map((b) => b[0])),
    Math.min(...boxes.map((b) => b[1])),
    Math.max(...boxes.map((b) => b[2])),
    Math.max(...boxes.map((b) => b[3])),
  ];
}

test("every terrain symbol's extent is the exact bounds of the paths glyphSymbolDefs draws", () => {
  const symbols = glyphSymbolDefs(STYLES.antique);
  assert.deepEqual(symbols.map((s) => String(s.attrs["id"])).sort(), Object.keys(SYMBOL_EXTENT).sort());
  for (const s of symbols) {
    const id = String(s.attrs["id"]);
    const bounds = symbolBounds(s);
    const table = SYMBOL_EXTENT[id] as readonly number[];
    bounds.forEach((v, i) =>
      assert.ok(Math.abs(v - (table[i] as number)) < 1e-9, `${id} edge ${i}: ${v} vs ${table[i]}`),
    );
  }
});

test("a mark that meets no name is kept exactly as drawn, in order", () => {
  const marks = [
    { x: 300, y: 300, symbol: "gl-hill-1", scale: 1, kind: "hill" },
    { ...MTN, x: 500, y: 500 },
  ] as const;
  assert.deepEqual(marksClearOf(marks, [N], ground()), marks);
});

test("a mark that meets a name slides the shortest way clear", () => {
  assert.deepEqual(marksClearOf([MTN], [N], ground()), [{ ...MTN, y: 135.1 }]);
});

test("a mark with no free ground within its kind's reach is dropped", () => {
  assert.deepEqual(marksClearOf([MTN], [N], ground({ reach: () => 5 })), []);
});

test("a slide onto another name is refused for the next shortest", () => {
  const second = { x: 100, y: 124, w: 60, h: 20 };
  assert.deepEqual(marksClearOf([MTN], [N, second], ground()), [{ ...MTN, y: 97.9 }]);
});

test("a slide onto ground the mark's kind does not stand on is refused", () => {
  assert.deepEqual(marksClearOf([MTN], [N], ground({ stands: (_kind, _x, y) => y < 130 })), [{ ...MTN, y: 97.9 }]);
});

test("a mark's reach is its own kind's", () => {
  const hill = { x: 130, y: 122, symbol: "gl-hill-1", scale: 1, kind: "hill" } as const;
  const result = marksClearOf([MTN, hill], [N], ground({ reach: (kind) => (kind === "mtn" ? 30 : 1) }));
  assert.deepEqual(result, [{ ...MTN, y: 135.1 }]);
});

test("each kind stands on the ground it is picked from", () => {
  const rows = [
    ["mtn", 0.6, BIOMES.grassland, true],
    ["mtn", 0.4, BIOMES.grassland, false],
    ["hill", 0.4, BIOMES.grassland, true],
    ["hill", 0.6, BIOMES.grassland, false],
    ["hill", 0.2, BIOMES.grassland, false],
    ["tree", 0.4, BIOMES.temperateForest, true],
    ["tree", 0.6, BIOMES.temperateForest, false],
    ["tree", 0.2, BIOMES.grassland, false],
    ["marsh", 0.1, BIOMES.marsh, true],
    ["marsh", 0.4, BIOMES.marsh, false],
    ["dune", 0.1, BIOMES.desert, true],
    ["dune", 0.1, BIOMES.marsh, false],
  ] as const;
  for (const [kind, rel, biome, expected] of rows) {
    assert.equal(markStandsOn(kind, rel, biome), expected, `${kind} at relief ${rel} on biome ${biome}`);
  }
});

test("a realm name's box is its anchor's extent", () => {
  assert.deepEqual(realmNameBox({ realm: 0, cx: 100, cy: 50, halfW: 30, halfH: 6 }), { x: 70, y: 44, w: 60, h: 12 });
});
