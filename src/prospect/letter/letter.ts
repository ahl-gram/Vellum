import { el, type SvgNode } from "../../render/svg.ts";
import { GRID, UNITS_PER_EM, type FaceName, type FaceTable, type Glyph } from "./face.ts";
import { ROMAN } from "./face-roman.ts";
import { CAPS } from "./face-caps.ts";
import { ITALIC } from "./face-italic.ts";
import { NUMERO } from "./numero.ts";

export const FACES: Readonly<Record<FaceName, FaceTable>> = { roman: ROMAN, caps: CAPS, italic: ITALIC };
const NUMERO_KEY = "№";
/** The lib spike's optical sizes against the Iowan stack the plate was laid out in (Issue #747, issuecomment-5980975988). */
export const OPTICAL_SCALE: Readonly<Record<FaceName, number>> = { roman: 1.06, caps: 1, italic: 1.1 };

export type RunSpec = {
  readonly text: string;
  readonly x: number;
  readonly y: number;
  readonly size: number;
  readonly italic?: boolean;
  readonly anchor?: "start" | "middle" | "end";
  readonly spacing?: number;
  readonly fill: string;
  readonly opacity?: number;
  readonly halo?: { readonly color: string; readonly width: number };
};

export type RunBox = { readonly x0: number; readonly x1: number; readonly top: number; readonly bottom: number };

type Placed = { readonly key: string; readonly glyph: Glyph; readonly at: number };

export type RunLayout = {
  readonly face: FaceName;
  readonly scale: number;
  readonly x0: number;
  readonly width: number;
  readonly glyphs: ReadonlyArray<Placed>;
};

export function faceFor(text: string, italic: boolean): FaceName {
  if (italic) return "italic";
  const letters = text.replace(/[^A-Za-z]/g, "");
  return letters.length > 0 && letters === letters.toUpperCase() ? "caps" : "roman";
}

function glyphOf(face: FaceTable, key: string): Glyph {
  if (key === NUMERO_KEY && face.name !== "italic") return NUMERO;
  const g = face.glyphs[key];
  if (g === undefined) throw new RangeError(`the plate face has no ${face.name} glyph for ${JSON.stringify(key)}`);
  return g;
}

export function glyphKeys(face: FaceTable, text: string): string[] {
  const out: string[] = [];
  let i = 0;
  while (i < text.length) {
    const lig = face.ligatures.find((l) => text.startsWith(l, i));
    const key = lig ?? text.charAt(i);
    out.push(key);
    i += key.length;
  }
  return out;
}

export function layoutRun(spec: RunSpec): RunLayout {
  const faceName = faceFor(spec.text, spec.italic === true);
  const face = FACES[faceName];
  const scale = (spec.size * OPTICAL_SCALE[faceName]) / UNITS_PER_EM;
  const spacing = (spec.spacing ?? 0) / scale;
  const glyphs: Placed[] = [];
  let at = 0;
  let prev: string | null = null;
  for (const key of glyphKeys(face, spec.text)) {
    if (prev !== null) at += (face.kern[prev]?.[key] ?? 0) + spacing;
    const glyph = glyphOf(face, key);
    glyphs.push({ key, glyph, at });
    at += glyph[0];
    prev = key;
  }
  const width = at * scale;
  const anchor = spec.anchor ?? "start";
  const x0 = spec.x - (anchor === "middle" ? width / 2 : anchor === "end" ? width : 0);
  return { face: faceName, scale, x0, width, glyphs };
}

export function runBox(spec: RunSpec): RunBox {
  const run = layoutRun(spec);
  const inked = run.glyphs.filter((g) => g.glyph[5] !== "");
  if (inked.length === 0) return { x0: run.x0, x1: run.x0, top: spec.y, bottom: spec.y };
  return {
    x0: run.x0 + Math.min(...inked.map((g) => g.at + g.glyph[1])) * run.scale,
    x1: run.x0 + Math.max(...inked.map((g) => g.at + g.glyph[2])) * run.scale,
    top: spec.y - Math.max(...inked.map((g) => g.glyph[4])) * run.scale,
    bottom: spec.y - Math.min(...inked.map((g) => g.glyph[3])) * run.scale,
  };
}

const r1 = (v: number): number => Math.round(v * 10) / 10;
const r2 = (v: number): number => Math.round(v * 100) / 100;
const r6 = (v: number): number => Math.round(v * 1e6) / 1e6;

export type Lettering = {
  readonly run: (spec: RunSpec) => SvgNode;
  readonly defs: () => SvgNode[];
};

/** One plate's lettering: each glyph defined once, ids carrying the plate's suffix so several plates can share a document. */
export function createLettering(suffix: string): Lettering {
  const defined = new Map<string, SvgNode>();
  const idOf = (face: FaceName, key: string, glyph: Glyph): string => {
    const id = key === NUMERO_KEY ? `pf-n-${suffix}` : `pf-${face[0] ?? ""}${Object.keys(FACES[face].glyphs).indexOf(key)}-${suffix}`;
    if (!defined.has(id)) defined.set(id, el("path", { id, d: glyph[5] }));
    return id;
  };
  const run = (spec: RunSpec): SvgNode => {
    const layout = layoutRun(spec);
    const k = layout.scale * GRID;
    const uses = layout.glyphs
      .filter((g) => g.glyph[5] !== "")
      .map((g) => el("use", { href: `#${idOf(layout.face, g.key, g.glyph)}`, x: r1(g.at / GRID) }));
    const transform = `translate(${r2(layout.x0)} ${r2(spec.y)}) scale(${r6(k)})`;
    const ink = el("g", { "aria-label": spec.text, fill: spec.fill, ...(spec.opacity === undefined ? {} : { "fill-opacity": spec.opacity }), transform }, uses);
    if (spec.halo === undefined) return ink;
    const halo = el("g", { fill: spec.halo.color, stroke: spec.halo.color, "stroke-width": r2(spec.halo.width / k), "stroke-linejoin": "round", transform }, uses);
    return el("g", {}, [halo, ink]);
  };
  return { run, defs: () => [...defined.values()] };
}
