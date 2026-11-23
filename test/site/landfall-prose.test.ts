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

  const svg = read("src/static/charts/chart-42-antique.svg");
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

test("the Primer's where-line is seed 42's own: Poalo is a harbour of The Ratoa Atolls (Issue #1155 comment 6754142680 ruling 8)", () => {
  const world = generateWorld(defaultRecipe(42));
  const poalo = world.settlements.find((s) => s.name === "Poalo");
  assert.ok(poalo, "seed 42 places Poalo");
  assert.equal(poalo.harbor, true, "Poalo is a harbour");
  const id = world.realms.labels[Math.round(poalo.y) * world.elev.w + Math.round(poalo.x)] ?? -1;
  const realm = id >= 0 ? world.names.realms[id] : undefined;
  assert.equal(realm, "The Ratoa Atolls", "Poalo stands in The Ratoa Atolls");
  assert.equal(
    homeStations().find((s) => s.id === "primer")?.where,
    "at Poalo, a harbour of the Ratoa Atolls",
    "the card says what the world holds",
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
      `${s.id}: the sea flag is the terrain's own verdict (measured 2026-11-22: elev ${elev.toFixed(4)} against seaLevel ${world.seaLevel.toFixed(4)}; the Gallery 0.3989 and How It Works -0.0048 are the two at sea, and the Primer at Poalo, 0.4411, is land by 0.0023); if this reds after a regen or re-anchor, the dress must be re-decided, not the assertion loosened`,
    );
  }
});
