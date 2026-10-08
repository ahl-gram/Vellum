import { test } from "node:test";
import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { resolve } from "node:path";
import type { VoyageLogPort } from "../../src/world/voyage-log.ts";
import { El, el, installShim } from "../../test-support/element-shim.ts";

const REPO = resolve(import.meta.dirname, "..", "..");
const read = (p: string): string => readFileSync(resolve(REPO, p), "utf8");

installShim();

/** The structure an assertion can compare across two producers of the same idiom. */
function shape(li: El): unknown {
  return {
    tag: li.tagName,
    parts: li.children.map((s) => ({ tag: s.tagName, cls: s.className, text: s.textContent })),
  };
}

test("the log component renders the chronicle's row shape in the shared idiom (#219)", async () => {
  const { createDatedLog } = await import("../../src/site/reading-frame/dated-log.ts");
  const log = createDatedLog({ label: "The chronicle" });
  log.render([
    { year: 214, text: "Aldmarch is founded on the strait." },
    { year: 655, text: "The Kelder war ends at the shallows." },
  ]);
  const strip = log.strip as unknown as El;
  assert.equal(strip.children.length, 2, "one row per event");
  assert.deepEqual(shape(strip.children[0]!), {
    tag: "LI",
    parts: [
      { tag: "SPAN", cls: "cr-year", text: "214" },
      { tag: "SPAN", cls: "cr-text", text: "Aldmarch is founded on the strait." },
    ],
  });
});

test("the engine's prologue rows carry the #312 manuscript shape: day gutters, an initial on the first line", async () => {
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

test("one canonical row rule covers the one arrived-state (#219; collapsed at #220)", () => {
  const css = read("public/reading-frame.css");
  const brighten = css.match(/^[^{]*\.inked[^{]*\{[^}]*\}/m);
  assert.ok(brighten, "the frame css carries the rule keyed on the one .inked state");
  for (const stale of ["past", "logged"]) {
    assert.doesNotMatch(
      css,
      new RegExp(`\\.${stale}\\b`),
      `the retired .${stale} selector must not linger after the #220 collapse`,
    );
  }
  assert.match(css, /\.prologue\b/, "the surveyor's prologue voice (#220's Overture) is dressed in the frame css");
  assert.match(css, /\.cr-year/, "the frame dresses the shared .cr-year column the engine's builders already emit");
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
