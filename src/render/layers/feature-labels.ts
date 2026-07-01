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
 * Candidate label positions along a river polyline, each a straight reach long
 * enough to hold a label of `targetLen` px, returned as the reach's mid-point
 * and a reading-friendly rotation. Following the whole winding course smears
 * glyphs at bends; a single straight reach keeps the label legible.
 *
 * The list is ordered by preference. Element 0 is the same reach
 * `straightestReach` has always returned (the most-centered of the straightest
 * reaches), so a river whose best spot is free keeps its exact placement. The
 * rest are straightest-first alternatives, each far enough from every reach
 * already offered (>= `targetLen`) that it names a genuinely different stretch
 * of the course, so a river whose best spot is taken can still label a free
 * stretch elsewhere instead of going nameless.
 */
export function reachPlacements(
  pts: ReadonlyArray<readonly [number, number]>,
  targetLen: number,
  max = 8,
): RiverLabelPlacement[] {
  if (pts.length < 2) return [];

  const cum: number[] = [0];
  for (let i = 1; i < pts.length; i++) {
    cum[i] = (cum[i - 1] as number) +
      Math.hypot(pts[i]![0] - pts[i - 1]![0], pts[i]![1] - pts[i - 1]![1]);
  }
  const total = cum[cum.length - 1] as number;

  // A placement built from a [lo, hi] reach: read left-to-right, gently rotated,
  // anchored at the reach's arc-length midpoint on the river.
  const toPlacement = (lo: number, hi: number): RiverLabelPlacement => {
    let a = pts[lo]!;
    let b = pts[hi]!;
    if (b[0] < a[0]) [a, b] = [b, a]; // read left → right, never inverted
    const angleDeg = clamp((Math.atan2(b[1] - a[1], b[0] - a[0]) * 180) / Math.PI, -50, 50);
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
  };

  // Course too short to hold a full-length reach: label the whole thing.
  if (total <= targetLen) return [toPlacement(0, pts.length - 1)];

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
  if (wins.length === 0) return [toPlacement(0, pts.length - 1)];

  const mid = total / 2;
  const minTurn = Math.min(...wins.map((w) => w.turn));

  // Primary: the most-centered of the straightest reaches (unchanged pick).
  const primary = wins
    .filter((w) => w.turn <= minTurn + 0.08)
    .sort((a, b) => Math.abs(a.center - mid) - Math.abs(b.center - mid))[0]!;

  const chosen = [primary];
  const gap = targetLen * 0.5;
  const byStraightness = [...wins].sort(
    (a, b) => a.turn - b.turn || Math.abs(a.center - mid) - Math.abs(b.center - mid),
  );
  for (const w of byStraightness) {
    if (chosen.length >= max) break;
    if (chosen.every((c) => Math.abs(c.center - w.center) >= gap)) chosen.push(w);
  }

  return chosen.map((w) => toPlacement(w.i, w.j));
}

/**
 * The single best reach for a river's label (the most-centered of the
 * straightest reaches), or null for a degenerate course. Thin wrapper over
 * `reachPlacements` so both share one definition of the primary reach.
 */
export function straightestReach(
  pts: ReadonlyArray<readonly [number, number]>,
  targetLen: number,
): RiverLabelPlacement | null {
  return reachPlacements(pts, targetLen)[0] ?? null;
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
    // The label renders all-caps (name.toUpperCase() below), which runs wider
    // than spacedTextBox's 0.56 mixed-case factor. Size the shield anchor with a
    // caps-aware width so a side-placed coat of arms clears the final letters
    // instead of tucking over them. (Anchor-only: heraldry consumes this, so it
    // does not move the no-arms committed charts.)
    const labelW = name.length * (fs * 0.72 + ls);
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
