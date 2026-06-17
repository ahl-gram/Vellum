import { BIOMES } from "../../climate/biomes.ts";
import { clamp } from "../../core/math.ts";
import { chaikinSmooth } from "../../terrain/contours.ts";
import { el, type SvgNode } from "../svg.ts";
import { centroidOf, principalAngle, textBox } from "../geometry.ts";
import { largestBlob } from "../blobs.ts";
import type { RenderCtx } from "../context.ts";

function spacedTextBox(
  x: number,
  y: number,
  text: string,
  fontSize: number,
  letterSpacing: number,
) {
  const w = text.length * (fontSize * 0.56 + letterSpacing);
  return { x: x - w / 2, y: y - fontSize, w, h: fontSize * 1.2 };
}

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

export type RiverLabelPlacement = {
  readonly x: number;
  readonly y: number;
  readonly angleDeg: number;
};

/** Total absolute turning (radians) of the polyline between indices i and j. */
function reachTurn(
  pts: ReadonlyArray<readonly [number, number]>,
  i: number,
  j: number,
): number {
  let turn = 0;
  for (let m = i + 1; m < j; m++) {
    const a1 = Math.atan2(pts[m]![1] - pts[m - 1]![1], pts[m]![0] - pts[m - 1]![0]);
    const a2 = Math.atan2(pts[m + 1]![1] - pts[m]![1], pts[m + 1]![0] - pts[m]![0]);
    let d = Math.abs(a2 - a1);
    if (d > Math.PI) d = 2 * Math.PI - d;
    turn += d;
  }
  return turn;
}

/**
 * The straightest reach of a river polyline long enough to hold a label of
 * `targetLen` px, returned as the reach's mid-point and a reading-friendly
 * rotation. Following the whole winding course smears glyphs at bends; a
 * single straight reach keeps the label legible while still river-aligned.
 */
export function straightestReach(
  pts: ReadonlyArray<readonly [number, number]>,
  targetLen: number,
): RiverLabelPlacement | null {
  if (pts.length < 2) return null;

  const cum: number[] = [0];
  for (let i = 1; i < pts.length; i++) {
    cum[i] = (cum[i - 1] as number) +
      Math.hypot(pts[i]![0] - pts[i - 1]![0], pts[i]![1] - pts[i - 1]![1]);
  }
  const total = cum[cum.length - 1] as number;

  let lo = 0;
  let hi = pts.length - 1;
  if (total > targetLen) {
    const wins: Array<{ i: number; j: number; turn: number; center: number }> = [];
    for (let i = 0; i < pts.length - 1; i++) {
      let j = i + 1;
      while (j < pts.length && (cum[j] as number) - (cum[i] as number) < targetLen) j++;
      if (j >= pts.length) break;
      wins.push({
        i, j,
        turn: reachTurn(pts, i, j),
        center: ((cum[i] as number) + (cum[j] as number)) / 2,
      });
    }
    if (wins.length > 0) {
      // straightest reach wins; among comparably-straight ones, the most
      // centered (so the label sits mid-river, not jammed at an end)
      const minTurn = Math.min(...wins.map((w) => w.turn));
      const mid = total / 2;
      let bestDc = Infinity;
      for (const w of wins) {
        if (w.turn > minTurn + 0.08) continue;
        const dc = Math.abs(w.center - mid);
        if (dc < bestDc) {
          bestDc = dc;
          lo = w.i;
          hi = w.j;
        }
      }
    }
  }

  let a = pts[lo]!;
  let b = pts[hi]!;
  if (b[0] < a[0]) [a, b] = [b, a]; // read left → right, never inverted
  const angleDeg = clamp((Math.atan2(b[1] - a[1], b[0] - a[0]) * 180) / Math.PI, -50, 50);

  // position the label at the reach's arc-length midpoint, on the river
  const midLen = ((cum[lo] as number) + (cum[hi] as number)) / 2;
  let s = 0;
  while (s < pts.length - 1 && (cum[s + 1] as number) < midLen) s++;
  const seg = Math.max(1e-6, (cum[s + 1] as number) - (cum[s] as number));
  const t = (midLen - (cum[s] as number)) / seg;
  return {
    x: pts[s]![0] + (pts[s + 1]![0] - pts[s]![0]) * t,
    y: pts[s]![1] + (pts[s + 1]![1] - pts[s]![1]) * t,
    angleDeg,
  };
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
    if (blob.length < 60) return;
    const pts = blob.map((i) => ({
      x: proj.px(i % w),
      y: proj.py((i / w) | 0),
    }));
    const c = centroidOf(pts);
    const fs = 16.5 * k;
    const ls = 4 * k;
    const placedY = offsetCandidates(c.y, k).find((cy) =>
      labels.tryClaim(spacedTextBox(c.x, cy, name, fs, ls), 4),
    );
    if (placedY === undefined) return;
    const labelW = name.length * (fs * 0.56 + ls);
    realmAnchors.push({ realm, cx: c.x, cy: placedY - 0.4 * fs, halfW: labelW / 2, halfH: 0.6 * fs });
    nodes.push(
      el(
        "text",
        {
          x: c.x, y: placedY, "text-anchor": "middle",
          "font-family": style.fontFamilyTitle,
          "font-size": fs.toFixed(1),
          "letter-spacing": ls.toFixed(1),
          fill: style.labelColor,
          "fill-opacity": 0.55,
          stroke: style.labelHalo,
          "stroke-width": 2.6 * k,
          "paint-order": "stroke",
        },
        [name.toUpperCase()],
      ),
    );
  });

  // --- river names along the straightest reach of each course ---
  const named = [...world.names.rivers.entries()]
    .map(([idx, name]) => ({ river: world.rivers[idx]!, name }))
    .sort((a, b) => b.river.points.length - a.river.points.length)
    .slice(0, 3);

  for (const { river, name } of named) {
    const raw = river.points.map((p) => [proj.px(p.x), proj.py(p.y)] as const);
    const pts = chaikinSmooth(raw, false, 2);
    const fs = 10.5 * k;
    const place = straightestReach(pts, name.length * fs * 0.52);
    if (!place) continue;
    const box = textBox(place.x, place.y - 4 * k, name, fs, "middle");
    if (!labels.tryClaim(box, 2)) continue;
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
        nodes.push(
          el(
            "text",
            {
              x: c.x, y: placedY, "text-anchor": "middle",
              transform: `rotate(${angle.toFixed(1)} ${c.x.toFixed(1)} ${placedY.toFixed(1)})`,
              "font-family": style.fontFamily,
              "font-size": fs.toFixed(1),
              "letter-spacing": (3 * k).toFixed(1),
              fill: style.labelColor,
              "fill-opacity": 0.78,
              stroke: style.labelHalo,
              "stroke-width": 2.4 * k,
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
