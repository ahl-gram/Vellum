import { test } from "node:test";
import assert from "node:assert/strict";
import { defaultRecipe, generateWorld } from "../../src/world/generate.ts";
import { generateRegionWorld, regionTitle } from "../../src/world/region.ts";
import type { World } from "../../src/world/types.ts";
import { createRng } from "../../src/core/rng.ts";
import { minMax } from "../../src/core/grid.ts";
import { createLabelArena, type RenderCtx } from "../../src/render/context.ts";
import { boxesOverlap, type Box } from "../../src/render/geometry.ts";
import { createProjection, marginFor } from "../../src/render/transform.ts";
import { nameSetting, settlementsLayer } from "../../src/render/layers/settlements.ts";
import { glyphPoly, polysOverlap, textNodes } from "../../test-support/label-geometry.ts";
import { renderSvg } from "../../src/render/svg.ts";
import { STYLES, type StyleName } from "../../src/render/style.ts";
import { renderMap } from "../../src/render/map-renderer.ts";
import { MAX_DETAIL } from "../../src/terrain/heightfield.ts";
import {
  markGrowth,
  markLadder,
  markScale,
  settlementGlyph,
  type SettlementTier,
} from "../../src/render/layers/settlement-marks.ts";
import { largerSide, markExtent, type Extent } from "../../test-support/mark-extent.ts";

const world56 = generateWorld(defaultRecipe(56));
const AELEGWEI_B5 = { u0: 191 / 256, v0: 183 / 256, u1: 191 / 256 + 1 / 32, v1: 183 / 256 + 1 / 32 };
const spec = {
  window: AELEGWEI_B5,
  gridW: 320,
  gridH: 240,
  title: regionTitle(world56, AELEGWEI_B5),
};
const BARE = generateRegionWorld(world56, spec);

const atDepth = (level: number): World => ({ ...BARE, region: { ...BARE.region!, detail: level } });

const glyphCtx = (world: World, name: StyleName): RenderCtx =>
  ({ world, style: STYLES[name], proj: { widthPx: 1500 } }) as unknown as RenderCtx;

const sizeOf = (tier: SettlementTier, world: World, name: StyleName): number =>
  largerSide(markExtent(renderSvg(settlementGlyph(tier, 100, 100, glyphCtx(world, name), markScale(tier, world)))));

const DRESSES: ReadonlyArray<StyleName> = ["antique", "topographic", "ink", "nautical"];

test("on a close-up the marks keep the ruled order at every depth, in every dress (Issue #1104)", () => {
  for (const dress of DRESSES) {
    for (let level = 0; level <= 5; level++) {
      const w = atDepth(level);
      const size = (tier: SettlementTier): number => sizeOf(tier, w, dress);
      const where = `${dress}, level ${level}`;
      const chain: ReadonlyArray<readonly [SettlementTier, SettlementTier]> = [
        ["capital", "seat"],
        ["seat", "town"],
        ["town", "village"],
        ["village", "hamlet"],
        ["village", "farmstead"],
        ["village", "mill"],
      ];
      for (const [bigger, smaller] of chain) {
        assert.ok(
          size(bigger) > size(smaller),
          `${where}: ${bigger} ${size(bigger).toFixed(2)} is not over ${smaller} ${size(smaller).toFixed(2)}`,
        );
      }
    }
  }
});

const DEEP = generateRegionWorld(world56, { ...spec, detail: true });

const sheetOf = (w: World): string => renderMap(w, { style: "antique", widthPx: 1500, legend: true });

function sheetMark(svg: string, tier: SettlementTier, nth = 0): Extent {
  let at = -1;
  for (let i = 0; i <= nth; i++) {
    at = svg.indexOf(`data-tier="${tier}"`, at + 1);
    assert.notEqual(at, -1, `the sheet draws a ${tier} (number ${nth})`);
  }
  const stops = ["<text", '<g class="settlement"', '<g id="layer-'].map((s) => svg.indexOf(s, at));
  const end = Math.min(...stops.filter((n) => n !== -1));
  return markExtent(svg.slice(at, end));
}

function keyCapital(svg: string): Extent {
  const legend = svg.indexOf('<g id="layer-legend"');
  assert.notEqual(legend, -1, "the sheet draws a key");
  const at = svg.indexOf('<g class="settlement-capital">', legend);
  assert.notEqual(at, -1, "the key has a capital row");
  return markExtent(svg.slice(at, svg.indexOf("</g></g>", at)));
}

const sideOf = (e: Extent): readonly [number, number] => [e.x1 - e.x0, e.y1 - e.y0];

test("a detailed close-up draws its marks larger by its depth's growth, its key keeps the ladder, and the order holds on the drawn sheet (Issue #1104)", () => {
  assert.equal(DEEP.region!.detail, 5, "the detailed close-up carries the Glass's deepest band");
  assert.equal(BARE.region!.detail, 0, "a bare survey carries level 0");
  for (const w of [DEEP, BARE])
    assert.ok(
      w.settlements.some((s) => s.kind === "capital"),
      "it holds a capital",
    );
  const deep = sheetOf(DEEP);
  const bare = sheetOf(BARE);

  const growth = largerSide(sheetMark(deep, "capital")) / largerSide(sheetMark(bare, "capital"));
  assert.ok(markGrowth(DEEP) > 1, "a detailed band-5 survey grows its marks");
  assert.ok(
    Math.abs(growth / markGrowth(DEEP) - 1) < 1e-6,
    `the drawn capital grows ${growth}, the growth is ${markGrowth(DEEP)}`,
  );

  const [kdw, kdh] = sideOf(keyCapital(deep));
  const [kbw, kbh] = sideOf(keyCapital(bare));
  assert.ok(Math.abs(kdw - kbw) < 1e-6 && Math.abs(kdh - kbh) < 1e-6, "the key's capital does not grow with depth");
  const sheetBare = sideOf(sheetMark(bare, "capital"));
  assert.ok(Math.abs(kbw - sheetBare[0]) < 1e-6 && Math.abs(kbh - sheetBare[1]) < 1e-6, "the key draws the ladder");

  const capital = largerSide(sheetMark(deep, "capital"));
  const village = largerSide(sheetMark(deep, "village"));
  const hamlet = largerSide(sheetMark(deep, "hamlet"));
  assert.ok(capital > village && village > hamlet, `drawn capital ${capital} > village ${village} > hamlet ${hamlet}`);
  for (const tier of ["farmstead", "mill"] as const) {
    const count = deep.split(`data-tier="${tier}"`).length - 1;
    assert.ok(count > 0, `the sheet draws a ${tier}`);
    for (let n = 0; n < count; n++) {
      const side = largerSide(sheetMark(deep, tier, n));
      assert.ok(side < village, `a drawn ${tier} (${side}) stays under the village (${village})`);
    }
  }
});

const TIERS: ReadonlyArray<SettlementTier> = ["capital", "seat", "town", "village", "hamlet", "farmstead", "mill"];

test("growth rises with the survey's depth, stops at the Glass's deepest band, and never reaches a world sheet (Issue #1104)", () => {
  assert.equal(markGrowth(atDepth(0)), 1, "a bare survey draws the ladder alone");
  for (let n = 0; n < 5; n++) {
    assert.ok(markGrowth(atDepth(n + 1)) > markGrowth(atDepth(n)), `level ${n + 1} grows past level ${n}`);
  }
  assert.equal(markGrowth(atDepth(MAX_DETAIL)), markGrowth(atDepth(5)), "growth stops at the deepest band");
  for (const tier of TIERS) {
    assert.equal(markLadder(tier, world56), 1, `a world sheet draws the ${tier} on no ladder`);
    assert.equal(markScale(tier, world56), 1, `a world sheet draws the ${tier} ungrown`);
  }
});

function layerCtx(region: World): RenderCtx {
  const { max } = minMax(region.elev);
  return {
    world: region,
    style: STYLES.antique,
    proj: createProjection(region.elev.w, region.elev.h, 1500, marginFor(1500)),
    coastRings: [],
    elevSpan: Math.max(1e-9, max - region.seaLevel),
    rng: createRng(region.recipe.seed).fork("render"),
    realmTint: [],
    labels: createLabelArena(),
  };
}

const extentBox = (e: Extent): Box => ({ x: e.x0, y: e.y0, w: e.x1 - e.x0, h: e.y1 - e.y0 });

test("on a close-up a name is never set on its own mark (Issue #1104)", () => {
  const ctx = layerCtx(DEEP);
  const capital = DEEP.settlements.find((s) => s.kind === "capital");
  assert.ok(capital, "the close-up holds a capital");
  const { tries } = nameSetting(DEEP, ctx.proj, capital, "capital");
  ctx.labels.claim(tries[0]!.box);
  ctx.labels.claim(tries[1]!.box);
  const svg = renderSvg(settlementsLayer(ctx).finish().node);

  const at = svg.indexOf('data-tier="capital"');
  assert.notEqual(at, -1, "the capital is drawn");
  const textAt = svg.indexOf("<text", at);
  assert.notEqual(textAt, -1, "the capital is named");
  const castle = markExtent(svg.slice(at, textAt));
  assert.ok(boxesOverlap(tries[2]!.box, extentBox(castle)), "the north spot lies on the castle, so the hazard is live");

  const names = textNodes(svg.slice(textAt, svg.indexOf("</g>", textAt)));
  assert.equal(names.length, 1, "the capital's name is drawn once");
  const castlePoly = [
    { x: castle.x0, y: castle.y0 },
    { x: castle.x1, y: castle.y0 },
    { x: castle.x1, y: castle.y1 },
    { x: castle.x0, y: castle.y1 },
  ];
  assert.equal(polysOverlap(glyphPoly(names[0]!), castlePoly), false, "the name stands off its own castle");
});
