import { test } from "node:test";
import assert from "node:assert/strict";
import { defaultRecipe, generateWorld } from "../../src/world/generate.ts";
import { generateRegionWorld, windowAround } from "../../src/world/region.ts";
import { createRng } from "../../src/core/rng.ts";
import { createLoreWriter } from "../../src/society/lore.ts";
import { renderMap } from "../../src/render/map-renderer.ts";
import { computeClimate } from "../../src/climate/climate.ts";
import { classifyBiomes, BIOMES } from "../../src/climate/biomes.ts";
import { isMajorRiver } from "../../src/hydrology/rivers.ts";

const world = generateWorld(defaultRecipe(42, { gridW: 160, gridH: 120 }));

const count = (svg: string, needle: string): number => svg.split(needle).length - 1;

// A production-grid multi-realm fixture: seat projection and river/climate
// continuity are only meaningful at a real chart resolution.
const bigWorld = generateWorld(defaultRecipe(42, { gridW: 320, gridH: 240 }));

test("region world keeps the parent's waterline and terrain", () => {
  const capital = world.settlements.find((s) => s.kind === "capital")!;
  const win = windowAround(world, capital, 0.4);
  const region = generateRegionWorld(world, {
    window: win,
    gridW: 160,
    gridH: 160,
    title: "Test Environs",
  });
  assert.equal(region.seaLevel, world.seaLevel);
  assert.equal(region.winds.dir, world.winds.dir, "the same wind blows over the region");
  assert.equal(region.culture.id, world.culture.id);
  assert.ok(region.region, "region metadata present");

  // capital must survive projection, same name, on land
  const cap = region.settlements.find((s) => s.kind === "capital");
  assert.ok(cap, "capital inside its own environs");
  assert.equal(cap.name, capital.name);
  const i = cap.x + cap.y * region.elev.w;
  assert.ok((region.elev.data[i] as number) > region.seaLevel);
});

// --- #162 The Surveyor's Glass gate: trustworthy regional surveys ---

test("region projects world realm seats to region indices (no town-dot downgrade, #162)", () => {
  assert.ok(bigWorld.realms.seats.length > 1, "fixture is multi-realm");
  const seatIdx = bigWorld.realms.seats.find(
    (si) => bigWorld.settlements[si]!.kind !== "capital",
  )!;
  const seat = bigWorld.settlements[seatIdx]!;
  const region = generateRegionWorld(bigWorld, {
    window: windowAround(bigWorld, seat, 0.3),
    gridW: 320,
    gridH: 240,
    title: "Seat Environs",
  });
  // seats stay realm-indexed, with a -1 sentinel for any off-window seat.
  assert.equal(
    region.realms.seats.length,
    bigWorld.realms.seats.length,
    "seats array keeps its realm-id indexing",
  );
  assert.ok(
    region.realms.seats.every((i) => i === -1 || (i >= 0 && i < region.settlements.length)),
    "every projected seat is a valid region index or the -1 sentinel",
  );
  const projected = region.realms.seats.filter((i) => i >= 0);
  assert.ok(projected.length >= 1, "the centered seat projects into the window");
  const names = projected.map((i) => region.settlements[i]!.name);
  assert.ok(names.includes(seat.name), "the centered seat survives as a seat, not a plain town");
});

test("a region seat renders a castle glyph with no political halo (AC #162)", () => {
  const seatIdx = bigWorld.realms.seats.find(
    (si) => bigWorld.settlements[si]!.kind !== "capital",
  )!;
  const seat = bigWorld.settlements[seatIdx]!;
  const region = generateRegionWorld(bigWorld, {
    window: windowAround(bigWorld, seat, 0.3),
    gridW: 320,
    gridH: 240,
    title: "Seat Environs",
  });
  const svg = renderMap(region, { style: "antique", legend: true });
  assert.ok(count(svg, 'class="settlement-seat"') >= 1, "the projected seat keeps its seat glyph");
  assert.equal(count(svg, 'class="seat-halo"'), 0, "no realm-tint halo on a regional survey");
});

test("region temperature is continuous with the world via the parent elevSpan (AC #162)", () => {
  // a low window well away from the world's peak (seed 42's summit is at uv
  // ~0.39,0.62), so the region's local max sits well below the world's.
  const win = { u0: 0.02, v0: 0.16, u1: 0.37, v1: 0.51 };
  const region = generateRegionWorld(bigWorld, {
    window: win,
    gridW: 320,
    gridH: 240,
    title: "Lowland Environs",
  });
  const seaLevel = bigWorld.seaLevel;
  let worldMax = -Infinity, localMax = -Infinity;
  for (const v of bigWorld.elev.data) worldMax = Math.max(worldMax, v);
  for (const v of region.elev.data) localMax = Math.max(localMax, v);
  const worldSpan = Math.max(1e-9, worldMax - seaLevel);
  assert.ok(worldMax - localMax > 0.05, "precondition: this window excludes the world peak");

  // Temperature ignores riverCells, so a reference computed on the region's own
  // elevation with the WORLD span must reproduce the region's temperature exactly.
  const aspect = (bigWorld.recipe.gridW - 1) / (bigWorld.recipe.gridH - 1);
  const ref = computeClimate(region.elev, seaLevel, bigWorld.recipe.seed, {
    band: bigWorld.recipe.band,
    windDir: bigWorld.winds.dir,
    window: win,
    worldAspect: aspect,
    elevSpan: worldSpan,
  });
  assert.deepEqual(
    Array.from(region.climate.temperature.data),
    Array.from(ref.temperature.data),
    "the region normalizes lapse-rate against the world span, not its own local max",
  );
});

test("region biomes are continuous with the world via the parent elevSpan (AC #162)", () => {
  // An inland highland window whose local max sits well below the world peak; under
  // its own local span every hilltop would read snow/alpine, which the world span
  // suppresses. This is the INTEGRATION check: the climate/biomes unit tests pass
  // even if region.ts forgets to thread elevSpan into classifyBiomes, but this does not.
  const win = { u0: 0.15, v0: 0.22, u1: 0.31, v1: 0.38 };
  const region = generateRegionWorld(bigWorld, {
    window: win, gridW: 320, gridH: 240, title: "Highland Environs",
  });
  const seaLevel = bigWorld.seaLevel;
  let worldMax = -Infinity, localMax = -Infinity;
  for (const v of bigWorld.elev.data) worldMax = Math.max(worldMax, v);
  for (const v of region.elev.data) localMax = Math.max(localMax, v);
  const worldSpan = Math.max(1e-9, worldMax - seaLevel);
  const localSpan = Math.max(1e-9, localMax - seaLevel);
  assert.ok(worldMax - localMax > 0.08, "precondition: this window excludes the world peak");

  const snowAlpine = (b: Uint8Array): number => {
    let n = 0;
    for (const x of b) if (x === BIOMES.snow || x === BIOMES.alpine) n++;
    return n;
  };
  const withWorld = classifyBiomes(region.elev, seaLevel, region.climate, worldSpan);
  assert.deepEqual(
    Array.from(region.biomes),
    Array.from(withWorld),
    "region biomes normalize against the world span, not the window's local max",
  );
  const withLocal = classifyBiomes(region.elev, seaLevel, region.climate, localSpan);
  assert.ok(
    snowAlpine(withLocal) - snowAlpine(withWorld) > 100,
    `non-vacuous: the local span would falsely snowbind this window ` +
      `(world ${snowAlpine(withWorld)} snow/alpine cells, local ${snowAlpine(withLocal)})`,
  );
});

test("region rivers match the world's major-river set at the window boundary (AC #162)", () => {
  // A river-rich seed (seed 27 at production grid carries many major rivers), and
  // a window centred on a major river's midsection so rivers cross its edges.
  const riverWorld = generateWorld(defaultRecipe(27, { gridW: 320, gridH: 240 }));
  const majors = riverWorld.rivers
    .filter(isMajorRiver)
    .sort((a, b) => b.points.length - a.points.length);
  assert.ok(majors.length >= 5, "seed 27 is river-rich");
  const mid = majors[0]!.points[Math.floor(majors[0]!.points.length / 2)]!;
  const win = windowAround(riverWorld, { x: mid.x, y: mid.y }, 0.38);
  const gridW = 320, gridH = 240;
  const region = generateRegionWorld(riverWorld, {
    window: win, gridW, gridH, title: "River Environs",
  });

  // region river cells (rounded; projected world rivers carry fractional coords)
  const regionCells = new Set<number>();
  for (const r of region.rivers) {
    for (const p of r.points) regionCells.add(Math.round(p.x) + Math.round(p.y) * gridW);
  }
  const nearRegion = (gx: number, gy: number): boolean => {
    for (let dy = -2; dy <= 2; dy++) {
      for (let dx = -2; dx <= 2; dx++) {
        const nx = gx + dx, ny = gy + dy;
        if (nx >= 0 && nx < gridW && ny >= 0 && ny < gridH && regionCells.has(nx + ny * gridW)) {
          return true;
        }
      }
    }
    return false;
  };

  // Project every world MAJOR-river cell into the window INDEPENDENTLY (this test
  // owns the uv->cell mapping, so region.ts's projection has to agree, not just
  // echo itself), classified into an interior band and an 8%-of-window edge band.
  const Ww = riverWorld.recipe.gridW, Wh = riverWorld.recipe.gridH;
  const du = win.u1 - win.u0, dv = win.v1 - win.v0, edgeFrac = 0.08;
  let iHit = 0, iMiss = 0, bHit = 0, bMiss = 0;
  for (const river of majors) {
    for (const p of river.points) {
      const u = p.x / (Ww - 1), v = p.y / (Wh - 1);
      if (u < win.u0 || u > win.u1 || v < win.v0 || v > win.v1) continue;
      const gx = Math.round(((u - win.u0) / du) * (gridW - 1));
      const gy = Math.round(((v - win.v0) / dv) * (gridH - 1));
      const edge =
        (u - win.u0) / du < edgeFrac || (win.u1 - u) / du < edgeFrac ||
        (v - win.v0) / dv < edgeFrac || (win.v1 - v) / dv < edgeFrac;
      const hit = nearRegion(gx, gy);
      if (edge) hit ? bHit++ : bMiss++;
      else hit ? iHit++ : iMiss++;
    }
  }
  const interior = iHit / Math.max(1, iHit + iMiss);
  const boundary = bHit / Math.max(1, bHit + bMiss);
  assert.ok(bHit + bMiss > 0, "the window actually crosses major rivers at its edge");
  assert.ok(
    boundary >= 0.85,
    `world major rivers continue across the boundary (got ${(boundary * 100) | 0}%)`,
  );
  assert.ok(
    interior >= 0.85,
    `world major rivers persist in the interior (got ${(interior * 100) | 0}%)`,
  );
});

test("region rivers are not inked twice: no extracted river shadows a projected major (#162)", () => {
  // Same river-rich window as the continuity test. Projected world majors carry
  // fractional cell coords (a uv division); the region's own extracted rivers carry
  // integer coords (grid cells). The shadow filter drops any extracted river that
  // duplicates a projected major, so no extracted river may cover >=50% of its cells
  // within the majors' 2-cell shadow. (Guards the no-double-ink return in region-rivers.ts.)
  const riverWorld = generateWorld(defaultRecipe(27, { gridW: 320, gridH: 240 }));
  const majors = riverWorld.rivers
    .filter(isMajorRiver)
    .sort((a, b) => b.points.length - a.points.length);
  const mid = majors[0]!.points[Math.floor(majors[0]!.points.length / 2)]!;
  const win = windowAround(riverWorld, { x: mid.x, y: mid.y }, 0.38);
  const gridW = 320, gridH = 240;
  const region = generateRegionWorld(riverWorld, { window: win, gridW, gridH, title: "River Environs" });

  const isProjected = (r: (typeof region.rivers)[number]): boolean =>
    r.points.some((p) => !Number.isInteger(p.x) || !Number.isInteger(p.y));
  const shadow = new Set<number>();
  for (const r of region.rivers) {
    if (!isProjected(r)) continue;
    for (const p of r.points) {
      const cx = Math.round(p.x), cy = Math.round(p.y);
      for (let dy = -2; dy <= 2; dy++) {
        for (let dx = -2; dx <= 2; dx++) {
          const nx = cx + dx, ny = cy + dy;
          if (nx >= 0 && nx < gridW && ny >= 0 && ny < gridH) shadow.add(nx + ny * gridW);
        }
      }
    }
  }
  assert.ok(shadow.size > 0, "the window carries projected world majors to shadow-check against");

  let extractedRivers = 0;
  for (const r of region.rivers) {
    if (isProjected(r)) continue;
    extractedRivers++;
    let covered = 0;
    for (const p of r.points) {
      if (shadow.has(Math.round(p.x) + Math.round(p.y) * gridW)) covered++;
    }
    assert.ok(
      covered / r.points.length < 0.5,
      `an extracted river shadows a projected major (${(100 * covered / r.points.length) | 0}% covered): double-ink`,
    );
  }
  assert.ok(extractedRivers > 0, "the window also carries genuinely new extracted detail");
});

test("windowAround clamps to the world", () => {
  const win = windowAround(world, { x: 2, y: 2 }, 0.4);
  assert.ok(win.u0 >= 0 && win.v0 >= 0);
  assert.ok(win.u1 <= 1 && win.v1 <= 1);
  assert.ok(Math.abs(win.u1 - win.u0 - 0.4) < 1e-9);
});

test("settlement notes are deterministic, non-empty prose", () => {
  const writerA = createLoreWriter(world, createRng(5));
  const writerB = createLoreWriter(world, createRng(5));
  for (const s of world.settlements.slice(0, 8)) {
    const a = writerA.settlementNote(s);
    const b = writerB.settlementNote(s);
    assert.equal(a, b);
    assert.ok(a.length > 15, `note too short: "${a}"`);
    assert.ok(a.endsWith("."), "notes are sentences");
    assert.ok(!a.includes("%"), "template slot left unfilled");
  }
});

test("a writer avoids back-to-back template repeats", () => {
  const writer = createLoreWriter(world, createRng(9));
  const harborTowns = world.settlements.filter((s) => s.harbor).slice(0, 6);
  if (harborTowns.length < 3) return;
  const notes = harborTowns.map((s) => writer.settlementNote(s));
  for (let i = 1; i < notes.length; i++) {
    assert.notEqual(notes[i], notes[i - 1], "adjacent notes identical");
  }
});
