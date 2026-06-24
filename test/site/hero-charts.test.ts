import { test } from "node:test";
import assert from "node:assert/strict";
import { readFile, readdir } from "node:fs/promises";
import { fileURLToPath } from "node:url";
import { heroChartSvgs } from "../../scripts/hero-charts.ts";

/**
 * Drift guard (#40 part 2): the committed `docs/charts/*.svg` heroes are content
 * the homepage embeds by relative path, but nothing re-rendered them from src/.
 * A `src/render` change that alters how seed 42 draws could leave the homepage
 * showing stale charts silently. This re-renders them via heroChartSvgs() (the
 * same function `npm run site` writes with) and compares.
 *
 * NOT a byte compare. SVG coordinates come straight from trig/projection at full
 * float precision, and Math.sin/cos/atan2 are not IEEE-correctly-rounded, so a
 * fresh render on a different OS / Node build differs from the committed bytes by
 * ~1 ULP in the trailing digits (CI is linux + node 26; the charts are committed
 * from a dev machine). That is the same platform sensitivity the e2e A4 check
 * tolerates. So compare STRUCTURALLY: the non-numeric skeleton must match exactly
 * (catches any real markup / attribute / text / coordinate-shape change), and
 * every numeric token must match within TOL — far below any real coordinate move
 * (>= 0.01px) but far above floating-point noise (~1e-10). On a real drift this
 * still fails loudly with the offending magnitudes; then run `npm run site`.
 */

const chartsDir = fileURLToPath(new URL("../../docs/charts/", import.meta.url));

// Plain SVG decimals (no scientific notation in our output). A leading '-' only
// matches when a digit follows, so attribute hyphens (stroke-width) are skipped.
const NUM = /-?\d+(?:\.\d+)?/g;
// Coordinates are emitted rounded to 2 decimals, so a ~1e-13 cross-platform trig
// difference can flip the last digit by one quantum (0.01) at a rounding
// boundary. TOL sits above that quantum yet 20x below a 1px change, so a
// rounding flip or full-precision ULP noise passes while real drift fails.
const TOL = 0.05;

type Diff =
  | { kind: "structure"; at: number; committed: string; fresh: string }
  | { kind: "numeric"; maxAbs: number; overTol: number; total: number; examples: string[] };

function diffSvg(committed: string, fresh: string): Diff | null {
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
    if (d > TOL) {
      overTol++;
      if (examples.length < 5) examples.push(`${nc[j]} vs ${nf[j]} (Δ${d.toExponential(2)})`);
    }
  }
  return maxAbs > 0 ? { kind: "numeric", maxAbs, overTol, total: nc.length, examples } : null;
}

test("committed docs/charts heroes match a fresh src/ render (structure exact, numbers ULP-tolerant)", async () => {
  let worstAbs = 0;
  for (const [name, svg] of heroChartSvgs()) {
    const committed = await readFile(chartsDir + name, "utf8");
    const d = diffSvg(committed, svg);
    if (d === null) continue; // byte-identical (same platform)
    if (d.kind === "structure") {
      assert.fail(
        `docs/charts/${name} drifted from src/ — a structural change at offset ${d.at}. ` +
          `Run \`npm run site\` to regenerate.\n  committed: …${d.committed}…\n  fresh:     …${d.fresh}…`,
      );
    }
    worstAbs = Math.max(worstAbs, d.maxAbs);
    assert.equal(
      d.overTol,
      0,
      `docs/charts/${name}: ${d.overTol}/${d.total} numbers drifted beyond ${TOL}px ` +
        `(max Δ ${d.maxAbs.toExponential(2)}) — run \`npm run site\` to regenerate. e.g. ${d.examples.join("; ")}`,
    );
  }
  // A green run logs the platform float noise, documenting it was ULP, not drift.
  if (worstAbs > 0) {
    console.log(`hero-charts drift guard: max cross-render numeric Δ = ${worstAbs.toExponential(2)}px (tol ${TOL})`);
  }
});

test("committed docs/charts has no orphaned or missing SVGs", async () => {
  const produced = new Set(heroChartSvgs().keys());
  const committed = new Set((await readdir(chartsDir)).filter((f) => f.endsWith(".svg")));
  const orphans = [...committed].filter((f) => !produced.has(f));
  const missing = [...produced].filter((f) => !committed.has(f));
  assert.deepEqual(
    { orphans, missing },
    { orphans: [], missing: [] },
    "docs/charts file set disagrees with heroChartSvgs() — run `npm run site` to regenerate",
  );
});
