import { BIOMES } from "../../climate/biomes.ts";
import { clamp } from "../../core/math.ts";
import { chaikinSmooth } from "../../terrain/contours.ts";
import { el, type SvgNode } from "../svg.ts";
import { centroidOf, principalAngle, spacedTextBox, textBox } from "../geometry.ts";
import { largestBlob } from "../blobs.ts";
import type { RenderCtx } from "../context.ts";
import { reachPlacements, type RiverLabelPlacement } from "./river-label-placement.ts";
import { placeRealmLabel } from "./realm-label-placement.ts";

const FOREST_BIOMES: ReadonlySet<number> = new Set<number>([
  BIOMES.temperateForest,
  BIOMES.rainforest,
  BIOMES.tropicalForest,
  BIOMES.jungle,
  BIOMES.taiga,
]);

/** Offsets tried (in order) when a feature label's first spot is taken. */
function offsetCandidates(y: number, k: number): number[] {
  return [y, y - 26 * k, y + 26 * k, y - 52 * k, y + 52 * k];
}

export type RealmAnchor = {
  readonly realm: number;
  /** Center and half-extents of the placed realm label box, so a shield can be
   *  tried on any side of it. */
  readonly cx: number;
  readonly cy: number;
  readonly halfW: number;
  readonly halfH: number;
};

/** Sea name, named rivers along their courses, mountain range, forest. */
export function featureLabelsLayer(ctx: RenderCtx): {
  defs: SvgNode[];
  node: SvgNode;
  realmAnchors: RealmAnchor[];
} {
  const { world, proj, style, labels } = ctx;
  const k = proj.widthPx / 1500;
  const { w, h } = world.elev;
  const defs: SvgNode[] = [];
  const nodes: SvgNode[] = [];
  const realmAnchors: RealmAnchor[] = [];

  // --- sea label in open water, shrinking until it fits ---
  const deep: Array<{ px: number; py: number; d: number }> = [];
  for (let gy = 3; gy < h - 3; gy += 2) {
    for (let gx = 3; gx < w - 3; gx += 2) {
      const d = world.oceanDist[gx + gy * w] as number;
      if (d >= 5) deep.push({ px: proj.px(gx), py: proj.py(gy), d });
    }
  }
  deep.sort((a, b) => b.d - a.d);
  let seaPlaced = false;
  for (const fsBase of [26, 21, 17]) {
    if (seaPlaced) break;
    const fs = fsBase * k;
    const ls = fsBase * 0.19 * k;
    for (const cand of deep) {
      const box = spacedTextBox(cand.px, cand.py, world.names.sea, fs, ls);
      if (box.x < proj.margin + 8 || box.x + box.w > proj.widthPx - proj.margin - 8) continue;
      if (box.y < proj.margin + 8 || box.y + box.h > proj.heightPx - proj.margin - 8) continue;
      if (!labels.tryClaim(box, 8)) continue;
      nodes.push(
        el(
          "text",
          {
            x: cand.px, y: cand.py, "text-anchor": "middle",
            "font-family": style.fontFamilyTitle,
            "font-size": fs.toFixed(1),
            "font-style": "italic",
            "letter-spacing": ls.toFixed(1),
            fill: style.inkSoft,
            "fill-opacity": 0.85,
          },
          [world.names.sea],
        ),
      );
      seaPlaced = true;
      break;
    }
  }

  // --- realm names over their heartlands ---
  world.names.realms.forEach((name, realm) => {
    const blob = largestBlob(w, h, (i) => world.realms.labels[i] === realm);
    // A realm with no cells cannot be labelled anywhere; every other realm gets a
    // name, however small or however crowded its heartland (#145).
    if (blob.length === 0) return;
    const pts = blob.map((i) => ({
      x: proj.px(i % w),
      y: proj.py((i / w) | 0),
    }));
    const c = centroidOf(pts);
    const fs = 16.5 * k;
    const ls = 4 * k;
    const { x: placedX, y: placedY } = placeRealmLabel({
      blob,
      gridW: w,
      proj,
      centroid: c,
      yCandidates: offsetCandidates(c.y, k),
      name,
      fs,
      ls,
      arena: labels,
    });
    // The label renders all-caps (name.toUpperCase() below), which runs wider
    // than spacedTextBox's 0.56 mixed-case factor. Size the shield anchor with a
    // caps-aware width so a side-placed coat of arms clears the final letters
    // instead of tucking over them. (Anchor-only: heraldry consumes this, so it
    // does not move the no-arms committed charts.)
    const labelW = name.length * (fs * 0.72 + ls);
    realmAnchors.push({ realm, cx: placedX, cy: placedY - 0.4 * fs, halfW: labelW / 2, halfH: 0.6 * fs });
    nodes.push(
      el(
        "text",
        {
          x: placedX, y: placedY, "text-anchor": "middle",
          "font-family": style.fontFamilyTitle,
          "font-size": fs.toFixed(1),
          // #158: bold + near-opaque + a fatter halo so a realm name reads over
          // mountains and forests. Size is held (see fs above): it is the only one
          // of these that feeds tryClaim, so changing it could unplace a label.
          "font-weight": 700,
          "letter-spacing": ls.toFixed(1),
          fill: style.labelColor,
          "fill-opacity": 0.9,
          stroke: style.labelHalo,
          "stroke-width": 3.8 * k,
          "paint-order": "stroke",
        },
        [name.toUpperCase()],
      ),
    );
  });

  // --- river names along the straightest reach of each course ---
  // longest first so the major rivers win label space; collision avoidance
  // (tryClaim) then limits density, so the count adapts to the chart size
  const named = [...world.names.rivers.entries()]
    .map(([idx, name]) => ({ river: world.rivers[idx]!, name }))
    .sort((a, b) => b.river.points.length - a.river.points.length);

  for (const { river, name } of named) {
    const raw = river.points.map((p) => [proj.px(p.x), proj.py(p.y)] as const);
    const pts = chaikinSmooth(raw, false, 2);
    const fs = 10.5 * k;
    // Try the straightest reach first, then spread alternatives, so a river
    // whose best spot is taken can still label a free stretch elsewhere. Each
    // tryClaim only reserves on success, so failed candidates cost nothing.
    let place: RiverLabelPlacement | null = null;
    for (const cand of reachPlacements(pts, name.length * fs * 0.52)) {
      if (labels.tryClaim(textBox(cand.x, cand.y - 4 * k, name, fs, "middle"), 2)) {
        place = cand;
        break;
      }
    }
    if (!place) continue;
    nodes.push(
      el(
        "text",
        {
          x: place.x.toFixed(1),
          y: place.y.toFixed(1),
          "text-anchor": "middle",
          transform: `rotate(${place.angleDeg.toFixed(1)} ${place.x.toFixed(1)} ${place.y.toFixed(1)})`,
          "font-family": style.fontFamily,
          "font-size": fs.toFixed(1),
          "font-style": "italic",
          fill: style.river,
          stroke: style.labelHalo,
          "stroke-width": (2.4 * k).toFixed(1),
          "paint-order": "stroke",
          "stroke-linejoin": "round",
        },
        [el("tspan", { dy: (-4 * k).toFixed(1) }, [name])],
      ),
    );
  }

  // --- lake names at their centroids ---
  for (const lake of world.names.lakes) {
    const lx = proj.px(lake.x);
    const ly = proj.py(lake.y);
    const fs = 11.5 * k;
    const placedY = [ly, ly - 15 * k, ly + 15 * k].find((cy) =>
      labels.tryClaim(textBox(lx, cy, lake.name, fs, "middle"), 3),
    );
    if (placedY === undefined) continue;
    nodes.push(
      el(
        "text",
        {
          x: lx, y: placedY, "text-anchor": "middle",
          "font-family": style.fontFamily,
          "font-size": fs.toFixed(1),
          "font-style": "italic",
          fill: style.river,
          "fill-opacity": 0.9,
        },
        [lake.name],
      ),
    );
  }

  // --- mountain range label over the LARGEST connected range ---
  if (world.names.range) {
    const blob = largestBlob(w, h, (i) => {
      const b = world.biomes[i] as number;
      return b === BIOMES.alpine || b === BIOMES.snow;
    });
    if (blob.length >= 10) {
      const peaks = blob.map((i) => ({
        x: proj.px(i % w),
        y: proj.py((i / w) | 0),
      }));
      const c = centroidOf(peaks);
      const angle = clamp((principalAngle(peaks) * 180) / Math.PI, -32, 32);
      const fs = 14.5 * k;
      const placedY = offsetCandidates(c.y, k).find((cy) =>
        labels.tryClaim(spacedTextBox(c.x, cy, world.names.range!, fs, 3 * k), 4),
      );
      if (placedY !== undefined) {
        // a soft paper casing clears a clean lane through the dense mountain
        // glyphs so the spaced capitals read; the opaque fill + halo do the
        // rest. Rotated with the label and drawn first, so text sits on top.
        const box = spacedTextBox(c.x, placedY, world.names.range, fs, 3 * k);
        const padX = 7 * k;
        const padY = 4 * k;
        const spin = `rotate(${angle.toFixed(1)} ${c.x.toFixed(1)} ${placedY.toFixed(1)})`;
        nodes.push(
          el("rect", {
            class: "range-casing",
            x: (box.x - padX).toFixed(1),
            y: (box.y - padY).toFixed(1),
            width: (box.w + 2 * padX).toFixed(1),
            height: (box.h + 2 * padY).toFixed(1),
            rx: (5 * k).toFixed(1),
            transform: spin,
            fill: style.paper,
            "fill-opacity": 0.72,
          }),
          el(
            "text",
            {
              x: c.x, y: placedY, "text-anchor": "middle",
              transform: spin,
              "font-family": style.fontFamily,
              "font-size": fs.toFixed(1),
              "letter-spacing": (3 * k).toFixed(1),
              fill: style.labelColor,
              stroke: style.labelHalo,
              "stroke-width": 3 * k,
              "paint-order": "stroke",
            },
            [world.names.range.toUpperCase()],
          ),
        );
      }
    }
  }

  // --- forest label at the largest forest blob ---
  if (world.names.forest) {
    const blob = largestBlob(w, h, (i) => FOREST_BIOMES.has(world.biomes[i] as number));
    if (blob.length >= 25) {
      const pts = blob.map((i) => ({
        x: proj.px(i % w),
        y: proj.py((i / w) | 0),
      }));
      const c = centroidOf(pts);
      const fs = 12.5 * k;
      const placedY = offsetCandidates(c.y, k).find((cy) =>
        labels.tryClaim(textBox(c.x, cy, world.names.forest!, fs, "middle"), 4),
      );
      if (placedY !== undefined) {
        nodes.push(
          el(
            "text",
            {
              x: c.x, y: placedY, "text-anchor": "middle",
              "font-family": style.fontFamily,
              "font-size": fs.toFixed(1),
              "font-style": "italic",
              fill: style.labelColor,
              "fill-opacity": 0.75,
              stroke: style.labelHalo,
              "stroke-width": 2.2 * k,
              "paint-order": "stroke",
            },
            [world.names.forest],
          ),
        );
      }
    }
  }

  return { defs, node: el("g", { id: "layer-feature-labels" }, nodes), realmAnchors };
}
