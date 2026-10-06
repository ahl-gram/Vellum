import { el, type SvgNode } from "../../render/svg.ts";
import type { MapStyle } from "../../render/style.ts";
import { createRng } from "../../core/rng.ts";
import { PLATE_H, PLATE_W, VIEW_X0, VIEW_X1, type ProspectGeometry } from "../geometry.ts";
import type { ProspectInput } from "../input.ts";
import type { PlateCaption, PlateEra } from "../caption.ts";
import type { PlateKeyEntry } from "../key.ts";
import type { Surroundings } from "../surroundings.ts";
import { viewRight, type ProspectView } from "../transect.ts";
import { createLettering, runBox } from "../letter/letter.ts";
import { engraver, type Engraver } from "./burin.ts";
import { LIFT, RISE_BOTTOM, picture, skylineOf, type Box, type Picture } from "./rise.ts";
import { banderole, cardinalWords, chartRoundel, footerLine, frameNodes, horizonTowns, keyPanel, keyTags, tagSpec, titleCartouche, wreathedArms, type Cardinals, type Inked } from "./furniture.ts";

export type PlateParts = {
  readonly input: ProspectInput;
  readonly g: ProspectGeometry;
  readonly era: PlateEra;
  readonly year: number;
  readonly caption: PlateCaption;
  readonly key: ReadonlyArray<PlateKeyEntry>;
  readonly surroundings: Surroundings;
  readonly suffix: string;
  readonly widthPx?: number;
};

export type FurnitureBoxes = Readonly<Record<"towns" | "cartouche" | "medals" | "key" | "margin", ReadonlyArray<Box>>>;
export type EngravedE = { readonly node: SvgNode; readonly picture: Picture; readonly furniture: FurnitureBoxes };

/** Grid space: x east, y south; the view points from the viewer into the picture (the round's cardinal words). */
export function cardinalsFor(view: ProspectView): Cardinals {
  const word = (dx: number, dy: number): string => (Math.abs(dx) >= Math.abs(dy) ? (dx > 0 ? "Oriens" : "Occidens") : dy > 0 ? "Meridies" : "Septentrio");
  const right = viewRight(view);
  return { far: word(view.dx, view.dy), near: word(-view.dx, -view.dy), right: word(right.dx, right.dy), left: word(-right.dx, -right.dy) };
}

function inkChannels(ink: string): [string, string, string] {
  if (!/^#[0-9a-fA-F]{6}$/.test(ink)) throw new RangeError(`ink token ${ink} is not #rrggbb; the grain matrix needs 6-digit hex`);
  const ch = (i: number): string => (parseInt(ink.slice(i, i + 2), 16) / 255).toFixed(2);
  return [ch(1), ch(3), ch(5)];
}

function parchmentDefs(e: Engraver, suffix: string, grainSeed: number): SvgNode[] {
  if (!e.style.parchmentTexture) return [];
  const [r, g, b] = inkChannels(e.ink);
  return [
    el("filter", { id: `prospect-parch-${suffix}`, x: "0%", y: "0%", width: "100%", height: "100%" }, [
      el("feTurbulence", { type: "fractalNoise", baseFrequency: "0.012 0.014", numOctaves: 3, seed: grainSeed, stitchTiles: "stitch" }),
      el("feColorMatrix", { values: `0 0 0 0 ${r}  0 0 0 0 ${g}  0 0 0 0 ${b}  0.45 0 0 0 0` }),
    ]),
    el("radialGradient", { id: `prospect-vig-${suffix}`, cx: "50%", cy: "48%", r: "72%" }, [
      el("stop", { offset: "62%", "stop-color": e.ink, "stop-opacity": 0 }),
      el("stop", { offset: "100%", "stop-color": e.ink, "stop-opacity": 0.16 }),
    ]),
  ];
}

function parchmentOverlay(e: Engraver, suffix: string): SvgNode[] {
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

const group = (cls: string, parts: ReadonlyArray<Inked>): SvgNode => el("g", { class: cls }, parts.flatMap((p) => p.nodes));

function bandText(p: PlateParts): string {
  if (p.caption.yearLine === null) return p.caption.epithet;
  return p.era === "ruined" ? `founded An. ${p.input.founded}, ${p.caption.epithet}` : `${p.caption.epithet}, founded An. ${p.input.founded}`;
}

export function engraveE(style: MapStyle, p: PlateParts): EngravedE {
  const e = engraver(style);
  const letters = createLettering(p.suffix);
  const fork = (name: string) => createRng(p.g.seed).fork(`prospect:${p.g.index}:e:${name}`);
  const standing = p.era !== "before-founding";
  const tags = p.key.flatMap((k) => (k.x === null || k.y === null ? [] : [{ n: k.letter, x: Math.max(VIEW_X0 + 8, Math.min(VIEW_X1 - 8, k.x)), y: Math.max(40, k.y + LIFT) }]));
  const cartouche = [titleCartouche(e, letters, p.input.name, 44), banderole(e, letters, bandText(p), 70)];
  const medals = [...(standing && p.surroundings.realmProclaimed && p.input.arms !== null ? [wreathedArms(e, p.input.arms, p.suffix)] : []), chartRoundel(e, letters, p.input.seed, p.year)];
  const key = [keyPanel(e, letters, p.key, RISE_BOTTOM), keyTags(e, letters, tags)];
  const margin = [cardinalWords(e, letters, cardinalsFor(p.input.view)), footerLine(e, letters, p.caption.yearLine, p.input.seed)];
  const tagClear = tags.map((t) => { const b = runBox(tagSpec(e, t)); return { x0: b.x0 - 2, x1: b.x1 + 2, y0: b.top - 2, y1: b.bottom + 2 }; });
  const avoid = [...cartouche, ...medals, ...key, ...margin].flatMap((i) => i.boxes);
  const roadTowns = standing ? p.surroundings.roadTowns : [];
  const named = horizonTowns(e, createLettering(p.suffix), roadTowns, p.key, { ...skylineOf(p.g), birds: [], avoid });
  const pic = picture(e, { g: p.g, kind: p.input.kind, era: p.era, arms: p.input.arms, roadCount: p.surroundings.roadCount, beast: p.surroundings.beast !== null, clear: [...tagClear, ...named.boxes] },
    { sky: fork("sky"), town: fork("town"), water: fork("water"), rise: fork("rise"), figures: fork("figures") }, fork("beast"));
  const towns = horizonTowns(e, letters, roadTowns, p.key, { ...pic.vignette, avoid });
  const furniture = [group(`pt-${p.suffix}`, [towns]), group(`pc-${p.suffix}`, cartouche), group(`pd-${p.suffix}`, medals), group(`pk-${p.suffix}`, key), group(`pm-${p.suffix}`, margin), ...frameNodes(e)];
  const grain = (p.g.seed * 31 + p.g.index * 7) % 9973;
  const width = p.widthPx ?? PLATE_W;
  const node = el("svg", {
    class: `pq-${p.suffix}`, xmlns: "http://www.w3.org/2000/svg", viewBox: `0 0 ${PLATE_W} ${PLATE_H}`, width: Math.round(width), height: Math.round((width * PLATE_H) / PLATE_W),
    role: "img", "aria-label": `The prospect of ${p.input.name}, chart ${p.input.seed}`,
  }, [
    el("style", {}, [smallSizeRule(p.suffix)]),
    el("defs", {}, [...parchmentDefs(e, p.suffix, grain), ...letters.defs()]),
    el("rect", { x: 0, y: 0, width: PLATE_W, height: PLATE_H, fill: e.paper }),
    ...pic.nodes,
    ...parchmentOverlay(e, p.suffix),
    ...furniture,
  ]);
  const boxes = (parts: ReadonlyArray<Inked>): Box[] => parts.flatMap((i) => i.boxes);
  return { node, picture: pic, furniture: { towns: towns.boxes, cartouche: boxes(cartouche), medals: boxes(medals), key: boxes(key), margin: boxes(margin) } };
}
