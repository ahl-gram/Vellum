import { test } from "node:test";
import assert from "node:assert/strict";
import { createRng } from "../../src/core/rng.ts";
import { defaultRecipe, generateWorld } from "../../src/world/generate.ts";
import { renderMap } from "../../src/render/map-renderer.ts";

// FNV-1a over realm labels, mirroring test/world/golden-seed42.test.ts
function labelsChecksum(labels: Int16Array): number {
  let h = 0x811c9dc5 >>> 0;
  for (const v of labels) {
    h ^= v & 0xffff;
    h = Math.imul(h, 0x01000193) >>> 0;
  }
  return h >>> 0;
}

test("the prevailing wind is a deterministic world property in [0, 2pi)", () => {
  const a = generateWorld(defaultRecipe(42));
  const b = generateWorld(defaultRecipe(42));
  assert.equal(a.winds.dir, b.winds.dir, "same seed, same wind");
  assert.ok(a.winds.dir >= 0 && a.winds.dir < Math.PI * 2, "radians in range");
  // pin the provenance: the named fork, never the parent stream. #74's climate
  // consumes this value; a parent-stream draw would silently re-roll it the
  // moment any earlier draw is inserted.
  assert.equal(
    a.winds.dir,
    createRng(42).fork("winds").range(0, Math.PI * 2),
    "wind comes from the named fork, not the parent stream",
  );
});

test("different seeds roll different winds", () => {
  const dirs = new Set(
    [42, 7, 123, 20260701].map((s) => generateWorld(defaultRecipe(s)).winds.dir),
  );
  assert.ok(dirs.size >= 3, `winds vary across seeds (got ${dirs.size} distinct)`);
});

test("the winds fork re-rolled nothing: seed 42 identity intact (fork independence)", () => {
  // The named fork derives from seed + label, never stream position, so
  // promoting the wind into generateWorld must leave every other stream
  // byte-identical. These pins match test/world/golden-seed42.test.ts.
  const w = generateWorld(defaultRecipe(42));
  assert.equal(labelsChecksum(w.realms.labels), 1218526613);
  assert.equal(w.settlements[0]!.name, "Laukuwelua");
  assert.deepEqual(w.names.realms, [
    "The Chiefdom of Peroa",
    "The Chiefdom of Rekekoa",
    "The Hauwaiwa Atolls",
  ]);
  assert.equal(w.names.sea, "The Great Mung");
});

test("the nautical arrows read the world's wind", () => {
  const world = generateWorld(defaultRecipe(42));
  const rotated = {
    ...world,
    winds: { dir: (world.winds.dir + Math.PI / 2) % (Math.PI * 2) },
  };
  const svg = renderMap(world, { style: "nautical" });
  assert.notEqual(
    svg,
    renderMap(rotated, { style: "nautical" }),
    "rotating world.winds turns the arrows",
  );
  assert.equal(
    svg,
    renderMap({ ...world, winds: { dir: world.winds.dir } }, { style: "nautical" }),
    "same wind, same arrows",
  );
});
