import { writeFileSync } from "node:fs";
import { join } from "node:path";
import { fileURLToPath } from "node:url";
import * as fontkit from "fontkit";
import { GRID, UNITS_PER_EM, type FaceName } from "../src/prospect/letter/face.ts";

export const PLATE_FONTS = fileURLToPath(new URL("../design/kit/plate-fonts", import.meta.url));
export const FACE_DIR = fileURLToPath(new URL("../src/prospect/letter", import.meta.url));

const UPPER = "ABCDEFGHIJKLMNOPQRSTUVWXYZ";
const DIGITS = "0123456789";
const MARKS = " ,.-·";

export const PLATE_FACES: Readonly<
  Record<FaceName, { readonly file: string; readonly chars: string; readonly symbol: string }>
> = {
  roman: { file: "im-fell-dw-pica-latin-400-normal.woff2", chars: DIGITS + MARKS, symbol: "ROMAN" },
  caps: { file: "im-fell-dw-pica-sc-latin-400-normal.woff2", chars: UPPER + DIGITS + MARKS, symbol: "CAPS" },
  italic: {
    file: "im-fell-dw-pica-latin-400-italic.woff2",
    chars: UPPER + UPPER.toLowerCase() + DIGITS + MARKS,
    symbol: "ITALIC",
  },
};

export const TOLERANCE = 2;
const FLATTEN_STEPS = 8;

type P = readonly [number, number];
type Cmd = { readonly command: string; readonly args: readonly number[] };

function flatten(cmds: readonly Cmd[]): P[][] {
  const out: P[][] = [];
  let cur: P[] = [];
  let last: P = [0, 0];
  for (const c of cmds) {
    const a = c.args;
    if (c.command === "moveTo") {
      if (cur.length > 0) out.push(cur);
      last = [a[0]!, a[1]!];
      cur = [last];
    } else if (c.command === "lineTo") {
      last = [a[0]!, a[1]!];
      cur.push(last);
    } else if (c.command === "quadraticCurveTo") {
      for (let k = 1; k <= FLATTEN_STEPS; k++) {
        const t = k / FLATTEN_STEPS,
          u = 1 - t;
        cur.push([
          u * u * last[0] + 2 * u * t * a[0]! + t * t * a[2]!,
          u * u * last[1] + 2 * u * t * a[1]! + t * t * a[3]!,
        ]);
      }
      last = [a[2]!, a[3]!];
    } else if (c.command === "closePath") {
      if (cur.length > 0) out.push(cur);
      cur = [];
    } else {
      throw new RangeError(`the plate faces are TrueType quadratics; ${c.command} is not expected`);
    }
  }
  if (cur.length > 0) out.push(cur);
  return out;
}

/** Squared distance from p to the segment ab: squares only, so a regeneration on any platform yields the same vertices. */
export function segmentDistance2(p: P, a: P, b: P): number {
  const dx = b[0] - a[0],
    dy = b[1] - a[1];
  const l2 = dx * dx + dy * dy;
  const t = l2 === 0 ? 0 : Math.max(0, Math.min(1, ((p[0] - a[0]) * dx + (p[1] - a[1]) * dy) / l2));
  const ex = p[0] - a[0] - t * dx,
    ey = p[1] - a[1] - t * dy;
  return ex * ex + ey * ey;
}

export function simplify(pts: readonly P[], tolerance: number): P[] {
  if (pts.length < 3) return [...pts];
  const keep = new Uint8Array(pts.length);
  keep[0] = 1;
  keep[pts.length - 1] = 1;
  const stack: Array<readonly [number, number]> = [[0, pts.length - 1]];
  for (let top = stack.pop(); top !== undefined; top = stack.pop()) {
    const [a, b] = top;
    let best = -1,
      bd = 0;
    for (let i = a + 1; i < b; i++) {
      const d = segmentDistance2(pts[i]!, pts[a]!, pts[b]!);
      if (d > bd) {
        bd = d;
        best = i;
      }
    }
    if (best >= 0 && bd > tolerance * tolerance) {
      keep[best] = 1;
      stack.push([a, best], [best, b]);
    }
  }
  return pts.filter((_, i) => keep[i] === 1);
}

function encode(contours: readonly P[][]): string {
  let s = "";
  let px = 0,
    py = 0;
  const num = (v: number): string => (v < 0 || s === "" || /[a-z]$/.test(s) ? String(v) : ` ${v}`);
  for (const contour of contours) {
    const closed = simplify([...contour, contour[0]!], TOLERANCE).slice(0, -1);
    const grid = closed.map(([x, y]) => [Math.round(x / GRID), Math.round(-y / GRID)] as const);
    const pts = grid.filter((p, i) => i === 0 || p[0] !== grid[i - 1]![0] || p[1] !== grid[i - 1]![1]);
    if (pts.length < 3) continue;
    s += "m";
    s += num(pts[0]![0] - px);
    s += num(pts[0]![1] - py);
    s += "l";
    for (let i = 1; i < pts.length; i++) {
      s += num(pts[i]![0] - pts[i - 1]![0]);
      s += num(pts[i]![1] - pts[i - 1]![1]);
    }
    s += "z";
    [px, py] = pts[0]!;
  }
  return s;
}

function openFace(name: FaceName): fontkit.Font {
  const font = fontkit.openSync(join(PLATE_FONTS, PLATE_FACES[name].file));
  if (!("glyphForCodePoint" in font)) throw new Error(`${PLATE_FACES[name].file} is a collection, not a face`);
  if (font.unitsPerEm !== UNITS_PER_EM)
    throw new RangeError(`${PLATE_FACES[name].file} has ${font.unitsPerEm} units per em, not ${UNITS_PER_EM}`);
  return font;
}

function glyphRecord(g: fontkit.Glyph): string {
  const { minX, maxX, minY, maxY } = g.bbox;
  const nums = [g.advanceWidth, minX, maxX, minY, maxY].map((v) => String(Number.isFinite(v) ? v : 0));
  return `[${nums.join(", ")}, ${JSON.stringify(encode(flatten(g.path.commands)))}]`;
}

function ligaturesOf(font: fontkit.Font, chars: string): string[] {
  const found = new Set<string>();
  const letters = Array.from(chars).filter((c) => c !== " ");
  for (const a of letters) for (const b of letters) if (font.layout(a + b).glyphs.length === 1) found.add(a + b);
  for (const lig of [...found])
    for (const c of letters) if (font.layout(lig + c).glyphs.length === 1) found.add(lig + c);
  return [...found].sort((p, q) => q.length - p.length || (p < q ? -1 : 1));
}

function kernRows(font: fontkit.Font, keys: readonly string[]): string[] {
  const rows: string[] = [];
  for (const a of keys) {
    const pairs: string[] = [];
    for (const b of keys) {
      const run = font.layout(a + b, { calt: false });
      if (run.glyphs.length !== 2) continue;
      const k = run.positions[0]!.xAdvance - run.glyphs[0]!.advanceWidth;
      if (k !== 0) pairs.push(`${JSON.stringify(b)}: ${k}`);
    }
    if (pairs.length > 0) rows.push(`    ${JSON.stringify(a)}: { ${pairs.join(", ")} },`);
  }
  return rows;
}

export function faceModuleSource(name: FaceName): string {
  const font = openFace(name);
  const { chars, symbol } = PLATE_FACES[name];
  const ligatures = ligaturesOf(font, chars);
  const keys = [...Array.from(chars), ...ligatures];
  const glyphLines = keys.map((k) => {
    const run = font.layout(k);
    if (run.glyphs.length !== 1 || run.glyphs[0]!.id === 0)
      throw new RangeError(`${name} has no glyph for ${JSON.stringify(k)}`);
    return `    ${JSON.stringify(k)}: ${glyphRecord(run.glyphs[0]!)},`;
  });
  return [
    `/*! The plate face, ${name}: a Modified Version of IM FELL DW Pica, (c) 2007 Igino Marini (www.iginomarini.com) With Reserved Font Name IM FELL DW Pica Roman, IM FELL DW Pica Italic and IM FELL DW Pica SC; licensed under the SIL Open Font License 1.1, the full text in /fonts/OFL.txt. Written by npm run plate-face. */`,
    `import type { FaceTable } from "./face.ts";`,
    "",
    `export const ${symbol}: FaceTable = {`,
    `  name: ${JSON.stringify(name)},`,
    "  glyphs: {",
    ...glyphLines,
    "  },",
    `  ligatures: ${JSON.stringify(ligatures)},`,
    "  kern: {",
    ...kernRows(font, keys),
    "  },",
    "};",
    "",
  ].join("\n");
}

export const faceModulePath = (name: FaceName): string => join(FACE_DIR, `face-${name}.ts`);

if (process.argv[1] === fileURLToPath(import.meta.url)) {
  for (const name of Object.keys(PLATE_FACES) as FaceName[])
    writeFileSync(faceModulePath(name), faceModuleSource(name));
}
