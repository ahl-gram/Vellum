import { el, type SvgNode } from "../../render/svg.ts";
import { PLATE_H, PLATE_W } from "../geometry.ts";
import type { PlateCaption, PlateEra } from "../caption.ts";
import { viewRight, type ProspectView } from "../transect.ts";
import type { Lettering } from "../letter/letter.ts";
import type { Engraver } from "./burin.ts";
import type { Cardinals, Inked } from "./furniture.ts";

/** Grid space: x east, y south; the view points from the viewer into the picture (the round's cardinal words). */
export function cardinalsFor(view: ProspectView): Cardinals {
  const word = (dx: number, dy: number): string =>
    Math.abs(dx) >= Math.abs(dy) ? (dx > 0 ? "Oriens" : "Occidens") : dy > 0 ? "Meridies" : "Septentrio";
  const right = viewRight(view);
  return {
    far: word(view.dx, view.dy),
    near: word(-view.dx, -view.dy),
    right: word(right.dx, right.dy),
    left: word(-right.dx, -right.dy),
  };
}

function inkChannels(ink: string): [string, string, string] {
  if (!/^#[0-9a-fA-F]{6}$/.test(ink))
    throw new RangeError(`ink token ${ink} is not #rrggbb; the grain matrix needs 6-digit hex`);
  const ch = (i: number): string => (parseInt(ink.slice(i, i + 2), 16) / 255).toFixed(2);
  return [ch(1), ch(3), ch(5)];
}

export function parchmentDefs(e: Engraver, suffix: string, grainSeed: number): SvgNode[] {
  if (!e.style.parchmentTexture) return [];
  const [r, g, b] = inkChannels(e.ink);
  return [
    el("filter", { id: `prospect-parch-${suffix}`, x: "0%", y: "0%", width: "100%", height: "100%" }, [
      el("feTurbulence", {
        type: "fractalNoise",
        baseFrequency: "0.012 0.014",
        numOctaves: 3,
        seed: grainSeed,
        stitchTiles: "stitch",
      }),
      el("feColorMatrix", { values: `0 0 0 0 ${r}  0 0 0 0 ${g}  0 0 0 0 ${b}  0.45 0 0 0 0` }),
    ]),
    el("radialGradient", { id: `prospect-vig-${suffix}`, cx: "50%", cy: "48%", r: "72%" }, [
      el("stop", { offset: "62%", "stop-color": e.ink, "stop-opacity": 0 }),
      el("stop", { offset: "100%", "stop-color": e.ink, "stop-opacity": 0.16 }),
    ]),
  ];
}

export function parchmentOverlay(e: Engraver, suffix: string): SvgNode[] {
  if (!e.style.parchmentTexture) return [];
  return [
    el("rect", { x: 0, y: 0, width: PLATE_W, height: PLATE_H, filter: `url(#prospect-parch-${suffix})`, opacity: 0.5 }),
    el("rect", { x: 0, y: 0, width: PLATE_W, height: PLATE_H, fill: `url(#prospect-vig-${suffix})` }),
  ];
}

export const SMALL_WIDTH = 400;
export const SMALLEST_WIDTH = 240;
export const smallSizeRule = (suffix: string): string =>
  `.pq-${suffix}{container-type:inline-size}@container (max-width: ${SMALL_WIDTH}px){.pk-${suffix},.pt-${suffix},.pm-${suffix}{display:none}}@container (max-width: ${SMALLEST_WIDTH}px){.pc-${suffix},.pd-${suffix}{display:none}}`;

export const furnitureGroup = (cls: string, parts: ReadonlyArray<Inked>): SvgNode =>
  el(
    "g",
    { class: cls },
    parts.flatMap((p) => p.nodes),
  );

export function bandText(caption: PlateCaption, era: PlateEra, founded: number): string {
  if (caption.yearLine === null) return caption.epithet;
  return era === "ruined" ? `founded An. ${founded}, ${caption.epithet}` : `${caption.epithet}, founded An. ${founded}`;
}

export type SheetParts = {
  readonly suffix: string;
  readonly widthPx?: number;
  readonly label: string;
  readonly e: Engraver;
  readonly letters: Lettering;
  readonly grain: number;
  readonly picture: ReadonlyArray<SvgNode>;
  readonly furniture: ReadonlyArray<SvgNode>;
};

export function plateSheet(s: SheetParts): SvgNode {
  const width = s.widthPx ?? PLATE_W;
  return el(
    "svg",
    {
      class: `pq-${s.suffix}`,
      xmlns: "http://www.w3.org/2000/svg",
      viewBox: `0 0 ${PLATE_W} ${PLATE_H}`,
      width: Math.round(width),
      height: Math.round((width * PLATE_H) / PLATE_W),
      role: "img",
      "aria-label": s.label,
    },
    [
      el("style", {}, [smallSizeRule(s.suffix)]),
      el("defs", {}, [...parchmentDefs(s.e, s.suffix, s.grain), ...s.letters.defs()]),
      el("rect", { x: 0, y: 0, width: PLATE_W, height: PLATE_H, fill: s.e.paper }),
      ...s.picture,
      ...parchmentOverlay(s.e, s.suffix),
      ...s.furniture,
    ],
  );
}
