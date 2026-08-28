import { test } from "node:test";
import assert from "node:assert/strict";
import { bindDrawer, type Listens } from "../../src/site/home/drawer.ts";

// Landfall Sub 6b (#480): the drawer's script-only manners: Escape and a tap on the scrim close it, and the page behind it is inert while it is open (skeptic finding 8: Tab walked out of the drawer onto the stage). The burger itself needs no script (the checkbox is the no-JS path).

type Handler = (e: Event) => void;
const listener = () => {
  const handlers = new Map<string, Handler>();
  const on: Listens = { addEventListener: (type, fn) => handlers.set(type, fn) };
  const fire = (type: string, detail: Record<string, unknown> = {}) => {
    const fn = handlers.get(type);
    assert.ok(fn, `listens for ${type}`);
    fn({ type, ...detail } as unknown as Event);
  };
  return { on, fire };
};
const fixture = (checked: boolean) => {
  const doc = listener();
  const revealEvents = listener();
  const reveal = { checked, addEventListener: revealEvents.on.addEventListener };
  const scrim = {};
  const inert = [{ inert: false }, { inert: false }];
  bindDrawer(reveal, doc.on, { scrim, inert });
  return { reveal, doc, revealEvents, scrim, inert };
};

test("opening by the burger makes the page behind inert; closing by the burger releases it (#480)", () => {
  const f = fixture(false);
  f.reveal.checked = true;
  f.revealEvents.fire("change");
  assert.deepEqual(f.inert.map((e) => e.inert), [true, true], "every element handed in goes inert on open");
  f.reveal.checked = false;
  f.revealEvents.fire("change");
  assert.deepEqual(f.inert.map((e) => e.inert), [false, false], "and comes back on close");
});

test("Escape closes an open drawer, releasing the page, and leaves a closed one alone (#480)", () => {
  const f = fixture(true);
  f.reveal.checked = true;
  f.revealEvents.fire("change");
  f.doc.fire("keydown", { key: "Enter" });
  assert.equal(f.reveal.checked, true, "an unrelated key changes nothing");
  f.doc.fire("keydown", { key: "Escape" });
  assert.equal(f.reveal.checked, false, "Escape closes the drawer");
  assert.deepEqual(f.inert.map((e) => e.inert), [false, false], "a script close releases the page too (no change event fires for a programmatic uncheck)");
  f.doc.fire("keydown", { key: "Escape" });
  assert.equal(f.reveal.checked, false, "a second Escape never re-opens it");
});

test("a click on the scrim's host closes the drawer; a click on anything else does not (#480)", () => {
  const f = fixture(true);
  f.revealEvents.fire("change");
  f.doc.fire("click", { target: { not: "the scrim" } });
  assert.equal(f.reveal.checked, true, "a click inside the drawer or on the burger is not a close");
  f.doc.fire("click", { target: f.scrim });
  assert.equal(f.reveal.checked, false, "a click on the scrim closes the drawer");
  assert.deepEqual(f.inert.map((e) => e.inert), [false, false], "and releases the page");
});
