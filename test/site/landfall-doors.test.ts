import { test } from "node:test";
import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { resolve } from "node:path";

// Landfall Sub 4a (Issue #470), ratified 2026-08-24: the failed-bundle doors. SPEC: the 2026-08-24 ratification comment on Issue #470 and the re-baseline comment beneath it.

const REPO = resolve(import.meta.dirname, "..", "..");
const read = (p: string): string => readFileSync(resolve(REPO, p), "utf8");
const liveCss = (p: string): string => read(p).replace(/\/\*[\s\S]*?\*\//g, "");

const astro = read("src/pages/index.astro");
const css = liveCss("public/index.css");

// Both numbers are source, the reveal's delay in a sheet and the veil's release in an inline script, and where the one window lives is part 2i's of Issue #779.
test("the 10s window is the veil's own, derived not duplicated by hand (#470)", () => {
  const delay = css.match(/animation:\s*lf-doors-reveal 0s linear (\d+)s forwards/);
  assert.ok(delay, "the reveal names its delay");
  const veil = astro.match(/if \(v\.dataset\.adopted === undefined\) v\.remove\(\); \}, (\d+)\);/);
  assert.ok(veil, "the veil's self-release timeout is readable");
  assert.equal(
    Number(delay[1]) * 1000,
    Number(veil[1]),
    "the doors and the unadopted veil share one self-release window (ratified 2026-08-24): a page whose veil just lifted must show its doors in the same breath, so a change to either constant must move both",
  );
});
