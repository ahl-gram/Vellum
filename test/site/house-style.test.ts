import { test } from "node:test";
import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { fileURLToPath } from "node:url";

// The Specimen Book (Issue #324): the house style lives ONCE in /shared/house.css, linked by BaseLayout on every page. The specs are the 2026-07-30 ledger ratifications (the comment on Issue #324); a change is a re-ratification, so these pins are deliberately literal.

const root = (p: string) => fileURLToPath(new URL(`../../${p}`, import.meta.url));
const read = (p: string) => readFileSync(root(p), "utf8");
const house = () => read("src/styles/shared/house.css");

const ruleOf = (css: string, selector: RegExp): string => {
  const m = css.match(new RegExp(`(^|\\n)\\s*${selector.source}[^{]*\\{([^}]*)\\}`));
  return m ? m[2]! : "";
};

test("the control idiom's border is 1.5px (#324; kept at the close of Issue #779: Chromium reads a 1.5px border as 1px at a device pixel ratio of 1 and of 2, measured 2026-10-13, so no browser read here tells it from 1px)", () => {
  const base = ruleOf(house(), /input\[type="number"\],\s*select,\s*button/);
  assert.match(base, /border:\s*1\.5px /);
});

test("the chart quotations equal the render constants they quote (#324)", async () => {
  // The render side is byte-identity domain: read here, never changed.
  const { SITE_PALETTE } = await import("../../src/atlas/palette.ts");
  const { STYLES } = await import("../../src/render/style.ts");
  assert.equal(SITE_PALETTE["--chart-paper"], STYLES.antique.paper, "--chart-paper quotes the antique chart's paper");
  assert.equal(
    SITE_PALETTE["--chart-ink"],
    STYLES.antique.labelColor,
    "--chart-ink quotes the chart's lettering ink (the shadow ink everywhere)",
  );
});
