// The hand-drawn post-pass with roughjs: every stroked <path> in a rendered plate keeps its fill and gains a wobbled stroke drawn by rough's generator (seeded, single stroke). It is here to show what the library adds; it cannot ship as is, since rough draws with Math.sin, Math.cos and Math.random (see the report).
import rough from "roughjs";

const gen = rough.generator();

function attrs(src: string): Record<string, string> {
  const out: Record<string, string> = {};
  for (const m of src.matchAll(/([\w:-]+)="([^"]*)"/g)) out[m[1]!] = m[2]!;
  return out;
}

export function roughenPlate(svg: string, seed: number, roughness = 0.55, bowing = 0.7): { svg: string; count: number } {
  let count = 0;
  let n = 0;
  const out = svg.replace(/<path ([^>]*)\/>/g, (whole, a: string) => {
    const at = attrs(a);
    const d = at["d"];
    const stroke = at["stroke"];
    if (!d || !stroke || stroke === "none" || d.length > 4000) return whole;
    n += 1;
    let paths: ReturnType<typeof gen.toPaths>;
    try {
      paths = gen.toPaths(gen.path(d, { seed: (seed * 7919 + n) % 2147483647, roughness, bowing, disableMultiStroke: true, stroke, fill: "none", strokeWidth: Number(at["stroke-width"] ?? 1) }));
    } catch {
      return whole;
    }
    const wob = paths.filter((p) => p.stroke && p.stroke !== "none").map((p) => p.d).join("");
    if (!wob) return whole;
    count += 1;
    const keep = Object.entries(at).filter(([k]) => k !== "d" && k !== "stroke").map(([k, v]) => ` ${k}="${v}"`).join("");
    const strokeAttrs = ["stroke-width", "stroke-opacity", "stroke-linecap", "stroke-linejoin", "stroke-dasharray", "opacity", "transform"].filter((k) => at[k] !== undefined).map((k) => ` ${k}="${at[k]}"`).join("");
    const body = at["fill"] && at["fill"] !== "none" ? `<path d="${d}"${keep} stroke="none"/>` : "";
    return `${body}<path d="${wob}" fill="none" stroke="${stroke}"${strokeAttrs}/>`;
  });
  return { svg: out, count };
}
