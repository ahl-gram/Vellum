import { BIOMES } from "../../climate/biomes.ts";
import { clamp } from "../../core/math.ts";
import { chaikinSmooth } from "../../terrain/contours.ts";
import { el, type SvgNode } from "../svg.ts";
import { centroidOf, principalAngle, rotatedRect, rotatedSpanBoxes, spacedTextBox, textBox, WIDTH_FACTOR, type Box, type Pt } from "../geometry.ts";
import { interiorProbes } from "./label-probes.ts";
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

// Ink may graze another label by under this fraction of the smaller box; terrain glyphs reserve nothing, so this yields only to TEXT.
const RIVER_MAX_OVERLAP = 0.15;

function offsetCandidates(y: number, k: number): number[] {
  return [y, y - 26 * k, y + 26 * k, y - 52 * k, y + 52 * k];
}

export type RealmAnchor = {
  readonly realm: number;
  readonly cx: number;
  readonly cy: number;
  readonly halfW: number;
  readonly halfH: number;
};

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

  const seaGate = world.region?.seaGate;
  const deep: Array<{ px: number; py: number; d: number }> = [];
  for (let gy = 3; gy < h - 3; gy += 2) {
    for (let gx = 3; gx < w - 3; gx += 2) {
      if (seaGate && seaGate[gx + gy * w] === 0) continue;
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

  // Claim order is load-bearing: the range name claims FIRST because it cannot move, while realm names roam and force-place; painting in this order also keeps realm names on top of the range casing.
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
      const padX = 7 * k;
      const padY = 4 * k;
      const claimAt = (cx: number, cy: number, fs: number): Box[] => {
        const text = spacedTextBox(cx, cy, world.names.range!, fs, 3 * k, WIDTH_FACTOR.caps);
        const casing = {
          x: text.x - padX,
          y: text.y - padY,
          w: text.w + 2 * padX,
          h: text.h + 2 * padY,
        };
        return rotatedSpanBoxes(casing, angle, cx, cy);
      };
      let placed: (Pt & { fs: number }) | undefined;
      for (const fsBase of [14.5, 13, 11.5, 10]) {
        const fs = fsBase * k;
        const candidates: Pt[] = [
          ...offsetCandidates(c.y, k).map((cy) => ({ x: c.x, y: cy })),
          ...interiorProbes(blob, w, proj, c),
        ];
        const hit = candidates.find((p) => labels.tryClaimAll(claimAt(p.x, p.y, fs), 4));
        if (hit) {
          placed = { ...hit, fs };
          break;
        }
      }
      if (placed !== undefined) {
        const { x: placedX, y: placedY, fs } = placed;
        const box = spacedTextBox(placedX, placedY, world.names.range, fs, 3 * k, WIDTH_FACTOR.caps);
        const spin = `rotate(${angle.toFixed(1)} ${placedX.toFixed(1)} ${placedY.toFixed(1)})`;
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
              x: placedX, y: placedY, "text-anchor": "middle",
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

  world.names.realms.forEach((name, realm) => {
    const blob = largestBlob(w, h, (i) => world.realms.labels[i] === realm);
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
    const labelW = name.length * (fs * WIDTH_FACTOR.caps + ls);
    realmAnchors.push({ realm, cx: placedX, cy: placedY - 0.4 * fs, halfW: labelW / 2, halfH: 0.6 * fs });
    nodes.push(
      el(
        "text",
        {
          x: placedX, y: placedY, "text-anchor": "middle",
          "font-family": style.fontFamilyTitle,
          "font-size": fs.toFixed(1),
          // Only the font size feeds tryClaim, so changing it could unplace a label.
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

  const named = [...world.names.rivers.entries()]
    .map(([idx, name]) => ({ river: world.rivers[idx]!, name }))
    .sort((a, b) => b.river.points.length - a.river.points.length);

  for (const { river, name } of named) {
    const raw = river.points.map((p) => [proj.px(p.x), proj.py(p.y)] as const);
    const pts = chaikinSmooth(raw, false, 2);
    const fs = 10.5 * k;
    let place: RiverLabelPlacement | null = null;
    for (const cand of reachPlacements(pts, name.length * fs * 0.52)) {
      const box = textBox(cand.x, cand.y - 4 * k, name, fs, "middle");
      const ink = rotatedRect(box, cand.angleDeg, cand.x, cand.y);
      const footprint = rotatedSpanBoxes(box, cand.angleDeg, cand.x, cand.y);
      if (labels.tryClaimPoly(ink, footprint, RIVER_MAX_OVERLAP)) {
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
