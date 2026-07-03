import { createField, type Field } from "../../core/grid.ts";
import { chaikinSmooth, marchingSquares, type Point } from "../../terrain/contours.ts";
import { el, pathFrom, type SvgNode } from "../svg.ts";
import type { RenderCtx } from "../context.ts";

function boxBlur(f: Field, passes: number): Field {
  let cur = f;
  for (let p = 0; p < passes; p++) {
    const { w, h, data } = cur;
    cur = createField(w, h, (x, y) => {
      let sum = 0;
      let n = 0;
      for (let dy = -1; dy <= 1; dy++) {
        for (let dx = -1; dx <= 1; dx++) {
          const nx = x + dx;
          const ny = y + dy;
          if (nx < 0 || nx >= w || ny < 0 || ny >= h) continue;
          sum += data[nx + ny * w] as number;
          n++;
        }
      }
      return sum / n;
    });
  }
  return cur;
}

/** Soft hand-tinted color washes over each realm's territory. */
export function realmTintsLayer(ctx: RenderCtx): SvgNode | null {
  const { world, proj, style } = ctx;
  const { labels, seats } = world.realms;
  if (!style.politicalTints || seats.length <= 1) return null;
  const { w, h } = world.elev;
  const nodes: SvgNode[] = [];

  for (let realm = 0; realm < seats.length; realm++) {
    const indicator = createField(w, h, (x, y) =>
      labels[x + y * w] === realm ? 1 : 0,
    );
    const soft = boxBlur(indicator, 3);
    const rings = marchingSquares(soft, 0.5)
      .filter((c) => c.closed)
      .map((c) => chaikinSmooth(c.points, true, 2));
    if (rings.length === 0) continue;
    const d = rings
      .map((r) =>
        pathFrom(r.map(([x, y]) => [proj.px(x), proj.py(y)] as const), true),
      )
      .join("");
    nodes.push(
      el("path", {
        d,
        fill: style.realmTints[ctx.realmTint[realm] as number] as string,
        "fill-opacity": style.name === "topographic" ? 0.16 : 0.11,
        "fill-rule": "evenodd",
      }),
    );
  }

  return el("g", { id: "layer-realm-tints" }, nodes);
}

type Seg = readonly [number, number, number, number];

function chainBorderSegments(segs: ReadonlyArray<Seg>): Point[][] {
  const key = (x: number, y: number): string =>
    `${Math.round(x * 4)},${Math.round(y * 4)}`;
  const touching = new Map<string, number[]>();
  segs.forEach((s, i) => {
    for (const k of [key(s[0], s[1]), key(s[2], s[3])]) {
      const list = touching.get(k);
      if (list) list.push(i);
      else touching.set(k, [i]);
    }
  });

  const used = new Uint8Array(segs.length);
  const chains: Point[][] = [];

  for (let i = 0; i < segs.length; i++) {
    if (used[i]) continue;
    used[i] = 1;
    const s = segs[i] as Seg;
    const chain: Point[] = [[s[0], s[1]], [s[2], s[3]]];

    // extend both ends greedily
    for (const end of [1, 0] as const) {
      for (;;) {
        const tip = end === 1 ? chain[chain.length - 1]! : chain[0]!;
        const candidates = touching.get(key(tip[0], tip[1])) ?? [];
        let nextIdx = -1;
        for (const c of candidates) {
          if (!used[c]) {
            nextIdx = c;
            break;
          }
        }
        if (nextIdx === -1) break;
        used[nextIdx] = 1;
        const t = segs[nextIdx] as Seg;
        const startsAtTip =
          key(t[0], t[1]) === key(tip[0], tip[1]);
        const far: Point = startsAtTip ? [t[2], t[3]] : [t[0], t[1]];
        if (end === 1) chain.push(far);
        else chain.unshift(far);
      }
    }
    chains.push(chain);
  }
  return chains;
}

/** Dashed political borders along realm boundaries. */
export function realmBordersLayer(ctx: RenderCtx): SvgNode | null {
  const { world, proj, style } = ctx;
  const { labels, seats } = world.realms;
  if (seats.length <= 1) return null;
  const { w, h } = world.elev;
  const k = proj.widthPx / 1500;

  const segs: Seg[] = [];
  for (let y = 0; y < h; y++) {
    for (let x = 0; x < w; x++) {
      const a = labels[x + y * w] as number;
      if (a < 0) continue;
      if (x + 1 < w) {
        const b = labels[x + 1 + y * w] as number;
        if (b >= 0 && b !== a) {
          segs.push([x + 0.5, y - 0.5, x + 0.5, y + 0.5]);
        }
      }
      if (y + 1 < h) {
        const b = labels[x + (y + 1) * w] as number;
        if (b >= 0 && b !== a) {
          segs.push([x - 0.5, y + 0.5, x + 0.5, y + 0.5]);
        }
      }
    }
  }
  if (segs.length === 0) return null;

  const chains = chainBorderSegments(segs).map((chain) =>
    chaikinSmooth(chain, false, 2).map(
      ([x, y]) => [proj.px(x), proj.py(y)] as const,
    ),
  );

  return el(
    "g",
    { id: "layer-realm-borders" },
    chains.map((chain) =>
      el("path", {
        d: pathFrom(chain, false),
        fill: "none",
        stroke: style.name === "topographic" ? style.ink : style.road,
        "stroke-width": 1.1 * k,
        "stroke-dasharray": `${1.2 * k} ${3.2 * k}`,
        "stroke-linecap": "round",
        "stroke-opacity": 0.65,
      }),
    ),
  );
}
