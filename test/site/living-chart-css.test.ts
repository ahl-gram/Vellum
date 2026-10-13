import { test } from "node:test";
import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { fileURLToPath } from "node:url";

// The engine's overlay dressing is ONE shared sheet, public/living-chart.css (Issue #302), the CSS twin of the Issue #191 boundary: it dresses every engine-emitted hook, names no host's own element, and has ONE home.

const root = (p: string) => fileURLToPath(new URL(`../../${p}`, import.meta.url));
const read = (p: string) => {
  try {
    return readFileSync(root(p), "utf8");
  } catch {
    return "";
  }
};

const SHEET = "public/living-chart.css";

// A rule is only as good as the LAST block that declares it, and a commented-out assignment reads as code to a substring match.
const soleRule = (css: string, selector: string): string => {
  const blocks = [...css.matchAll(new RegExp(`${selector.replace(/\./g, "\\.")}\\s*\\{[^}]*\\}`, "g"))];
  assert.equal(blocks.length, 1, `${SHEET} declares ${selector} ${blocks.length} times, so the last one wins`);
  return blocks[0]![0];
};

test("the raised town's rule and the card's rule are each declared once (#632; kept for Issue #779 part 2i: a second block repeating the first shows nowhere, and P36 and Z27 read the stacking)", () => {
  const css = read(SHEET);
  for (const selector of [".place-hit.pc-near", "#place-card"]) soleRule(css, selector);
});

test("the card's action row, its filing press and its refusing face are each declared once (#522; kept for Issue #779 part 2i: a second block repeating the first shows nowhere, and CD57 reads the dress)", () => {
  const css = read(SHEET);
  for (const selector of [".pc-acts", ".pc-lay", ".pc-lay.dim"]) soleRule(css, selector);
});

test("the philologist's note and its roots are each declared once (#124; kept for Issue #779 part 2i: a second block repeating the first shows nowhere; Z26 reads the dress and P16 the engine's classes)", () => {
  const css = read(SHEET);
  for (const selector of [".pc-tongue", ".pc-roots"]) soleRule(css, selector);
});

test("the flipped card's rule and the card's own rule are each declared once (#124; kept for Issue #779 part 2i: a second block repeating the first shows nowhere; Z24 reads the seats)", () => {
  const css = read(SHEET);
  for (const selector of ["#place-card.flip-h", "#place-card"]) soleRule(css, selector);
});

test("every card variant is declared once, and its transform carries one translate and one scale (#387/#388; kept for Issue #779 part 2i: a repeating block, or a second translate or scale composing to the same matrix, shows nowhere; Z24 and Z25 read the seats and the clamp)", () => {
  const css = read(SHEET);
  const variants = ["#place-card", "#place-card.flip-h", "#place-card.flip-v", "#place-card.flip-h.flip-v"];
  for (const selector of variants) {
    const transform = soleRule(css, selector).match(/transform:\s*([^;}]+)/);
    assert.ok(transform, `${selector} declares no transform`);
    const t = transform[1]!.replace(/\s+/g, " ");
    assert.equal(
      t.split("translate(").length - 1,
      1,
      `${selector} carries a second translate, and one of them is outside the counter-scale`,
    );
    assert.equal(t.split("scale(").length - 1, 1, `${selector} carries a second scale`);
  }
});
