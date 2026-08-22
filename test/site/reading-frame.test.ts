import { test } from "node:test";
import assert from "node:assert/strict";
import { readFileSync, readdirSync } from "node:fs";
import { resolve } from "node:path";
import type { VoyageLogPort } from "../../src/world/voyage-log.ts";

// The Reading Room's frame (#219): host-agnostic, the first non-Explorer host of the #191 engine, which is what proves that API capability-complete.
// Both open decisions ratified by Alex 2026-07-27 (https://github.com/ahl-gram/Vellum/issues/219#issuecomment-5097366231): no Explorer watch view in this sub (this suite IS the minimal harness), and the log FLOWS at every width, bounded by construction, no scrollbar.
// The frame BUILDS DOM, so this file installs the element shim; the shim stands in for the ENVIRONMENT, never the module under test.
import { El, installShim, walk } from "../../test-support/element-shim.ts";

const REPO = resolve(import.meta.dirname, "..", "..");
const FRAME_DIR = resolve(REPO, "src/site/reading-frame");
const read = (p: string): string => readFileSync(resolve(REPO, p), "utf8");

installShim();

/** The structure an assertion can compare across two producers of the same idiom. */
function shape(li: El): unknown {
  return {
    tag: li.tagName,
    parts: li.children.map((s) => ({ tag: s.tagName, cls: s.className, text: s.textContent })),
  };
}

const el = () => new El("div") as unknown as HTMLElement;

test("the frame mounts and hands the engine a complete host (#219, the first non-Explorer host)", async () => {
  const { createReadingFrame } = await import("../../src/site/reading-frame/index.ts");
  const mount = new El("div");
  const frame = createReadingFrame(mount as unknown as HTMLElement);

  assert.equal(mount.children.length, 1, "the frame mounts its root into the element it was given");
  assert.equal(mount.children[0], frame.root as unknown as El, "the mounted root is the frame's root");

  const host = frame.host;
  for (const [name, node] of [
    ["mapEl", host.mapEl],
    ["statusEl", host.statusEl],
    ["scrubber.panel", host.scrubber.panel],
    ["scrubber.playBtn", host.scrubber.playBtn],
    ["scrubber.range", host.scrubber.range],
    ["scrubber.year", host.scrubber.year],
    ["scrubber.sig", host.scrubber.sig],
    ["scrubber.strip", host.scrubber.strip],
  ] as const) {
    assert.ok(node instanceof El, `the host supplies a real element for ${name}`);
    assert.ok(
      walk(frame.root as unknown as El).includes(node as unknown as El),
      `${name} is part of the frame's own tree, not a detached stub`,
    );
  }

  // The capability proof: the engine constructs against this host exactly as against the Explorer's, so nothing in its public API is Explorer-shaped.
  const { createLivingChart } = await import("../../src/site/living-chart/index.ts");
  const lc = createLivingChart(host);
  for (const method of ["applyAges", "agesState", "applyScrub", "scrubTo", "applyVoyage", "voyagePaintAt", "scrubState", "destroy"]) {
    assert.equal(typeof (lc as Record<string, unknown>)[method], "function", `the engine drives the frame: ${method}()`);
  }
});

test("#402 the frame forwards onAgesYear to the scrubber host beside onPark", async () => {
  const { createReadingFrame } = await import("../../src/site/reading-frame/index.ts");
  const onAgesYear = (_y: number | null): void => {};
  const onPark = (): void => {};
  const frame = createReadingFrame(new El("div") as unknown as HTMLElement, { onPark, onAgesYear });
  assert.equal(frame.host.scrubber.onAgesYear, onAgesYear, "the year signal reaches the engine's deps");
  assert.equal(frame.host.scrubber.onPark, onPark, "onPark still rides beside it");
});

test("the instrument panel starts hidden and the ONE journal nests inside it (#219, fused at #220)", async () => {
  const { createReadingFrame } = await import("../../src/site/reading-frame/index.ts");
  const frame = createReadingFrame(new El("div") as unknown as HTMLElement);
  assert.equal((frame.host.scrubber.panel as unknown as El).hidden, true, "the instrument starts hidden");
  // The journal must ride INSIDE the panel the engine hides, or turning the instrument off would leave a stale strip on screen.
  const panel = frame.host.scrubber.panel as unknown as El;
  assert.ok(
    walk(panel).includes(frame.host.scrubber.strip as unknown as El),
    "the journal strip lives inside the panel the engine hides",
  );
  assert.ok(
    walk(panel).includes(frame.host.scrubber.sig as unknown as El),
    "the signature line lives inside the same panel",
  );
});

test("the frame owns no element ids: identity stays the host's namespace (#191, #219)", async () => {
  const { createReadingFrame } = await import("../../src/site/reading-frame/index.ts");
  const frame = createReadingFrame(new El("div") as unknown as HTMLElement);
  for (const node of walk(frame.root as unknown as El)) {
    assert.ok(
      !node.attrs.has("id"),
      `the frame set an id on <${node.tagName.toLowerCase()}>; a second frame on one page would collide`,
    );
  }
  for (const f of readdirSync(FRAME_DIR).filter((n) => n.endsWith(".ts"))) {
    const src = read(`src/site/reading-frame/${f}`);
    assert.doesNotMatch(src, /getElementById/, `${f} must not look elements up by id: it BUILDS them`);
  }
});

test("the frame imports nothing from the Explorer (#219 acceptance)", () => {
  for (const f of readdirSync(FRAME_DIR).filter((n) => n.endsWith(".ts"))) {
    const src = read(`src/site/reading-frame/${f}`);
    for (const m of src.matchAll(/from\s+"([^"]+)"/g)) {
      assert.doesNotMatch(
        m[1],
        /explorer\//,
        `${f} imports ${m[1]}; the frame must be mountable by a page that is not the Explorer`,
      );
    }
  }
});

test("destroy() unmounts the frame (a page host that leaves takes its DOM with it)", async () => {
  const { createReadingFrame } = await import("../../src/site/reading-frame/index.ts");
  const mount = new El("div");
  const frame = createReadingFrame(mount as unknown as HTMLElement);
  frame.destroy();
  assert.equal(mount.children.length, 0, "destroy() removes the frame's root from its mount");
});

test("the log component renders the chronicle's row shape in the shared idiom (#219)", async () => {
  const { createDatedLog } = await import("../../src/site/reading-frame/dated-log.ts");
  const log = createDatedLog({ label: "The chronicle" });
  // HistoricalEvent's displayed fields (src/society/history.ts): year + text.
  log.render([
    { year: 214, text: "Aldmarch is founded on the strait." },
    { year: 655, text: "The Kelder war ends at the shallows." },
  ]);
  const strip = log.strip as unknown as El;
  assert.equal(strip.children.length, 2, "one row per event");
  assert.deepEqual(shape(strip.children[0]), {
    tag: "LI",
    parts: [
      { tag: "SPAN", cls: "cr-year", text: "214" },
      { tag: "SPAN", cls: "cr-text", text: "Aldmarch is founded on the strait." },
    ],
  });
});

test("the engine's prologue rows carry the #312 manuscript shape: day gutters, an initial on the first line", async () => {
  // #312 narrowed the #219 parity by design: both still emit the li > .cr-year + .cr-text idiom, but the engine's gutter counts voyage days and its first line opens with an initial.
  const { createVoyageLogPanel } = await import("../../src/site/living-chart/voyage-log-panel.ts");

  const ports: VoyageLogPort[] = [
    { idx: 0, name: "Aldmarch", kind: "capital", founded: 214, arrivalMode: null, inlandHandoff: false, legLength: 0 },
    // 28 grid units = two days' travel (GRID_UNITS_PER_DAY is 14): day 1 + 2 = 3.
    { idx: 4, name: "Kelder", kind: "town", founded: 402, arrivalMode: "sea", inlandHandoff: false, legLength: 28 },
    // A one-unit hop rounds to the same raw day; the strictly-increasing ruling bumps it.
    { idx: 9, name: "Brenmoor", kind: "village", founded: 655, arrivalMode: "road", inlandHandoff: true, legLength: 1 },
  ];

  const enginePanel = { panel: el(), sig: el(), strip: el() };
  const engine = createVoyageLogPanel(enginePanel);
  const { log: builtLog } = engine.buildLogPanel(ports, 1200, 42, "surveyed for the Admiralty", null);
  const rows = (enginePanel.strip as unknown as El).children;
  assert.equal(rows.length, 3, "one row per port");

  assert.deepEqual(
    rows.map((li) => ({ cls: li.children[0]!.className, text: li.children[0]!.textContent })),
    [
      { cls: "cr-year", text: "day 1" },
      { cls: "cr-year", text: "day 3" },
      { cls: "cr-year", text: "day 4" },
    ],
    "the gutter counts strictly increasing days, never the year",
  );

  const body0 = builtLog.entries[0]!.text.replace(/^Year \d+\. /, "");
  const text0 = rows[0]!.children[1]!;
  assert.equal(text0.className, "cr-text");
  assert.equal(text0.children[0]!.className, "cr-dc");
  assert.equal(text0.children[0]!.textContent, body0[0], "the initial is the first letter");
  assert.equal(text0.textContent, body0, "the drop cap costs no readable text");

  assert.deepEqual(shape(rows[1]!), {
    tag: "LI",
    parts: [
      { tag: "SPAN", cls: "cr-year", text: "day 3" },
      { tag: "SPAN", cls: "cr-text", text: builtLog.entries[1]!.text.replace(/^Year \d+\. /, "") },
    ],
  });

  assert.equal(
    (enginePanel.sig as unknown as El).textContent,
    "surveyed for the Admiralty",
    "the attribution line alone carries the survey's dating",
  );
});

test("reveal() brightens an arrived prefix, idempotently and in both directions (#219)", async () => {
  const { createDatedLog } = await import("../../src/site/reading-frame/dated-log.ts");
  const log = createDatedLog({ label: "The chronicle" });
  log.render([
    { year: 100, text: "one" },
    { year: 200, text: "two" },
    { year: 300, text: "three" },
  ]);
  const inked = () => (log.strip as unknown as El).children.map((li) => li.classes.has("inked"));

  assert.deepEqual(inked(), [false, false, false], "rows rest dim until their year arrives");
  log.reveal(2);
  assert.deepEqual(inked(), [true, true, false], "the arrived prefix brightens");
  log.reveal(2);
  assert.deepEqual(inked(), [true, true, false], "reveal is idempotent: a repeated frame changes nothing");
  log.reveal(1);
  assert.deepEqual(inked(), [true, false, false], "stepping BACKWARD un-brightens, so a scrub can run either way");
  log.reveal(0);
  assert.deepEqual(inked(), [false, false, false], "back to the start");
  log.reveal(99);
  assert.deepEqual(inked(), [true, true, true], "an over-count clamps at the last row");

  assert.deepEqual(log.snapshot(), { rows: 3, inked: 3, attribution: "" }, "the read hook reports the live state");

  log.clear();
  assert.equal((log.strip as unknown as El).children.length, 0, "clear() empties the strip");
  assert.equal((log.sig as unknown as El).textContent, "", "clear() empties the attribution too");
});

test("the log is a labeled region and its rows are plain text (accessibility carries over, not down)", async () => {
  const { createDatedLog } = await import("../../src/site/reading-frame/dated-log.ts");
  const log = createDatedLog({ label: "The surveyor's log" });
  const panel = log.panel as unknown as El;
  assert.equal(panel.getAttribute("role"), "region", "the log panel is a landmark a screen reader can jump to");
  assert.equal(panel.getAttribute("aria-label"), "The surveyor's log", "and it is named");
});

test("the frame's log never nests a scroller, at any width (#219 acceptance, decision 2)", () => {
  const css = read("public/reading-frame.css");
  assert.doesNotMatch(
    css,
    /overflow-y\s*:\s*(auto|scroll)/,
    "the frame's log is a single vertical story: the PAGE scroll owns it, at every width",
  );
  assert.doesNotMatch(
    css,
    /max-height/,
    "no max-height cap: the log is bounded by construction (14 events + ~24 legs), not by a scrollbar",
  );
  assert.doesNotMatch(css, /@media[^{]*max-width/, "no narrow-viewport special case: one layout, ratified 2026-07-27");

  // Measured over CDP at a REAL 320px viewport (Brave's --window-size does not shrink the layout viewport): a flex item's min-width:auto refuses to shrink and a range input's intrinsic width is ~129px, so the row overflowed to scrollWidth 355. Both halves are load-bearing.
  assert.match(css, /\.rf-instrument\s*\{[^}]*flex-wrap:\s*wrap/, "the instrument wraps instead of overflowing");
  assert.match(css, /\.rf-range\s*\{[^}]*min-width:\s*0/, "the slider may shrink below its intrinsic width");

  // The Explorer's ONE journal adopted the same flow at #220: the cap is gone, not raised.
  const explorer = read("public/explorer/index.css");
  assert.equal(
    explorer.match(/max-height:\s*32rem;\s*overflow-y:\s*auto/g)?.length ?? 0,
    0,
    "the Explorer's journal flows like the frame's; a revived scroll cap would truncate the fused journal",
  );
});

test("one canonical row rule covers the one arrived-state (#219; collapsed at #220)", () => {
  const css = read("public/reading-frame.css");
  // #220 collapsed .inked / .past / .logged onto .inked alone; a leftover selector would quietly resurrect a producer the fusion retired.
  const brighten = css.match(/^[^{]*\.inked[^{]*\{[^}]*\}/m);
  assert.ok(brighten, "the frame css carries the rule keyed on the one .inked state");
  for (const stale of ["past", "logged"]) {
    assert.doesNotMatch(
      css,
      new RegExp(`\\.${stale}\\b`),
      `the retired .${stale} selector must not linger after the #220 collapse`,
    );
  }
  assert.match(
    css,
    /\.prologue\b/,
    "the surveyor's prologue voice (#220's Overture) is dressed in the frame css",
  );
  assert.match(
    css,
    /\.cr-year/,
    "the frame dresses the shared .cr-year column the engine's builders already emit",
  );
  assert.match(css, /\.cr-text/, "and the shared .cr-text column");
});

test("the brighten is a transition, so motion.css's universal collapse reaches it (#128)", () => {
  const css = read("public/reading-frame.css");
  assert.match(
    css,
    /transition:\s*opacity/,
    "rows brighten via a transition, the form the reduced-motion block collapses",
  );
  assert.doesNotMatch(
    css,
    /prefers-reduced-motion/,
    "the frame needs no reduced-motion block of its own: motion.css's universal `*` collapse already reaches it, and a local block would be a second source of truth",
  );
  assert.match(
    read("public/motion.css"),
    /@media \(prefers-reduced-motion: reduce\)[\s\S]*transition-duration: 0\.01ms !important/,
    "the universal collapse this frame relies on is still there",
  );
});
