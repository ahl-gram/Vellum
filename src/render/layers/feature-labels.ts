import { BIOMES } from "../../climate/biomes.ts";
import { clamp } from "../../core/math.ts";
import { chaikinSmooth } from "../../terrain/contours.ts";
import { el, pathFrom, type SvgNode } from "../svg.ts";
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

/** Sea name, named rivers along their courses, mountain range, forest. */
export function featureLabelsLayer(ctx: RenderCtx): {
  defs: SvgNode[];
  node: SvgNode;
} {
  const { world, proj, style, labels } = ctx;
  const k = proj.widthPx / 1500;
  const { w, h } = world.elev;
  const defs: SvgNode[] = [];
  const nodes: SvgNode[] = [];

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
    const box = spacedTextBox(c.x, c.y, name, fs, ls);
    if (!labels.tryClaim(box, 4)) return;
    nodes.push(
      el(
        "text",
        {
          x: c.x, y: c.y, "text-anchor": "middle",
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

  // --- river names along their courses ---
  const named = [...world.names.rivers.entries()]
    .map(([idx, name]) => ({ river: world.rivers[idx]!, name, idx }))
    .sort((a, b) => b.river.points.length - a.river.points.length)
    .slice(0, 3);

  for (const { river, name, idx } of named) {
    let pts = river.points.map(
      (p) => [proj.px(p.x), proj.py(p.y)] as const,
    );
    // keep text upright: path must run left → right
    if ((pts[pts.length - 1]![0] - pts[0]![0]) < 0) {
      pts = [...pts].reverse();
    }
    const smooth = chaikinSmooth(pts, false, 2);
    const pathId = `river-label-${idx}`;
    defs.push(el("path", { id: pathId, d: pathFrom(smooth, false), fill: "none" }));
    const mid = smooth[Math.floor(smooth.length / 2)]!;
    const fs = 10.5 * k;
    const box = textBox(mid[0], mid[1], name, fs, "middle");
    if (!labels.tryClaim(box, 2)) continue;
    nodes.push(
      el(
        "text",
        {
          "font-family": style.fontFamily,
          "font-size": fs.toFixed(1),
          "font-style": "italic",
          fill: style.river,
        },
        [
          el(
            "textPath",
            { href: `#${pathId}`, startOffset: "32%" },
            [el("tspan", { dy: (-3.5 * k).toFixed(1) }, [name])],
          ),
        ],
      ),
    );
  }

  // --- lake names at their centroids ---
  for (const lake of world.names.lakes) {
    const lx = proj.px(lake.x);
    const ly = proj.py(lake.y);
    const fs = 11.5 * k;
    const box = textBox(lx, ly, lake.name, fs, "middle");
    if (!labels.tryClaim(box, 3)) continue;
    nodes.push(
      el(
        "text",
        {
          x: lx, y: ly, "text-anchor": "middle",
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
      const box = spacedTextBox(c.x, c.y, world.names.range, fs, 3 * k);
      if (labels.tryClaim(box, 4)) {
        nodes.push(
          el(
            "text",
            {
              x: c.x, y: c.y, "text-anchor": "middle",
              transform: `rotate(${angle.toFixed(1)} ${c.x.toFixed(1)} ${c.y.toFixed(1)})`,
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
      const box = textBox(c.x, c.y, world.names.forest, fs, "middle");
      if (labels.tryClaim(box, 4)) {
        nodes.push(
          el(
            "text",
            {
              x: c.x, y: c.y, "text-anchor": "middle",
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

  return { defs, node: el("g", { id: "layer-feature-labels" }, nodes) };
}
