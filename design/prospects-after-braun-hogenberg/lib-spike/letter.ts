// The lettering post-pass: every <text> in a rendered plate becomes glyph outlines, so the plate carries its own engraved letterforms and no longer depends on the fonts a device has. Two forms: "inline" writes each run as one <path>; "defs" defines each distinct glyph once (ids suffixed per plate, as the heraldry does) and places it with <use>. Both are pure arithmetic over the font's integer outlines (multiply, divide, round).
import opentype from "opentype.js";

export type FaceSet = {
  readonly name: string;
  readonly roman: opentype.Font;
  readonly smallCaps: opentype.Font;
  readonly italic: opentype.Font;
  /** Nudges a face's optical size against the Iowan stack the mock was laid out for. */
  readonly scale: { roman: number; smallCaps: number; italic: number };
};

export function loadFace(relPath: string): opentype.Font {
  return opentype.loadSync(new URL(`./node_modules/@fontsource/${relPath}`, import.meta.url).pathname);
}

const unescape = (s: string): string => s.replaceAll("&quot;", '"').replaceAll("&apos;", "'").replaceAll("&lt;", "<").replaceAll("&gt;", ">").replaceAll("&amp;", "&");

function attrs(src: string): Record<string, string> {
  const out: Record<string, string> = {};
  for (const m of src.matchAll(/([\w:-]+)="([^"]*)"/g)) out[m[1]!] = m[2]!;
  return out;
}

/** The faces carry no U+2116, so the chart number's sign is spelled out; every other character the plates use is in the latin subset. */
const fallbackText = (s: string): string => s.replaceAll("№", "No.");

type Pick = { font: opentype.Font; scale: number; key: "r" | "s" | "i" };

function pickFace(f: FaceSet, a: Record<string, string>, text: string): Pick {
  if (a["font-style"] === "italic") return { font: f.italic, scale: f.scale.italic, key: "i" };
  const letters = text.replace(/[^A-Za-z]/g, "");
  if (letters.length > 0 && letters === letters.toUpperCase()) return { font: f.smallCaps, scale: f.scale.smallCaps, key: "s" };
  return { font: f.roman, scale: f.scale.roman, key: "r" };
}

const KEEP = ["fill", "fill-opacity", "stroke", "stroke-width", "stroke-opacity", "opacity"] as const;

function run(f: FaceSet, a: Record<string, string>, raw: string): { text: string; p: Pick; size: number; x0: number; y: number; opts: { kerning: boolean; letterSpacing: number } } {
  const text = fallbackText(unescape(raw));
  const p = pickFace(f, a, text);
  const size = Number(a["font-size"] ?? 10) * p.scale;
  const ls = Number(a["letter-spacing"] ?? 0);
  const opts = { kerning: true, letterSpacing: ls / size };
  const adv = p.font.getAdvanceWidth(text, size, opts);
  const anchor = a["text-anchor"] ?? "start";
  const x0 = Number(a["x"] ?? 0) - (anchor === "middle" ? adv / 2 : anchor === "end" ? adv : 0);
  return { text, p, size, x0, y: Number(a["y"] ?? 0), opts };
}

function letterInline(f: FaceSet, a: Record<string, string>, raw: string): string {
  const r = run(f, a, raw);
  const d = r.p.font.getPath(r.text, r.x0, r.y, r.size, r.opts).toPathData(1);
  const kept = KEEP.filter((k) => a[k] !== undefined).map((k) => ` ${k}="${a[k]}"`).join("");
  const join = a["stroke"] !== undefined ? ' stroke-linejoin="round"' : "";
  return `<path d="${d}"${kept}${join}/>`;
}

export function letterPlateInline(svg: string, f: FaceSet): string {
  return svg.replace(/<text ([^>]*)>([^<]*)<\/text>/g, (_m, a: string, t: string) => letterInline(f, attrs(a), t));
}

/** Glyph defs in font units (integers, exact) placed by translate and scale; a halo stroke is divided by the scale so it keeps its plate width. */
export function letterPlateDefs(svg: string, f: FaceSet, suffix: string): string {
  const defs = new Map<string, string>();
  const body = svg.replace(/<text ([^>]*)>([^<]*)<\/text>/g, (_m, aSrc: string, t: string) => {
    const a = attrs(aSrc);
    const r = run(f, a, t);
    const upem = r.p.font.unitsPerEm;
    const k = r.size / upem;
    const uses: string[] = [];
    r.p.font.forEachGlyph(r.text, r.x0, r.y, r.size, r.opts, (glyph, gx, gy) => {
      if (glyph.index === 0 || glyph.path.commands.length === 0) return;
      const id = `g${suffix}-${r.p.key}${glyph.index}`;
      if (!defs.has(id)) defs.set(id, `<path id="${id}" d="${glyph.getPath(0, 0, upem).toPathData(0)}"/>`);
      uses.push(`<use href="#${id}" transform="translate(${gx.toFixed(1)} ${gy.toFixed(1)}) scale(${k.toFixed(5)})"/>`);
    });
    const kept = KEEP.filter((kk) => a[kk] !== undefined && kk !== "stroke-width").map((kk) => ` ${kk}="${a[kk]}"`).join("");
    const sw = a["stroke-width"] !== undefined ? ` stroke-width="${(Number(a["stroke-width"]) / k).toFixed(1)}" stroke-linejoin="round"` : "";
    return `<g${kept}${sw}>${uses.join("")}</g>`;
  });
  const defBlock = `<defs>${[...defs.values()].join("")}</defs>`;
  return body.replace(/(<svg [^>]*>)/, `$1${defBlock}`);
}
