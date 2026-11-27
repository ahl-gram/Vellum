import { el, type SvgNode } from "../../render/svg.ts";
import type { MapStyle } from "../../render/style.ts";
import { createRng } from "../../core/rng.ts";
import { clamp } from "../../core/math.ts";
import { PLATE_H, PLATE_W, VIEW_X0, VIEW_X1 } from "../geometry.ts";
import type { ProspectInput } from "../input.ts";
import type { PlateCaption } from "../caption.ts";
import type { Surroundings } from "../surroundings.ts";
import { createLettering, runBox, type Lettering, type RunSpec } from "../letter/letter.ts";
import type { BirdseyeGeometry, Box } from "../birdseye/types.ts";
import { SAMPLE_STEP, SX, VIEW_BOTTOM, VIEW_TOP } from "../birdseye/window.ts";
import { SEA_NAME_RUN } from "../birdseye/names.ts";
import { engraver, stroke, type Engraver } from "./burin.ts";
import { bankOf } from "./birdseye-bank.ts";
import { landNodes, scatterNodes, seaNodes } from "./birdseye-land.ts";
import { harbourNodes, neighbourNodes, townNodes } from "./birdseye-town.ts";
import {
  banderole,
  cardinalWords,
  chartRoundel,
  footerLine,
  frameNodes,
  keyPanel,
  keyTags,
  titleCartouche,
  wreathedArms,
} from "./furniture.ts";
import { bandText, boxesOf, cardinalsFor, furnitureGroup, plateSheet } from "./plate-sheet.ts";

export type PlateCParts = {
  readonly input: ProspectInput;
  readonly geometry: BirdseyeGeometry;
  readonly year: number;
  readonly caption: PlateCaption;
  readonly surroundings: Surroundings;
  readonly suffix: string;
  readonly widthPx?: number;
};
export type CBoxes = {
  readonly seaName: Box | null;
  readonly names: ReadonlyArray<Box>;
  readonly key: ReadonlyArray<Box>;
  readonly bank: Box;
  readonly town: Box | null;
  readonly ships: ReadonlyArray<Box>;
};
export type EngravedC = { readonly node: SvgNode; readonly boxes: CBoxes };

const apart = (a: Box, b: Box): boolean => a.x1 <= b.x0 || b.x1 <= a.x0 || a.y1 <= b.y0 || b.y1 <= a.y0;

const padded = (b: { x0: number; x1: number; top: number; bottom: number }, by: number): Box => ({
  x0: b.x0 - by,
  x1: b.x1 + by,
  y0: b.top - by,
  y1: b.bottom + by,
});

function neighbourNames(e: Engraver, letters: Lettering, g: BirdseyeGeometry) {
  const nodes: SvgNode[] = [];
  const boxes: Box[] = [];
  for (const n of g.neighbours) {
    const spec: RunSpec = {
      text: n.name,
      x: n.x,
      y: n.y - 8,
      size: 6.2,
      italic: true,
      anchor: "middle",
      fill: e.ink,
      halo: { color: e.paper, width: 1.8 },
    };
    boxes.push({ x0: n.x - 7, x1: n.x + 7, y0: n.y - 6, y1: n.y + 4 }, padded(runBox(spec), 1));
    nodes.push(letters.run(spec));
  }
  return { nodes, boxes };
}

function seaNameAt(e: Engraver, letters: Lettering, g: BirdseyeGeometry, avoid: ReadonlyArray<Box>) {
  if (g.seaName === null) return null;
  const { text, bands } = g.seaName;
  const spec = (x: number, y: number): RunSpec => ({ text, x, y, ...SEA_NAME_RUN, fill: e.ink, opacity: 0.8 });
  const whole = runBox(spec(0, 0));
  const half = (whole.x1 - whole.x0) / 2;
  const col = SAMPLE_STEP * SX;
  for (const band of bands) {
    const lo = Math.max(band.x0 + half, VIEW_X0 + half + 6);
    const hi = Math.min(band.x1 - half, VIEW_X1 - half - 6);
    if (lo > hi) continue;
    const mid = clamp((band.x0 + band.x1) / 2, lo, hi);
    for (let k = 0; mid + k * col <= hi || mid - k * col >= lo; k++) {
      for (const x of k === 0 ? [mid] : [mid + k * col, mid - k * col]) {
        if (x < lo || x > hi) continue;
        const box = runBox(spec(x, band.y));
        if (box.x0 < band.x0 || box.x1 > band.x1) continue;
        const clear = padded(box, 2);
        if (avoid.every((a) => apart(clear, a)))
          return { node: letters.run(spec(x, band.y)), box: { x0: box.x0, x1: box.x1, y0: box.top, y1: box.bottom } };
      }
    }
  }
  return null;
}

export function engraveC(style: MapStyle, p: PlateCParts): EngravedC {
  const g = p.geometry;
  const era = g.era;
  const e = engraver(style);
  const letters = createLettering(p.suffix);
  const fork = (name: string) => createRng(p.input.seed).fork(`prospect:${p.input.index}:c:${name}`);
  const standing = era !== "before-founding";
  const tags = g.key.flatMap((k) =>
    k.x === null || k.y === null
      ? []
      : [{ n: k.letter, x: clamp(k.x, VIEW_X0 + 8, VIEW_X1 - 8), y: Math.max(VIEW_TOP + 10, k.y) }],
  );
  const cartouche = [
    titleCartouche(e, letters, p.input.name, 44),
    banderole(e, letters, bandText(p.caption, era, p.input.founded), 70),
  ];
  const medals = [
    ...(standing && p.surroundings.realmProclaimed && p.input.arms !== null
      ? [wreathedArms(e, p.input.arms, p.suffix)]
      : []),
    chartRoundel(e, letters, p.input.seed, p.year),
  ];
  const key = [keyPanel(e, letters, g.key, VIEW_BOTTOM + 4, VIEW_X1), keyTags(e, letters, tags)];
  const margin = [
    cardinalWords(e, letters, cardinalsFor(p.input.view)),
    footerLine(e, letters, p.caption.yearLine, p.input.seed),
  ];
  const bank = bankOf(
    e,
    { kind: p.input.kind, harbor: p.input.harbor, roads: p.surroundings.roadCount, era, arms: p.input.arms },
    fork("bank"),
  );
  const names = neighbourNames(e, letters, g);
  const ships = g.harbour.ships.map((s) => ({
    x0: s.x - 16 * s.s,
    x1: s.x + 16 * s.s,
    y0: s.y - 30 * s.s,
    y1: s.y + 8 * s.s,
  }));
  const townBox = g.town === null ? null : g.town.extent;
  const keyBoxes = boxesOf(key);
  const sea = seaNameAt(e, letters, g, [
    ...(townBox === null ? [] : [townBox]),
    ...ships,
    ...names.boxes,
    ...keyBoxes,
    bank.box,
  ]);
  const picture: SvgNode[] = [
    ...seaNodes(e, fork("water")),
    ...landNodes(e, g),
    ...scatterNodes(e, g.scatter, fork("trees")),
    ...(g.town === null ? [] : townNodes(e, g.town)),
    ...harbourNodes(e, g.harbour),
    ...neighbourNodes(e, g.neighbours),
    el("rect", { x: 0, y: 0, width: PLATE_W, height: VIEW_TOP, fill: e.paper }),
    el("rect", { x: 0, y: VIEW_BOTTOM, width: PLATE_W, height: PLATE_H - VIEW_BOTTOM, fill: e.paper }),
    el("rect", { x: 0, y: 0, width: VIEW_X0, height: PLATE_H, fill: e.paper }),
    el("rect", { x: VIEW_X1, y: 0, width: PLATE_W - VIEW_X1, height: PLATE_H, fill: e.paper }),
    el("rect", {
      x: VIEW_X0,
      y: VIEW_TOP,
      width: VIEW_X1 - VIEW_X0,
      height: VIEW_BOTTOM - VIEW_TOP,
      fill: "none",
      ...stroke(e, 0.8),
    }),
    ...bank.nodes,
  ];
  const furniture = [
    el("g", { class: `pt-${p.suffix}` }, [...names.nodes, ...(sea === null ? [] : [sea.node])]),
    furnitureGroup(`pc-${p.suffix}`, cartouche),
    furnitureGroup(`pd-${p.suffix}`, medals),
    furnitureGroup(`pk-${p.suffix}`, key),
    furnitureGroup(`pm-${p.suffix}`, margin),
    ...frameNodes(e),
  ];
  const node = plateSheet({
    suffix: p.suffix,
    ...(p.widthPx === undefined ? {} : { widthPx: p.widthPx }),
    label: `The bird's-eye of ${p.input.name}, chart ${p.input.seed}`,
    e,
    letters,
    grain: (p.input.seed * 31 + p.input.index * 7) % 9973,
    picture,
    furniture,
  });
  return {
    node,
    boxes: {
      seaName: sea === null ? null : sea.box,
      names: names.boxes,
      key: keyBoxes,
      bank: bank.box,
      town: townBox,
      ships,
    },
  };
}
