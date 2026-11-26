import type { SvgNode } from "../../render/svg.ts";
import type { MapStyle } from "../../render/style.ts";
import { createRng } from "../../core/rng.ts";
import { VIEW_X0, VIEW_X1, type ProspectGeometry } from "../geometry.ts";
import type { ProspectInput } from "../input.ts";
import type { PlateCaption, PlateEra } from "../caption.ts";
import type { PlateKeyEntry } from "../key.ts";
import type { Surroundings } from "../surroundings.ts";
import { createLettering, runBox, type Lettering } from "../letter/letter.ts";
import { engraver, type Engraver } from "./burin.ts";
import { LIFT, RISE_BOTTOM, skylineOf, type Box } from "./rise.ts";
import { picture, type Picture } from "./rise-picture.ts";
import {
  banderole,
  cardinalWords,
  chartRoundel,
  footerLine,
  frameNodes,
  horizonTowns,
  keyPanel,
  keyTags,
  tagSpec,
  titleCartouche,
  wreathedArms,
  type Inked,
} from "./furniture.ts";
import { bandText, cardinalsFor, furnitureGroup, plateSheet } from "./plate-sheet.ts";

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

export { SMALL_WIDTH, SMALLEST_WIDTH, smallSizeRule } from "./plate-sheet.ts";

function fixedFurniture(p: PlateParts, e: Engraver, letters: Lettering, standing: boolean) {
  const tags = p.key.flatMap((k) =>
    k.x === null || k.y === null
      ? []
      : [{ n: k.letter, x: Math.max(VIEW_X0 + 8, Math.min(VIEW_X1 - 8, k.x)), y: Math.max(40, k.y + LIFT) }],
  );
  const cartouche = [
    titleCartouche(e, letters, p.input.name, 44),
    banderole(e, letters, bandText(p.caption, p.era, p.input.founded), 70),
  ];
  const medals = [
    ...(standing && p.surroundings.realmProclaimed && p.input.arms !== null
      ? [wreathedArms(e, p.input.arms, p.suffix)]
      : []),
    chartRoundel(e, letters, p.input.seed, p.year),
  ];
  const key = [keyPanel(e, letters, p.key, RISE_BOTTOM), keyTags(e, letters, tags)];
  const margin = [
    cardinalWords(e, letters, cardinalsFor(p.input.view)),
    footerLine(e, letters, p.caption.yearLine, p.input.seed),
  ];
  const tagClear = tags.map((t) => {
    const b = runBox(tagSpec(e, t));
    return { x0: b.x0 - 2, x1: b.x1 + 2, y0: b.top - 2, y1: b.bottom + 2 };
  });
  return { cartouche, medals, key, margin, tagClear };
}

export function engraveE(style: MapStyle, p: PlateParts): EngravedE {
  const e = engraver(style);
  const letters = createLettering(p.suffix);
  const fork = (name: string) => createRng(p.g.seed).fork(`prospect:${p.g.index}:e:${name}`);
  const standing = p.era !== "before-founding";
  const { cartouche, medals, key, margin, tagClear } = fixedFurniture(p, e, letters, standing);
  const avoid = [...cartouche, ...medals, ...key, ...margin].flatMap((i) => i.boxes);
  const roadTowns = standing ? p.surroundings.roadTowns : [];
  const named = horizonTowns(e, createLettering(p.suffix), roadTowns, p.key, { ...skylineOf(p.g), birds: [], avoid });
  const pic = picture(
    e,
    {
      g: p.g,
      kind: p.input.kind,
      era: p.era,
      arms: p.input.arms,
      roadCount: p.surroundings.roadCount,
      beast: p.surroundings.beast !== null,
      clear: [...tagClear, ...named.boxes],
    },
    { sky: fork("sky"), town: fork("town"), water: fork("water"), rise: fork("rise"), figures: fork("figures") },
    fork("beast"),
  );
  const towns = horizonTowns(e, letters, roadTowns, p.key, { ...pic.vignette, avoid });
  const furniture = [
    furnitureGroup(`pt-${p.suffix}`, [towns]),
    furnitureGroup(`pc-${p.suffix}`, cartouche),
    furnitureGroup(`pd-${p.suffix}`, medals),
    furnitureGroup(`pk-${p.suffix}`, key),
    furnitureGroup(`pm-${p.suffix}`, margin),
    ...frameNodes(e),
  ];
  const node = plateSheet({
    suffix: p.suffix,
    ...(p.widthPx === undefined ? {} : { widthPx: p.widthPx }),
    label: `The prospect of ${p.input.name}, chart ${p.input.seed}`,
    e,
    letters,
    grain: (p.g.seed * 31 + p.g.index * 7) % 9973,
    picture: pic.nodes,
    furniture,
  });
  const boxes = (parts: ReadonlyArray<Inked>): Box[] => parts.flatMap((i) => i.boxes);
  return {
    node,
    picture: pic,
    furniture: {
      towns: towns.boxes,
      cartouche: boxes(cartouche),
      medals: boxes(medals),
      key: boxes(key),
      margin: boxes(margin),
    },
  };
}
