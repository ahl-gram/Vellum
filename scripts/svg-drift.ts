/**
 * Structural SVG comparison tolerant of cross-platform floating-point noise.
 *
 * SVG coordinates come straight from Math.sin/cos/atan2, which are not IEEE-
 * correctly-rounded, so the same seed rendered on a different OS / Node build
 * differs in the trailing digits (~1e-13), and where a 2-decimal coordinate sits
 * on a rounding boundary that noise can flip it by one 0.01 quantum. A byte
 * compare reads that as drift; this does not. The non-numeric skeleton must match
 * EXACTLY (any real markup / attribute / text / coordinate-shape change), while
 * numeric tokens are compared within a tolerance above the rounding quantum and
 * ULP noise but far below any real coordinate move.
 *
 * Used by the hero-charts drift guard (test/site/hero-charts.test.ts).
 */

// Plain SVG decimals (no scientific notation in our output). A leading '-' only
// matches when a digit follows, so attribute hyphens (stroke-width) are skipped.
const NUM = /-?\d+(?:\.\d+)?/g;

// Coordinates are emitted rounded to 2 decimals, so a ~1e-13 cross-platform trig
// difference can flip the last digit by one quantum (0.01) at a rounding
// boundary. The default sits above that quantum yet 20x below a 1px change, so a
// rounding flip or full-precision ULP noise passes while real drift fails.
export const DRIFT_TOL = 0.05;

export type SvgDiff =
  | { kind: "structure"; at: number; committed: string; fresh: string }
  | { kind: "numeric"; maxAbs: number; overTol: number; total: number; examples: string[] };

/**
 * Compare two SVGs. Returns null when they are byte-identical OR differ only
 * within `tol`; a "structure" diff when the non-numeric skeletons differ; a
 * "numeric" diff (with magnitudes) when some number moved past `tol`.
 *
 * A "numeric" result with overTol === 0 means the only differences are tolerated
 * float noise — useful for reporting the max delta on an otherwise-green run.
 */
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
