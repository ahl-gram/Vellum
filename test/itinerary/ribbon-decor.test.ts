import test from "node:test";
import assert from "node:assert/strict";
import { generateWorld, defaultRecipe } from "../../src/world/generate.ts";
import { createRng } from "../../src/core/rng.ts";
import { renderSvg, type SvgNode } from "../../src/render/svg.ts";
import { STYLES } from "../../src/render/style.ts";
import { layoutRibbon } from "../../src/itinerary/dress/layout.ts";
import { ribbonDress } from "../../src/itinerary/dress/context.ts";
import { decorNodes } from "../../src/itinerary/dress/strip.ts";
import type { Box } from "../../src/render/geometry.ts";
import { namedJourney } from "../../test-support/ribbon-fixtures.ts";

const input = namedJourney(generateWorld(defaultRecipe(42)), "Laukuwelua", "Homaitani");
const strip = layoutRibbon(input).strips[1]!;
const c = ribbonDress(STYLES.antique);
const press = (captions: ReadonlyArray<Box>): SvgNode[] =>
  decorNodes(c, strip, createRng(input.seed).fork(`ribbon-${input.fromIdx}-${input.toIdx}`), captions);

const glyphs = (nodes: ReadonlyArray<SvgNode>): SvgNode[] =>
  nodes.filter((n) => n.tag === "g" && /^translate\(/.test(String(n.attrs.transform)));

// A glyph at translate(x y) scale(s) fills x - 9s to x + 9s across and y - 12s to y + 1 down, and gives way to a caption box widened by 1.
function boxOf(node: SvgNode): Box {
  const m = /^translate\((-?[\d.]+) (-?[\d.]+)\) scale\(([\d.]+)\)$/.exec(String(node.attrs.transform));
  assert.ok(m, `premise: a glyph group is placed by translate and scale: ${String(node.attrs.transform)}`);
  const [x, y, s] = [Number(m[1]), Number(m[2]), Number(m[3])];
  return { x: x - 9 * s, y: y - 12 * s, w: 18 * s, h: 12 * s + 1 };
}

const meets = (a: Box, b: Box): boolean =>
  a.x - 1 < b.x + b.w && a.x + a.w + 1 > b.x && a.y - 1 < b.y + b.h && a.y + a.h + 1 > b.y;

test("a tree or hill gives way to a caption over it, and every other glyph stays put", () => {
  const nodes = press([]);
  const all = glyphs(nodes);
  const wooded = nodes.findIndex((n, i) => n.tag === "g" && nodes[i - 1]?.tag === "circle");
  assert.ok(
    wooded > 0 && all.length >= 2,
    `premise: the strip draws a tree among its dots and glyphs (node ${wooded} of ${nodes.length})`,
  );
  const caption = boxOf(nodes[wooded] as SvgNode);
  const covered = all.filter((g) => meets(boxOf(g), caption));
  const after = all.filter((g) => !covered.includes(g) && nodes.indexOf(g) > wooded);
  assert.ok(
    covered.length >= 1 && after.length >= 1,
    `premise: the caption covers ${covered.length} and leaves ${after.length} glyphs after the tree`,
  );
  assert.deepEqual(
    glyphs(press([caption])).map((g) => renderSvg(g)),
    all.filter((g) => !covered.includes(g)).map((g) => renderSvg(g)),
  );
});

test("a glyph within a unit of a caption gives way, and one farther off stays", () => {
  const nodes = press([]);
  const glyph = nodes.find((n, i) => n.tag === "g" && nodes[i - 1]?.tag === "circle") as SvgNode;
  const box = boxOf(glyph);
  const beside = (gap: number): Box => ({ x: box.x + box.w + gap, y: box.y, w: 6, h: 6 });
  const drawn = (caption: Box): boolean => glyphs(press([caption])).some((g) => renderSvg(g) === renderSvg(glyph));
  assert.equal(drawn(beside(0.5)), false, "half a unit off its box, the glyph gives way");
  assert.equal(drawn(beside(1.5)), true, "a unit and a half off, it stays");
});
