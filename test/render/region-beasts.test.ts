import { test } from "node:test";
import assert from "node:assert/strict";
import { createHash } from "node:crypto";
import { defaultRecipe, generateWorld } from "../../src/world/generate.ts";
import { generateRegionWorld, regionTitle } from "../../src/world/region.ts";
import { LOD_BANDS, lodWindowFor, quantizeCenter } from "../../src/world/lod.ts";
import { renderMap } from "../../src/render/map-renderer.ts";
import { createProjection, marginFor } from "../../src/render/transform.ts";
import { beastSpot } from "../../test-support/beast-spot.ts";

const OFF = { style: "antique", widthPx: 1500, legend: true } as const;
const ON = { ...OFF, beasts: true } as const;

/** A region sheet is ~300KB, and node:test renders a failed equal() of two of them character by character; the digest is the same byte comparison with a message a human can read. */
const digest = (svg: string): string => `${createHash("sha256").update(svg).digest("hex").slice(0, 16)}/${svg.length}`;

const proj = createProjection(320, 240, 1500, marginFor(1500));

const world42 = generateWorld(defaultRecipe(42));
const beast = world42.beasts[0]!;

function closeUpOf(world: typeof world42, cx: number, cy: number, bandIndex: number) {
  const band = LOD_BANDS[bandIndex]!;
  const window = lodWindowFor(cx, cy, band.sizeUV);
  return generateRegionWorld(world, {
    window,
    gridW: 320,
    gridH: 240,
    title: regionTitle(world, window),
    detail: true,
  });
}

const band2 = LOD_BANDS[2]!;
const q2 = quantizeCenter(beast.x / (world42.recipe.gridW - 1), beast.y / (world42.recipe.gridH - 1), band2.sizeUV);
const closeUp2 = closeUpOf(world42, q2.cx, q2.cy, 2);

test("with the beasts seal off, a close-up carrying a beast draws exactly what one carrying none draws", () => {
  assert.equal(closeUp2.beasts.length, 1, "fixture drift: the window no longer carries the beast");
  const bare = renderMap({ ...closeUp2, beasts: [] }, OFF);
  assert.equal(
    digest(renderMap(closeUp2, OFF)),
    digest(bare),
    "a carried beast changed a sheet drawn without the seal",
  );
  assert.ok(bare.includes('id="sea-serpent"'), "fixture drift: no decor serpent for a leak to remove");
});

test("a carried beast is drawn on the close-up, and the decor serpent stands down for it (seed 42, band 2)", () => {
  const svg = renderMap(closeUp2, ON);
  assert.ok(svg.includes('id="layer-bestiary"'), "the close-up drew no bestiary");
  assert.ok(svg.includes(`>${beast.name}, ${beast.epithet}<`), "the beast lost its name or title");
  assert.ok(!svg.includes('id="sea-serpent"'), "the decor serpent did not stand down for the beast");
  assert.ok(
    renderMap({ ...closeUp2, beasts: [] }, ON).includes('id="sea-serpent"'),
    "fixture drift: no decor serpent for the beast to displace",
  );
});

test("a carried beast pushed off its haunt is drawn nudged within its near reach (seed 42, band 3, the haunt in the corner)", () => {
  const band = LOD_BANDS[3]!;
  const step = band.sizeUV / 8;
  const region = closeUpOf(world42, 55 * step, 59 * step, 3);
  const svg = renderMap(region, ON);
  assert.ok(svg.includes('id="beast-0"'), "a beast with room near its haunt was lost");
  const home = region.beasts[0]!;
  const spot = beastSpot(svg, home.kind);
  assert.ok(spot !== null, "the beast was drawn with no label to read its place from");
  const moved = Math.hypot(spot.x - proj.px(home.x), spot.y - proj.py(home.y));
  assert.ok(moved > 1, "fixture drift: the beast now fits at its haunt, so the search is never run");
  assert.ok(moved < 460, `the beast was drawn ${moved.toFixed(0)} px from its haunt, beyond the near reach`);
});

test("a close-up with no room near the haunt draws no beast and stays exactly as it was (seed 22, band 1, the haunt under the title)", () => {
  const world22 = generateWorld(defaultRecipe(22));
  const step = LOD_BANDS[1]!.sizeUV / 8;
  const region = closeUpOf(world22, 7 * step, 5 * step, 1);
  assert.equal(region.beasts.length, 1, "fixture drift: the window no longer carries the beast");
  const svg = renderMap(region, ON);
  assert.ok(!svg.includes('id="beast-0"'), "the close-up drew its beast beyond the near reach");
  assert.equal(
    digest(svg),
    digest(renderMap({ ...region, beasts: [] }, ON)),
    "a close-up that finds no room near the haunt is not the sheet it was",
  );
  assert.ok(svg.includes('id="sea-serpent"'), "the decor serpent did not keep its place");
});
