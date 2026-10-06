import { test } from "node:test";
import assert from "node:assert/strict";
import { globSync, readFileSync } from "node:fs";
import { resolve } from "node:path";
import { GLASS_GAP_REM, LEGEND_RISE, pressRowStacks, rowSheds } from "../../src/site/shared/room-seats.ts";

test("the Glass's computed seat beside an open slip is the sheet's own arithmetic (atelier.css: --slip-w + 2rem + 1.4rem)", () => {
  const css = readFileSync(resolve(import.meta.dirname, "..", "..", "public/atelier.css"), "utf8");
  const m = css.match(/\.corner\.br\.zoomery\s*\{[^}]*right:\s*calc\(var\(--slip-w\)\s*\+\s*([\d.]+)rem\s*\+\s*([\d.]+)rem\)/);
  assert.ok(m, "atelier.css seats the Glass at --slip-w plus two rem terms");
  assert.equal(Number(m[1]) + Number(m[2]), GLASS_GAP_REM, "room-seats.ts's GLASS_GAP_REM drifted from the sheet");
});

test("the room folio's panel is painted screen-only (#538): on paper the corner goes static and in flow, and an absolute panel on a static corner resolved against the whole page (e2e RH10c and SB9b pin the resolved value)", () => {
  const REPO = resolve(import.meta.dirname, "..", "..");
  const strip = (p: string) => readFileSync(resolve(REPO, p), "utf8").replace(/"(?:[^"\\]|\\.)*"|'(?:[^'\\]|\\.)*'|\/\*[\s\S]*?\*\//g, (m) => (m.startsWith("/*") ? "" : m));
  // The sweep errs toward flagging: any tr or folio-room word in a content-giving before or after selector, any case, any spelling; the wrap's window is its own brace-matched close, and a brace inside a string can only close it early or never, so the window is never too wide; a quoted string passes the comment stripper whole, so a "/*" in a content value hides nothing. What it cannot see, named: native nesting (no sheet uses it) and a selector reaching the folio by a shared class or by structure; RH10c and SB9b read the resolved content.
  const paints = (css: string) => [...css.matchAll(/([^{}]+)\{([^{}]*)\}/g)].filter(([, sel, decls]) => /:{1,2}(before|after)/i.test(sel!) && /\b(tr|folio-room)\b/i.test(sel!) && /content\s*:/i.test(decls!));
  const css = strip("public/atelier.css");
  const screen = css.indexOf("@media screen {");
  const closeOf = (open: number) => { let depth = 0; for (let i = open; i < css.length; i++) { if (css[i] === "{") depth++; else if (css[i] === "}" && --depth === 0) return i; } return -1; };
  const close = screen >= 0 ? closeOf(screen) : -1;
  assert.ok(screen >= 0 && close > screen, "the kit carries a screen-only block");
  assert.match(css.slice(screen, close), /\.corner\.tr::before[^{]*\{[^}]*content\s*:\s*""/i, "the painting rule that gives the folio panel its content sits inside it");
  const kit = paints(css);
  assert.ok(kit.length >= 1, "at least one rule gives the folio's pseudo content");
  for (const m of kit) assert.ok(m.index > screen && m.index < close, `a rule giving the folio's pseudo content sits outside the screen-only wrap: ${m[1]!.trim().slice(0, 80)}`);
  const sheets = [...globSync("public/**/*.css", { cwd: REPO }), ...globSync("src/**/*.astro", { cwd: REPO }), ...globSync("src/cli/*.ts", { cwd: REPO })].filter((p) => p !== "public/atelier.css").sort();
  assert.ok(sheets.includes("src/cli/gallery.ts") && sheets.includes("src/layouts/BaseLayout.astro"), "the sweep reaches the generated Gallery sheet and the layout's style block");
  for (const p of sheets) assert.deepEqual(paints(strip(p)).map((m) => m[1]!.trim().slice(0, 80)), [], `${p} paints the folio's pseudo itself; the panel belongs to the kit`);
});

test("the kit's print block stands the stage's message boxes down (#566, ruled 2026-09-11): the status pill with its scripts-off notice, and the render-worker warning that stands on the notice's own seat, each scoped to the stage so no other status or warning goes with them", () => {
  const css = readFileSync(resolve(import.meta.dirname, "..", "..", "public/atelier.css"), "utf8").replace(/"(?:[^"\\]|\\.)*"|'(?:[^'\\]|\\.)*'|\/\*[\s\S]*?\*\//g, (m) => (m.startsWith("/*") ? "" : m));
  const open = css.indexOf("@media print");
  assert.notEqual(open, -1, "the kit carries a print block");
  let depth = 0, close = -1;
  for (let i = css.indexOf("{", open); i < css.length && close < 0; i++) { if (css[i] === "{") depth++; else if (css[i] === "}" && --depth === 0) close = i; }
  assert.ok(close > open, "the print block's own brace-matched close, so a block appended after it can never widen the window");
  // This pin is the fast lane and it reads TEXT, so it is blind to anything the cascade decides: a later rule re-showing the pill (in this block, in a second print block, or in a page sheet) passes here and reds e2e SB9c, which reads the resolved value and is the guard (measured 2026-09-11 against a display: block !important arm appended after this one: SB9c red at disp block, w 195). It errs toward flagging where it does read: \bstatus\b also matches .legend-status. SB9c, SB9d and PR21d are the resolved reads for the pill, the scripts-off notice and the warning.
  const stood = [...css.slice(open, close).matchAll(/([^{}]+)\{([^{}]*)\}/g)]
    .filter(([, , decls]) => /display\s*:\s*none/i.test(decls!))
    .flatMap(([, sel]) => sel!.split(",").map((arm) => arm.trim()).filter((arm) => /\b(status|warning)\b/i.test(arm)));
  const subjectOf = (arm: string): string => (arm.split(/\s+/).filter(Boolean).at(-1) ?? "").toLowerCase();
  for (const box of [".status", ".warning"]) assert.ok(stood.some((arm) => subjectOf(arm) === box), `the print block stands the stage's ${box} down`);
  for (const arm of stood) {
    assert.match(arm, /\.stage\b/i, `a message-box stand-down that is not scoped to a chart room's stage: ${arm.slice(0, 80)}`);
    assert.doesNotMatch(arm.replace(/\[[^\]]*\]/g, ""), /[>+~]/, `a message-box stand-down on a combinator, which cannot reach the scripts-off notice: it sits inside <noscript>, one level deeper than the pill (${arm.slice(0, 80)})`);
    assert.match(subjectOf(arm), /^\.(status|warning)$/, `a message-box stand-down whose subject is not the kit's class alone, so it reaches one room's own element or a compound no element wears, and the other rooms' boxes keep printing: ${arm.slice(0, 80)}`);
  }
});

// This reads public/atelier.css alone, so a page sheet re-raising the opacity would pass it: extraCss links after the kit and wins on equal specificity. CD23 and CD24 read the resolved value and are the guard for that (Issue #547).
test("the kit gives the stage's status pill its fade, keyed to the class so every chart room's pill wears it (#547)", () => {
  const css = readFileSync(resolve(import.meta.dirname, "..", "..", "public/atelier.css"), "utf8").replace(/\/\*[\s\S]*?\*\//g, "");
  const base = css.match(/body\.chart-room \.stage \.status\s*\{([^}]*)\}/);
  assert.ok(base, "the kit dresses the stage's pill");
  assert.match(base[1]!, /transition:\s*opacity\s+0\.45s/, "the pill carries the fade's own duration, the one src/site/shared/announce.ts waits out before it clears the text");
  // Every arm, keyed on the bare class: `.status.fading` as the anchor misses `#pf-status.fading`, the one spelling that leaves a page's announcement standing (skeptic round 2 on PR #584).
  const fades = [...css.matchAll(/([^{}]*\.fading[^{}]*)\{([^}]*)\}/g)];
  assert.ok(fades.length > 0, "and the kit carries the arm the announcer turns on");
  for (const fade of fades) {
    assert.match(fade[2]!, /opacity:\s*0/, `which is what fading means: ${fade[1]!.trim()}`);
    assert.match(fade[1]!, /body\.chart-room \.stage\b/, `scoped to a chart room's stage like every other rule on this pill: ${fade[1]!.trim()}`);
    assert.doesNotMatch(fade[1]!, /#/, `keyed to the class and never to one page's id, or that page's pill never fades: ${fade[1]!.trim()}`);
  }
});

// The legend row's width follows the folio's text extent (placeLegendRow), and a narrower row wraps taller; the fit bounds the sheet by the row's top, so the row is seated first or the fit reads a row that is about to grow (plate read 2026-08-30 on Issue #463: the Print Room's sheet over a freshly wrapped row until the next layout).
test("bindRoom seats the legend row before it fits the sheet", () => {
  const room = readFileSync(resolve(import.meta.dirname, "..", "..", "src/site/shared/room.ts"), "utf8");
  const layout = room.slice(room.indexOf("const layout = () => {"), room.indexOf("camera.restore(held);"));
  assert.ok(layout.includes("placeLegendRow(") && layout.includes("fitRoom("), "the layout both seats the row and fits the sheet");
  assert.ok(layout.indexOf("placeLegendRow(") < layout.indexOf("fitRoom("), "the row is seated before the fit reads its top");
});

test("the Press stacks when its presses take more than two lines, or two or more stand each alone; one or two shared lines do not (Issue #762)", () => {
  assert.equal(pressRowStacks([0, 0, 40, 40, 80]), true, "the Print Room's 2+2+1 column at 1024x600, which painted its footing over the nav");
  assert.equal(pressRowStacks([0, 44]), true, "the Seed of the Day's two presses each alone at 901, a sliver over the Glass");
  assert.equal(pressRowStacks([0, 44, 88]), true, "the Explorer's one-press column at 901");
  assert.equal(pressRowStacks([0, 0, 62]), false, "the Explorer's two lines at 1280x800, as main seats them");
  assert.equal(pressRowStacks([0, 0, 0, 0, 0]), false, "one line");
  assert.equal(pressRowStacks([12]), false, "a single press is never a stack");
  assert.equal(pressRowStacks([]), false, "a row with no press shown");
  assert.equal(pressRowStacks([10.4, 10.6, 71.6]), false, "presses on one line read as one, even a fraction of a pixel apart across a rounding edge");
  assert.equal(pressRowStacks([44, 0]), true, "tops read in any order: the lines are counted from the sorted tops, not the order the presses come in");
  assert.equal(pressRowStacks([88, 44, 0]), true, "three presses each alone, read bottom first");
});

// Alex, 2026-10-06 (Issue #762 issuecomment-6010814718), "lean": a risen row is measured against the cluster's foot, 127.4 at 1024 on every room with a trail.
test("UL1 a risen row sheds its note only where its top would come within the gap of the head cluster's foot", () => {
  assert.equal(rowSheds(127.4 + 15.9, 127.4), true, "within the gap: the Press would stand at the cluster's foot");
  assert.equal(rowSheds(116.5, 127.4), true, "over the cluster's foot outright");
  assert.equal(rowSheds(588, 127.4), false, "a row far below the cluster keeps its note");
  assert.equal(rowSheds(127.4 + 16, 127.4), false, "exactly the gap below the cluster is clear");
  assert.equal(rowSheds(127.4 + 18, 127.4, 20.8), true, "clear of the gap, but the soft pool's 1.3rem above the row would reach the cluster's foot");
  assert.equal(rowSheds(127.4 + 18, 127.4, 8), false, "a backing that reaches less than the gap leaves the gap the rule");
  assert.equal(LEGEND_RISE, 12, "the soft pool stops inside this rise gap above the chart folio");
});
