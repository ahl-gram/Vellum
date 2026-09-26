import test from "node:test";
import assert from "node:assert/strict";
import { bindChartDrawer } from "../../src/site/explorer/chart-drawer.ts";
import { TABLE_CAP, type SurveyItem, type TableItem } from "../../src/site/shared/table-address.ts";
import { El, installShim } from "../../test-support/element-shim.ts";

// The ceremony half of the Chart Table (Issue #523 Sub 5 of Issue #401): the settle on a laid cutting, the jolt at the cap, the ghost's url adopted on a drag-drop, the drawer revealed for a carry and put back, and a thumbnail patched into its cutting in place. The drawer BUILDS DOM, so the element shim stands in for the environment, never the module under test; every rect is the one the test states.

installShim();

const survey = (lx: number): SurveyItem => ({
  kind: "survey", seed: 42, overrides: {}, rung: 2, lx, ly: 3,
  style: "antique", legend: true, arms: false, beasts: false, theme: null,
});
const fill = (n: number): TableItem[] => Array.from({ length: n }, (_, i) => survey(i));
const SVG = "<svg xmlns=\"http://www.w3.org/2000/svg\"></svg>";

function drawer(opts: { onScreen?: boolean; drawThumb?: (item: TableItem) => Promise<{ url: string; title: string } | null> } = {}) {
  const el = (tag: string) => new El(tag);
  const cuttings = el("ol");
  cuttings.rect = opts.onScreen === false ? { left: 0, top: 0, right: 0, bottom: 0 } : { left: 251, top: 567, right: 1077, bottom: 785 };
  const root = el("div");
  root.rect = opts.onScreen === false ? { left: 0, top: 0, right: 0, bottom: 0 } : { left: 0, top: 552, right: 1280, bottom: 800 };
  const said: string[] = [];
  const changes: number[] = [];
  const els = { root, tab: el("button"), shut: el("button"), count: el("p"), cuttings, full: el("p"), road: el("button") };
  const deps = {
    say: (line: string) => { said.push(line); },
    onChange: (items: ReadonlyArray<TableItem>) => { changes.push(items.length); },
    ...(opts.drawThumb ? { drawThumb: opts.drawThumb } : {}),
  };
  const table = bindChartDrawer(els as unknown as Parameters<typeof bindChartDrawer>[0], deps);
  return { table, els, said, changes, cuttings };
}
const lis = (cuttings: El): El[] => cuttings.children;
const landing = (li: El): boolean => li.classList.contains("landing");

test("CT12 a lay marks exactly the laid cutting `landing`, once: a second lay marks the second and the first is bare again", () => {
  const { table, cuttings } = drawer();
  table.lay(survey(1), SVG, "one");
  assert.equal(lis(cuttings).length, 1);
  assert.equal(landing(lis(cuttings)[0]!), true, "the cutting just laid settles");
  table.lay(survey(2), SVG, "two");
  assert.equal(lis(cuttings).length, 2);
  assert.equal(landing(lis(cuttings)[0]!), false, "the earlier cutting, rebuilt by the render, does not settle again");
  assert.equal(landing(lis(cuttings)[1]!), true, "the one just laid does");
});

test("CT12b a restore marks nothing: a reload, a Back or a shared link lands its cuttings still (Issue #523, D5 ruled 2026-09-21)", () => {
  const { table, cuttings } = drawer();
  table.restore(fill(3));
  assert.equal(lis(cuttings).length, 3);
  assert.equal(lis(cuttings).some(landing), false);
});

test("CT12c the mark is consumed by the render that plays it: a lay followed by a restore that still holds that sheet re-seats it STILL, since a mark surviving its render would settle the sheet again on the cached return (the guard-prover's hole, 2026-09-21)", () => {
  const { table, cuttings } = drawer();
  table.lay(survey(1), SVG, "one");
  assert.equal(landing(lis(cuttings)[0]!), true, "the lay settles");
  table.restore([survey(1), survey(2)]);
  assert.equal(lis(cuttings).length, 2);
  assert.equal(lis(cuttings).some(landing), false, "the restore re-seats the same sheet without a settle");
});

test("CT13 the settle retires on the cutting's OWN animation end and not on its picture's: the img's shadow keyframe ending first must not cut the sheet's settle short", () => {
  const { table, cuttings } = drawer();
  table.lay(survey(1), SVG, "one");
  const li = lis(cuttings)[0]!;
  const img = li.children.find((c) => c.tagName === "IMG");
  assert.ok(img, "the cutting carries its picture");
  li.fire("animationend", { target: img });
  assert.equal(landing(li), true, "the picture's end is not the sheet's");
  li.fire("animationend", { target: li });
  assert.equal(landing(li), false, "the sheet's own end retires the class");
});

test("CT13b a ceremony plays only where the sheets are on screen: a lay into a list with no rect (the phone, its leaf away) leaves no `landing`, and the pill still answers", () => {
  const away = drawer({ onScreen: false });
  away.table.lay(survey(1), SVG, "one");
  assert.equal(lis(away.cuttings).length, 1, "the sheet is on the table either way");
  assert.equal(landing(lis(away.cuttings)[0]!), false, "but nothing is queued to settle later when the leaf is next shown");
  assert.match(away.said[0] ?? "", /lies on the table/, "the pill is the phone's answer");
  const shown = drawer();
  shown.table.lay(survey(1), SVG, "one");
  assert.equal(landing(lis(shown.cuttings)[0]!), true, "the same lay with the list on screen settles");
});

test("CT14 a refusal at the cap jolts the sheets on the table, a duplicate does not, and the next render takes the jolt off", () => {
  const { table, cuttings, said } = drawer();
  table.restore(fill(TABLE_CAP));
  table.reveal();
  assert.equal(table.lay(survey(99), SVG, "seventh"), false, "the cap refuses");
  assert.equal(cuttings.classList.contains("jolt"), true, "the table reacts");
  assert.match(said.at(-1) ?? "", /the table is full/);
  cuttings.fire("animationend", { target: cuttings });
  assert.equal(cuttings.classList.contains("jolt"), false, "and the jolt retires on its own end");
  table.restore(fill(2));
  assert.equal(table.lay(survey(1), SVG, "again"), false, "a duplicate is refused");
  assert.equal(cuttings.classList.contains("jolt"), false, "without a jolt: the jolt is the cap's");
  table.restore(fill(TABLE_CAP));
  table.lay(survey(99), SVG, "seventh");
  assert.equal(cuttings.classList.contains("jolt"), true);
  table.restore(fill(1));
  assert.equal(cuttings.classList.contains("jolt"), false, "the deterministic half: a render clears it whether or not the end event ever fired");
});

test("CT14b the jolt, like the settle, is dropped rather than queued when the sheets are off screen", () => {
  const { table, cuttings } = drawer({ onScreen: false });
  table.restore(fill(TABLE_CAP));
  table.lay(survey(99), SVG, "seventh");
  assert.equal(cuttings.classList.contains("jolt"), false);
});

test("CT14c a refusal at the cap from a SHUT drawer plays the dip once the drawer's own slide has ended, not under it, while a refusal with the drawer already open dips at once (D3: the drawer itself does not move; the cold review's finding 4 on PR #663)", () => {
  const shut = drawer();
  shut.table.restore(fill(TABLE_CAP));
  assert.equal(shut.els.root.classList.contains("open"), false, "shut before the refusal");
  shut.table.lay(survey(99), SVG, "seventh");
  assert.equal(shut.els.root.classList.contains("open"), true, "the refusal opens the drawer, which starts its slide");
  assert.equal(shut.cuttings.classList.contains("jolt"), false, "the sheets do not dip while the drawer is still rising");
  shut.els.root.fire("animationend", { target: shut.els.root });
  assert.equal(shut.cuttings.classList.contains("jolt"), true, "they dip once the drawer has arrived");
  const open = drawer();
  open.table.restore(fill(TABLE_CAP));
  open.table.reveal();
  open.table.lay(survey(99), SVG, "seventh");
  assert.equal(open.cuttings.classList.contains("jolt"), true, "an open drawer dips at once");
});

test("CT14d a shut inside a ceremony clears it rather than leaving it armed: display:none cancels an animation with no end event, so a settle or a dip caught by the shut press, and a dip armed on a slide the shut cancelled, would all replay on the next plain open (the cold review's round 3 finding 2 on PR #663)", () => {
  const { table, cuttings, els } = drawer();
  table.lay(survey(1), SVG, "one");
  assert.equal(landing(lis(cuttings)[0]!), true, "settling");
  els.shut.fire("click");
  assert.equal(landing(lis(cuttings)[0]!), false, "a shut mid-settle takes the mark off, since no end event will");
  els.tab.fire("click");
  assert.equal(lis(cuttings).some(landing), false, "and the next open replays nothing");
  table.restore(fill(TABLE_CAP));
  els.shut.fire("click");
  table.lay(survey(99), SVG, "seventh");
  assert.equal(els.root.classList.contains("open"), true, "a refusal from shut opens the drawer and arms the dip on its slide");
  els.shut.fire("click");
  els.tab.fire("click");
  els.root.fire("animationend", { target: els.root });
  assert.equal(cuttings.classList.contains("jolt"), false, "a shut inside that slide dropped the armed dip, so the next plain open's slide end dips nothing");
  table.lay(survey(99), SVG, "seventh");
  assert.equal(cuttings.classList.contains("jolt"), true, "dipping");
  els.shut.fire("click");
  assert.equal(cuttings.classList.contains("jolt"), false, "a shut mid-dip takes the jolt off too");
});

test("CT15 a lay handed a ready url (the drag's ghost) adopts it and mints none; a lay handed only the svg mints one", () => {
  const minted: string[] = [];
  const real = URL.createObjectURL.bind(URL);
  URL.createObjectURL = (blob: Blob) => { const u = `blob:minted-${minted.length}`; minted.push(u); void blob; return u; };
  try {
    const { table, cuttings } = drawer();
    assert.equal(table.lay(survey(1), SVG, "one", { url: "blob:ghost" }), true);
    assert.equal(minted.length, 0, "the ghost's url IS the cutting's; a second url per drag is the leak the issue names");
    const img = lis(cuttings)[0]!.children.find((c): c is El & { src?: string } => c.tagName === "IMG");
    assert.equal(img?.src, "blob:ghost");
    assert.equal(table.lay(survey(2), SVG, "two"), true);
    assert.equal(minted.length, 1, "the click path still mints its own");
  } finally {
    URL.createObjectURL = real;
  }
});

test("CT16 reveal() opens a shut drawer and hands back the function that shuts it again; on a drawer already open it hands back a no-op", () => {
  const { table, els } = drawer();
  assert.equal(els.root.classList.contains("open"), false);
  const back = table.reveal();
  assert.equal(els.root.classList.contains("open"), true, "the carry sees the table");
  back();
  assert.equal(els.root.classList.contains("open"), false, "a snap-back puts the drawer back as it was");
  table.lay(survey(1), SVG, "one");
  assert.equal(els.root.classList.contains("open"), true, "a filing leaves it open (Issue #520, the filing gesture)");
  const noop = table.reveal();
  noop();
  assert.equal(els.root.classList.contains("open"), true, "a drawer that was open before the grab stays open after a snap-back");
});

test("CT17 a thumbnail arriving for a recovered sheet is patched into its cutting in place: the li keeps its identity, the reserved frame becomes the picture, and the title follows; a settle in flight is not rebuilt out from under it", async () => {
  let resolveThumb: (v: { url: string; title: string } | null) => void = () => {};
  const drawThumb = () => new Promise<{ url: string; title: string } | null>((r) => { resolveThumb = r; });
  const { table, cuttings, els } = drawer({ drawThumb });
  table.restore([survey(1)]);
  const before = lis(cuttings)[0]!;
  assert.ok(before.children.some((c) => c.classList.contains("awaited")), "a recovered sheet holds a reserved frame");
  els.tab.fire("click");
  await Promise.resolve();
  resolveThumb({ url: "blob:drawn", title: "The Environs of Somewhere" });
  await new Promise((r) => setTimeout(r, 0));
  const after = lis(cuttings)[0]!;
  assert.equal(after, before, "the same element: a rebuild would end any settle playing on it");
  assert.equal(after.children.some((c) => c.classList.contains("awaited")), false, "the frame is gone");
  const img = after.children.find((c): c is El & { src?: string } => c.tagName === "IMG");
  assert.equal(img?.src, "blob:drawn", "and the picture stands in its place");
  const title = after.children.find((c) => c.classList.contains("label"))?.children.find((c) => c.tagName === "B");
  assert.equal(title?.textContent, "The Environs of Somewhere", "named from the drawn title, no longer the chart number");
});
