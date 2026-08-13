/** Structural SVG comparison tolerant of cross-platform float noise: sin/cos/atan2 are not correctly rounded, so trailing digits differ (~1e-13) and a 2-decimal rounding boundary can flip by one 0.01 quantum; the non-numeric skeleton must match EXACTLY, numeric tokens within tolerance. Used by test/site/hero-charts.test.ts. */

// A leading '-' only matches when a digit follows, so attribute hyphens (stroke-width) are skipped.
const NUM = /-?\d+(?:\.\d+)?/g;

// 0.05 sits above the 0.01 rounding quantum yet 20x below a 1px change, so a rounding flip or ULP noise passes while real drift fails.
export const DRIFT_TOL = 0.05;

export type SvgDiff =
  | { kind: "structure"; at: number; committed: string; fresh: string }
  | { kind: "numeric"; maxAbs: number; overTol: number; total: number; examples: string[] };

/** Returns null when byte-identical or within tol; "structure" when the skeletons differ; "numeric" otherwise (overTol === 0 means only tolerated float noise). */
export function diffSvg(committed: string, fresh: string, tol = DRIFT_TOL): SvgDiff | null {
  const skelC = committed.replace(NUM, "#");
  const skelF = fresh.replace(NUM, "#");
  if (skelC !== skelF) {
    let i = 0;
    while (i < skelC.length && i < skelF.length && skelC[i] === skelF[i]) i++;
    return {
      kind: "structure",
      at: i,
      committed: skelC.slice(Math.max(0, i - 40), i + 40),
      fresh: skelF.slice(Math.max(0, i - 40), i + 40),
    };
  }
  const nc = committed.match(NUM) ?? [];
  const nf = fresh.match(NUM) ?? [];
  let maxAbs = 0;
  let overTol = 0;
  const examples: string[] = [];
  for (let j = 0; j < nc.length; j++) {
    const d = Math.abs(Number(nc[j]) - Number(nf[j]));
    if (d > maxAbs) maxAbs = d;
    if (d > tol) {
      overTol++;
      if (examples.length < 5) examples.push(`${nc[j]} vs ${nf[j]} (Δ${d.toExponential(2)})`);
    }
  }
  return maxAbs > 0 ? { kind: "numeric", maxAbs, overTol, total: nc.length, examples } : null;
}
