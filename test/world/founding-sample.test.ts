import { test } from "node:test";
import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import type { ClimateBand } from "../../src/climate/climate.ts";
import { hashString } from "../../src/core/rng.ts";
import { CULTURE_IDS } from "../../src/society/culture-ids.ts";
import type { MapType } from "../../src/terrain/heightfield.ts";
import { defaultRecipe } from "../../src/world/generate.ts";
import { foundWorld, type FoundingOverrides } from "../../src/world/founding/found.ts";
import { COAST_WARP, FOUNDING_VERSION, LAND_FACTOR } from "../../src/world/founding/lexicon.ts";

const LOCK =
  "until the written-world link goes public in Issue #393, a change to version 1 re-pins these rows; once it is public, version 1 is locked and a change is version 2, with version 1 kept (Alex, 2026-10-09)";

type Row = {
  readonly sentence: string;
  readonly seed: number;
  readonly residual: string;
  readonly overrides: FoundingOverrides;
  readonly steered: ReadonlyArray<string>;
};

const isRow = (value: unknown): value is Row => {
  if (typeof value !== "object" || value === null) return false;
  const row = value as Record<string, unknown>;
  return (
    typeof row["sentence"] === "string" &&
    Number.isInteger(row["seed"]) &&
    typeof row["residual"] === "string" &&
    typeof row["overrides"] === "object" &&
    row["overrides"] !== null &&
    Array.isArray(row["steered"]) &&
    row["steered"].every((p) => typeof p === "string")
  );
};

const RAW: unknown = JSON.parse(readFileSync(new URL("./founding-sample.json", import.meta.url), "utf8"));
const SAMPLE: ReadonlyArray<Row> = Array.isArray(RAW) ? RAW.filter(isRow) : [];
const MAP_TYPES: Record<MapType, true> = { island: true, archipelago: true, continent: true, citystate: true };
const BANDS: Record<ClimateBand, true> = { polar: true, temperate: true, tropical: true };

test("every row of the kept sample has the shape its pins are read from", () => {
  assert.ok(Array.isArray(RAW), "the sample is an array of rows");
  for (const [i, row] of RAW.entries()) assert.ok(isRow(row), `row ${i}: ${JSON.stringify(row)}`);
});

for (const row of SAMPLE) {
  test(`the sample: "${row.sentence}" founds the world version 1 founds`, () => {
    const f = foundWorld(row.sentence);
    assert.ok(f.ok, row.sentence);
    assert.equal(f.version, FOUNDING_VERSION);
    assert.equal(f.residual, row.residual);
    assert.equal(hashString(row.residual), row.seed, "the pinned seed is the pinned residual's own hash");
    assert.equal(f.seed, row.seed, LOCK);
    assert.deepEqual(f.overrides, row.overrides, LOCK);
    assert.deepEqual(
      f.steered.map((r) => r.phrase),
      row.steered,
      LOCK,
    );
  });
}

const landDirection = (row: Row): keyof typeof LAND_FACTOR | undefined => {
  const share = row.overrides.landFraction;
  if (share === undefined) return undefined;
  const mapType = row.overrides.mapType;
  const own = defaultRecipe(row.seed, mapType !== undefined ? { mapType } : {}).landFraction;
  const strengths = Object.entries(LAND_FACTOR) as Array<[keyof typeof LAND_FACTOR, number]>;
  return strengths.find(([, factor]) => Math.round(own * factor * 1000) / 1000 === share)?.[0];
};

test("the kept sample reaches every map type, climate, coast, land direction and naming tradition", () => {
  const values = (pick: (row: Row) => unknown): string[] =>
    [...new Set(SAMPLE.map(pick).filter((v) => v !== undefined))].map(String).sort();
  assert.deepEqual(
    values((r) => r.overrides.mapType),
    Object.keys(MAP_TYPES).sort(),
  );
  assert.deepEqual(
    values((r) => r.overrides.band),
    Object.keys(BANDS).sort(),
  );
  assert.deepEqual(
    values((r) => r.overrides.coastWarp),
    Object.values(COAST_WARP).map(String).sort(),
  );
  assert.deepEqual(values(landDirection), Object.keys(LAND_FACTOR).sort());
  assert.deepEqual(
    values((r) => r.overrides.culture),
    [...CULTURE_IDS].sort(),
  );
});
