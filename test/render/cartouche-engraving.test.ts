import { test } from "node:test";
import assert from "node:assert/strict";
import { foundWorld } from "../../src/world/founding/found.ts";
import { defaultRecipe, generateWorld } from "../../src/world/generate.ts";
import { generateRegionWorld, regionTitle, windowAround } from "../../src/world/region.ts";
import type { World } from "../../src/world/types.ts";
import { createRng } from "../../src/core/rng.ts";
import { createLabelArena, type RenderCtx } from "../../src/render/context.ts";
import { cartoucheLayer, planCartouche } from "../../src/render/layers/cartouche.ts";
import { STYLES, type MapStyle } from "../../src/render/style.ts";
import { createProjection, marginFor } from "../../src/render/transform.ts";
import type { SvgNode } from "../../src/render/svg.ts";

const EPIC = "a cold archipelago of black pines, iron harbors, and a drowned kingdom";
const EPIC_ENGRAVED = ["\u{201C}A cold archipelago of black pines, iron", "harbors, and a drowned kingdom\u{201D}"];

const f = foundWorld(EPIC);
assert.ok(f.ok);
const founded = generateWorld(defaultRecipe(f.seed, { ...f.overrides, foundingText: f.sentence }));
const control = generateWorld(defaultRecipe(f.seed, f.overrides));

function ctxFor(world: World, style: MapStyle, widthPx: number): RenderCtx {
  const proj = createProjection(world.elev.w, world.elev.h, widthPx, marginFor(widthPx));
  return {
    world,
    style,
    proj,
    coastRings: [],
    elevSpan: 1,
    rng: createRng(world.recipe.seed).fork("render"),
    realmTint: world.realms.seats.map((_, i) => i),
    labels: createLabelArena(),
  };
}

const layerFor = (world: World, style: MapStyle, widthPx = 1500): SvgNode => {
  const ctx = ctxFor(world, style, widthPx);
  return cartoucheLayer(ctx, planCartouche(ctx));
};

const foundingGroup = (layer: SvgNode): SvgNode | undefined =>
  layer.children.find((c): c is SvgNode => typeof c !== "string" && c.attrs["id"] === "cartouche-founding");

const textOf = (node: SvgNode): string => node.children.map((c) => (typeof c === "string" ? c : textOf(c))).join("");

const lineNodes = (group: SvgNode): SvgNode[] => group.children.filter((c): c is SvgNode => typeof c !== "string");

const nodeChildren = (layer: SvgNode): SvgNode[] => layer.children.filter((c): c is SvgNode => typeof c !== "string");

test("a founded world engraves its founding text under the subtitle, inside quotation marks, in each style's own face and ink (Issue #392)", () => {
  for (const style of Object.values(STYLES)) {
    const layer = layerFor(founded, style);
    const group = foundingGroup(layer);
    assert.ok(group, `${style.name}: the founding group must be found`);
    const lines = lineNodes(group);
    assert.deepEqual(lines.map(textOf), EPIC_ENGRAVED, style.name);
    assert.equal(lines.map(textOf).join(" "), `\u{201C}A${f.sentence.slice(1)}\u{201D}`, style.name);
    for (const line of lines) {
      assert.equal(line.attrs["fill"], style.ink, `${style.name}: full ink`);
      assert.equal(line.attrs["font-family"], style.fontFamily, `${style.name}: body face`);
    }
    const kids = nodeChildren(layer);
    const at = kids.indexOf(group);
    const lastItalic = kids.findLastIndex((c) => c.attrs["font-style"] === "italic");
    const chart = kids.findIndex((c) => textOf(c).startsWith("CHART №"));
    assert.notEqual(lastItalic, -1, `${style.name}: the subtitle is found`);
    assert.notEqual(chart, -1, `${style.name}: the chart number is found`);
    assert.ok(at > lastItalic, `${style.name}: the block sits after the subtitle`);
    assert.ok(at < chart, `${style.name}: the block sits before the chart number`);
  }
});

test("the box grows by exactly the engraved block, and the chart number keeps its place under it (Issue #392)", () => {
  for (const widthPx of [1500, 3000]) {
    const k = widthPx / 1500;
    const style = STYLES.antique;
    const ctx = ctxFor(founded, style, widthPx);
    const plan = planCartouche(ctx);
    const layer = cartoucheLayer(ctx, plan);
    const group = foundingGroup(layer);
    assert.ok(group, `${widthPx}: the founding group must be found`);
    const growth = plan.rect.h - planCartouche(ctxFor(control, style, widthPx)).rect.h;
    const lines = lineNodes(group);
    const lastItalic = nodeChildren(layer).findLast((c) => c.attrs["font-style"] === "italic");
    assert.ok(lastItalic);
    const span = Number((lines.at(-1) as SvgNode).attrs["y"]) - Number(lastItalic.attrs["y"]);
    assert.ok(Math.abs(growth - span) < 1e-6, `${widthPx}: the box grew ${growth}, the block spans ${span}`);
    const chart = nodeChildren(layer).find((c) => textOf(c).startsWith("CHART №"));
    assert.ok(chart);
    assert.ok(Math.abs(Number(chart.attrs["y"]) - (plan.rect.y + plan.rect.h - 11 * k)) < 1e-6);
    assert.equal(textOf(chart), `CHART № ${f.seed}`);
  }
  const size = (widthPx: number): number =>
    Number(
      (lineNodes(foundingGroup(layerFor(founded, STYLES.antique, widthPx)) as SvgNode)[0] as SvgNode).attrs[
        "font-size"
      ],
    );
  assert.equal(size(3000), 2 * size(1500));
});

test("a chart with no founding text, or an empty one, engraves nothing (Issue #392)", () => {
  const empty = generateWorld(defaultRecipe(f.seed, { ...f.overrides, foundingText: "" }));
  const cases: Array<[World, MapStyle]> = [
    ...Object.values(STYLES).map((style): [World, MapStyle] => [control, style]),
    [generateWorld(defaultRecipe(42)), STYLES.antique],
    [empty, STYLES.antique],
  ];
  for (const [world, style] of cases) {
    const ctx = ctxFor(world, style, 1500);
    assert.deepEqual(planCartouche(ctx).founding, []);
    assert.equal(foundingGroup(cartoucheLayer(ctx, planCartouche(ctx))), undefined);
  }
});

test("a close-up of a founded world letters no founding text, though its recipe carries it (Issue #392)", () => {
  const capital = founded.settlements.find((s) => s.kind === "capital");
  assert.ok(capital);
  const window = windowAround(founded, capital, 0.25);
  const region = generateRegionWorld(founded, { window, gridW: 320, gridH: 240, title: regionTitle(founded, window) });
  assert.equal(region.recipe.foundingText, EPIC, "the close-up's recipe carries the sentence");
  const ctx = ctxFor(region, STYLES.antique, 1500);
  assert.deepEqual(planCartouche(ctx).founding, []);
  assert.equal(foundingGroup(cartoucheLayer(ctx, planCartouche(ctx))), undefined);
});

test("the opening quotation mark and the first letter are set together as a larger capital in the title face, and the closing mark ends the last line (Issue #392)", () => {
  for (const style of Object.values(STYLES)) {
    const group = foundingGroup(layerFor(founded, style));
    assert.ok(group, `${style.name}: the founding group must be found`);
    const lines = lineNodes(group);
    const first = lines[0] as SvgNode;
    const capital = first.children[0];
    assert.ok(capital !== undefined && typeof capital !== "string" && capital.tag === "tspan", style.name);
    assert.deepEqual(capital.children, ["\u{201C}A"], style.name);
    assert.equal(capital.attrs["font-family"], style.fontFamilyTitle, style.name);
    assert.ok(Number(capital.attrs["font-size"]) > Number(first.attrs["font-size"]), `${style.name}: larger capital`);
    assert.equal(first.children[1], " cold archipelago of black pines, iron", style.name);
    const last = lines.at(-1) as SvgNode;
    assert.ok(textOf(last).endsWith("\u{201D}"), `${style.name}: the closing mark ends the last line`);
    assert.ok(
      last.children.every((c) => typeof c === "string"),
      `${style.name}: the last line holds no tspan`,
    );
  }
});

test("a founded world whose founding text opens on a flag engraves the whole flag in its capital, in each style (Issue #1107)", () => {
  const flag = "\u{1F1FA}\u{1F1F8}";
  const world: World = { ...founded, recipe: { ...founded.recipe, foundingText: `${flag} ${f.sentence}` } };
  for (const style of Object.values(STYLES)) {
    const group = foundingGroup(layerFor(world, style));
    assert.ok(group, `${style.name}: the founding group must be found`);
    const first = lineNodes(group)[0] as SvgNode;
    const capital = first.children[0];
    assert.ok(capital !== undefined && typeof capital !== "string" && capital.tag === "tspan", style.name);
    assert.deepEqual(capital.children, [`\u{201C}${flag}`], style.name);
  }
});
