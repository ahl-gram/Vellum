import test from "node:test";
import assert from "node:assert/strict";
import { parseHTML } from "linkedom";
import { EXPLORER } from "../../src/site/shared/primer/explorer.ts";
import { handSpot, noteWidth, ringBox, ringTargets } from "../../src/site/shared/primer/hand-geometry.ts";
import { buildNote, markDone } from "../../src/site/shared/primer/hand-note.ts";
import { handSteps, type HandStep } from "../../src/site/shared/primer/hand-steps.ts";
import { LADDERS } from "../../src/site/shared/primer/ladders.ts";
import { PRIMER_STORE_KEY } from "../../src/site/shared/primer/seals.ts";
import { bootHand, type HandEnv } from "../../src/site/shared/primer-hand.ts";
import { FakeStore } from "../../test-support/fake-store.ts";

const STEPS = handSteps(LADDERS);
const stepOf = (id: string): HandStep => {
  const s = STEPS.find((x) => x.id === id);
  assert.ok(s !== undefined, `no step ${id}`);
  return s;
};
const noteOf = (
  id: string,
  sealed: readonly string[] = [],
  when: "never" | "arrival" | "use" | "outcome" = "outcome",
) => {
  const { document } = parseHTML(`<!doctype html><html><body></body></html>`);
  const step = stepOf(id);
  return { document, step, note: buildNote(document, step, new Set(sealed), when) };
};
const text = (el: Element | null): string => (el?.textContent ?? "").replace(/\s+/g, " ").trim();

test("PK11 ringBox wraps the standing boxes grown by six pixels, handSpot stands the manicule forty-four pixels left and never off the window, noteWidth keeps the note twenty-four pixels short of the open slip, and ringTargets falls back to the first act only while no named control stands", () => {
  assert.deepEqual(
    ringBox([
      { x: 0, y: 0, w: 10, h: 10 },
      { x: 20, y: 5, w: 10, h: 10 },
      { x: 50, y: 50, w: 1, h: 1 },
    ]),
    { x: -6, y: -6, w: 42, h: 27 },
  );
  assert.equal(ringBox([]), null);
  assert.deepEqual(handSpot({ x: 30, y: 100, w: 50, h: 40 }, { h: 34 }), { x: 4, y: 103 });
  assert.deepEqual(handSpot({ x: 200, y: 100, w: 50, h: 40 }, { h: 34 }), { x: 156, y: 103 });
  assert.equal(noteWidth(25.6, 793, 1280), 620);
  assert.equal(noteWidth(25.6, 544, 1024), 494.4);
  assert.equal(noteWidth(24, null, 600), 552, "no open slip: the window is the edge");
  const prospect = stepOf("explorer-view-prospect");
  assert.deepEqual(
    ringTargets(prospect, (c) => c !== "#place-card .pc-prospect"),
    ['.place-hit[data-idx="0"]'],
  );
  assert.deepEqual(
    ringTargets(prospect, () => true),
    ["#place-card .pc-prospect"],
  );
  assert.deepEqual(
    ringTargets(stepOf("explorer-dog-ear"), () => true),
    [],
  );
});

test("PK12 the note carries the step: where it comes from, its lesson and place, its sentence with chips, the road back to its own step and the road on", () => {
  const { note } = noteOf("explorer-islands", ["explorer-dice"]);
  const dots = [...note.querySelectorAll(".primer-slip-dots i")];
  assert.equal(dots.length, 6);
  assert.deepEqual(
    dots.map((d) => d.className),
    ["", "now", "", "", "", ""],
  );
  assert.equal(text(note.querySelector(".primer-slip-verb")), "From The Primer");
  assert.equal(text(note.querySelector(".primer-slip-title")), "The Land, step 2 of 6");
  const act = note.querySelector(".primer-slip-act");
  assert.equal(text(act), "A new row has come: drag islands from few toward many, then let go.");
  assert.equal(act?.querySelectorAll("span.ch.word").length, 3);
  assert.equal(note.querySelector("a.primer-slip-back")?.getAttribute("href"), "/primer/#explorer-islands");
  const next = note.querySelector("a.primer-slip-next");
  assert.equal(next?.getAttribute("href"), "/explorer/?step=explorer-sizes#seed=42&type=archipelago&islands=20");
  assert.equal(next?.className, "primer-slip-next dim");
  assert.equal(text(next), "Next step");
  assert.equal(note.querySelector("button.primer-slip-aside")?.getAttribute("aria-label"), "Set the step aside");
  const sealed = noteOf("explorer-islands", ["explorer-archipelago"]).note;
  assert.deepEqual(
    [...sealed.querySelectorAll(".primer-slip-dots i")].map((d) => d.className),
    ["on", "now", "", "", "", ""],
  );
  const road = noteOf("explorer-to-print").note.querySelector(".primer-slip-act span.ch.road");
  assert.equal(text(road?.querySelector("i") ?? null).length > 0, true, "a road chip carries its verb");
  assert.equal(text(road?.querySelector("b") ?? null).length > 0, true, "and its place");
});

test("PK13 done, the note shows the seal with the step's number, says done and turns its press onward to the next step's word; a step that cannot apply carries its mark and no done row; the last step has no press onward", () => {
  const { note, step } = noteOf("explorer-islands", ["explorer-dice"]);
  assert.equal(note.querySelector(".primer-slip-done"), null);
  markDone(note, step, new Set(["explorer-dice", "explorer-islands"]));
  assert.equal(text(note.querySelector("b.primer-seal")), "2");
  assert.ok(text(note.querySelector(".primer-slip-done")).includes("done"));
  const next = note.querySelector("a.primer-slip-next");
  assert.equal(text(next), "Next, sizes ›");
  assert.equal(next?.className, "primer-slip-next go");
  assert.equal(note.querySelectorAll(".primer-slip-dots i")[1]?.className, "on");
  markDone(note, step, new Set(["explorer-islands"]));
  assert.equal(note.querySelectorAll(".primer-slip-done").length, 1, "done is written once");
  const never = noteOf("explorer-in-hand", [], "never").note;
  assert.equal(text(never.querySelector("span.mark")), "on a tablet");
  assert.equal(never.querySelector(".primer-slip-done"), null);
  const last = EXPLORER.lessons.flatMap((l) => l.steps).at(-1)!;
  const end = noteOf(last.id);
  assert.equal(end.note.querySelector("a.primer-slip-next"), null);
  markDone(end.note, end.step, new Set([last.id]));
  assert.equal(end.note.querySelector("a.primer-slip-next"), null);
});

function booted(address: string, steps: readonly HandStep[] = STEPS, chrome = true) {
  const { document } = parseHTML(
    `<!doctype html><html><body>${chrome ? `<header class="chrome"></header>` : ""}</body></html>`,
  );
  const [beforeHash = "", hash = ""] = address.split(/(?=#)/);
  const q = beforeHash.indexOf("?");
  const location = {
    pathname: q === -1 ? beforeHash : beforeHash.slice(0, q),
    search: q === -1 ? "" : beforeHash.slice(q),
    hash,
  };
  const store = new FakeStore();
  const replaced: string[] = [];
  let fetched = 0;
  const env: HandEnv = {
    doc: document,
    location,
    replace: (url) => void replaced.push(url),
    store: () => store as unknown as Storage,
    device: { touch: false, motion: false },
    fetchSteps: async () => {
      fetched++;
      return steps;
    },
    frame: () => 1,
    cancelFrame: () => {},
  };
  return { document, store, replaced, fetched: () => fetched, run: () => bootHand({ route: "/explorer/" }, env) };
}

test("PK14 bootHand drops the key with the hash kept once the step is done, writes the seal, and leaves an address with no key, an unknown key or a key for another room alone", async () => {
  const done = booted("/explorer/?step=explorer-to-print#seed=42");
  await done.run();
  assert.equal(done.store.held[PRIMER_STORE_KEY], "explorer-to-print");
  assert.equal(done.replaced.at(-1), "/explorer/#seed=42");
  assert.ok(
    done.document.querySelector("header.chrome > aside.primer-slip") !== null,
    "the note is the head's last child",
  );
  const none = booted("/explorer/#seed=42");
  await none.run();
  const unknown = booted("/explorer/?step=nope#seed=42");
  await unknown.run();
  const other = booted("/explorer/?step=prospect-year#seed=42");
  await other.run();
  assert.deepEqual([none.fetched(), unknown.fetched(), other.fetched()], [0, 1, 1]);
  for (const b of [none, unknown, other]) {
    assert.deepEqual(b.store.held, {});
    assert.deepEqual(b.replaced, []);
    assert.equal(b.document.querySelector(".primer-slip"), null);
  }
});
