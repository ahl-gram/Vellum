import { test } from "node:test";
import assert from "node:assert/strict";
import { createLabelArena } from "../../src/render/context.ts";
import { firstBerth } from "../../src/render/layers/sea-decor.ts";
import { defaultRecipe, generateWorld } from "../../src/world/generate.ts";
import { renderMap } from "../../src/render/map-renderer.ts";

const HALF = 45;
const A = { x: 200, y: 200 };
const B = { x: 600, y: 600 };
const C = { x: 1000, y: 200 };
const squareAt = (o: { x: number; y: number }) => ({ x: o.x - HALF, y: o.y - HALF, w: HALF * 2, h: HALF * 2 });
const HERO = { style: "antique", legend: true } as const;

// The centre of a decor glyph on a 1500-wide sheet, from its group's first move-to: the ship's hull opens at (-16.25, -2.5) from it and the serpent's tail at (-51, 0) (`shipNode` and `serpentNode` in `src/render/layers/sea-decor.ts`).
const decorCentre = (svg: string, id: string, dx: number, dy: number): { x: number; y: number } | null => {
  const m = new RegExp(`<g id="${id}"[^>]*><path d="M(-?[\\d.]+) (-?[\\d.]+)`).exec(svg);
  return m === null ? null : { x: Number(m[1]) + dx, y: Number(m[2]) + dy };
};

test("the decor ship walks past a taken berth to the next free one, and claims that one alone", () => {
  const labels = createLabelArena();
  labels.claim({ x: A.x + HALF + 4, y: A.y - 10, w: 40, h: 20 });
  assert.equal(firstBerth(labels, [A, B, C], HALF), B);
  assert.equal(labels.tryClaim({ x: B.x - 1, y: B.y - 1, w: 2, h: 2 }, 0), false, "B's square was not claimed");
  assert.equal(labels.tryClaim({ x: C.x - 1, y: C.y - 1, w: 2, h: 2 }, 0), true, "C's square was claimed too");
});

test("the decor ship keeps its first berth whenever it is free", () => {
  assert.equal(firstBerth(createLabelArena(), [A, B], HALF), A);
});

test("the decor ship takes no berth when every berth is taken", () => {
  const labels = createLabelArena();
  labels.claim(squareAt(A));
  labels.claim(squareAt(B));
  assert.equal(firstBerth(labels, [A, B], HALF), undefined);
});

test("the hero chart carries its decor ship (seed 42, antique, legend)", () => {
  const svg = renderMap(generateWorld(defaultRecipe(42)), HERO);
  assert.ok(svg.includes('<g id="sea-ship"'), "the hero chart drew no decor ship");
});

test("a walked ship keeps its distance from the decor serpent (seed 82, antique, legend)", () => {
  const svg = renderMap(generateWorld(defaultRecipe(82)), HERO);
  const serpent = decorCentre(svg, "sea-serpent", 51, 0);
  const ship = decorCentre(svg, "sea-ship", 16.25, 2.5);
  assert.ok(serpent !== null, "fixture drift: seed 82 no longer draws its decor serpent");
  assert.ok(ship !== null, "the decor ship was lost beside the serpent");
  const apart = Math.hypot(serpent.x - ship.x, serpent.y - ship.y);
  assert.ok(apart > 260, `the ship stands ${apart.toFixed(1)} px from the serpent, inside the 260 px it keeps`);
});
