import { test } from "node:test";
import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { resolve } from "node:path";
import { SHEET } from "../../src/site/home/camera.ts";
import { homeStations, howStation } from "../../src/site/home/stations.ts";
import { defaultRecipe, generateWorld } from "../../src/world/generate.ts";
import { createProjection, marginFor } from "../../src/render/transform.ts";

// Landfall Sub 4 (Issue #459): the prose finds a home. Ratified in the 2026-08-24 decision-2 comment on Issue #454 (restated on Issue #459): the How It Works prose and underhood links live in a panel opened from a dedicated pip on the chart, never the legend; the text ships hidden but indexable; the Notice to Mariners is the mockup's decorative stamp on the deep, stamp only.

const REPO = resolve(import.meta.dirname, "..", "..");
const read = (p: string): string => readFileSync(resolve(REPO, p), "utf8");

test("the How It Works pip moors at the title cartouche, chart only, never the legend (#459)", () => {
  const how = howStation();
  assert.equal(how.id, "how");
  assert.equal(how.name, "How It Works");
  assert.equal(how.verb, "See how");
  assert.equal(how.where, "at the title cartouche");

  const svg = read("public/charts/chart-42-antique.svg");
  const frame = svg.match(/id="layer-cartouche"><rect x="([\d.]+)" y="([\d.]+)" width="([\d.]+)" height="([\d.]+)"/);
  assert.ok(frame, "chart 42 carries its cartouche frame; a regen that moves it re-anchors the pip");
  const [x, y, w, h] = frame.slice(1).map(Number) as [number, number, number, number];
  assert.ok(Math.abs(how.nx - (x + w / 2) / SHEET.w) < 0.002, "the pip rides the cartouche frame's bottom-center");
  assert.ok(Math.abs(how.ny - (y + h) / SHEET.h) < 0.002, "the pip hangs from the frame's lower rule");

  assert.ok(
    homeStations().every((s) => s.id !== "how"),
    "the pip is no mode of encounter: the legend derives from homeStations and must never list it (ratified 2026-08-24)",
  );
  assert.equal(
    howStation().sea,
    true,
    "the how pip declares the at-sea round; the terrain test below is what earns it",
  );
});

test("every pip's at-sea dress is earned from the terrain, not asserted by hand (#470 deferred small; swept class-wide at skeptic round 2)", () => {
  const world = generateWorld(defaultRecipe(42));
  const proj = createProjection(world.recipe.gridW, world.recipe.gridH, SHEET.w, marginFor(SHEET.w));
  for (const s of [...homeStations(), howStation()]) {
    const gx = Math.round((s.nx * SHEET.w - proj.margin) / proj.scale);
    const gy = Math.round((s.ny * proj.heightPx - proj.margin) / proj.scale);
    assert.ok(world.elev.inBounds(gx, gy), `${s.id}: the anchor projects back inside the grid`);
    const elev = world.elev.at(gx, gy);
    assert.equal(
      elev < world.seaLevel,
      s.sea,
      `${s.id}: the sea flag is the terrain's own verdict (measured 2026-08-24: elev ${elev.toFixed(4)} against seaLevel ${world.seaLevel.toFixed(4)}; gallery -0.1389 and how -0.0048 are the two at sea); if this reds after a regen or re-anchor, the dress must be re-decided, not the assertion loosened`,
    );
  }
});

// No reader of the page sees code shape, and no link stands inside the stage for the tap guard's `a` arm to answer (Issue #779 part 2f).
test("input.ts carries no card guard, the slip's wheel handler opens on its scroller lookup, and the stage's tap guard spares links beside buttons (#459 skeptic rounds 1 and 2, reshaped at #470)", () => {
  const input = read("src/site/home/input.ts");
  const cards = read("src/site/home/cards.ts");
  assert.ok(
    !input.includes("lf-card"),
    "input.ts carries no card guard: the slips left the stage, and dead code that LOOKS like a guard is worse than none",
  );
  const at = cards.indexOf('"wheel"');
  assert.ok(at >= 0, "the wheel binding exists");
  const next = cards.indexOf("addEventListener", at);
  const wheel = next === -1 ? cards.slice(at) : cards.slice(at, next);
  const wheelBody = wheel.slice(wheel.indexOf("{", wheel.indexOf("=>")) + 1);
  assert.match(
    wheelBody.trimStart(),
    /^const scroller =/,
    "the handler's FIRST statement is the scroller lookup: an unconditional bail above it would leave every check below as dead text these pins still match (guard-prover round 4 hole)",
  );
  assert.match(
    cards,
    /if \(e\.target instanceof Element && e\.target\.closest\("button, a"\) !== null\) return;/,
    "the stage's tap-to-close guard spares links as well as buttons inside the stage",
  );
});
