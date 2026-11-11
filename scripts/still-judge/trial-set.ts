import { join } from "node:path";
import { svgDimensions } from "../../src/cli/raster.ts";
import { renderMap } from "../../src/render/map-renderer.ts";
import { defaultRecipe, generateWorld } from "../../src/world/generate.ts";
import type { Shot } from "../design/shoot.ts";
import type { Kind } from "./questions.ts";
import { cropClip, RESTAGES, withStyle, witnessProbe, type RestageId } from "./restage.ts";

// 2026-11-11, Issue #1309: the 30 charts the live trial scored, the first from 1 whose sheets carried every subject its five restages then needed; a question reworded after its score is scored again on charts from 36 up.
export const TRIAL_SEEDS: readonly number[] = [
  1, 2, 4, 5, 6, 7, 8, 9, 10, 11, 12, 14, 15, 16, 17, 19, 20, 21, 22, 24, 25, 26, 27, 28, 29, 31, 32, 33, 34, 35,
];
export const REASKED_SEEDS = 10;
export type Arm = "clean" | RestageId;
export type TrialStill = {
  readonly seed: number;
  readonly kind: Kind;
  readonly arm: Arm;
  readonly svg: string;
  readonly png: string;
};
export type SheetFile = { readonly name: string; readonly text: string };

export const sheetsOf = (seed: number): { sheet: string; rain: string } => {
  const world = generateWorld(defaultRecipe(seed));
  return {
    sheet: renderMap(world, { style: "antique", legend: true }),
    rain: renderMap(world, { style: "antique", legend: true, theme: "moisture" }),
  };
};

export const stillsOf = (seed: number, sheet: string, rain: string): { files: SheetFile[]; stills: TrialStill[] } => {
  const files: SheetFile[] = [
    { name: `${seed}-sheet-clean.svg`, text: sheet },
    { name: `${seed}-rain-clean.svg`, text: rain },
  ];
  const stills: TrialStill[] = [
    { seed, kind: "sheet", arm: "clean", svg: `${seed}-sheet-clean.svg`, png: `stills/${seed}-sheet-clean.png` },
    { seed, kind: "rainfall", arm: "clean", svg: `${seed}-rain-clean.svg`, png: `stills/${seed}-rainfall-clean.png` },
  ];
  for (const r of RESTAGES) {
    const name = `${seed}-${r.kind === "rainfall" ? "rain" : "sheet"}-${r.id}.svg`;
    files.push({ name, text: withStyle(r.kind === "rainfall" ? rain : sheet, r.css) });
    stills.push({ seed, kind: r.kind, arm: r.id, svg: name, png: `stills/${seed}-${r.kind}-${r.id}.png` });
  }
  stills.push({ seed, kind: "crop", arm: "clean", svg: `${seed}-sheet-clean.svg`, png: `stills/${seed}-crop-clean.png` });
  return { files, stills };
};

export const shotsOf = (dir: string, stills: readonly TrialStill[], files: ReadonlyMap<string, string>): Shot[] =>
  stills.map((s) => {
    const svg = files.get(s.svg)!;
    const { width, height } = svgDimensions(svg);
    const r = RESTAGES.find((x) => x.id === s.arm);
    return {
      url: `/${s.svg}`,
      width,
      height,
      mobile: false,
      out: join(dir, s.png),
      waitMs: 200,
      ...(r === undefined ? {} : { probe: witnessProbe(r) }),
      ...(s.kind === "crop" ? { clip: cropClip(svg) } : {}),
    };
  });

export const reaskedOf = (stills: readonly TrialStill[], seeds: readonly number[], count: number): TrialStill[] =>
  stills.filter((s) => s.arm === "clean" && seeds.slice(0, count).includes(s.seed));
