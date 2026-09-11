import { test } from "node:test";
import assert from "node:assert/strict";
import { globSync, readFileSync } from "node:fs";
import { resolve } from "node:path";
import { dockLegend, legendSeat, type LegendHome } from "../../src/site/shared/room.ts";
import { GLASS_GAP_REM } from "../../src/site/shared/room-seats.ts";

test("the Glass's computed seat beside an open slip is the sheet's own arithmetic (atelier.css: --slip-w + 2rem + 1.4rem)", () => {
  const css = readFileSync(resolve(import.meta.dirname, "..", "..", "public/atelier.css"), "utf8");
  const m = css.match(/\.corner\.br\.zoomery\s*\{[^}]*right:\s*calc\(var\(--slip-w\)\s*\+\s*([\d.]+)rem\s*\+\s*([\d.]+)rem\)/);
  assert.ok(m, "atelier.css seats the Glass at --slip-w plus two rem terms");
  assert.equal(Number(m[1]) + Number(m[2]), GLASS_GAP_REM, "room-seats.ts's GLASS_GAP_REM drifted from the sheet");
});

// On a phone the legend row docks inside the slip so the bottom sheet carries it (#462 ruling 3); on a wide sheet it stands on the stage. One element moves, because the Explorer's roads carry ids the suites and app.ts read, so a second copy is not an option.

test("the legend seats in the slip on a narrow sheet and on the stage on a wide one", () => {
  assert.equal(legendSeat({ narrow: true, hasSlip: true }), "slip");
  assert.equal(legendSeat({ narrow: false, hasSlip: true }), "stage");
});

test("a room with no slip keeps its legend on the stage at every width", () => {
  assert.equal(legendSeat({ narrow: true, hasSlip: false }), "stage");
  assert.equal(legendSeat({ narrow: false, hasSlip: false }), "stage");
});

function home(): LegendHome & { readonly moves: string[]; readonly legend: { parentElement: object | null; classList: { toggle(c: string, f: boolean): boolean }; inSlip: boolean } } {
  const moves: string[] = [];
  const stageNode = {} as { insertBefore(el: object, before: object | null): void };
  const dockNode = {} as { appendChild(el: object): void };
  const legend = {
    parentElement: stageNode as object | null,
    inSlip: false,
    classList: { toggle(c: string, f: boolean) { if (c === "in-slip") legend.inSlip = f; return f; } },
  };
  stageNode.insertBefore = (el, before) => { moves.push(`stage:${before === null ? "end" : "next"}`); legend.parentElement = stageNode; };
  dockNode.appendChild = () => { moves.push("dock"); legend.parentElement = dockNode; };
  const next = {};
  return { legend, dock: dockNode, stage: stageNode, next, moves };
}

test("docking moves the row into the slip and marks it in-slip; seating it on the stage puts it back before its old neighbour", () => {
  const h = home();
  dockLegend(h, "slip");
  assert.equal(h.legend.parentElement, h.dock, "the row moved into the dock");
  assert.equal(h.legend.inSlip, true, "and wears in-slip");
  dockLegend(h, "stage");
  assert.equal(h.legend.parentElement, h.stage, "the row came back to the stage");
  assert.equal(h.legend.inSlip, false, "and dropped in-slip");
  assert.deepEqual(h.moves, ["dock", "stage:next"], "back in front of the sibling it stood before, never at the end");
});

test("a seat already held moves nothing (a resize storm must not churn the row)", () => {
  const h = home();
  dockLegend(h, "stage");
  dockLegend(h, "stage");
  assert.deepEqual(h.moves, [], "on the stage already: no move");
  dockLegend(h, "slip");
  dockLegend(h, "slip");
  assert.deepEqual(h.moves, ["dock"], "docked once, then left alone");
});

// The legend row's width follows the folio's text extent (placeLegendRow), and a narrower row wraps taller; the fit bounds the sheet by the row's top, so the row is seated first or the fit reads a row that is about to grow (plate read 2026-08-30 on #463: the Print Room's sheet over a freshly wrapped row until the next layout).
// Paper is narrower than the 900px phone query, so the kit's narrow block (the folio clamped to 12.5rem, the tagline hidden) reaches every printed chart room; the print block, later in the sheet, takes both back.
test("the kit's print block restores the room folio's tagline and width after the phone block has hidden and clamped them", () => {
  const css = readFileSync(resolve(import.meta.dirname, "..", "..", "public/atelier.css"), "utf8");
  const narrow = css.indexOf("@media (max-width: 900px)");
  const print = css.indexOf("@media print");
  assert.ok(narrow >= 0 && print > narrow, "the print block follows the phone block, so its equal-specificity rules win");
  const block = css.slice(print);
  assert.match(block, /\.folio-room \.room-name, \.folio-room \.room-tagline\s*\{[^}]*display:\s*block/, "the tagline prints");
  assert.match(block, /\.corner\.folio-room\s*\{[^}]*max-width:\s*none/, "the corner unclamps on paper");
  assert.match(block, /\.folio-room \.room-name\s*\{[^}]*font-size:\s*1\.32rem/, "and the name prints at the corner's own size, not the phone's");
});

test("the room folio's panel is painted screen-only (#538): on paper the corner goes static and in flow, and an absolute panel on a static corner resolved against the whole page (e2e RH10c and SB9b pin the resolved value)", () => {
  const REPO = resolve(import.meta.dirname, "..", "..");
  const strip = (p: string) => readFileSync(resolve(REPO, p), "utf8").replace(/"(?:[^"\\]|\\.)*"|'(?:[^'\\]|\\.)*'|\/\*[\s\S]*?\*\//g, (m) => (m.startsWith("/*") ? "" : m));
  // The sweep errs toward flagging: any tr or folio-room word in a content-giving before or after selector, any case, any spelling; the wrap's window is its own brace-matched close, and a brace inside a string can only close it early or never, so the window is never too wide; a quoted string passes the comment stripper whole, so a "/*" in a content value hides nothing. What it cannot see, named: native nesting (no sheet uses it) and a selector reaching the folio by a shared class or by structure; RH10c and SB9b read the resolved content.
  const paints = (css: string) => [...css.matchAll(/([^{}]+)\{([^{}]*)\}/g)].filter(([, sel, decls]) => /:{1,2}(before|after)/i.test(sel) && /\b(tr|folio-room)\b/i.test(sel) && /content\s*:/i.test(decls));
  const css = strip("public/atelier.css");
  const screen = css.indexOf("@media screen {");
  const closeOf = (open: number) => { let depth = 0; for (let i = open; i < css.length; i++) { if (css[i] === "{") depth++; else if (css[i] === "}" && --depth === 0) return i; } return -1; };
  const close = screen >= 0 ? closeOf(screen) : -1;
  assert.ok(screen >= 0 && close > screen, "the kit carries a screen-only block");
  assert.match(css.slice(screen, close), /\.corner\.tr::before[^{]*\{[^}]*content\s*:\s*""/i, "the painting rule that gives the folio panel its content sits inside it");
  const kit = paints(css);
  assert.ok(kit.length >= 1, "at least one rule gives the folio's pseudo content");
  for (const m of kit) assert.ok(m.index > screen && m.index < close, `a rule giving the folio's pseudo content sits outside the screen-only wrap: ${m[1].trim().slice(0, 80)}`);
  const sheets = [...globSync("public/**/*.css", { cwd: REPO }), ...globSync("src/**/*.astro", { cwd: REPO }), ...globSync("src/cli/*.ts", { cwd: REPO })].filter((p) => p !== "public/atelier.css").sort();
  assert.ok(sheets.includes("src/cli/gallery.ts") && sheets.includes("src/layouts/BaseLayout.astro"), "the sweep reaches the generated Gallery sheet and the layout's style block");
  for (const p of sheets) assert.deepEqual(paints(strip(p)).map((m) => m[1].trim().slice(0, 80)), [], `${p} paints the folio's pseudo itself; the panel belongs to the kit`);
});

test("the kit's print block stands the stage's status pill down (#566, ruled 2026-09-11), and the arm is scoped to the stage so it takes the scripts-off notice with it and leaves every other status alone", () => {
  const css = readFileSync(resolve(import.meta.dirname, "..", "..", "public/atelier.css"), "utf8").replace(/"(?:[^"\\]|\\.)*"|'(?:[^'\\]|\\.)*'|\/\*[\s\S]*?\*\//g, (m) => (m.startsWith("/*") ? "" : m));
  const open = css.indexOf("@media print");
  assert.notEqual(open, -1, "the kit carries a print block");
  let depth = 0, close = -1;
  for (let i = css.indexOf("{", open); i < css.length && close < 0; i++) { if (css[i] === "{") depth++; else if (css[i] === "}" && --depth === 0) close = i; }
  assert.ok(close > open, "the print block's own brace-matched close, so a block appended after it can never widen the window");
  // This pin is the fast lane and it reads TEXT, so it is blind to anything the cascade decides: a later rule re-showing the pill (in this block, in a second print block, or in a page sheet) passes here and reds e2e SB9c, which reads the resolved value and is the guard (measured 2026-09-11 against a display: block !important arm appended after this one: SB9c red at disp block, w 195). It errs toward flagging where it does read: \bstatus\b also matches .legend-status.
  const stood = [...css.slice(open, close).matchAll(/([^{}]+)\{([^{}]*)\}/g)]
    .filter(([, , decls]) => /display\s*:\s*none/i.test(decls))
    .flatMap(([, sel]) => sel.split(",").map((arm) => arm.trim()).filter((arm) => /\bstatus\b/i.test(arm)));
  assert.ok(stood.length >= 1, "the print block stands the stage's status down");
  for (const arm of stood) {
    assert.match(arm, /\.stage\b/i, `a status stand-down that is not scoped to a chart room's stage: ${arm.slice(0, 80)}`);
    assert.doesNotMatch(arm, /[>+~]/, `a status stand-down on a combinator, which cannot reach the scripts-off notice: it sits inside <noscript>, one level deeper than the pill (${arm.slice(0, 80)})`);
    const subject = arm.split(/\s+/).filter(Boolean).at(-1) ?? "";
    assert.match(subject, /^\.status$/i, `a status stand-down whose subject is not the kit's class alone, so it reaches one room's own element or a compound no element wears, and six of the seven rooms' pills and all seven scripts-off notices keep printing: ${arm.slice(0, 80)}`);
  }
});

test("bindRoom seats the legend row before it fits the sheet", () => {
  const room = readFileSync(resolve(import.meta.dirname, "..", "..", "src/site/shared/room.ts"), "utf8");
  const layout = room.slice(room.indexOf("const layout = () => {"), room.indexOf("camera.restore(held);"));
  assert.ok(layout.includes("placeLegendRow(") && layout.includes("fitRoom("), "the layout both seats the row and fits the sheet");
  assert.ok(layout.indexOf("placeLegendRow(") < layout.indexOf("fitRoom("), "the row is seated before the fit reads its top");
});

test("the phone Glass stands down while the sheet is open as a KIT rule, in every chart room, and no page sheet carries its own copy (the sitting's ruling 1, 2026-09-03 on #454; was the Print Room's alone since PR #496)", () => {
  const REPO = resolve(import.meta.dirname, "..", "..");
  const css = readFileSync(resolve(REPO, "public/atelier.css"), "utf8");
  const narrow = css.slice(css.indexOf("@media (max-width: 900px)"), css.indexOf("@media print"));
  assert.match(narrow, /body:has\(\.slip\.open\) \.corner\.br\.zoomery\s*\{[^}]*display:\s*none/, "the kit's narrow block hides the Glass under an open sheet");
  const sheets = [...globSync("public/**/*.css", { cwd: REPO }), ...globSync("src/**/*.astro", { cwd: REPO }), ...globSync("src/cli/*.ts", { cwd: REPO })].filter((p) => p !== "public/atelier.css").sort();
  for (const must of ["public/reading-frame.css", "public/explorer/broadside.css", "src/cli/gallery.ts", "src/layouts/BaseLayout.astro", "src/pages/index.astro"]) assert.ok(sheets.includes(must), `the sweep reaches ${must} (the prover found the first glob missed reading-frame.css; the skeptic that the Gallery's sheet is generated from gallery.ts and the .astro files carry <style> blocks)`);
  for (const p of sheets) {
    assert.doesNotMatch(readFileSync(resolve(REPO, p), "utf8"), /slip\.open\)[^{]*\.zoomery/, `${p} carries its own copy of the kit's rule`);
  }
});
