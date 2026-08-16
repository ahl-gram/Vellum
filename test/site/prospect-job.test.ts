import test from "node:test";
import assert from "node:assert/strict";
import { generateWorld, defaultRecipe } from "../../src/world/generate.ts";
import { prospectPlate } from "../../src/prospect/finished.ts";
import { STYLES, type StyleName } from "../../src/render/style.ts";
import {
  plateDressFor,
  resolveProspectIndex,
  prospectResultFor,
} from "../../src/site/explorer/prospect-job.ts";

const world = generateWorld(defaultRecipe(42));
const capital = world.settlements.findIndex((s) => s.kind === "capital");

test("plateDressFor maps every chart style to a ratified plate dress: ink to ink, every other style to antique (#237 fallback rule)", () => {
  const styles = Object.keys(STYLES) as StyleName[];
  assert.ok(styles.length >= 4, "the style roster is the domain being swept");
  for (const name of styles) {
    assert.equal(
      plateDressFor(name),
      name === "ink" ? "ink" : "antique",
      `a ${name} chart opens a ${name === "ink" ? "ink" : "antique"} plate`,
    );
  }
});

test("resolveProspectIndex passes a valid index through and falls back to the capital otherwise", () => {
  assert.ok(capital >= 0, "seed 42 has a capital");
  assert.equal(resolveProspectIndex(world, 1), 1, "a valid non-capital index is honored");
  assert.equal(resolveProspectIndex(world, null), capital, "no index means the capital");
  assert.equal(resolveProspectIndex(world, world.settlements.length), capital, "past-the-end falls back");
  assert.equal(resolveProspectIndex(world, -1), capital, "negative falls back");
});

test("prospectResultFor renders through prospectPlate byte-for-byte and defaults the year to the present", () => {
  const res = prospectResultFor(world, { index: 1, dress: "ink", year: null });
  assert.equal(res.svg, prospectPlate(world, 1, STYLES.ink, world.title.year));
  assert.equal(res.year, world.title.year, "a null year is the present year");
  assert.equal(res.presentYear, world.title.year);
  assert.equal(res.name, world.settlements[1]!.name);
  assert.equal(res.index, 1);
  assert.equal(res.title, world.title.title);
});

test("prospectResultFor honors an explicit viewing year (the year is a pure era filter, #241)", () => {
  const res = prospectResultFor(world, { index: 1, dress: "antique", year: 300 });
  assert.equal(res.svg, prospectPlate(world, 1, STYLES.antique, 300));
  assert.equal(res.year, 300);
});

test("prospectResultFor with no index opens the capital's plate", () => {
  const res = prospectResultFor(world, { index: null, dress: "antique", year: null });
  assert.equal(res.index, capital);
  assert.equal(res.name, world.settlements[capital]!.name);
  assert.equal(res.svg, prospectPlate(world, capital, STYLES.antique, world.title.year));
});
