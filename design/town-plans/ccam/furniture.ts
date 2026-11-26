// Direction D's furniture: the strapwork title cartouche, the banderole, the arms in a laurel wreath, the numbered key panel, the cardinal words and the horizon names, all from the world's own data.
import { el, type SvgNode } from "../../../src/render/svg.ts";
import { armsNode, paletteForStyle } from "../../../src/render/layers/heraldry.ts";
import type { Arms } from "../../../src/society/heraldry.ts";
import type { Dress } from "./dress.ts";
import { r1, stroke } from "./burin.ts";
import type { Scene } from "./data.ts";
import { PLATE_W, VIEW_X0, VIEW_X1 } from "../../../src/prospect/geometry.ts";

const CX = PLATE_W / 2;

/** A strapwork panel: a rounded tablet with curled ends, a rolled top and bottom lip, after the Granada and Salzburg cartouches. */
export function strapwork(d: Dress, cx: number, cy: number, w: number, h: number, tinted: boolean): SvgNode[] {
  const x0 = cx - w / 2, x1 = cx + w / 2, y0 = cy - h / 2, y1 = cy + h / 2;
  const fill = tinted && d.coloured ? d.wash.cartouche : d.paper;
  const curl = Math.min(9, h * 0.45);
  const out: SvgNode[] = [
    el("path", {
      d: `M${r1(x0 - curl)} ${r1(y0 + curl * 0.6)}q${r1(curl)} ${r1(-curl * 1.2)} ${r1(curl * 1.6)} ${r1(-curl * 0.2)}L${r1(x1 - curl * 0.6)} ${r1(y0 + curl * 0.4)}q${r1(curl * 0.6)} ${r1(-curl * 1.4)} ${r1(curl * 1.6)} ${r1(-curl * 0.2)}q${r1(curl * 0.6)} ${r1(curl * 0.9)} ${r1(-curl * 0.2)} ${r1(curl * 1.4)}L${r1(x1 + curl * 0.4)} ${r1(y1 - curl * 0.4)}q${r1(curl * 0.6)} ${r1(curl * 1.4)} ${r1(-curl * 0.6)} ${r1(curl * 1.2)}q${r1(-curl * 0.8)} ${r1(-curl * 0.6)} ${r1(-curl * 1.2)} ${r1(-curl * 0.9)}L${r1(x0 + curl * 0.9)} ${r1(y1 - curl * 0.1)}q${r1(-curl * 0.9)} ${r1(curl * 0.9)} ${r1(-curl * 1.5)} ${r1(curl * 0.2)}q${r1(-curl * 0.4)} ${r1(-curl)} ${r1(curl * 0.4)} ${r1(-curl * 1.3)}Z`,
      fill, ...stroke(d, 0.9),
    }),
    el("rect", { x: r1(x0), y: r1(y0), width: r1(w), height: r1(h), fill: d.paper, ...stroke(d, 0.6) }),
    el("rect", { x: r1(x0 + 1.6), y: r1(y0 + 1.6), width: r1(w - 3.2), height: r1(h - 3.2), fill: "none", stroke: d.ink, "stroke-width": 0.35, "stroke-opacity": 0.7 }),
  ];
  for (const sx of [x0 - curl * 0.3, x1 + curl * 0.3]) {
    out.push(el("circle", { cx: r1(sx), cy: r1(cy), r: 1.3, fill: d.paper, ...stroke(d, 0.6) }));
  }
  return out;
}

export function titleCartouche(d: Dress, scene: Scene, cy: number): SvgNode[] {
  const name = scene.input.name.toUpperCase();
  const fs = Math.min(13, 150 / Math.max(6, name.length * 0.72));
  const w = Math.max(96, name.length * fs * 0.78 + 24);
  return [
    ...strapwork(d, CX, cy, w, 22, true),
    el("text", { x: CX, y: r1(cy + fs * 0.36), "text-anchor": "middle", "font-family": d.font, "font-size": r1(fs), "letter-spacing": 2.4, fill: d.ink }, [name]),
  ];
}

/** The banderole: a ribbon with swallow tails carrying the epithet, slung under the cartouche. */
export function banderole(d: Dress, text: string, cy: number): SvgNode[] {
  const fs = Math.min(8.2, 230 / Math.max(10, text.length * 0.5));
  const w = text.length * fs * 0.5 + 30;
  const x0 = CX - w / 2, x1 = CX + w / 2, h = 11;
  const fill = d.coloured ? d.wash.cartouche : d.paper;
  return [
    el("path", { d: `M${r1(x0 + 6)} ${r1(cy - h / 2)}L${r1(x0 - 10)} ${r1(cy - h / 2 + 3)}L${r1(x0 - 4)} ${r1(cy + 2)}L${r1(x0 - 10)} ${r1(cy + h / 2 + 3)}L${r1(x0 + 6)} ${r1(cy + h / 2)}Z`, fill, ...stroke(d, 0.7) }),
    el("path", { d: `M${r1(x1 - 6)} ${r1(cy - h / 2)}L${r1(x1 + 10)} ${r1(cy - h / 2 + 3)}L${r1(x1 + 4)} ${r1(cy + 2)}L${r1(x1 + 10)} ${r1(cy + h / 2 + 3)}L${r1(x1 - 6)} ${r1(cy + h / 2)}Z`, fill, ...stroke(d, 0.7) }),
    el("path", { d: `M${r1(x0)} ${r1(cy - h / 2)}q${r1(w / 2)} ${r1(-3)} ${r1(w)} 0L${r1(x1)} ${r1(cy + h / 2)}q${r1(-w / 2)} ${r1(3)} ${r1(-w)} 0Z`, fill: d.paper, ...stroke(d, 0.8) }),
    el("path", { d: `M${r1(x0)} ${r1(cy - h / 2)}l6 2.4M${r1(x1)} ${r1(cy - h / 2)}l-6 2.4`, fill: "none", stroke: d.ink, "stroke-width": 0.5 }),
    el("text", { x: CX, y: r1(cy + fs * 0.34), "text-anchor": "middle", "font-family": d.font, "font-size": r1(fs), "font-style": "italic", fill: d.ink }, [text]),
  ];
}

/** A laurel wreath of paired leaves around a roundel, tied at the foot. */
export function wreath(d: Dress, cx: number, cy: number, r: number): SvgNode[] {
  const leaves: string[] = [];
  const RING = [[1, 0], [0.866, 0.5], [0.5, 0.866], [0, 1], [-0.5, 0.866], [-0.866, 0.5], [-1, 0], [-0.866, -0.5], [-0.5, -0.866], [0, -1], [0.5, -0.866], [0.866, -0.5]] as const;
  const steps = 24;
  for (let i = 0; i < steps; i++) {
    const a = RING[i % 12]!;
    const b = RING[(i + 1) % 12]!;
    const t = (i % 2) * 0.5;
    const ux = a[0] * (1 - t) + b[0] * t, uy = a[1] * (1 - t) + b[1] * t;
    const px = cx + ux * r, py = cy + uy * r;
    const tx = -uy, ty = ux;
    const dir = ux < 0 ? 1 : -1;
    leaves.push(`M${r1(px)} ${r1(py)}q${r1(ux * 2.4 + tx * 3 * dir)} ${r1(uy * 2.4 + ty * 3 * dir)} ${r1(ux * 0.6 + tx * 6.4 * dir)} ${r1(uy * 0.6 + ty * 6.4 * dir)}q${r1(-ux * 2 + tx * 3 * dir)} ${r1(-uy * 2 + ty * 3 * dir)} ${r1(-ux * 0.6 - tx * 6.4 * dir)} ${r1(-uy * 0.6 - ty * 6.4 * dir)}`);
    leaves.push(`M${r1(px - ux * 2.2)} ${r1(py - uy * 2.2)}q${r1(-ux * 2.4 + tx * 3 * dir)} ${r1(-uy * 2.4 + ty * 3 * dir)} ${r1(-ux * 0.6 + tx * 6.4 * dir)} ${r1(-uy * 0.6 + ty * 6.4 * dir)}`);
  }
  return [
    el("circle", { cx: r1(cx), cy: r1(cy), r: r1(r), fill: d.paper, stroke: d.ink, "stroke-width": 0.5, "stroke-opacity": 0.6 }),
    el("path", { d: leaves.join(""), fill: d.coloured ? d.wash.wood : d.paper, stroke: d.ink, "stroke-width": 0.5, "stroke-linejoin": "round" }),
    el("path", { d: `M${r1(cx - 3)} ${r1(cy + r + 3)}q3 -4 6 0q-3 2 -6 0M${r1(cx)} ${r1(cy + r + 1)}l-3 7M${r1(cx)} ${r1(cy + r + 1)}l3 7`, fill: "none", stroke: d.ink, "stroke-width": 0.6 }),
  ];
}

export function wreathedArms(d: Dress, arms: Arms, cx: number, cy: number, suffix: string): SvgNode[] {
  return [...wreath(d, cx, cy, 22), armsNode(arms, cx, cy + 1, 24, paletteForStyle(d.style), `${suffix}-wreath`)];
}

/** The right-hand roundel: the chart's own mark, since the engine gives a town no arms of its own. */
export function chartRoundel(d: Dress, scene: Scene, cx: number, cy: number): SvgNode[] {
  return [
    ...wreath(d, cx, cy, 22),
    el("text", { x: cx, y: cy - 4, "text-anchor": "middle", "font-family": d.font, "font-size": 7, "letter-spacing": 1.4, fill: d.ink }, ["CHART"]),
    el("text", { x: cx, y: cy + 7, "text-anchor": "middle", "font-family": d.font, "font-size": 10.5, fill: d.ink }, [`№ ${scene.input.seed}`]),
    el("text", { x: cx, y: cy + 15, "text-anchor": "middle", "font-family": d.font, "font-size": 5.6, "font-style": "italic", fill: d.soft }, [`An. ${scene.year}`]),
  ];
}

export type KeyLine = { readonly n: number; readonly label: string };

/** The key the world can truthfully supply: the composed features first, then the named water, the range, the roads and the neighbours on the horizon, the beast and the realm. */
export function keyLines(scene: Scene): KeyLine[] {
  const lines: string[] = scene.key.map((k) => k.label);
  if (scene.input.harbor) lines.push(scene.seaName);
  if (scene.riverName) lines.push(scene.riverName);
  if (scene.rangeName && scene.geometry.ridge && scene.rangeInView) lines.push(scene.rangeName);
  for (const n of scene.neighbours.slice(0, 2)) lines.push(`The road to ${n.name}`);
  if (scene.beast) lines.push(`${scene.beast.name}, ${scene.beast.epithet}`);
  if (scene.input.realmName && scene.input.kind !== "capital") lines.push(`In ${scene.input.realmName.replace(/^The /, "the ")}`);
  return lines.slice(0, 8).map((label, i) => ({ n: i + 1, label }));
}

export function keyPanel(d: Dress, lines: ReadonlyArray<KeyLine>, x: number, y: number, cols: number): SvgNode[] {
  if (lines.length === 0) return [];
  const rows = Math.ceil(lines.length / cols);
  const colW = 92, rowH = 8.6;
  const w = cols * colW + 10, h = rows * rowH + 10;
  const out: SvgNode[] = strapwork(d, x + w / 2, y + h / 2, w, h, false);
  lines.forEach((l, i) => {
    const col = Math.floor(i / rows), row = i % rows;
    out.push(el("text", { x: r1(x + 6 + col * colW), y: r1(y + 9 + row * rowH), "font-family": d.font, "font-size": 6.6, "font-style": "italic", fill: d.ink }, [`${l.n}. ${l.label}`]));
  });
  return out;
}

/** Numbered tags on the picture for the composed features (the engine's own anchors) and the named features. */
export function keyTags(d: Dress, scene: Scene, dy: number, extra: ReadonlyArray<{ n: number; x: number; y: number }>): SvgNode[] {
  const tags = [
    ...scene.key.map((k, i) => ({ n: i + 1, x: Math.max(VIEW_X0 + 8, Math.min(VIEW_X1 - 8, k.x)), y: Math.max(40, k.y + dy) })),
    ...extra,
  ];
  return tags.flatMap((t) => [
    el("text", { x: r1(t.x), y: r1(t.y), "text-anchor": "middle", "font-family": d.font, "font-size": 8, "font-style": "italic", fill: d.paper, stroke: d.paper, "stroke-width": 2.4 }, [String(t.n)]),
    el("text", { x: r1(t.x), y: r1(t.y), "text-anchor": "middle", "font-family": d.font, "font-size": 8, "font-style": "italic", fill: d.ink }, [String(t.n)]),
  ]);
}

export function cardinalWords(d: Dress, scene: Scene, top: number, bottom: number): SvgNode[] {
  const c = scene.cardinals;
  const t = (x: number, y: number, s: string, anchor: string): SvgNode =>
    el("text", { x: r1(x), y: r1(y), "text-anchor": anchor, "font-family": d.font, "font-size": 6.2, "font-style": "italic", fill: d.soft }, [s]);
  return [
    t(VIEW_X0 + 4, top + 7, c.left, "start"),
    t(VIEW_X1 - 4, top + 7, c.right, "end"),
    t(CX, top + 7, c.far, "middle"),
    t(VIEW_X0 + 4, bottom, c.near, "start"),
  ];
}

/** A far town on the horizon: three tiny roofs and a spire, with its name in italic above, placed by its true bearing and pushed clear of the town's own run. */
export function horizonTowns(d: Dress, scene: Scene, horizonYAt: (x: number) => number, startN: number, townRun: readonly [number, number]): { nodes: SvgNode[]; tags: Array<{ n: number; x: number; y: number }> } {
  const nodes: SvgNode[] = [];
  const tags: Array<{ n: number; x: number; y: number }> = [];
  scene.neighbours.slice(0, 2).forEach((nb, i) => {
    let x = Math.max(VIEW_X0 + 30, Math.min(VIEW_X1 - 30, CX + nb.lateral * 230));
    if (x > townRun[0] - 24 && x < townRun[1] + 24) x = nb.lateral < 0 ? townRun[0] - 30 : townRun[1] + 30;
    if (x < VIEW_X0 + 24 || x > VIEW_X1 - 24) return;
    const y = horizonYAt(x);
    const s = nb.kind === "capital" ? 1.3 : nb.kind === "town" ? 1 : 0.75;
    nodes.push(el("path", {
      d: `M${r1(x - 7 * s)} ${r1(y)}v${r1(-3 * s)}l${r1(2 * s)} ${r1(-2 * s)}l${r1(2 * s)} ${r1(2 * s)}v${r1(3 * s)}M${r1(x - 2 * s)} ${r1(y)}v${r1(-4 * s)}l${r1(2 * s)} ${r1(-2 * s)}l${r1(2 * s)} ${r1(2 * s)}v${r1(4 * s)}M${r1(x + 3 * s)} ${r1(y)}v${r1(-3 * s)}l${r1(2 * s)} ${r1(-1.6 * s)}l${r1(2 * s)} ${r1(1.6 * s)}v${r1(3 * s)}M${r1(x + 0.6 * s)} ${r1(y - 4 * s)}v${r1(-3 * s)}l${r1(1.2 * s)} ${r1(-4 * s)}l${r1(1.2 * s)} ${r1(4 * s)}v${r1(3 * s)}`,
      fill: d.paper, ...stroke(d, 0.55),
    }));
    nodes.push(el("text", { x: r1(x), y: r1(y - 12 * s), "text-anchor": "middle", "font-family": d.font, "font-size": 6, "font-style": "italic", fill: d.ink }, [nb.name]));
    tags.push({ n: startN + i, x, y: y - 12 * s - 7 });
  });
  return { nodes, tags };
}

export function footerLine(d: Dress, scene: Scene, y: number): SvgNode {
  const text = scene.caption.yearLine ? `${scene.caption.yearLine}  ·  VELLUM  ·  CHART № ${scene.input.seed}` : `VELLUM  ·  CHART № ${scene.input.seed}`;
  return el("text", { x: CX, y, "text-anchor": "middle", "font-family": d.font, "font-size": 7.4, "letter-spacing": 2, fill: d.soft }, [text]);
}

export function frameNodes(d: Dress): SvgNode[] {
  const oi = 10;
  return [
    el("rect", { x: oi, y: oi, width: PLATE_W - 2 * oi, height: 384 - 2 * oi, fill: "none", stroke: d.ink, "stroke-width": 2 }),
    el("rect", { x: oi + 4, y: oi + 4, width: PLATE_W - 2 * oi - 8, height: 384 - 2 * oi - 8, fill: "none", stroke: d.ink, "stroke-width": 0.7 }),
  ];
}
