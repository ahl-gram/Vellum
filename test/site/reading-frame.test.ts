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

/**
 * The BODY of every @media block, brace-balanced. A regex cannot balance nested braces:
 * the first cut of this scan ended its match at the first `\n}`, so a compact one-line
 * `@media (max-width: 40rem) { .rf-log-strip li { display: none; } }` never matched at
 * all and the per-selector check below never ran (guard-prover, 2026-08-23). Blind spot,
 * argued: a brace inside a string or a comment would miscount, which this stylesheet has
 * none of and which would cost a false alarm rather than a miss.
 */
function mediaBlocks(css: string): string[] {
  const src = css.replace(/\/\*[\s\S]*?\*\//g, "");
  const out: string[] = [];
  for (let at = src.indexOf("@media"); at >= 0; at = src.indexOf("@media", at + 1)) {
    const open = src.indexOf("{", at);
    if (open < 0) break;
    let depth = 0;
    let i = open;
    for (; i < src.length; i++) {
      if (src[i] === "{") depth++;
      else if (src[i] === "}" && --depth === 0) break;
    }
    out.push(src.slice(open + 1, i));
  }
  return out;
}

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

test("#402/#442 the frame forwards onAgesTold to the scrubber host beside onPark", async () => {
  const { createReadingFrame } = await import("../../src/site/reading-frame/index.ts");
  const onAgesTold = (): void => {};
  const onPark = (): void => {};
  const frame = createReadingFrame(new El("div") as unknown as HTMLElement, { onPark, onAgesTold });
  assert.equal(frame.host.scrubber.onAgesTold, onAgesTold, "the told signal reaches the engine's deps");
  assert.equal(frame.host.scrubber.onPark, onPark, "onPark still rides beside it");
});

test("#442 the bar and the live row share ONE wrapper, inside the panel, above the journal", async () => {
  const { createReadingFrame } = await import("../../src/site/reading-frame/index.ts");
  const frame = createReadingFrame(new El("div") as unknown as HTMLElement);
  const panel = frame.host.scrubber.panel as unknown as El;
  const strip = frame.strip as unknown as El;

  assert.equal(strip.className, "rf-instrument-strip");
  assert.ok(walk(panel).includes(strip), "the strip nests inside the panel the engine hides, so a teardown takes it too");
  assert.deepEqual(
    strip.children.map((c) => c.className),
    ["rf-instrument", "rf-told"],
    "the wrapper holds the bar and the live row, in that order",
  );
  assert.deepEqual(
    panel.children.map((c) => c.className),
    ["rf-instrument-strip", "rf-log"],
    "and the wrapper sits above the one journal",
  );
  assert.equal((frame.told as unknown as El).hidden, true, "the live row rests hidden: a plain arrival tells nothing yet");
  assert.equal(
    (frame.told as unknown as El).getAttribute("aria-hidden"),
    "true",
    "it mirrors a row already in the document, so it is not announced twice",
  );
});

test("#442 setTold mirrors either half's row, and clears rather than lingering", async () => {
  const { createReadingFrame } = await import("../../src/site/reading-frame/index.ts");
  const frame = createReadingFrame(new El("div") as unknown as HTMLElement);
  const told = frame.told as unknown as El;
  const parts = () => told.children.map((s) => ({ cls: s.className, text: s.textContent }));

  frame.setTold({ chamber: "survey", row: 3, index: 7, day: 61, text: "we came to Theril." });
  assert.equal(told.hidden, false);
  assert.deepEqual(parts(), [
    { cls: "cr-year", text: "day 61" },
    { cls: "cr-text", text: "we came to Theril." },
  ], "the survey half counts days, the gutter the prologue rows already use");

  frame.setTold({ chamber: "ages", year: 900, text: "Gamma fell to ruin." });
  assert.deepEqual(parts(), [
    { cls: "cr-year", text: "900" },
    { cls: "cr-text", text: "Gamma fell to ruin." },
  ], "the chronicle half carries the annal's year");

  frame.setTold(null);
  assert.equal(told.hidden, true, "nothing told, nothing shown");
  assert.deepEqual(parts(), [
    { cls: "cr-year", text: "" },
    { cls: "cr-text", text: "" },
  ], "and the prose is cleared, so a hidden row holds no stale world's line");
});

test("#442 the live row is a MIRROR: it never writes into the journal the engine owns", async () => {
  const { createReadingFrame } = await import("../../src/site/reading-frame/index.ts");
  const frame = createReadingFrame(new El("div") as unknown as HTMLElement);
  const strip = frame.host.scrubber.strip as unknown as El;
  frame.log.render([{ year: 214, text: "Aldmarch is founded." }]);
  const before = strip.children.map((li) => ({ cls: li.className, text: li.textContent }));

  frame.setTold({ chamber: "ages", year: 214, text: "Aldmarch is founded." });
  frame.setTold({ chamber: "survey", row: 0, index: 0, day: 1, text: "set out from Aldmarch." });
  frame.setTold(null);

  assert.deepEqual(
    strip.children.map((li) => ({ cls: li.className, text: li.textContent })),
    before,
    "the journal strip is byte-identical after three told paints: the mirror owns its own element",
  );
  assert.equal(
    walk(strip).includes(frame.told as unknown as El),
    false,
    "and the live row is not inside the journal at all",
  );
});

test("#442 the WRAPPER sticks and the bar keeps the unfurl: a transform on the sticky element unsticks it", () => {
  const css = read("public/reading-frame.css");
  const sticky = css.match(/\.rf-instrument-strip\s*\{[^}]*\}/)?.[0];
  assert.ok(sticky, "the wrapper carries a rule of its own");
  assert.match(sticky, /position:\s*sticky/, "it sticks");
  assert.match(sticky, /top:\s*0/, "to the viewport top; nothing above it is fixed, so there is no offset to clear");
  assert.doesNotMatch(sticky, /transform|animation/, "and it is never transformed: that would slide the stuck strip out of register");

  // The polarity a presence check cannot see: the arrival animation must stay on the INNER bar. Both halves, so moving it onto the wrapper fails here rather than at a rendered probe.
  assert.match(
    css,
    /\.rf-arrival \.rf-instrument\s*\{[^}]*animation:\s*paperUnfurl/,
    "the unfurl still transforms .rf-instrument",
  );
  assert.doesNotMatch(
    css,
    /\.rf-arrival \.rf-instrument-strip\b/,
    "and never the sticky wrapper itself",
  );
});

test("#442 the live row takes the shared gutter idiom and refuses the drop cap", () => {
  const css = read("public/reading-frame.css");
  assert.match(css, /\.rf-told\s*\{[^}]*background:\s*var\(--parchment-panel\)/, "the stuck row is opaque: the journal must not read through it");
  assert.match(css, /\.rf-told\s*\.cr-year\s*\{/, "it dresses the shared gutter column");
  assert.match(css, /\.rf-told\[hidden\]\s*\{\s*display:\s*none/, "hidden means gone, not merely transparent");
  assert.doesNotMatch(css, /\.rf-told[^{]*\.cr-dc/, "the 2.1em initial never reaches the strip");
  assert.doesNotMatch(css, /\.rf-told\s*\{[^}]*(max-height|overflow)/, "the live row is one row, never a scroller of its own");
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
  // #219's ratification is about the JOURNAL, and #442 kept it: the one narrow-viewport
  // rule this file now carries (ruled 2026-08-23) drops the sticky strip's live row on a
  // phone and touches no journal selector, so the reading itself still does not differ by
  // width. Every @media block is read and its selectors checked, not merely counted.
  const blocks = mediaBlocks(css);
  assert.ok(blocks.length > 0, "the scan found the narrow-viewport block it is here to police");
  for (const body of blocks) {
    for (const sel of body.matchAll(/([^{}]+)\{/g)) {
      assert.doesNotMatch(
        sel[1]!,
        /\.rf-log/,
        `a narrow-viewport rule reaches the journal (${sel[1]!.trim()}); the log reads the same at every width`,
      );
    }
  }

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
