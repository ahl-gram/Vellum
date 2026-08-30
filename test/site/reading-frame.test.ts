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

/** What a narrow-viewport rule is allowed to touch: the sticky strip and nothing else. The journal's own columns are `.cr-*` and the strip borrows them, so the arm must be strip-scoped, not merely mention a `.cr-` class. */
const STRIP_SCOPED = /^\.rf-told\b|^\.rf-instrument(-strip)?\b/;

/** Selector arms of every narrow-viewport rule in the sheet, flattened and split on commas, so a rule cannot hide behind a selector list. */
function narrowSelectors(css: string): string[] {
  return mediaBlocks(css)
    .flatMap((body) => [...body.matchAll(/([^{}]+)\{/g)].map((m) => m[1]!))
    .flatMap((list) => list.split(","))
    .map((s) => s.trim())
    .filter((s) => s.length > 0);
}

/** Declaration blocks whose selector LIST contains `selector`, joined; membership beats a literal anchor, which a comma after the class defeats. */
function declarationsFor(css: string, selector: string): string {
  const src = css.replace(/\/\*[\s\S]*?\*\//g, "");
  const out: string[] = [];
  for (const m of src.matchAll(/([^{}]+)\{([^{}]*)\}/g)) {
    const arms = m[1]!.split(",").map((s) => s.trim());
    if (arms.includes(selector)) out.push(m[2]!);
  }
  return out.join("\n");
}

/** The BODY of every @media block, brace-balanced: a regex cannot balance nested braces, so a compact one-line rule hides from one. Blind spot, argued: a brace inside a string or comment would miscount, which this sheet has none of and which costs a false alarm rather than a miss. */
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

test("#463 (#462 ruling 6) the wrapper is the strip's column with the told row above the bar, seated by the host; the bar keeps the unfurl", () => {
  const css = read("public/reading-frame.css");
  const wrapper = declarationsFor(css, ".rf-instrument-strip");
  assert.ok(wrapper, "the wrapper carries a rule of its own");
  assert.match(wrapper, /flex-direction:\s*column-reverse/, "the row being told stands above the bar (the frame builds them bar-first)");
  assert.doesNotMatch(wrapper, /position:\s*(sticky|fixed)/, "where the strip stands is the host's (the #442 sticky shape retired)");
  assert.doesNotMatch(wrapper, /transform|animation/, "and it is never transformed");

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

test("#442 the mirror takes its SOURCE's voice: roman for an annal, the surveyor's italic for a day row", async () => {
  const { createReadingFrame } = await import("../../src/site/reading-frame/index.ts");
  const frame = createReadingFrame(new El("div") as unknown as HTMLElement);
  const told = frame.told as unknown as El;

  frame.setTold({ chamber: "survey", row: 3, index: 7, day: 61, text: "we came to Theril." });
  assert.equal(told.classes.has("prologue"), true, "a day row is the surveyor's hand, the class the journal uses");
  frame.setTold({ chamber: "ages", year: 900, text: "Gamma fell to ruin." });
  assert.equal(told.classes.has("prologue"), false, "an annal is the chronicler's, and must not inherit the survey voice");
  frame.setTold(null);

  // The style half too, or the markup could carry a voice the sheet never dresses; a structural test cannot see the rendered mismatch, so this pins the pair.
  const css = read("public/reading-frame.css");
  const toldText = css.match(/\.rf-told \.cr-text\s*\{[^}]*\}/)?.[0] ?? "";
  assert.ok(toldText, "the mirror dresses its text column");
  assert.doesNotMatch(toldText, /font-style:\s*italic/, "the UNQUALIFIED mirror is roman, like the annals it copies");
  assert.match(
    css,
    /\.rf-told\.prologue \.cr-text\s*\{[^}]*font-style:\s*italic/,
    "and only the prologue-voiced mirror is italic, like the day rows it copies",
  );
  const journalAnnal = css.match(/\.rf-log-strip li\.prologue \.cr-text\s*\{[^}]*\}/)?.[0] ?? "";
  assert.match(journalAnnal, /font-style:\s*italic/, "the source it is matching is still italic in the journal");
});

test("#442 the live row takes the shared gutter idiom and refuses the drop cap", () => {
  const css = read("public/reading-frame.css");
  const told = declarationsFor(css, ".rf-told");
  assert.ok(told, "the live row carries a rule of its own");
  assert.match(declarationsFor(css, ".rf-told .cr-text"), /color:\s*var\(--parchment-bright\)/, "the row is written in the strip's ink: it stands on the deep since #463, not on a panel");
  assert.ok(declarationsFor(css, ".rf-told .cr-year"), "it dresses the shared gutter column");
  assert.match(declarationsFor(css, ".rf-told[hidden]"), /display:\s*none/, "hidden means gone, not merely transparent");
  assert.doesNotMatch(css, /\.rf-told[^{]*\.cr-dc/, "the 2.1em initial never reaches the strip");
  assert.doesNotMatch(told, /max-height|overflow/, "the live row is one row, never a scroller of its own");
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
  // phone. An ALLOWLIST, not a search for journal selectors: the strip dresses the very
  // same .cr-year / .cr-text columns the journal rows use, so rejecting only `.rf-log`
  // waves through `@media (max-width: 40rem) { .cr-text { display: none } }` and reshapes
  // the reading unseen. Anything a narrow rule touches must be scoped to the strip.
  for (const sel of narrowSelectors(css)) {
    assert.ok(
      STRIP_SCOPED.test(sel),
      `a narrow-viewport rule reaches beyond the sticky strip (${sel}); the journal reads the same at every width`,
    );
  }
  // Non-vacuity WITHOUT requiring the rule to exist: deleting the narrow rule restores the
  // ratified pre-#442 state and must stay green, so the scan proves itself on a planted
  // one instead. Both directions, since a scan that finds nothing proves nothing.
  const planted = css + "\n@media (max-width: 40rem) { .cr-text { display: none; } }\n";
  assert.ok(
    narrowSelectors(planted).some((s) => !STRIP_SCOPED.test(s)),
    "the scan can see a journal-reshaping narrow rule; if this fails the loop above is decorative",
  );
  assert.deepEqual(
    narrowSelectors(css + "\n@media (max-width: 40rem) { .rf-told { display: none } }\n")
      .filter((s) => !STRIP_SCOPED.test(s)),
    [],
    "and it does not cry wolf over a second strip-scoped rule",
  );

  // Measured over CDP at a REAL 320px viewport (Brave's --window-size does not shrink the layout viewport): a flex item's min-width:auto refuses to shrink and a range input's intrinsic width is ~129px, so the row overflowed to scrollWidth 355. Both halves are load-bearing.
  // #463: the row no longer wraps (the bar keeps Play and the readout beside it on the strip at every width, #462 ruling 6); what still guards the 320px case is the bar shrinking and its neighbours never stretching.
  assert.match(css, /\.rf-play\s*\{[^}]*flex:\s*none/, "Play keeps its own width and never stretches the row");
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
