import { test } from "node:test";
import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { fileURLToPath } from "node:url";

// The Specimen Book (Issue #324): the house style lives ONCE in /house.css, linked by BaseLayout on every page. The specs are the 2026-07-30 ledger ratifications (the comment on Issue #324); a change is a re-ratification, so these pins are deliberately literal.

const root = (p: string) => fileURLToPath(new URL(`../../${p}`, import.meta.url));
const read = (p: string) => readFileSync(root(p), "utf8");
const house = () => read("public/house.css");

const ruleOf = (css: string, selector: RegExp): string => {
  const m = css.match(new RegExp(`(^|\\n)\\s*${selector.source}[^{]*\\{([^}]*)\\}`));
  return m ? m[2]! : "";
};

test("the status role's colour is ink-faded, a colour no served pill wears (#324 decision 3)", () => {
  assert.match(ruleOf(house(), /\.status/), /color:\s*var\(--ink-faded\)/, ".status is ink-faded");
});

test("the control idiom's border is 1.5px (#324; kept for Issue #779 part 2i: Chromium reads a 1.5px border as 1px at a device pixel ratio of 1 and of 2, measured 2026-10-13, so no browser read here tells it from 1px)", () => {
  const base = ruleOf(house(), /input\[type="number"\],\s*select,\s*button/);
  assert.match(base, /border:\s*1\.5px /);
});

// A rule for a class no element wears paints nothing, so this retire pin stays a source read for part 2i of Issue #779.
test("home's sheet keeps no dress for the notice panel that left with its section (#459)", () => {
  const css = read("public/index.css").replace(/\/\*[\s\S]*?\*\//g, "");
  assert.ok(!css.includes(".notice-body"), "the notice panel left home with its section (#459)");
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
