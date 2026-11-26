import test from "node:test";
import assert from "node:assert/strict";
import { parseHTML } from "linkedom";
import { bindPrimer } from "../../src/site/primer/bind.ts";
import { PRIMER_STORE_KEY } from "../../src/site/shared/primer/seals.ts";
import { WALK_OPENING } from "../../src/site/primer/words.ts";
import { chartOfLessons, type ChartRoom } from "../../src/layouts/chart-of-lessons.ts";
import { chartOfLessonsSvg } from "../../src/layouts/chart-of-lessons-svg.ts";
import { FakeStore } from "../../test-support/fake-store.ts";

const lesson = (id: string, steps: string): string => `<section class="lesson" id="${id}"><ol>${steps}</ol></section>`;
const room = (id: string, steps: string, more = ""): string =>
  `<section class="room"><div class="room-head"><h2 id="${id}">${id}</h2></div>` +
  `<div class="room-body" id="${id}-steps">${lesson(`${id}-one`, steps)}${more}</div></section>`;
const step = (id: string, only = ""): string =>
  `<li class="step" id="${id}"${only === "" ? "" : ` data-only="${only}"`}><span class="num">1</span><p class="act">Press ${id}</p></li>`;
const pageOf = (chart: string): string =>
  `<div class="primer">${chart}<div class="opening"><p class="lede">l</p><p>was</p></div>${room("a", step("a1") + step("a2", "touch"), '<p class="next"><a href="#b">b</a></p>')}` +
  room("b", step("b1"), lesson("b-two", step("b2"))) +
  `<section class="closing"><h2 id="afterward">x</h2><button class="wipe"></button></section></div>`;

const row = (sec: string, lessons: string): string =>
  `<li data-sec="${sec}"><a class="sec" href="#${sec}">${sec}</a>${lessons === "" ? "" : `<ol class="entries">${lessons}</ol>`}</li>`;
const INDEX =
  `<aside id="index"><div class="slip-body"><ol class="index">` +
  `${row("a", `<li data-for="a-one"><a href="#a-one">one</a></li>`)}${row("b", `<li data-for="b-one"><a href="#b-one">one</a></li>`)}${row("afterward", "")}` +
  `</ol></div></aside>`;

type Listener = (e: { persisted?: boolean }) => void;

function load(chart: string, hash: string, sealed: string) {
  const { document, Element, Event } = parseHTML(`<!doctype html><html><body>${INDEX}${pageOf(chart)}</body></html>`);
  const scrolled: string[] = [];
  const tops: unknown[][] = [];
  const pushed: string[] = [];
  const replaced: string[] = [];
  const timers: Array<() => void> = [];
  const listeners = new Map<string, Listener[]>();
  const focused: Array<{ el: Element; opts: unknown }> = [];
  Element.prototype.scrollIntoView = function (this: Element) {
    scrolled.push(this.id);
  };
  (Element.prototype as unknown as { focus: (opts?: unknown) => void }).focus = function (
    this: Element,
    opts?: unknown,
  ) {
    focused.push({ el: this, opts });
  };
  Object.defineProperty(document, "activeElement", {
    configurable: true,
    get: () => focused[focused.length - 1]?.el ?? null,
  });
  const store = new FakeStore(sealed === "" ? {} : { [PRIMER_STORE_KEY]: sealed });
  const g = globalThis as unknown as Record<string, unknown>;
  const where = { hash, pathname: "/primer/", search: "" };
  const win = {
    matchMedia: () => ({ matches: false }),
    addEventListener: (type: string, run: Listener) => listeners.set(type, [...(listeners.get(type) ?? []), run]),
    scrollTo: (...at: unknown[]) => tops.push(at),
    location: where,
    setTimeout: (run: () => void) => timers.push(run),
    history: {
      state: null,
      scrollRestoration: "auto",
      pushState: (_state: unknown, _title: string, url: string) => pushed.push(url),
      replaceState: (_state: unknown, _title: string, url: string) => {
        replaced.push(url);
        where.hash = url.includes("#") ? url.slice(url.indexOf("#")) : "";
      },
    },
  };
  Object.assign(g, { location: where, window: win, matchMedia: win.matchMedia, localStorage: store, Element });
  let error: unknown = null;
  try {
    bindPrimer(document);
  } catch (e) {
    error = e;
  }
  return { document, Event, scrolled, tops, pushed, replaced, timers, listeners, focused, store, win, error };
}

const foldedOf = (document: Document) =>
  [...document.querySelectorAll("section.room")].map((r) => [
    r.querySelector("h2")!.id,
    r.classList.contains("folded"),
  ]);

function bound(hash: string, sealed: string, press?: string) {
  const { document, Event, scrolled, tops, replaced, error } = load("", hash, sealed);
  if (press !== undefined)
    document.querySelector(`#index a.sec[href="#${press}"]`)?.dispatchEvent(new Event("click", { bubbles: true }));
  const folded = foldedOf(document);
  const lessons = [...document.querySelectorAll("#index .index > li")].map((li) => [
    li.getAttribute("data-sec"),
    li.querySelector(".entries")?.hasAttribute("hidden") ?? null,
  ]);
  const now = [...document.querySelectorAll("li.now")].map((li) => li.id);
  return {
    error,
    scrolled,
    tops,
    replaced,
    folded,
    lessons,
    now,
    document,
    ready: document.querySelector(".primer")!.hasAttribute("data-bound"),
  };
}

const CHART_ROOMS: ChartRoom[] = [
  { id: "a", route: "/explorer/", lessons: [{ steps: [{ id: "a1" }, { id: "a2", only: "touch" }] }] },
  { id: "b", route: "/prospect/", lessons: [{ steps: [{ id: "b1" }] }, { steps: [{ id: "b2" }] }] },
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
  assert.deepEqual(got.replaced, [], "its address is left for the browser's own jump");
  assert.deepEqual(
    got.folded,
    [
      ["a", true],
      ["b", false],
    ],
    "the returner's room is still the one open",
  );
});

test("PB3 a returner with no address resumes at the first room with a step still to seal, its step shown with no scroll and no address held; a hash naming a lesson opens its room at the lesson's first step, asks the window for its top and holds its address from the browser's own jump (Issue #1392 C6, C14, C24)", () => {
  const back = bound("", "a1");
  assert.deepEqual(back.folded, [
    ["a", true],
    ["b", false],
  ]);
  assert.deepEqual(back.scrolled, []);
  assert.deepEqual(back.tops, []);
  assert.deepEqual(back.replaced, []);
  assert.deepEqual(back.now, ["b1"]);
  const named = bound("#b-one", "");
  assert.deepEqual(named.folded, [
    ["a", true],
    ["b", false],
  ]);
  assert.deepEqual(named.tops, [[0, 0]]);
  assert.deepEqual(named.replaced, ["/primer/"]);
  assert.deepEqual(named.now, ["b1"]);
});

test("PB5 the Primer's index lists the open room's lessons alone: on arrival the first room's, after a press on that room's row in the index that room's, after a hash naming a lesson its room's, and the closing row, which lists none, untouched (Issue #1363)", () => {
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
    "after the press on its row",
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

test("PB8 the page walks: its first step alone and its lesson marked, the chart moved under the rooms, the opening in the walk's words; Skip shows the next step, a tablet step included, Back the one before, Back absent at the room's first step, and Skip at the room's last step its end (Issue #1392 D1, D2, D6, comment 7199849912)", () => {
  const { document, Event, error } = load(`<nav class="col-head">${CHART}</nav>`, "", "");
  assert.equal(error, null);
  const primer = document.querySelector(".primer")!;
  const nowIds = (): string[] => [...document.querySelectorAll(".now[id]")].map((e) => e.id);
  const press = (selector: string): void => {
    document.querySelector(selector)?.dispatchEvent(new Event("click", { bubbles: true }));
  };
  assert.equal(primer.classList.contains("walking"), true);
  assert.deepEqual(nowIds(), ["a-one", "a1"]);
  assert.equal(document.querySelector(".walk .walk-back") === null, true, "no Back at the room's first step");
  assert.equal(document.querySelector(".closing")?.previousElementSibling?.matches("nav.col-head"), true);
  assert.equal(document.querySelector(".opening p:not(.lede)")?.textContent, WALK_OPENING);
  press(".walk-skip");
  assert.notEqual(document.querySelector(".walk .walk-back"), null);
  assert.deepEqual(nowIds(), ["a-one", "a2"]);
  press(".walk-back");
  assert.deepEqual(nowIds(), ["a-one", "a1"]);
  press(".walk-skip");
  press(".walk-skip");
  assert.equal(primer.classList.contains("room-end"), true);
  assert.equal(document.querySelector("li.now"), null);
});

test("PB9 a hash naming a sealed step lands past it with a Done line holding its seal and act, at the room's end where nothing is left, and asks the window for its top (Issue #1392 D5, C6, C14)", () => {
  const got = bound("#a1", "a1");
  assert.equal(got.document.querySelector(".walk-done")?.textContent, "1Done: Press a1");
  assert.equal(got.document.querySelector(".primer")?.classList.contains("room-end"), true);
  assert.deepEqual(got.tops, [[0, 0]]);
});

test("PB11 Back stands beside Skip on every step of a room but its first, a later lesson's first step included (Issue #1392 comment 7199849912)", () => {
  const { document, Event } = load("", "#b", "");
  const ids = (): string[] => [...document.querySelectorAll(".now[id]")].map((e) => e.id);
  assert.deepEqual(ids(), ["b-one", "b1"]);
  assert.equal(document.querySelector(".walk .walk-back") === null, true);
  document.querySelector(".walk-skip")?.dispatchEvent(new Event("click", { bubbles: true }));
  assert.deepEqual(ids(), ["b-two", "b2"]);
  assert.notEqual(document.querySelector(".walk .walk-back"), null);
});

test("PB10 Skip and Back keep the keyboard on the walk: the press used takes the focus in the new row, Skip where Back has gone at the room's first step, the room's road at its end, and a press that held no focus hands none (Issue #1392, review of PR #1496)", () => {
  const { document, Event, focused } = load("", "", "");
  const click = (el: Element | null): void => {
    el?.dispatchEvent(new Event("click", { bubbles: true }));
  };
  const hold = (selector: string): Element | null => {
    const el = document.querySelector(selector);
    (el as HTMLElement | null)?.focus();
    return el;
  };
  const last = (): { el: Element; opts: unknown } | undefined => focused[focused.length - 1];

  const skip = hold(".walk-skip");
  click(skip);
  assert.equal(last()?.el.matches(".walk .walk-skip"), true, "Skip hands the focus to the new row's Skip");
  assert.equal(last()?.el !== skip, true, "the new row's Skip, not the one pressed");
  assert.deepEqual(last()?.opts, { preventScroll: true });

  click(hold(".walk-back"));
  assert.equal(last()?.el.matches(".walk .walk-skip"), true, "Back at the room's first step hands the focus to Skip");

  click(hold(".walk-skip"));
  click(hold(".walk-skip"));
  assert.equal(document.querySelector(".walk") === null, true, "the room's last step leaves no row");
  assert.equal(
    last()?.el.matches("section.room:not(.folded) .room-body > .next a"),
    true,
    "the room's road takes the focus",
  );

  const fresh = load("", "", "");
  fresh.document.querySelector(".walk-skip")?.dispatchEvent(new fresh.Event("click", { bubbles: true }));
  assert.deepEqual(fresh.focused, [], "a press that held no focus hands none");
});

test("PB13 the Primer lands itself on every load: it asks the browser not to put back a scroll it left, so a reload lands at the top like any landing (Issue #1392 comment 7201280596, D8)", () => {
  const { win } = load("", "", "");
  assert.equal(win.history.scrollRestoration, "manual");
});

test("PB12 the browser's Back to the page it kept reads the seals again: the step shown, sealed while the reader was away, lands past it with its Done line at the page's top, and a step not sealed stays shown with no Done line; a page's first showing does nothing (Issue #1392 D1, D5, comment 7201280596)", () => {
  const { document, listeners, store, tops } = load("", "", "");
  const shown = (persisted: boolean): void => {
    for (const run of listeners.get("pageshow") ?? []) run({ persisted });
  };
  const now = (): string | undefined => document.querySelector("li.now")?.id;
  const done = (): string | null => document.querySelector(".walk-done")?.textContent ?? null;
  shown(true);
  assert.equal(now(), "a1");
  assert.equal(done(), null);
  assert.equal(document.querySelector(".walk .walk-skip") === null, false, "the row stands");
  store.setItem(PRIMER_STORE_KEY, "a1");
  shown(false);
  assert.equal(now(), "a1");
  assert.equal(done(), null);
  assert.equal(document.querySelector("#a1")?.classList.contains("sealed"), false, "a first showing reads nothing");
  shown(true);
  assert.equal(done(), "1Done: Press a1");
  assert.equal(document.querySelector(".primer")?.classList.contains("room-end"), true);
  assert.equal(document.querySelector("#a1")?.classList.contains("sealed"), true);
  assert.deepEqual(tops[tops.length - 1], [0, 0]);
});
