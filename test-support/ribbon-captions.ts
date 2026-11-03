import { textBox, WIDTH_FACTOR, type Box } from "../src/render/geometry.ts";
import { unescapeXml } from "../src/render/svg.ts";
import { defaultRecipe, generateWorld } from "../src/world/generate.ts";
import type { RibbonInput } from "../src/itinerary/input.ts";
import type { StripLayout } from "../src/itinerary/dress/layout.ts";
import { attrsOf } from "./dress-svg.ts";
import { capitalJourneys, namedJourney, stripNearestX } from "./ribbon-fixtures.ts";

export type PlateCaptionLine = {
  readonly text: string;
  readonly x: number;
  readonly y: number;
  readonly size: number;
  readonly anchor: "start" | "end" | "middle";
  readonly caps: boolean;
  readonly backed: boolean;
  readonly box: Box;
};

export type PlateCaption = { readonly lines: ReadonlyArray<PlateCaptionLine>; readonly strip: StripLayout };

export function plateCaptions(svg: string, strips: ReadonlyArray<StripLayout>): PlateCaption[] {
  const out: PlateCaption[] = [];
  for (const group of svg.matchAll(/<g class="caption">(.*?)<\/g>/gs)) {
    const lines: PlateCaptionLine[] = [];
    for (const t of (group[1] as string).matchAll(/<text ([^>]*)>([^<]*)<\/text>/g)) {
      const a = attrsOf(t[1] as string);
      const caps = a["letter-spacing"] !== undefined;
      const size = Number(a["font-size"]);
      const anchor = a["text-anchor"] as PlateCaptionLine["anchor"];
      const text = unescapeXml(t[2] as string);
      const x = Number(a.x);
      const y = Number(a.y);
      const box = textBox(x, y, text, size, anchor, caps ? WIDTH_FACTOR.caps : WIDTH_FACTOR.mixed, caps ? 0.8 : 0);
      lines.push({ text, x, y, size, anchor, caps, backed: a["paint-order"] === "stroke", box });
    }
    const first = lines[0];
    if (first === undefined) throw new Error(`plateCaptions: a caption group holds no text: ${group[0].slice(0, 120)}`);
    out.push({ lines, strip: stripNearestX(strips, first.box.x + first.box.w / 2) });
  }
  return out;
}

export function sweepJourneys(): Array<{ readonly seed: number; readonly input: RibbonInput }> {
  const worlds = new Map<number, ReturnType<typeof generateWorld>>();
  const worldOf = (seed: number): ReturnType<typeof generateWorld> => {
    if (!worlds.has(seed)) worlds.set(seed, generateWorld(defaultRecipe(seed)));
    return worlds.get(seed) as ReturnType<typeof generateWorld>;
  };
  const all: Array<{ readonly seed: number; readonly input: RibbonInput }> = [];
  for (const seed of [99, 15, 42]) for (const input of capitalJourneys(worldOf(seed))) all.push({ seed, input });
  for (const [seed, from, to] of [
    [99, "Taliport", "Ceasairmere"],
    [15, "Stanbyl", "Gistel"],
    [2, "Skorsty", "Zakvigrad"],
  ] as const)
    all.push({ seed, input: namedJourney(worldOf(seed), from, to) });
  const seen = new Set<string>();
  return all.filter(({ seed, input }) => {
    const key = `${seed}/${input.fromIdx}-${input.toIdx}`;
    if (seen.has(key)) return false;
    seen.add(key);
    return true;
  });
}
