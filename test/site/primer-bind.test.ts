import test from "node:test";
import assert from "node:assert/strict";
import { parseHTML } from "linkedom";
import { bindPrimer } from "../../src/site/primer/bind.ts";
import { PRIMER_STORE_KEY } from "../../src/site/shared/primer/seals.ts";
import { chartOfLessons, type ChartRoom } from "../../src/layouts/chart-of-lessons.ts";
import { chartOfLessonsSvg } from "../../src/layouts/chart-of-lessons-svg.ts";
import { FakeStore } from "../../test-support/fake-store.ts";

const room = (id: string, steps: string): string =>
  `<section class="room"><div class="room-head"><h2 id="${id}">${id}</h2><button class="unfold" hidden></button></div>` +
  `<div class="room-body" id="${id}-steps"><section class="lesson" id="${id}-one"><ol>${steps}</ol></section></div></section>`;
const step = (id: string, only = ""): string =>
  `<li class="step" id="${id}"${only === "" ? "" : ` data-only="${only}"`}><span class="num">1</span></li>`;
const pageOf = (chart: string): string =>
  `<div class="primer">${chart}${room("a", step("a1") + step("a2", "touch"))}${room("b", step("b1"))}` +
  `<section class="closing"><h2 id="afterward">x</h2><button class="wipe"></button></section></div>`;

const row = (sec: string, lessons: string): string =>
  `<li data-sec="${sec}"><a class="sec" href="#${sec}">${sec}</a>${lessons === "" ? "" : `<ol class="entries">${lessons}</ol>`}</li>`;
const INDEX =
  `<aside id="index"><div class="slip-body"><ol class="index">` +
  `${row("a", `<li data-for="a-one"><a href="#a-one">one</a></li>`)}${row("b", `<li data-for="b-one"><a href="#b-one">one</a></li>`)}${row("afterward", "")}` +
  `</ol></div></aside>`;

function load(chart: string, hash: string, sealed: string) {
  const { document, Element, Event } = parseHTML(`<!doctype html><html><body>${INDEX}${pageOf(chart)}</body></html>`);
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
  return { document, Event, scrolled, error };
}

const foldedOf = (document: Document) =>
  [...document.querySelectorAll("section.room")].map((r) => [
    r.querySelector("h2")!.id,
    r.classList.contains("folded"),
  ]);

function bound(hash: string, sealed: string, press?: string) {
  const { document, Event, scrolled, error } = load("", hash, sealed);
  if (press !== undefined)
    document
      .getElementById(press)
      ?.closest("section.room")
      ?.querySelector(".unfold")
      ?.dispatchEvent(new Event("click", { bubbles: true }));
  const folded = foldedOf(document);
  const lessons = [...document.querySelectorAll("#index .index > li")].map((li) => [
    li.getAttribute("data-sec"),
    li.querySelector(".entries")?.hasAttribute("hidden") ?? null,
  ]);
  return { error, scrolled, folded, lessons, ready: document.querySelector(".primer")!.hasAttribute("data-bound") };
}

const CHART_ROOMS: ChartRoom[] = [
  { id: "a", route: "/explorer/", lessons: [{ steps: [{ id: "a1" }, { id: "a2", only: "touch" }] }] },
  { id: "b", route: "/prospect/", lessons: [{ steps: [{ id: "b1" }] }] },
];
const CHART = chartOfLessonsSvg(chartOfLessons(CHART_ROOMS), "t");

function chartBound(sealed: string, press?: string) {
  const { document, Event, error: bindError } = load(CHART, "", sealed);
  let error = bindError;
  if (press !== undefined) {
    try {
      document
        .querySelector(`.col-chart a[href="#${press}"] text.name`)
        ?.dispatchEvent(new Event("click", { bubbles: true }));
    } catch (e) {
      error = e;
    }
  }
  const read = (selector: string, attr: string): string[] =>
    [...document.querySelectorAll(selector)].map((e) => e.getAttribute(attr) ?? "");
  return {
    error,
    folded: foldedOf(document),
    sealedMarks: read(".col-chart .sealed", "data-step"),
    inkedRoads: read(".col-chart .inked", "data-rooms"),
    lit: read(".col-chart .lit", "data-halo"),
    hand: document.querySelector(".col-chart .col-next.on")?.getAttribute("transform") ?? null,
    handAt: (step: string): string | null =>
      document.querySelector(`.col-chart [data-step="${step}"]`)?.getAttribute("data-hand") ?? null,
  };
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

test("PB5 the Primer's index lists the open room's lessons alone: on arrival the first room's, after a press on a folded room's head that room's, after a hash naming a lesson its room's, and the closing row, which lists none, untouched (Issue #1363)", () => {
  assert.deepEqual(
    bound("", "").lessons,
    [
      ["a", false],
      ["b", true],
      ["afterward", null],
    ],
    "on arrival",
  );
  assert.deepEqual(
    bound("", "", "b").lessons,
    [
      ["a", true],
      ["b", false],
      ["afterward", null],
    ],
    "after the press",
  );
  assert.deepEqual(
    bound("#b-one", "").lessons,
    [
      ["a", true],
      ["b", false],
      ["afterward", null],
    ],
    "after the hash",
  );
});

test("PB6 a returner's seals under the Primer's own key ink the chart as the page binds, and the room the page opens is the one lit, its hand at that room's next step (Issue #1257)", () => {
  const got = chartBound("a1");
  assert.equal(got.error, null);
  assert.deepEqual(got.sealedMarks, ["a1"]);
  assert.deepEqual(got.inkedRoads, ["a b"]);
  assert.deepEqual(got.lit, ["b"]);
  assert.ok(got.handAt("b1"));
  assert.equal(got.hand, got.handAt("b1"));
  assert.deepEqual(got.folded, [
    ["a", true],
    ["b", false],
  ]);
});

test("PB7 a press on a room's link on the chart opens that room as a link in the index does, and the light and the hand follow it (Issue #1155 comment 7136681098, Q1)", () => {
  const got = chartBound("", "b");
  assert.equal(got.error, null);
  assert.deepEqual(got.folded, [
    ["a", true],
    ["b", false],
  ]);
  assert.deepEqual(got.lit, ["b"]);
  assert.ok(got.handAt("b1"));
  assert.equal(got.hand, got.handAt("b1"));
});
