import { test } from "node:test";
import assert from "node:assert/strict";
import type { VoyageLogPort } from "../../src/world/voyage-log.ts";
import { El, el, installShim, walk } from "../../test-support/element-shim.ts";

installShim();

/** The structure an assertion can compare across two producers of the same idiom. */
function shape(li: El): unknown {
  return {
    tag: li.tagName,
    parts: li.children.map((s) => ({ tag: s.tagName, cls: s.className, text: s.textContent })),
  };
}

test("the log component renders the chronicle's row shape in the shared idiom (#219)", async () => {
  const { createDatedLog } = await import("../../src/site/shared/reading-frame/dated-log.ts");
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
  const { createVoyageLogPanel } = await import("../../src/site/shared/living-chart/voyage-log-panel.ts");

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
  const { createDatedLog } = await import("../../src/site/shared/reading-frame/dated-log.ts");
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
  const { createDatedLog } = await import("../../src/site/shared/reading-frame/dated-log.ts");
  const log = createDatedLog({ label: "The surveyor's log" });
  const panel = log.panel as unknown as El;
  assert.equal(panel.getAttribute("role"), "region", "the log panel is a landmark a screen reader can jump to");
  assert.equal(panel.getAttribute("aria-label"), "The surveyor's log", "and it is named");
});

const ROAD_PORTS: VoyageLogPort[] = [
  { idx: 0, name: "Aldmarch", kind: "capital", founded: 214, arrivalMode: null, inlandHandoff: false, legLength: 0 },
  { idx: 4, name: "Kelder", kind: "town", founded: 402, arrivalMode: "sea", inlandHandoff: false, legLength: 28 },
  { idx: 9, name: "Brenmoor", kind: "village", founded: 655, arrivalMode: "road", inlandHandoff: false, legLength: 14 },
  { idx: 12, name: "Dunmere", kind: "village", founded: 700, arrivalMode: "road", inlandHandoff: false, legLength: 30 },
];
const HOME = { arrivalMode: "road", inlandHandoff: false, legLength: 14 } as const;
const ROAD_LEGS = [
  { fromIdx: 0, toIdx: 4, mode: "sea" },
  { fromIdx: 4, toIdx: 9, mode: "road" },
  { fromIdx: 9, toIdx: 12, mode: "road" },
  { fromIdx: 12, toIdx: 0, mode: "road" },
] as const;

async function roadPanel(park: () => void = () => {}) {
  const { createVoyageLogPanel } = await import("../../src/site/shared/living-chart/voyage-log-panel.ts");
  const road = { href: (s: number, a: number, b: number) => `/ribbon/#seed=${s}&a=${a}&b=${b}`, park };
  const panel = createVoyageLogPanel({ panel: el(), sig: el(), strip: el() }, road);
  const { log, rows } = panel.buildLogPanel(ROAD_PORTS, 1200, 42, "x", HOME, ROAD_LEGS);
  return { panel, log, rows };
}

const textOf = (li: HTMLLIElement): El => (li as unknown as El).children[1]!;
const pressOf = (li: HTMLLIElement): El | undefined => textOf(li).children.find((c) => c.className === "cr-road");
const labelOf = (p: El): El => p.children.find((c) => c.className === "cr-road-label")!;
const noteOf = (p: El): El => p.children.find((c) => c.className === "cr-road-note")!;
const ev = (): { defaultPrevented: boolean; preventDefault(): void } => ({
  defaultPrevented: false,
  preventDefault() {
    this.defaultPrevented = true;
  },
});

test("a road leg's journal row carries Take this road to the host's address for that leg; the departure, a sea row and the last entry carry none (#434)", async () => {
  const { panel, log, rows } = await roadPanel();
  panel.revealLog(rows, 5);
  assert.equal(rows.length, 5, "a departure, three ports and the homecoming");
  assert.equal(
    ROAD_LEGS[3].mode,
    "road",
    "witness: the homecoming's leg is a road, so only the rule withholds its press",
  );
  for (const i of [0, 1, 4]) assert.equal(pressOf(rows[i]!), undefined, `row ${i} carries no press`);

  const press = pressOf(rows[2]!);
  assert.ok(press, "row 2 carries a press");
  assert.equal(press.tagName, "A");
  assert.equal(press.getAttribute("href"), "/ribbon/#seed=42&a=4&b=9");
  assert.equal(labelOf(press).textContent, "Take this road");
  assert.equal(noteOf(press).textContent, "Not reached yet");
  const kids = textOf(rows[2]!).children;
  assert.deepEqual(
    kids.map((c) => c.className),
    ["cr-prose", "", "cr-road"],
    "the words in their own span, a space, then the press",
  );
  assert.equal(kids[1]!.tagName, "#TEXT");
  assert.equal(kids[1]!.textContent, " ");
  assert.equal(pressOf(rows[3]!)!.getAttribute("href"), "/ribbon/#seed=42&a=9&b=12");
  assert.deepEqual(
    rows.map((li) => (li as unknown as El).children[0]!.textContent),
    log.entries.map((e) => `day ${e.day}`),
    "the gutters are the entries' own",
  );
});

test("a host that hands the journal no road writer keeps today's rows (#434 ruling B)", async () => {
  const { createVoyageLogPanel } = await import("../../src/site/shared/living-chart/voyage-log-panel.ts");
  const strip = el();
  const panel = createVoyageLogPanel({ panel: el(), sig: el(), strip });
  panel.buildLogPanel(ROAD_PORTS, 1200, 42, "x", HOME, ROAD_LEGS);
  const nodes = walk(strip as unknown as El);
  assert.ok(nodes.length > 10, "the strip was built and walked");
  assert.deepEqual(
    nodes.filter((n) => n.className === "cr-road" || n.className === "cr-prose"),
    [],
    "no press and no prose span on any row",
  );
});

const click = (p: El): { defaultPrevented: boolean } => {
  const e = ev();
  p.fire("click", e);
  return e;
};
const press2 = (rows: HTMLLIElement[]): El => pressOf(rows[2]!)!;
const press3 = (rows: HTMLLIElement[]): El => pressOf(rows[3]!)!;

test("the press stands pale and carries no address until the voyage reaches its row: it refuses, pauses nothing, and says Not reached yet; told, it takes its address and works, and the note goes (#434 M2)", async () => {
  const parks: number[] = [];
  const { panel, rows } = await roadPanel(() => parks.push(1));
  const p2 = press2(rows);
  const p3 = press3(rows);
  assert.equal(p2.getAttribute("aria-disabled"), "true", "at build no row is told");
  assert.equal(noteOf(p2).hidden, false);
  assert.equal(
    p2.getAttribute("href"),
    null,
    "a pale press carries no address, so no click of any kind opens the Ribbon",
  );

  panel.revealLog(rows, 2);
  assert.equal(p2.getAttribute("aria-disabled"), "true", "row 2 is still untold");
  assert.equal(noteOf(p2).hidden, false);
  assert.equal(p2.getAttribute("href"), null, "nor while its row is still untold");
  assert.equal(click(p2).defaultPrevented, true, "a pale press goes nowhere");
  assert.equal(parks.length, 0, "and pauses nothing");
  assert.equal(labelOf(p2).textContent, "Take this road", "and asks nothing");

  panel.revealLog(rows, 3);
  assert.equal(p2.getAttribute("aria-disabled"), "false", "told, it works");
  assert.equal(noteOf(p2).hidden, true, "and the note goes");
  assert.equal(p2.getAttribute("href"), "/ribbon/#seed=42&a=4&b=9", "and it takes its leg's address");
  assert.equal(p3.getAttribute("aria-disabled"), "true", "the next row's press is still pale");
  assert.equal(noteOf(p3).hidden, false);
  assert.equal(p3.getAttribute("href"), null, "and carries none");

  panel.revealLog(rows, 2);
  assert.equal(p2.getAttribute("aria-disabled"), "true", "scrubbed back, it is pale again");
  assert.equal(noteOf(p2).hidden, false);
  assert.equal(p2.getAttribute("href"), null, "and gives its address up");
});

test("the first press on a told row pauses the voyage and asks Leave the voyage?; the second lets the Ribbon open (#434 ruling A)", async () => {
  const parks: number[] = [];
  const { panel, rows } = await roadPanel(() => parks.push(1));
  panel.revealLog(rows, 5);
  const p2 = press2(rows);

  assert.equal(click(p2).defaultPrevented, true, "the first press goes nowhere");
  assert.equal(parks.length, 1, "it pauses the voyage once");
  assert.equal(labelOf(p2).textContent, "Leave the voyage?");

  assert.equal(click(p2).defaultPrevented, false, "the second press lets the anchor's own navigation through");
  assert.equal(parks.length, 1, "and pauses nothing more");
  assert.equal(labelOf(p2).textContent, "Take this road", "the question closes as the reader leaves");
  assert.equal(noteOf(p2).hidden, true, "the note stays gone on a told row");
});

type Rig = Awaited<ReturnType<typeof roadPanel>> & { parks: number[] };

async function askingRig(): Promise<Rig> {
  const parks: number[] = [];
  const rig = await roadPanel(() => parks.push(1));
  rig.panel.revealLog(rig.rows, 5);
  assert.equal(click(press2(rig.rows)).defaultPrevented, true);
  assert.equal(labelOf(press2(rig.rows)).textContent, "Leave the voyage?", "the precondition: row 2 asks");
  return { ...rig, parks };
}

function assertClosedNotRelabelled(rig: Rig, why: string): void {
  rig.panel.revealLog(rig.rows, 5);
  assert.equal(labelOf(press2(rig.rows)).textContent, "Take this road", `${why}: the label is back`);
  const before = rig.parks.length;
  assert.equal(click(press2(rig.rows)).defaultPrevented, true, `${why}: a fresh first press asks again`);
  assert.equal(
    rig.parks.length,
    before + 1,
    `${why}: and pauses again, so the question closed and did not merely relabel`,
  );
}

const CLOSERS: ReadonlyArray<[string, (r: Rig) => void]> = [
  ["focus leaves the press", (r) => press2(r.rows).fire("focusout")],
  ["Escape is pressed on it", (r) => press2(r.rows).fire("keydown", { key: "Escape" })],
  [
    "another road press asks",
    (r) => {
      assert.equal(click(press3(r.rows)).defaultPrevented, true);
      assert.equal(labelOf(press3(r.rows)).textContent, "Leave the voyage?", "row 3 asks in its turn");
    },
  ],
  [
    "a pale press is pressed",
    (r) => {
      r.panel.revealLog(r.rows, 3);
      const parked = r.parks.length;
      assert.equal(click(press3(r.rows)).defaultPrevented, true);
      assert.equal(r.parks.length, parked, "the pale press paused nothing");
    },
  ],
  ["its row goes untold", (r) => r.panel.revealLog(r.rows, 2)],
  ["the engine closes it", (r) => r.panel.closeAsk()],
];

test("the question closes on any other action: focus leaving, Escape, another road asking, a pale press pressed, its row untold, and the engine's closeAsk (#434 M4)", async () => {
  for (const [why, act] of CLOSERS) {
    const rig = await askingRig();
    act(rig);
    assert.equal(labelOf(press2(rig.rows)).textContent, "Take this road", `${why}: row 2 closed`);
    assertClosedNotRelabelled(rig, why);
  }

  const standing = await askingRig();
  standing.panel.revealLog(standing.rows, 5);
  assert.equal(
    labelOf(press2(standing.rows)).textContent,
    "Leave the voyage?",
    "a paint that leaves the row told leaves the question standing",
  );
});

test("a rebuilt or hidden journal paints only the presses it shows, never the ones it let go (#434)", async () => {
  const { panel, rows } = await roadPanel();
  panel.revealLog(rows, 5);
  const replaced = press2(rows);
  assert.equal(replaced.getAttribute("aria-disabled"), "false", "the old row 2 is told, so its press works");

  const { rows: fresh } = panel.buildLogPanel(ROAD_PORTS, 1200, 42, "x", HOME, ROAD_LEGS);
  assert.equal(press2(fresh).getAttribute("aria-disabled"), "true", "the new row 2 starts untold");
  rows[2]!.classList.toggle("inked", false);
  panel.revealLog(fresh, 5);
  assert.equal(press2(fresh).getAttribute("aria-disabled"), "false", "witness: the paint ran, on the new rows");
  assert.equal(
    replaced.getAttribute("aria-disabled"),
    "false",
    "the replaced press is not repainted from its replaced row, so the rebuild let it go",
  );

  const hidden = press2(fresh);
  panel.hideLog();
  fresh[2]!.classList.toggle("inked", false);
  panel.revealLog([], 0);
  assert.equal(
    hidden.getAttribute("aria-disabled"),
    "false",
    "the hidden press is not repainted from its hidden row, so hiding let it go",
  );
});
