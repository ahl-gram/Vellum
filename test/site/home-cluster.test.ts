import { test } from "node:test";
import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { resolve } from "node:path";

// Home's head cluster (Issue #480; SPEC: the four screenshots on Issue #480 and their captions, the measured baseline on PR #482). What stays here is what clears home's own furniture.

const REPO = resolve(import.meta.dirname, "..", "..");
const read = (p: string): string => readFileSync(resolve(REPO, p), "utf8");
const liveCss = (p: string): string => read(p).replace(/\/\*[\s\S]*?\*\//g, "");

const css = liveCss("public/index.css");
const layout = read("public/shell.css");

const rule = (sheet: string, selector: string): string => {
  const m = sheet.match(
    new RegExp(`(?:^|[}\\n])\\s*${selector.replace(/[.*+?^${}()|[\]\\]/g, "\\$&")}\\s*\\{([^}]*)\\}`),
  );
  assert.ok(m, `a rule for ${selector} exists`);
  return m[1]!;
};

const topLevel = css.replace(/@media[^{]*\{[\s\S]*?\n\}/g, "");

test("the stage never yields its lettering to a drag: user-select none on the whole stage, so a pip drag selects nothing (#480, screenshot 4)", () => {
  const stage = rule(topLevel, ".landfall .stage");
  assert.match(stage, /user-select:\s*none/, "the stage opts its lettering out of selection");
  assert.match(stage, /-webkit-user-select:\s*none/, "iOS Safari reads the prefixed form");
});

test("the cluster's wash is a soft pool sized by the cluster, not the 46rem slab (#480, screenshot 3)", () => {
  const wash = rule(topLevel, "header.chrome::before");
  assert.doesNotMatch(wash, /radial-gradient|46rem|17rem|width:|height:/, "no fixed-size gradient box remains");
  const inset = wash.match(/inset:\s*(-?[\d.]+)rem\s+(-?[\d.]+)rem\s+(-?[\d.]+)rem\s+(-?[\d.]+)rem/);
  assert.ok(inset, "the wash is an inset around the cluster, so it follows the lettering");
  const [top, right, bottom, left] = inset.slice(1).map(Number) as [number, number, number, number];
  assert.ok(top <= -3 && left <= -3, `the top and left bleed off the viewport edge (top ${top}rem, left ${left}rem)`);
  assert.ok(
    right >= -3 && right <= -1.5 && bottom >= -3 && bottom <= -1.5,
    `the right and bottom reach 1.5 to 3rem past the lettering (right ${right}rem, bottom ${bottom}rem)`,
  );
  assert.match(wash, /filter:\s*blur\((1[6-9]|2[0-8])px\)/, "the edge is a 16 to 28px blur, no clipped edge to see");
  const alpha = wash.match(/background:\s*rgb\(from var\(--chart-ink\) r g b \/ (0\.\d+)\)/);
  assert.ok(
    alpha && Number(alpha[1]) >= 0.8,
    "the pool is the chart ink at 0.8 or deeper (the 2026-08-26 plate read measured 1.17:1 for the cluster over the close-in chart with no wash)",
  );
});

test("the chrome's corner offsets are tokens the wash can follow (#480)", () => {
  assert.match(
    layout,
    /--chrome-x:\s*1\.6rem;\s*--chrome-y:\s*1\.4rem;/,
    "the layout declares the desktop offsets once",
  );
  assert.match(
    layout,
    /header\.chrome\s*\{[^}]*left:\s*var\(--chrome-x\);\s*top:\s*var\(--chrome-y\);/,
    "header.chrome consumes them",
  );
});
