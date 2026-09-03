import { el, type SvgNode } from "../../src/render/svg.ts";
import type { Rng } from "../../src/core/rng.ts";
import { P, FONT, type Variant } from "./palette.ts";
import { offsetPath, r1, roadAngleDeg, stripPos, type Ev, type Ribbon, type Strip } from "./data.ts";
import * as G from "./glyphs.ts";

const BAND = 6;
const ROLL = 12;
const FOREST = new Set(["temperateForest", "rainforest", "tropicalForest"]);

type Body = { y0: number; y1: number; left: (y: number) => number; right: (y: number) => number };

function bodyOf(v: Variant, s: Strip): Body {
  const inset = v.frame === "scroll" ? ROLL : 0;
  const wob = v.frame === "wavy" ? 3.2 : 0;
  return {
    y0: s.y0 + inset,
    y1: s.y0 + s.h - inset,
    left: (y) => s.x0 + (wob ? 3.5 + wob * Math.sin(((y - s.y0) / 190) * Math.PI * 2 + s.index) + 0.9 * Math.sin(((y - s.y0) / 71) * Math.PI * 2) : 0),
    right: (y) => s.x0 + s.w - (wob ? 3.5 + wob * Math.sin(((y - s.y0) / 230) * Math.PI * 2 + s.index * 1.7 + 1.2) + 0.9 * Math.sin(((y - s.y0) / 83) * Math.PI * 2 + 2) : 0),
  };
}

function edgePath(b: Body, side: -1 | 1, off: number, down: boolean): string {
  const f = side < 0 ? b.left : b.right;
  const ys: number[] = [];
  for (let y = b.y0; y < b.y1; y += 6) ys.push(y);
  ys.push(b.y1);
  if (!down) ys.reverse();
  return ys.map((y, i) => `${i === 0 ? "M" : "L"}${r1(f(y) + off)} ${r1(y)}`).join("");
}

function bodyPath(b: Body): string {
  return `${edgePath(b, -1, 0, true)}${edgePath(b, 1, 0, false).replace(/^M/, "L")}Z`;
}

function bandPath(b: Body, side: -1 | 1): string {
  return `${edgePath(b, side, 0, true)}${edgePath(b, side, -side * BAND, false).replace(/^M/, "L")}Z`;
}

function roll(s: Strip, y: number, curlRight: boolean, id: string): SvgNode[] {
  const eyeX = curlRight ? s.x0 + s.w + 3 : s.x0 - 3;
  return [
    el("rect", { x: s.x0 - 3, y, width: s.w + 6, height: ROLL - 1, rx: 6, fill: `url(#${id})`, stroke: P.ink, "stroke-width": 0.9 }),
    el("circle", { cx: eyeX, cy: y + (ROLL - 1) / 2, r: 5.6, fill: P.paper, stroke: P.ink, "stroke-width": 0.9 }),
    el("circle", { cx: eyeX, cy: y + (ROLL - 1) / 2, r: 2.8, fill: "none", stroke: P.ink, "stroke-width": 0.6 }),
    el("circle", { cx: eyeX, cy: y + (ROLL - 1) / 2, r: 0.9, fill: P.ink }),
  ];
}

function frame(v: Variant, s: Strip, b: Body): SvgNode[] {
  const nodes: SvgNode[] = [];
  const fill = v.landWash ? { fill: P.landWash } : { fill: "#ffffff", "fill-opacity": 0.16 };
  if (v.frame === "rect") {
    nodes.push(
      el("rect", { x: s.x0, y: s.y0, width: s.w, height: s.h, ...fill }),
      el("rect", { x: s.x0 + 2.5, y: s.y0 + 2.5, width: BAND - 1, height: s.h - 5, fill: P.gamboge, "fill-opacity": 0.72 }),
      el("rect", { x: s.x0 + s.w - 2.5 - (BAND - 1), y: s.y0 + 2.5, width: BAND - 1, height: s.h - 5, fill: P.gamboge, "fill-opacity": 0.72 }),
      el("rect", { x: s.x0, y: s.y0, width: s.w, height: s.h, fill: "none", stroke: P.ink, "stroke-width": 1.1 }),
      el("rect", { x: s.x0 + 3, y: s.y0 + 3, width: s.w - 6, height: s.h - 6, fill: "none", stroke: P.soft, "stroke-width": 0.5 }),
    );
    return nodes;
  }
  nodes.push(el("path", { d: bodyPath(b), ...fill }));
  nodes.push(el("path", { d: bandPath(b, -1), fill: P.gamboge, "fill-opacity": 0.72 }));
  nodes.push(el("path", { d: bandPath(b, 1), fill: P.gamboge, "fill-opacity": 0.72 }));
  nodes.push(el("path", { d: bodyPath(b), fill: "none", stroke: P.ink, "stroke-width": 1.0 }));
  nodes.push(el("path", { d: edgePath(b, -1, BAND, true), fill: "none", stroke: P.soft, "stroke-width": 0.5 }));
  nodes.push(el("path", { d: edgePath(b, 1, -BAND, true), fill: "none", stroke: P.soft, "stroke-width": 0.5 }));
  if (v.frame === "scroll") {
    nodes.push(...roll(s, s.y0 + 1, false, `roll-${s.index}`), ...roll(s, s.y0 + s.h - ROLL, true, `roll-${s.index}`));
  }
  return nodes;
}

function smooth(pts: ReadonlyArray<readonly [number, number]>): string {
  let d = "";
  for (let i = 0; i < pts.length - 1; i++) {
    const a = pts[i]!;
    const b = pts[i + 1]!;
    d += `Q${r1(a[0])} ${r1(a[1])} ${r1((a[0] + b[0]) / 2)} ${r1((a[1] + b[1]) / 2)}`;
  }
  const last = pts[pts.length - 1]!;
  return `${d}L${r1(last[0])} ${r1(last[1])}`;
}

function seaWash(s: Strip, b: Body, rng: Rng): SvgNode[] {
  const nodes: SvgNode[] = [];
  for (const side of [-1, 1] as const) {
    const isSea = (i: number): boolean => (side < 0 ? s.samples[i]?.bl : s.samples[i]?.br) === "ocean";
    let i = 0;
    while (i < s.samples.length) {
      if (!isSea(i)) { i++; continue; }
      let j = i;
      while (j + 1 < s.samples.length && isSea(j + 1)) j++;
      if (j - i >= 1) {
        const clampY = (y: number): number => Math.min(b.y1 - 4, Math.max(b.y0 + 4, y));
        const inner = s.pts.slice(Math.max(0, i - 1), Math.min(s.pts.length, j + 2))
          .map((p) => [p[0] + side * (26 + rng.range(0, 12)), clampY(p[1])] as const);
        const yBot = clampY(Math.max(...inner.map((p) => p[1])) + 12);
        const yTop = clampY(Math.min(...inner.map((p) => p[1])) - 12);
        const edgeX = side < 0 ? b.left((yBot + yTop) / 2) + BAND : b.right((yBot + yTop) / 2) - BAND;
        const shore = [[edgeX + side * -6, yBot] as const, ...inner, [edgeX + side * -6, yTop] as const];
        const d = `M${r1(edgeX)} ${r1(yBot)}${smooth(shore)}L${r1(edgeX)} ${r1(yTop)}Z`;
        nodes.push(el("path", { d, fill: P.azuriteWash, "fill-opacity": 0.55, stroke: P.azurite, "stroke-width": 0.8, "stroke-opacity": 0.65, "stroke-linejoin": "round" }));
        for (let k = 0; k < Math.max(2, Math.round((yBot - yTop) / 40)); k++) {
          const p = inner[Math.floor(rng.range(0, inner.length - 0.01))]!;
          nodes.push(G.wave(p[0] + side * rng.range(4, 12) - 8, p[1] + rng.range(-8, 8), 0.7));
        }
      }
      i = j + 1;
    }
  }
  return nodes;
}

function decor(s: Strip, b: Body, rng: Rng): SvgNode[] {
  const nodes: SvgNode[] = [];
  const fork = rng.fork(`decor-${s.index}`);
  for (let i = 0; i < s.samples.length; i += 2) {
    const smp = s.samples[i];
    const pt = s.pts[i];
    if (!smp || !pt) continue;
    if (pt[1] < b.y0 + 26 || pt[1] > b.y1 - 12) continue;
    for (const side of [-1, 1] as const) {
      const rel = side < 0 ? smp.relL : smp.relR;
      const biome = side < 0 ? smp.bl : smp.br;
      if (fork.next() < 0.42) continue;
      const x = pt[0] + side * (25 + fork.range(0, 9));
      if (x < s.x0 + 12 || x > s.x0 + s.w - 12) continue;
      const y = pt[1] + fork.range(-2, 2);
      const sc = 0.72 + fork.range(0, 0.2);
      if (biome === "ocean") continue;
      else if (biome === "alpine" || biome === "snow") nodes.push(G.mountain(x, y, 0.8));
      else if (rel - smp.rel > 0.045) nodes.push(G.hill(x, y, 0.85));
      else if (FOREST.has(biome)) nodes.push(...G.stipple(fork, x, y - 3, 7, 10, P.verdigris, 0.55), G.treeRound(x, y, sc));
      else if (biome === "taiga") nodes.push(...G.stipple(fork, x, y - 3, 4, 8, P.verdigris, 0.5), G.treePine(x, y, sc));
      else if (biome === "jungle" || biome === "savanna") nodes.push(G.treePalm(x, y, sc));
      else if (biome === "marsh") nodes.push(...G.stipple(fork, x, y - 2, 3, 8, P.azurite, 0.5), G.marshTuft(x, y, sc));
      else if (biome === "desert") nodes.push(G.dune(x, y, sc));
    }
  }
  return nodes;
}

function road(v: Variant, s: Strip, rb: Ribbon): SvgNode[] {
  const nodes: SvgNode[] = [];
  const lineInk = v.frame === "rect" ? P.sepia : P.ink;
  const half = v.roadHalf;
  if (v.roadFill) {
    nodes.push(el("path", { d: `${offsetPath(s.pts, -half)}${offsetPath(s.pts, half, true).replace(/^M/, "L")}Z`, fill: P.gamboge, "fill-opacity": 0.5, stroke: "none" }));
  }
  for (const off of [-half, half]) {
    nodes.push(el("path", { d: offsetPath(s.pts, off), fill: "none", stroke: lineInk, "stroke-width": 1.1, "stroke-dasharray": "0.2 3.4", "stroke-linecap": "round" }));
  }
  const solidSpan = Math.min(2.2, 30 / s.pxPerCell);
  for (const e of rb.events) {
    if (e.kind !== "waypoint" || e.dist < s.d0 - 0.75 || e.dist > s.d1 + 0.75) continue;
    const a = stripPos(s, Math.max(s.d0, e.dist - solidSpan));
    const c = stripPos(s, Math.min(s.d1, e.dist + solidSpan));
    const dx = c.sx - a.sx;
    const dy = c.sy - a.sy;
    const len = Math.hypot(dx, dy);
    if (len < 2) continue;
    for (const off of [-half, half]) {
      const nx = (-dy / len) * off;
      const ny = (dx / len) * off;
      nodes.push(el("path", { d: `M${r1(a.sx + nx)} ${r1(a.sy + ny)}L${r1(c.sx + nx)} ${r1(c.sy + ny)}`, fill: "none", stroke: lineInk, "stroke-width": 1.2 }));
    }
  }
  return nodes;
}

function leagues(v: Variant, s: Strip, rb: Ribbon): SvgNode[] {
  const nodes: SvgNode[] = [];
  const cpl = rb.cellsPerLeague;
  const first = Math.max(1, Math.ceil(s.d0 / cpl));
  const last = Math.floor(s.d1 / cpl);
  for (let l = first; l <= last; l++) {
    const p = stripPos(s, l * cpl);
    if (v.numerals === "every") {
      nodes.push(
        el("circle", { cx: r1(p.sx), cy: r1(p.sy), r: 3.6, fill: v.landWash ? P.landWash : P.paper }),
        el("text", { x: r1(p.sx), y: r1(p.sy + 1.9), "text-anchor": "middle", "font-family": FONT, "font-size": 5.2, fill: P.ink }, [String(l)]),
      );
      continue;
    }
    nodes.push(el("circle", { cx: r1(p.sx), cy: r1(p.sy), r: 1.4, fill: P.ink }));
    if (l % 5 === 0) nodes.push(el("text", { x: r1(p.sx + 5.5), y: r1(p.sy + 2.4), "font-family": FONT, "font-size": 7, fill: P.soft }, [String(l)]));
  }
  return nodes;
}

type Track = { left: number; right: number };
type Line = { text: string; caps?: boolean; size?: number };

function wrap(text: string): string[] {
  const out: string[] = [];
  let cur = "";
  for (const w of text.split(" ")) {
    if (cur.length > 0 && cur.length + w.length > 17) { out.push(cur); cur = w; } else cur = cur.length === 0 ? w : `${cur} ${w}`;
  }
  if (cur.length > 0) out.push(cur);
  return out;
}

function caption(b: Body, sx: number, sy: number, side: -1 | 1, spec: Line[], track: Track): SvgNode[] {
  const lines = spec.flatMap((l) => wrap(l.text).map((text) => ({ text, caps: l.caps === true, size: l.size ?? 8.2 })));
  const need = lines.reduce((a, l) => a + l.size + 1.2, 0);
  const key = side < 0 ? "left" : "right";
  let y = Math.min(sy + 2.6, track[key] - need);
  y = Math.max(y, b.y0 + 12);
  track[key] = y - 4;
  const ax = side < 0 ? sx - 10 : sx + 10;
  const out: SvgNode[] = [];
  let dy = 0;
  for (const line of lines) {
    dy += line.size + 1.2;
    out.push(el("text", {
      x: r1(ax), y: r1(y + dy - 1.2), "text-anchor": side < 0 ? "end" : "start", "font-family": FONT, "font-size": line.size,
      "font-style": line.caps ? "normal" : "italic", ...(line.caps ? { "letter-spacing": 0.8 } : {}), fill: P.ink,
    }, [line.caps ? line.text.toUpperCase() : line.text]));
  }
  return out;
}

function riverBand(s: Strip, b: Body, sy: number, tilt: number): SvgNode {
  const x0 = b.left(sy) + BAND + 1;
  const x1 = b.right(sy) - BAND - 1;
  const span = (x1 - x0) / 4;
  let d = `M${r1(x0)} ${r1(sy)}`;
  for (let i = 0; i < 4; i++) d += `q${r1(span / 2)} ${i % 2 === 0 ? -3 : 3} ${r1(span)} 0`;
  return el("g", { transform: `rotate(${r1(tilt)} ${r1((x0 + x1) / 2)} ${r1(sy)})` }, [
    el("path", { d, fill: "none", stroke: P.azuriteWash, "stroke-width": 7, "stroke-opacity": 0.75 }),
    el("path", { d, fill: "none", stroke: P.azurite, "stroke-width": 1.4, "stroke-opacity": 0.9, transform: "translate(0 -3)" }),
    el("path", { d, fill: "none", stroke: P.azurite, "stroke-width": 1.0, "stroke-opacity": 0.7, transform: "translate(0 3)" }),
  ]);
}

function events(v: Variant, s: Strip, b: Body, rb: Ribbon, rng: Rng): SvgNode[] {
  const marks: SvgNode[] = [];
  const caps: SvgNode[] = [];
  const track: Track = { left: b.y1, right: b.y1 };
  for (const e of rb.events as Ev[]) {
    if (e.strip !== s.index || e.sx === null || e.sy === null) continue;
    const free: -1 | 1 = e.sx > s.x0 + s.w / 2 ? -1 : 1;
    switch (e.kind) {
      case "waypoint": {
        marks.push(G.settlementCluster(e.sx, e.sy - 1, e.tier ?? "hamlet"));
        const lines: Line[] = e.endpoint ? [{ text: e.caption, caps: true, size: 10.5 }] : [{ text: e.caption, caps: true, size: 8.6 }, { text: e.tierTag ?? "", size: 7.6 }];
        caps.push(...caption(b, e.sx, e.sy, free, lines, track));
        break;
      }
      case "crossing": {
        marks.push(riverBand(s, b, e.sy, rng.fork(`tilt-${e.dist}`).range(-9, 9)));
        const deg = roadAngleDeg(s, e.dist);
        marks.push(e.major || /over the|crossed by/.test(e.caption) ? G.bridgeMark(e.sx, e.sy, deg) : G.fordMark(e.sx, e.sy, deg));
        caps.push(...caption(b, e.sx, e.sy - 8, free, [{ text: e.caption }], track));
        break;
      }
      case "branch": {
        const side = e.side ?? 1;
        const ex = e.sx + side * 20;
        const ey = e.sy - 9;
        marks.push(el("path", { d: `M${r1(e.sx)} ${r1(e.sy)}Q${r1(e.sx + side * 12)} ${r1(e.sy - 2)} ${r1(ex)} ${r1(ey)}`, fill: "none", stroke: v.frame === "rect" ? P.sepia : P.ink, "stroke-width": 0.9, "stroke-dasharray": "0.2 3", "stroke-linecap": "round" }));
        caps.push(...caption(b, ex, ey, side, [{ text: e.caption }], track));
        break;
      }
      case "summit": {
        marks.push(G.mountain(e.sx + free * 27, e.sy + 4, 1.05));
        caps.push(...caption(b, e.sx, e.sy - 10, (free * -1) as -1 | 1, [{ text: e.caption }], track));
        break;
      }
    }
  }
  return [...marks, ...caps];
}

function continuation(s: Strip, b: Body, rb: Ribbon, isLast: boolean): SvgNode[] {
  if (isLast) return [];
  return [el("text", { x: r1(s.x0 + s.w / 2), y: r1(b.y0 + 12), "text-anchor": "middle", "font-family": FONT, "font-size": 7.5, "font-style": "italic", fill: P.soft }, [`· ${Math.round(s.d1 / rb.cellsPerLeague)} leagues ·`])];
}

function realmEdge(s: Strip, b: Body, name: string | null, side: -1 | 1): SvgNode[] {
  if (name === null) return [];
  const x = side < 0 ? s.x0 + 4.6 : s.x0 + s.w - 4.6;
  const y = (b.y0 + b.y1) / 2;
  return [el("text", {
    x: r1(x), y: r1(y), "text-anchor": "middle", "dominant-baseline": "middle", transform: `rotate(${side < 0 ? -90 : 90} ${r1(x)} ${r1(y)})`,
    "font-family": FONT, "font-size": 7.6, "font-style": "italic", "letter-spacing": 1.2, fill: P.ink,
  }, [name])];
}

export function stripNodes(v: Variant, s: Strip, rb: Ribbon, rng: Rng, isLast: boolean): SvgNode {
  const b = bodyOf(v, s);
  const compassX = s.x0 + s.w / 2 - Math.sign(s.lean || 1) * (s.w / 4 + 4);
  const compassY = s.y0 + s.h * 0.36;
  const edges = v.realmEdges
    ? [...(s.index === 0 ? realmEdge(s, b, rb.realmFrom, -1) : []), ...(isLast ? realmEdge(s, b, rb.realmTo, 1) : [])]
    : [];
  return el("g", {}, [
    ...frame(v, s, b),
    ...seaWash(s, b, rng.fork(`sea-${s.index}`)),
    ...decor(s, b, rng),
    G.compassRose(compassX, compassY, s.needleDeg),
    ...road(v, s, rb),
    ...leagues(v, s, rb),
    ...events(v, s, b, rb, rng),
    ...continuation(s, b, rb, isLast),
    ...edges,
  ]);
}
