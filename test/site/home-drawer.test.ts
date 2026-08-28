import { test } from "node:test";
import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { resolve } from "node:path";
import { INERT_BEHIND, bindDrawer, type Listens } from "../../src/site/home/drawer.ts";

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
  const narrowEvents = listener();
  const narrow = { matches: true, addEventListener: narrowEvents.on.addEventListener };
  bindDrawer(reveal, doc.on, { scrim, inert, narrow });
  return { reveal, doc, revealEvents, scrim, inert, narrow, narrowEvents };
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

test("the inert set is the survey section's children, never the chrome, and home's markup keeps the stage, seed form and slips there (#480, prover round 3 hole C7)", () => {
  // The binder is generic; this pins the WIRING app.ts hands it, which no fake host can see.
  assert.equal(INERT_BEHIND, ".landfall > *", "exactly the survey section's children, which is exactly what the scrim covers; the shelf and footer stay live (skeptic round 2, finding 2: a click over an inert subtree retargets to a live ancestor, never the scrim, so an inert region the scrim does not cover is dead with no way out)");
  const astro = readFileSync(resolve(import.meta.dirname, "..", "..", "src/pages/index.astro"), "utf8");
  const landfallAt = astro.indexOf('<section class="landfall"');
  const landfallEnd = astro.indexOf("</section>", landfallAt);
  const section = astro.slice(landfallAt, landfallEnd);
  for (const child of ['class="stage"', 'class="lf-seed"', 'class="lf-card"', 'class="lf-card lf-card-how"']) {
    assert.ok(section.includes(child), `${child} lives inside .landfall, so ".landfall > *" reaches it`);
  }
  assert.ok(astro.indexOf('<section class="lf-shelf"') > landfallEnd, "the shelf is a sibling section after .landfall, outside the inert set and the scrim alike");
  const app = readFileSync(resolve(import.meta.dirname, "..", "..", "src/site/home/app.ts"), "utf8");
  assert.match(app, /querySelectorAll<HTMLElement>\(INERT_BEHIND\)/, "app.ts queries the exported constant, not a restrung copy");
});

test("the drawer closes itself when the viewport leaves the narrow range, so no inert state outlives the rules that dressed it (#480, skeptic round 2 finding 2)", () => {
  const f = fixture(true);
  f.revealEvents.fire("change");
  assert.deepEqual(f.inert.map((e) => e.inert), [true, true]);
  f.narrow.matches = true;
  f.narrowEvents.fire("change");
  assert.equal(f.reveal.checked, true, "a change that still matches narrow leaves the drawer alone");
  f.narrow.matches = false;
  f.narrowEvents.fire("change");
  assert.equal(f.reveal.checked, false, "crossing to desktop closes it");
  assert.deepEqual(f.inert.map((e) => e.inert), [false, false], "and releases the page");
});

test("a page scroll closes an open drawer, so the drawer, its burger and its scrim never ride off-screen as an orphaned open state (#480, plate round 2 C and skeptic round 2 finding 2)", () => {
  const f = fixture(true);
  f.revealEvents.fire("change");
  f.doc.fire("scroll");
  assert.equal(f.reveal.checked, false, "the first scroll closes it");
  assert.deepEqual(f.inert.map((e) => e.inert), [false, false], "and releases the page");
  f.doc.fire("scroll");
  assert.equal(f.reveal.checked, false, "a scroll with the drawer closed is nothing to it");
});
