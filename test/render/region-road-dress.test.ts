import { test } from "node:test";
import assert from "node:assert/strict";
import { defaultRecipe, generateWorld } from "../../src/world/generate.ts";
import { renderMap } from "../../src/render/map-renderer.ts";
import { closeUp, townWindows } from "../../test-support/region-rivers-fixtures.ts";

const HERO = generateWorld(defaultRecipe(42));

const OPTIONS = { style: "antique", legend: true, widthPx: 1500 } as const;

const dressOf = (tag: string): string => {
  const read = (name: string): string => new RegExp(`${name}="([^"]*)"`).exec(tag)?.[1] ?? "absent";
  return `${read("stroke-width")}|${read("stroke-dasharray")}|${read("stroke-opacity")}`;
};

function roadLayerDresses(svg: string): Set<string> {
  const from = svg.indexOf('<g id="layer-roads">');
  const to = svg.indexOf("</g>", from);
  assert.notEqual(from, -1, "the sheet has a roads layer");
  return new Set([...svg.slice(from, to).matchAll(/<path [^>]*>/g)].map((m) => dressOf(m[0])));
}

function keyDresses(svg: string): Map<string, string> {
  const legend = svg.slice(svg.indexOf('id="layer-legend"'));
  const rows = [...legend.matchAll(/(<path d="M[\d.]+ [\d.]+H[\d.]+"[^>]*>)<text[^>]*>([^<]*)</g)];
  return new Map(rows.map((m) => [m[2] as string, dressOf(m[1] as string)]));
}

test("a close-up draws its roads and their key in the heavier dress, and a world sheet keeps its own (Issue #952)", () => {
  const window = townWindows(HERO, "Laukuwelua")[0];
  assert.ok(window !== undefined, "the capital has a band-1 window");
  const closeSvg = renderMap(closeUp(HERO, window), OPTIONS);
  assert.deepEqual(
    roadLayerDresses(closeSvg),
    new Set(["2.4|6 3.5|1", "1.8|3.2 3|0.9"]),
    "the close-up's trunks and tracks, both ranks present",
  );
  const closeKey = keyDresses(closeSvg);
  assert.equal(closeKey.get("Road"), "2.4|6.0 3.5|1", "the close-up's key draws a road as the sheet does");
  assert.equal(closeKey.get("Track"), "1.8|3.2 3.0|0.9", "the close-up's key draws a track as the sheet does");

  const worldSvg = renderMap(HERO, OPTIONS);
  assert.deepEqual(
    roadLayerDresses(worldSvg),
    new Set(["1.5|5 3.5|0.85", "1|2.5 3.5|0.7"]),
    "the world sheet keeps its own dress, both ranks present",
  );
  const worldKey = keyDresses(worldSvg);
  assert.equal(worldKey.get("Road"), "1.5|5.0 3.5|0.85", "the world sheet's key draws a road as the sheet does");
  assert.equal(worldKey.get("Track"), "1.0|2.5 3.5|0.7", "the world sheet's key draws a track as the sheet does");
});
