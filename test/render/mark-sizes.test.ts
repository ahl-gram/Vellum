import { test } from "node:test";
import assert from "node:assert/strict";
import { defaultRecipe, generateWorld } from "../../src/world/generate.ts";
import { generateRegionWorld, regionTitle } from "../../src/world/region.ts";
import type { World } from "../../src/world/types.ts";
import type { RenderCtx } from "../../src/render/context.ts";
import { renderSvg } from "../../src/render/svg.ts";
import { STYLES, type StyleName } from "../../src/render/style.ts";
import { markScale, settlementGlyph, type SettlementTier } from "../../src/render/layers/settlement-marks.ts";
import { largerSide, markExtent } from "../../test-support/mark-extent.ts";

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
