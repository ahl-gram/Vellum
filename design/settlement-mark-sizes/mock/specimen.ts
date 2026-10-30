// Issue #1104 round: the seven tiers side by side in each dress (a specimen, not a sheet), and the size table: each tier's box as the issue's own measuring script reads it, per ladder and dress.
import { settlementGlyph } from "../../../src/render/layers/settlement-marks.ts";
import { STYLES, type StyleName } from "../../../src/render/style.ts";
import { renderSvg, el } from "../../../src/render/svg.ts";
import { TIERS, setMarks, type Mults, type Tier } from "./ladder.ts";

export const DRESSES: readonly StyleName[] = ["antique", "ink", "topographic", "nautical"];
const LABEL: Record<Tier, string> = {
  capital: "capital",
  seat: "seat",
  town: "town",
  village: "village",
  hamlet: "hamlet",
  farmstead: "farmstead",
  mill: "mill",
};

const ctxFor = (style: StyleName) => ({ style: STYLES[style], proj: { widthPx: 1500 } }) as never;

export function boxOf(tier: Tier, style: StyleName, mult: Mults): { w: number; h: number } {
  setMarks(mult, style);
  const svg = renderSvg(settlementGlyph(tier, 100, 100, ctxFor(style)));
  const xs: number[] = [];
  const ys: number[] = [];
  for (const m of svg.matchAll(/[ML]\s*(-?[\d.]+)[ ,](-?[\d.]+)/g)) {
    xs.push(Number(m[1]));
    ys.push(Number(m[2]));
  }
  for (const m of svg.matchAll(/cx="(-?[\d.]+)" cy="(-?[\d.]+)" r="(-?[\d.]+)"/g)) {
    const [cx, cy, r] = [Number(m[1]), Number(m[2]), Number(m[3])];
    xs.push(cx - r, cx + r);
    ys.push(cy - r, cy + r);
  }
  return { w: Math.max(...xs) - Math.min(...xs), h: Math.max(...ys) - Math.min(...ys) };
}

const PITCH = 46;
const BASE = 30;

export function specimenSvg(style: StyleName, mult: Mults): string {
  setMarks(mult, style);
  const s = STYLES[style];
  const w = PITCH * TIERS.length;
  const h = 62;
  const marks = TIERS.map((t, i) => settlementGlyph(t, PITCH / 2 + i * PITCH, BASE, ctxFor(style)));
  const words = TIERS.map((t, i) =>
    el("text", { x: PITCH / 2 + i * PITCH, y: 57, "text-anchor": "middle", "font-family": s.fontFamily, "font-size": "7", fill: s.labelColor }, [LABEL[t]]),
  );
  const root = el("svg", { xmlns: "http://www.w3.org/2000/svg", viewBox: `0 0 ${w} ${h}`, width: w, height: h }, [
    el("rect", { x: 0, y: 0, width: w, height: h, fill: s.paper }),
    ...marks,
    ...words,
  ]);
  return renderSvg(root);
}
