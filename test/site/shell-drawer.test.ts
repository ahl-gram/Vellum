import { test } from "node:test";
import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { resolve } from "node:path";
import { bindDrawer, type Listens } from "../../src/site/shell/drawer.ts";
import { HOME_WIRING, NARROW, ROOM_WIRING, wiringFor } from "../../src/site/shell/wiring.ts";

// Landfall Sub 6b (#480) then Sub 6c (#483): the drawer's script-only manners, now the shell's on every page. Escape and a tap on the scrim close it, the page behind it is inert while it is open (skeptic finding 8: Tab walked out of the drawer onto the stage), and home ALONE closes it on a scroll. The burger itself needs no script (the checkbox is the no-JS path).

const REPO = resolve(import.meta.dirname, "..", "..");
const read = (p: string): string => readFileSync(resolve(REPO, p), "utf8");

type Handler = (e: Event) => void;
const listener = () => {
  const handlers = new Map<string, Handler>();
  const on: Listens = { addEventListener: (type, fn) => handlers.set(type, fn) };
  const fire = (type: string, detail: Record<string, unknown> = {}) => {
    const fn = handlers.get(type);
    assert.ok(fn, `listens for ${type}`);
    fn({ type, ...detail } as unknown as Event);
  };
  return { on, fire, listens: (type: string) => handlers.has(type) };
};
const fixture = (checked: boolean, closesOnScroll = true) => {
  const doc = listener();
  const revealEvents = listener();
  const reveal = { checked, addEventListener: revealEvents.on.addEventListener };
  const scrim = {};
  const inert = [{ inert: false }, { inert: false }];
  const narrowEvents = listener();
  const narrow = { matches: true, addEventListener: narrowEvents.on.addEventListener };
  bindDrawer(reveal, doc.on, { scrim, inert, narrow, closesOnScroll });
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

test("a scroll closes an open drawer where the host asks for it, so the drawer, its burger and its scrim never ride off-screen as an orphaned open state (#480, plate round 2 C and skeptic round 2 finding 2)", () => {
  const f = fixture(true, true);
  f.revealEvents.fire("change");
  f.doc.fire("scroll");
  assert.equal(f.reveal.checked, false, "the first scroll closes it");
  assert.deepEqual(f.inert.map((e) => e.inert), [false, false], "and releases the page");
  f.doc.fire("scroll");
  assert.equal(f.reveal.checked, false, "a scroll with the drawer closed is nothing to it");
});

test("a host that does not close on scroll never listens for one, so a room's fixed drawer survives a scroll under it (#483)", () => {
  const f = fixture(true, false);
  f.revealEvents.fire("change");
  assert.equal(f.doc.listens("scroll"), false, "no scroll listener is registered at all: an unregistered handler cannot regress into a no-op body");
  assert.equal(f.reveal.checked, true, "the drawer is still open");
  assert.deepEqual(f.inert.map((e) => e.inert), [true, true], "and the page behind it is still inert");
  f.doc.fire("keydown", { key: "Escape" });
  assert.equal(f.reveal.checked, false, "every other manner still applies");
});

test("the scrim host and the inert set are chosen together per page kind, and the room's scroll-close is off (#483)", () => {
  assert.equal(wiringFor(false), HOME_WIRING, "home is the roomless page");
  assert.equal(wiringFor(true), ROOM_WIRING, "every other shelled page is a room");
  assert.equal(HOME_WIRING.scrim, ".landfall", "home's scrim is the survey section's own overlay, so it rides with the drawer and the burger (#482 finding 4)");
  assert.equal(HOME_WIRING.inert, ".landfall > *", "exactly the survey section's children, which is exactly what that scrim covers; the shelf and footer stay live");
  assert.equal(HOME_WIRING.closesOnScroll, true, "home's chrome rides the page (RH3), so an open drawer would ride away");
  assert.equal(ROOM_WIRING.scrim, "body", "a room's scrim is body's own fixed overlay, and a click on it reports body as the target");
  assert.equal(ROOM_WIRING.inert, "body.room > main, body.room > footer", "everything the shell renders below the chrome; unlike home's these need not match the wash extent, since body IS the scrim host every retarget lands on");
  assert.equal(ROOM_WIRING.closesOnScroll, false, "a room's chrome is FIXED (RH3), so nothing rides away and a scroll is not a close");
});

test("the shell's entry queries the wiring it was handed, and home's bundle no longer binds the drawer (#483)", () => {
  const app = read("src/site/shell/app.ts");
  assert.match(app, /wiringFor\(document\.body\.classList\.contains\("room"\)\)/, "the page kind is read from the class the layout renders, not guessed from a path");
  assert.match(app, /querySelector\(wiring\.scrim\)/, "the scrim comes from the wiring, not a restrung copy");
  assert.match(app, /querySelectorAll<HTMLElement>\(wiring\.inert\)/, "and so does the inert set");
  assert.match(app, /closesOnScroll: wiring\.closesOnScroll/, "and the scroll manner");
  assert.match(app, /window\.matchMedia\(NARROW\)/, "the narrow range is the exported constant the sheet is pinned against");
  const home = read("src/site/home/app.ts");
  assert.doesNotMatch(home, /bindDrawer/, "the homepage bundle no longer binds the drawer: the shell does, once, for every page (#483 ruling, option 1)");
});

test("the inert set the wiring names reaches what each page actually renders (#480 prover round 3 hole C7, #483)", () => {
  const astro = read("src/pages/index.astro");
  const landfallAt = astro.indexOf('<section class="landfall"');
  const landfallEnd = astro.indexOf("</section>", landfallAt);
  const section = astro.slice(landfallAt, landfallEnd);
  for (const child of ['class="stage"', 'class="lf-seed"', 'class="lf-card"', 'class="lf-card lf-card-how"']) {
    assert.ok(section.includes(child), `${child} lives inside .landfall, so "${HOME_WIRING.inert}" reaches it`);
  }
  assert.ok(astro.indexOf('<section class="lf-shelf"') > landfallEnd, "the shelf is a sibling section after .landfall, outside the inert set and the scrim alike");
  const layout = read("src/layouts/BaseLayout.astro");
  const body = layout.slice(layout.indexOf("<body"));
  assert.match(body, /<main class:list=\{\[room && desk !== "open" && "desk-panel"\]\}>/, "main is body's own child on a room, so the room wiring's child combinator reaches it");
  assert.ok(body.indexOf("<footer>") > body.indexOf("</main>"), "and the footer is its sibling after it, the last thing the fixed scrim covers");
});

test("the narrow range the binder watches is the one the sheet folds the nav down at (#480)", () => {
  assert.equal(NARROW, "(max-width: 900px)");
  assert.ok(
    read("src/layouts/BaseLayout.astro").includes(`@media ${NARROW}`),
    "a binder watching a different width than the sheet leaves the drawer open past the rules that dressed it",
  );
});
