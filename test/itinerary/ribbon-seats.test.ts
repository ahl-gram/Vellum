import test from "node:test";
import assert from "node:assert/strict";
import { generateWorld, defaultRecipe } from "../../src/world/generate.ts";
import { ribbonSvgFor } from "../../src/itinerary/finished.ts";
import { layoutRibbon, stripPos, type StripLayout } from "../../src/itinerary/dress/layout.ts";
import { stripBody } from "../../src/itinerary/dress/cloth.ts";
import { textBox, WIDTH_FACTOR, type Box } from "../../src/render/geometry.ts";
import { r1 } from "../../src/prospect/dress/context.ts";
import type { RibbonInput } from "../../src/itinerary/input.ts";
import { namedJourney } from "../../test-support/ribbon-fixtures.ts";
import {
  plateCaptions,
  sweepJourneys,
  type PlateCaption,
  type PlateCaptionLine,
} from "../../test-support/ribbon-captions.ts";

// The room, written out so it cannot widen with the module it guards: a caption sits 9 inside its strip's long edges (the cloth's on antique, the outer rule on ink), under the continuation line (22 below the strip's top), and above the strip's foot (the inner rule, 3.5 up, on ink); 1e-6 is the float slack of a box slid onto the edge.
const EDGE = 9;
const TOP_CLEAR = 22;
const INK_FOOT = 3.5;
const EPS = 1e-6;

type Dress = "antique" | "ink";
type Plate = {
  readonly seed: number;
  readonly input: RibbonInput;
  readonly dress: Dress;
  readonly svg: string;
  readonly strips: ReadonlyArray<StripLayout>;
  readonly captions: ReadonlyArray<PlateCaption>;
};

const plates: Plate[] = sweepJourneys().flatMap(({ seed, input }) =>
  (["antique", "ink"] as const).map((dress) => {
    const svg = ribbonSvgFor(input, dress);
    const strips = layoutRibbon(input).strips;
    return { seed, input, dress, svg, strips, captions: plateCaptions(svg, strips) };
  }),
);

const worldOf = new Map<number, ReturnType<typeof generateWorld>>();
const world = (seed: number): ReturnType<typeof generateWorld> => {
  if (!worldOf.has(seed)) worldOf.set(seed, generateWorld(defaultRecipe(seed)));
  return worldOf.get(seed) as ReturnType<typeof generateWorld>;
};
const road42 = namedJourney(world(42), "Laukuwelua", "Homaitani");

function roomOf(
  dress: Dress,
  strip: StripLayout,
): { left: (y: number) => number; right: (y: number) => number; foot: number } {
  if (dress === "antique") {
    const body = stripBody(strip);
    return { left: body.left, right: body.right, foot: strip.y0 + strip.h };
  }
  return { left: () => strip.x0, right: () => strip.x0 + strip.w, foot: strip.y0 + strip.h - INK_FOOT };
}

function heights(box: Box): number[] {
  const ys = [box.y];
  for (let y = Math.ceil(box.y + EPS); y < box.y + box.h; y++) ys.push(y);
  ys.push(box.y + box.h);
  return ys;
}

function pastRoom(dress: Dress, strip: StripLayout, box: Box): number {
  const room = roomOf(dress, strip);
  let past = Math.max(strip.y0 + TOP_CLEAR - box.y, box.y + box.h - room.foot, 0);
  for (const y of heights(box))
    past = Math.max(past, room.left(y) + EDGE - box.x, box.x + box.w - (room.right(y) - EDGE));
  return past;
}

type LineAt = { readonly plate: Plate; readonly caption: PlateCaption; readonly line: PlateCaptionLine };
const linesOf = (dress: Dress): LineAt[] =>
  plates
    .filter((p) => p.dress === dress)
    .flatMap((plate) => plate.captions.flatMap((caption) => caption.lines.map((line) => ({ plate, caption, line }))));
const where = (a: LineAt): string =>
  `seed ${a.plate.seed} ${a.plate.input.fromName} to ${a.plate.input.toName}, strip ${a.caption.strip.index}, "${a.line.text}"`;

const branchEnd = (input: RibbonInput, toName: string): { sx: number; sy: number } => {
  const strips = layoutRibbon(input).strips;
  const e = input.events.find((x) => x.kind === "branch" && x.toName === toName);
  assert.ok(e?.kind === "branch", `premise: the road has a side road to ${toName}`);
  const strip = strips.find((s) => e.dist >= s.d0 && e.dist < s.d1) as StripLayout;
  const p = stripPos(strip, e.dist);
  return { sx: p.sx + e.side * 20, sy: p.sy - 9 };
};

test("every caption sits inside its own strip, nine inside its edge, on any journey, in both dresses", () => {
  const lamahai = branchEnd(road42, "Lamahai");
  const strip = layoutRibbon(road42).strips.find((s) => lamahai.sx > s.x0 && lamahai.sx < s.x0 + s.w) as StripLayout;
  const today = textBox(lamahai.sx + 10, lamahai.sy + 2.6 + 8.2, "to Lamahai", 8.2, "start", WIDTH_FACTOR.mixed);
  assert.ok(
    pastRoom("antique", strip, today) > 0,
    `premise: today's seat for "to Lamahai" (start-anchored at ${r1(lamahai.sx + 10)}) runs past the room's right edge`,
  );
  for (const dress of ["antique", "ink"] as const) {
    const lines = linesOf(dress);
    assert.ok(plates.filter((p) => p.dress === dress).length >= 70, `${dress}: the sweep is real`);
    assert.ok(lines.length >= 500, `${dress}: and it found captions to measure: ${lines.length} lines`);
    const worst = lines.reduce((a, b) =>
      pastRoom(dress, b.caption.strip, b.line.box) > pastRoom(dress, a.caption.strip, a.line.box) ? b : a,
    );
    const past = pastRoom(dress, worst.caption.strip, worst.line.box);
    assert.ok(
      past <= EPS,
      `${dress}: a caption must lie inside its strip's room. Worst ${past.toFixed(2)} past: ${where(worst)}`,
    );
  }
});
