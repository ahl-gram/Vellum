import { el, type SvgNode } from "../../render/svg.ts";
import type { Arms } from "../../society/heraldry.ts";
import { armsNode, paletteForStyle } from "../../render/layers/heraldry.ts";
import { PLATE_H, PLATE_W, VIEW_X0, VIEW_X1 } from "../geometry.ts";
import type { PlateKeyEntry } from "../key.ts";
import type { RoadTown } from "../surroundings.ts";
import { runBox, type Lettering, type RunSpec } from "../letter/letter.ts";
import { quietInk, r1, stroke, washOr, type Engraver } from "./burin.ts";
import type { Box } from "./rise.ts";

const CX = PLATE_W / 2;
export const FRAME_OUTER = 10;
export const FRAME_INNER = FRAME_OUTER + 4;
export const INNER: Box = { x0: FRAME_INNER, x1: PLATE_W - FRAME_INNER, y0: FRAME_INNER, y1: PLATE_H - FRAME_INNER };
/** The bottom line's baseline: high enough that the old-style figures' and a "p"'s descenders clear the inner frame. */
export const BOTTOM_LINE = PLATE_H - 17.5;
const TOP_LINE = FRAME_INNER + 7;

export type Inked = { readonly nodes: SvgNode[]; readonly boxes: ReadonlyArray<Box> };

const boxOfRun = (spec: RunSpec): Box => {
  const b = runBox(spec);
  const h = (spec.halo?.width ?? 0) / 2;
  return { x0: b.x0 - h, x1: b.x1 + h, y0: b.top - h, y1: b.bottom + h };
};

function lettered(letters: Lettering, specs: ReadonlyArray<RunSpec>): Inked {
  return { nodes: specs.map((s) => letters.run(s)), boxes: specs.map(boxOfRun) };
}

/** The rightmost reach of a strapwork curl beyond the tablet, as a fraction of the curl: the quadratic's extreme. */
const CURL_REACH = 1.26;

/** A strapwork panel: a tablet with curled ends and rolled lips, after the Granada and Salzburg cartouches. */
export function strapwork(e: Engraver, cx: number, cy: number, w: number, h: number, tinted: boolean): Inked {
  const x0 = cx - w / 2, x1 = cx + w / 2, y0 = cy - h / 2, y1 = cy + h / 2;
  const c = Math.min(9, h * 0.45);
  const d = `M${r1(x0 - c)} ${r1(y0 + c * 0.6)}q${r1(c)} ${r1(-c * 1.2)} ${r1(c * 1.6)} ${r1(-c * 0.2)}L${r1(x1 - c * 0.6)} ${r1(y0 + c * 0.4)}q${r1(c * 0.6)} ${r1(-c * 1.4)} ${r1(c * 1.6)} ${r1(-c * 0.2)}q${r1(c * 0.6)} ${r1(c * 0.9)} ${r1(-c * 0.2)} ${r1(c * 1.4)}L${r1(x1 + c * 0.4)} ${r1(y1 - c * 0.4)}q${r1(c * 0.6)} ${r1(c * 1.4)} ${r1(-c * 0.6)} ${r1(c * 1.2)}q${r1(-c * 0.8)} ${r1(-c * 0.6)} ${r1(-c * 1.2)} ${r1(-c * 0.9)}L${r1(x0 + c * 0.9)} ${r1(y1 - c * 0.1)}q${r1(-c * 0.9)} ${r1(c * 0.9)} ${r1(-c * 1.5)} ${r1(c * 0.2)}q${r1(-c * 0.4)} ${r1(-c)} ${r1(c * 0.4)} ${r1(-c * 1.3)}Z`;
  const nodes = [
    el("path", { d, fill: tinted ? washOr(e, "cartouche") : e.paper, ...stroke(e, 0.9) }),
    el("rect", { x: r1(x0), y: r1(y0), width: r1(w), height: r1(h), fill: e.paper, ...stroke(e, 0.6) }),
    el("rect", { x: r1(x0 + 1.6), y: r1(y0 + 1.6), width: r1(w - 3.2), height: r1(h - 3.2), fill: "none", stroke: e.ink, "stroke-width": 0.35, "stroke-opacity": 0.7 }),
    ...[x0 - c * 0.3, x1 + c * 0.3].map((sx) => el("circle", { cx: r1(sx), cy: r1(cy), r: 1.3, fill: e.paper, ...stroke(e, 0.6) })),
  ];
  return { nodes, boxes: [{ x0: x0 - c * CURL_REACH - 0.5, x1: x1 + c * CURL_REACH + 0.5, y0: y0 - c * 0.6 - 0.5, y1: y1 + c * 0.9 + 0.5 }] };
}

export function titleCartouche(e: Engraver, letters: Lettering, name: string, cy: number): Inked {
  const text = name.toUpperCase();
  const size = Math.min(13, 150 / Math.max(6, text.length * 0.72));
  const spec: RunSpec = { text, x: CX, y: r1(cy + size * 0.36), size, anchor: "middle", spacing: 2.4, fill: e.ink };
  const panel = strapwork(e, CX, cy, Math.max(96, runBox(spec).x1 - runBox(spec).x0 + 24), 22, true);
  const run = lettered(letters, [spec]);
  return { nodes: [...panel.nodes, ...run.nodes], boxes: [...panel.boxes, ...run.boxes] };
}

/** The banderole: a ribbon with swallow tails carrying the epithet and the founding, slung under the cartouche. */
export function banderole(e: Engraver, letters: Lettering, text: string, cy: number): Inked {
  const size = Math.min(8.2, 230 / Math.max(10, text.length * 0.5));
  const spec: RunSpec = { text, x: CX, y: r1(cy + size * 0.34), size, italic: true, anchor: "middle", fill: e.ink };
  const span = runBox(spec);
  const w = span.x1 - span.x0 + 30;
  const x0 = CX - w / 2, x1 = CX + w / 2, h = 11, fill = washOr(e, "cartouche");
  const tail = (x: number, dir: number): SvgNode => el("path", { d: `M${r1(x - 6 * dir)} ${r1(cy - h / 2)}L${r1(x + 10 * dir)} ${r1(cy - h / 2 + 3)}L${r1(x + 4 * dir)} ${r1(cy + 2)}L${r1(x + 10 * dir)} ${r1(cy + h / 2 + 3)}L${r1(x - 6 * dir)} ${r1(cy + h / 2)}Z`, fill, ...stroke(e, 0.7) });
  const run = lettered(letters, [spec]);
  return {
    nodes: [
      tail(x0, -1), tail(x1, 1),
      el("path", { d: `M${r1(x0)} ${r1(cy - h / 2)}q${r1(w / 2)} -3 ${r1(w)} 0L${r1(x1)} ${r1(cy + h / 2)}q${r1(-w / 2)} 3 ${r1(-w)} 0Z`, fill: e.paper, ...stroke(e, 0.8) }),
      el("path", { d: `M${r1(x0)} ${r1(cy - h / 2)}l6 2.4M${r1(x1)} ${r1(cy - h / 2)}l-6 2.4`, fill: "none", stroke: e.ink, "stroke-width": 0.5 }),
      ...run.nodes,
    ],
    boxes: [{ x0: x0 - 10.5, x1: x1 + 10.5, y0: cy - h / 2 - 3.5, y1: cy + h / 2 + 3.5 }, ...run.boxes],
  };
}

const RING: ReadonlyArray<readonly [number, number]> = [[1, 0], [0.866, 0.5], [0.5, 0.866], [0, 1], [-0.5, 0.866], [-0.866, 0.5], [-1, 0], [-0.866, -0.5], [-0.5, -0.866], [0, -1], [0.5, -0.866], [0.866, -0.5]];

/** A laurel wreath of paired leaves around a roundel, tied at the foot. */
export function wreath(e: Engraver, cx: number, cy: number, r: number): Inked {
  const leaves: string[] = [];
  for (let i = 0; i < 24; i++) {
    const a = RING[i % 12]!, b = RING[(i + 1) % 12]!;
    const t = (i % 2) * 0.5;
    const ux = a[0] * (1 - t) + b[0] * t, uy = a[1] * (1 - t) + b[1] * t;
    const px = cx + ux * r, py = cy + uy * r, tx = -uy, ty = ux, dir = ux < 0 ? 1 : -1;
    leaves.push(`M${r1(px)} ${r1(py)}q${r1(ux * 2.4 + tx * 3 * dir)} ${r1(uy * 2.4 + ty * 3 * dir)} ${r1(ux * 0.6 + tx * 6.4 * dir)} ${r1(uy * 0.6 + ty * 6.4 * dir)}q${r1(-ux * 2 + tx * 3 * dir)} ${r1(-uy * 2 + ty * 3 * dir)} ${r1(-ux * 0.6 - tx * 6.4 * dir)} ${r1(-uy * 0.6 - ty * 6.4 * dir)}`);
    leaves.push(`M${r1(px - ux * 2.2)} ${r1(py - uy * 2.2)}q${r1(-ux * 2.4 + tx * 3 * dir)} ${r1(-uy * 2.4 + ty * 3 * dir)} ${r1(-ux * 0.6 + tx * 6.4 * dir)} ${r1(-uy * 0.6 + ty * 6.4 * dir)}`);
  }
  return {
    nodes: [
      el("circle", { cx: r1(cx), cy: r1(cy), r: r1(r), fill: e.paper, stroke: e.ink, "stroke-width": 0.5, "stroke-opacity": 0.6 }),
      el("path", { d: leaves.join(""), fill: washOr(e, "wood"), stroke: e.ink, "stroke-width": 0.5, "stroke-linejoin": "round" }),
      el("path", { d: `M${r1(cx - 3)} ${r1(cy + r + 3)}q3 -4 6 0q-3 2 -6 0M${r1(cx)} ${r1(cy + r + 1)}l-3 7M${r1(cx)} ${r1(cy + r + 1)}l3 7`, fill: "none", stroke: e.ink, "stroke-width": 0.6 }),
    ],
    boxes: [{ x0: cx - r - 7, x1: cx + r + 7, y0: cy - r - 7, y1: cy + r + 9 }],
  };
}

export const ROUNDEL_Y = 60;
const ROUNDEL_R = 22;

export function wreathedArms(e: Engraver, arms: Arms, suffix: string): Inked {
  const w = wreath(e, 64, ROUNDEL_Y, ROUNDEL_R);
  return { nodes: [...w.nodes, armsNode(arms, 64, ROUNDEL_Y + 1, 24, paletteForStyle(e.style), `${suffix}-wreath`)], boxes: w.boxes };
}

/** The right-hand roundel, the chart's own mark: "CHART" fitted inside the wreath's leaves, the number, the year. */
export function chartRoundel(e: Engraver, letters: Lettering, seed: number, year: number): Inked {
  const cx = PLATE_W - 64, cy = ROUNDEL_Y;
  const chart: RunSpec = { text: "CHART", x: cx, y: cy - 4, size: 7, anchor: "middle", spacing: 1.4, fill: e.ink };
  const plain = runBox({ ...chart, spacing: 0 });
  const spacing = Math.max(0, Math.min(1.4, (26 - (plain.x1 - plain.x0)) / 4));
  const runs = lettered(letters, [
    { ...chart, spacing },
    { text: `№ ${seed}`, x: cx, y: cy + 7, size: 10.5, anchor: "middle", fill: e.ink },
    { text: `An. ${year}`, x: cx, y: cy + 15, size: 5.6, italic: true, anchor: "middle", fill: quietInk(e) },
  ]);
  const w = wreath(e, cx, cy, ROUNDEL_R);
  return { nodes: [...w.nodes, ...runs.nodes], boxes: [...w.boxes, ...runs.boxes] };
}

const KEY_SIZE = 6.6;
const ROW_H = 8.6;
const MIN_COL = 92;

/** The numbered key in its panel at the rise's lower right, its curls kept inside the inner frame. */
export function keyPanel(e: Engraver, letters: Lettering, entries: ReadonlyArray<PlateKeyEntry>, riseBottom: number): Inked {
  if (entries.length === 0) return { nodes: [], boxes: [] };
  const cols = entries.length > 4 ? 2 : 1;
  const rows = Math.ceil(entries.length / cols);
  const spec = (i: number, x: number, y: number): RunSpec => ({ text: `${entries[i]!.letter}. ${entries[i]!.label}`, x, y, size: KEY_SIZE, italic: true, fill: e.ink });
  const colW = Array.from({ length: cols }, (_, col) => Math.max(MIN_COL, ...entries.slice(col * rows, (col + 1) * rows).map((_, j) => { const b = runBox(spec(col * rows + j, 0, 0)); return b.x1 + 8; })));
  const w = colW.reduce((a, b) => a + b, 0) + 10, h = rows * ROW_H + 10;
  const curl = Math.min(9, h * 0.45);
  const x = INNER.x1 - 1.5 - curl * CURL_REACH - 0.5 - w;
  const y = riseBottom - 14 - h;
  const panel = strapwork(e, x + w / 2, y + h / 2, w, h, false);
  const runs = lettered(letters, entries.map((_, i) => {
    const col = Math.floor(i / rows), row = i % rows;
    return spec(i, x + 6 + colW.slice(0, col).reduce((a, b) => a + b, 0), y + 9 + row * ROW_H);
  }));
  return { nodes: [...panel.nodes, ...runs.nodes], boxes: [...panel.boxes, ...runs.boxes] };
}

export type Tag = { readonly n: string; readonly x: number; readonly y: number };

export const tagSpec = (e: Engraver, t: Tag): RunSpec => ({ text: t.n, x: r1(t.x), y: r1(t.y), size: 8, italic: true, anchor: "middle", fill: e.ink, halo: { color: e.paper, width: 2.4 } });

export function keyTags(e: Engraver, letters: Lettering, tags: ReadonlyArray<Tag>): Inked {
  return lettered(letters, tags.map((t) => tagSpec(e, t)));
}

export type Cardinals = { readonly left: string; readonly right: string; readonly far: string; readonly near: string };

export function cardinalWords(e: Engraver, letters: Lettering, c: Cardinals): Inked {
  const word = (text: string, x: number, y: number, anchor: RunSpec["anchor"]): RunSpec => ({ text, x, y, size: 6.2, italic: true, anchor, fill: quietInk(e) });
  return lettered(letters, [word(c.left, VIEW_X0 + 4, TOP_LINE, "start"), word(c.right, VIEW_X1 - 4, TOP_LINE, "end"), word(c.far, CX, TOP_LINE, "middle"), word(c.near, VIEW_X0 + 4, BOTTOM_LINE, "start")]);
}

export function footerLine(e: Engraver, letters: Lettering, yearLine: string | null, seed: number): Inked {
  const text = yearLine === null ? `VELLUM · CHART № ${seed}` : `${yearLine} · VELLUM · CHART № ${seed}`;
  return lettered(letters, [{ text, x: CX, y: BOTTOM_LINE, size: 7.4, anchor: "middle", spacing: 2, fill: quietInk(e) }]);
}

export function frameNodes(e: Engraver): SvgNode[] {
  return [
    el("rect", { x: FRAME_OUTER, y: FRAME_OUTER, width: PLATE_W - 2 * FRAME_OUTER, height: PLATE_H - 2 * FRAME_OUTER, fill: "none", stroke: e.ink, "stroke-width": 2 }),
    el("rect", { x: FRAME_INNER, y: FRAME_INNER, width: PLATE_W - 2 * FRAME_INNER, height: PLATE_H - 2 * FRAME_INNER, fill: "none", stroke: e.ink, "stroke-width": 0.7 }),
  ];
}

export type HorizonContext = { readonly horizonYAt: (x: number) => number; readonly townRun: readonly [number, number]; readonly masts: ReadonlyArray<Box>; readonly birds: ReadonlyArray<Box>; readonly avoid: ReadonlyArray<Box> };

const overlaps = (a: Box, b: Box): boolean => a.x0 < b.x1 && b.x0 < a.x1 && a.y0 < b.y1 && b.y0 < a.y1;

const lifted = (b: Box, lift: number): Box => ({ ...b, y0: b.y0 - lift, y1: b.y1 - lift });

function clearLabel(boxes: ReadonlyArray<Box>, ctx: HorizonContext, placed: ReadonlyArray<Box>): number | null {
  const blocks = [...ctx.masts, ...ctx.birds, ...ctx.avoid, ...placed];
  const clear = (b: Box): boolean => {
    for (let x = b.x0; x <= b.x1; x += 1) if (b.y1 >= ctx.horizonYAt(x) - 0.5) return false;
    return !blocks.some((m) => overlaps(b, m));
  };
  for (let lift = 0; lift <= 40; lift += 1) if (boxes.every((b) => clear(lifted(b, lift)))) return lift;
  return null;
}

type Seat = { readonly x: number; readonly s: number; readonly name: RunSpec; readonly tag: RunSpec; readonly boxes: ReadonlyArray<Box> };

function seatAt(e: Engraver, t: RoadTown, n: string, x: number, ctx: HorizonContext, placed: ReadonlyArray<Box>): Seat | null {
  const y = ctx.horizonYAt(x);
  const s = t.kind === "capital" ? 1.3 : t.kind === "town" ? 1 : 0.75;
  const name: RunSpec = { text: t.name, x, y: y - 12 * s, size: 6, italic: true, anchor: "middle", fill: e.ink };
  const tag: RunSpec = { text: n, x, y: y - 12 * s - 7, size: 8, italic: true, anchor: "middle", fill: e.ink, halo: { color: e.paper, width: 2.4 } };
  const both = [boxOfRun(name), boxOfRun(tag)].map((k) => ({ x0: k.x0 - 1.2, x1: k.x1 + 1.2, y0: k.y0 - 1.2, y1: k.y1 + 1.2 }));
  const lift = clearLabel(both, ctx, placed);
  if (lift === null) return null;
  return { x, s, name: { ...name, y: name.y - lift }, tag: { ...tag, y: tag.y - lift }, boxes: both.map((k) => lifted(k, lift)) };
}

/** The nearest seat to a road town's bearing, stepping away from the town's own run, where its name and number clear the hills, the masts, the birds, the furniture and every name seated before it. */
function seatLabel(e: Engraver, t: RoadTown, n: string, ctx: HorizonContext, placed: ReadonlyArray<Box>): Seat | null {
  const bearing = Math.max(VIEW_X0 + 30, Math.min(VIEW_X1 - 30, CX + t.lateral * 230));
  const pushed = bearing > ctx.townRun[0] - 24 && bearing < ctx.townRun[1] + 24;
  const x0 = pushed ? (t.lateral < 0 ? ctx.townRun[0] - 30 : ctx.townRun[1] + 30) : bearing;
  const away = t.lateral < 0 ? -1 : 1;
  for (let k = 0; k <= 8; k++) {
    for (const x of pushed || k === 0 ? [x0 + away * 14 * k] : [x0 + away * 14 * k, x0 - away * 14 * k]) {
      if (x < VIEW_X0 + 24 || x > VIEW_X1 - 24 || (x > ctx.townRun[0] - 24 && x < ctx.townRun[1] + 24)) continue;
      const seat = seatAt(e, t, n, x, ctx, placed);
      if (seat !== null) return seat;
    }
  }
  return null;
}

/** The road towns standing on the horizon by their true bearing, pushed clear of the town's own run, each named and numbered for its key entry; a name with no clear seat is left to the key. */
export function horizonTowns(e: Engraver, letters: Lettering, towns: ReadonlyArray<RoadTown>, entries: ReadonlyArray<PlateKeyEntry>, ctx: HorizonContext): Inked {
  const out: SvgNode[] = [];
  const boxes: Box[] = [];
  towns.forEach((t, i) => {
    const entry = entries.find((k) => k.town === i);
    if (entry === undefined) return;
    const seat = seatLabel(e, t, entry.letter, ctx, boxes);
    if (seat === null) return;
    const { x, s } = seat;
    const y = ctx.horizonYAt(x);
    out.push(el("path", {
      d: `M${r1(x - 7 * s)} ${r1(y)}v${r1(-3 * s)}l${r1(2 * s)} ${r1(-2 * s)}l${r1(2 * s)} ${r1(2 * s)}v${r1(3 * s)}M${r1(x - 2 * s)} ${r1(y)}v${r1(-4 * s)}l${r1(2 * s)} ${r1(-2 * s)}l${r1(2 * s)} ${r1(2 * s)}v${r1(4 * s)}M${r1(x + 3 * s)} ${r1(y)}v${r1(-3 * s)}l${r1(2 * s)} ${r1(-1.6 * s)}l${r1(2 * s)} ${r1(1.6 * s)}v${r1(3 * s)}M${r1(x + 0.6 * s)} ${r1(y - 4 * s)}v${r1(-3 * s)}l${r1(1.2 * s)} ${r1(-4 * s)}l${r1(1.2 * s)} ${r1(4 * s)}v${r1(3 * s)}`,
      fill: e.paper, ...stroke(e, 0.55),
    }));
    out.push(...lettered(letters, [seat.name, seat.tag]).nodes);
    boxes.push(...seat.boxes);
  });
  return { nodes: out, boxes };
}
