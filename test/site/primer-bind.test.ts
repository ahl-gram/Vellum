import test from "node:test";
import assert from "node:assert/strict";
import { parseHTML } from "linkedom";
import { bindPrimer } from "../../src/site/primer/bind.ts";
import { PRIMER_STORE_KEY } from "../../src/site/shared/primer/seals.ts";
import { FakeStore } from "../../test-support/fake-store.ts";

const room = (id: string, steps: string): string =>
  `<section class="room"><div class="room-head"><h2 id="${id}">${id}</h2><button class="unfold" hidden></button></div>` +
  `<div class="room-body" id="${id}-steps"><section class="lesson" id="${id}-one"><ol>${steps}</ol></section></div></section>`;
const step = (id: string, only = ""): string =>
  `<li class="step" id="${id}"${only === "" ? "" : ` data-only="${only}"`}><span class="num">1</span></li>`;
const PAGE =
  `<div class="primer">${room("a", step("a1") + step("a2", "touch"))}${room("b", step("b1"))}` +
  `<section class="closing"><h2 id="afterward">x</h2><button class="wipe"></button></section></div>`;

function bound(hash: string, sealed: string, press?: string) {
  const { document, Element, Event } = parseHTML(`<!doctype html><html><body>${PAGE}</body></html>`);
  const scrolled: string[] = [];
  Element.prototype.scrollIntoView = function (this: Element) {
    scrolled.push(this.id);
  };
  const store = new FakeStore(sealed === "" ? {} : { [PRIMER_STORE_KEY]: sealed });
  const g = globalThis as unknown as Record<string, unknown>;
  const win = { matchMedia: () => ({ matches: false }), addEventListener: () => {} };
  Object.assign(g, { location: { hash }, window: win, matchMedia: win.matchMedia, localStorage: store, Element });
  let error: unknown = null;
  try {
    bindPrimer(document);
  } catch (e) {
    error = e;
  }
  if (press !== undefined)
    document
      .getElementById(press)
      ?.closest("section.room")
      ?.querySelector(".unfold")
      ?.dispatchEvent(new Event("click", { bubbles: true }));
  const folded = [...document.querySelectorAll("section.room")].map((r) => [
    r.querySelector("h2")!.id,
    r.classList.contains("folded"),
  ]);
  return { error, scrolled, folded, ready: document.querySelector(".primer")!.hasAttribute("data-bound") };
}

test("PB1 a hash that is not a valid percent-encoding leaves the page as bound as any other (Issue #1251 skeptic)", () => {
  for (const hash of ["#%", "#100%", "#%E0%A4%A"]) {
    const got = bound(hash, "");
    assert.equal(got.error, null, `${hash} threw`);
    assert.equal(got.ready, true, `${hash} left the page unbound`);
  }
});

test("PB2 a hash naming something outside a room is where the reader lands, whatever the seals say (Issue #1251 skeptic)", () => {
  const got = bound("#afterward", "a1");
  assert.deepEqual(got.scrolled, [], "the resume room's head is not scrolled to over the address the reader came by");
  assert.deepEqual(
    got.folded,
    [
      ["a", true],
      ["b", false],
    ],
    "the returner's room is still the one open",
  );
});

test("PB3 a returner with no address resumes at the first room with a step still to seal, and lands on it; a hash naming a lesson opens its room", () => {
  const back = bound("", "a1");
  assert.deepEqual(back.folded, [
    ["a", true],
    ["b", false],
  ]);
  assert.deepEqual(back.scrolled, ["b"]);
  const named = bound("#b-one", "");
  assert.deepEqual(named.folded, [
    ["a", true],
    ["b", false],
  ]);
  assert.deepEqual(named.scrolled, ["b-one"]);
});

test("PB4 a press on a folded room's head opens that room, folds the open one and lands on its head (Issue #1252)", () => {
  const got = bound("", "", "b");
  assert.deepEqual(got.folded, [
    ["a", true],
    ["b", false],
  ]);
  assert.deepEqual(got.scrolled, ["b"]);
});
