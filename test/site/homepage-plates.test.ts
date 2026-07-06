import { test } from "node:test";
import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import { fileURLToPath } from "node:url";

/**
 * Consistency guard (2026-07-06, #130 follow-up): every chart surface on the site
 * rests FLAT and tips on hover, so the hand meets the homepage hero plates, the
 * generated atlas figures, and the Explorer's bound atlas the same way. This guards
 * the homepage plate against a regression back to a resting tilt (the earlier
 * "scattered on the desk" look, `--tilt` per plate), which is what made it the odd
 * surface out (it straightened on hover while every other chart tips).
 */

const indexHtml = fileURLToPath(new URL("../../docs/index.html", import.meta.url));
const motionCss = fileURLToPath(new URL("../../docs/motion.css", import.meta.url));

test("homepage chart plates rest flat and tip on hover (consistent with the atlas)", async () => {
  const html = await readFile(indexHtml, "utf8");
  const css = await readFile(motionCss, "utf8");

  // the markup carries no resting-tilt scatter, but the plates are still there
  assert.ok(/class="plate"/.test(html), "the homepage plates should still be present");
  assert.ok(!/--tilt/.test(html), "no per-plate --tilt resting tilt should remain in the markup");

  // the base .plate rule rests flat (no resting rotate); :hover tips (rotate) and lifts
  const base = css.match(/\.plate\s*\{([^}]*)\}/);
  assert.ok(base, ".plate base rule should exist in motion.css");
  assert.ok(!/rotate\(/.test(base[1]), ".plate should rest flat (no resting rotate)");

  const hover = css.match(/\.plate:hover\s*\{([^}]*)\}/);
  assert.ok(hover, ".plate:hover rule should exist in motion.css");
  assert.ok(
    /rotate\(/.test(hover[1]) && /translateY\(/.test(hover[1]),
    ".plate should tip (rotate) and lift (translateY) under the hand",
  );
});
