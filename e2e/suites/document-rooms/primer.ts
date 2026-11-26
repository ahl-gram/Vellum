import { mouseMove, sendClick } from "../../support/input.ts";
import { primerPage } from "../../../src/site/primer/page.ts";
import { LADDERS } from "../../../src/site/shared/primer/ladders.ts";
import { emitSeals, PRIMER_STORE_KEY } from "../../../src/site/shared/primer/seals.ts";
import { TABLE_STORE_KEY } from "../../../src/site/shared/table-store.ts";
import type { Payload } from "../../types.ts";
import type { DocRoomsKit } from "../document-rooms.ts";

const FIRST = LADDERS[0]!.lessons[0]!.steps[0]!.id;
const TABLE = "k-s.seed-42.style-antique.legend-1.arms-0.beasts-0.rung-1.lx-8.ly-8";
const PRIMER = "/primer/";

type Held = { bound: boolean; y: number; sealed: string[]; primer: string | null; table: string | null };
type Press = { x: number; y: number; hit: boolean; scrollY: number } | null;

const READ: Payload<Held> = `(() => ({
  bound: !!document.querySelector(".primer[data-bound]"),
  y: scrollY,
  sealed: [...document.querySelectorAll(".primer li.step.sealed")].map((li) => li.id),
  primer: localStorage.getItem(${JSON.stringify(PRIMER_STORE_KEY)}),
  table: localStorage.getItem(${JSON.stringify(TABLE_STORE_KEY)}),
}))()`;

const REACH: Payload<Press> = `(() => {
  const b = document.querySelector(".primer .closing .wipe");
  if (!b) return null;
  b.scrollIntoView({ block: "center" });
  const r = b.getBoundingClientRect();
  const x = r.x + r.width / 2, y = r.y + r.height / 2;
  return { x, y, hit: document.elementFromPoint(x, y) === b, scrollY };
})()`;

const put = (key: string, value: string | null): string =>
  value === null
    ? `localStorage.removeItem(${JSON.stringify(key)})`
    : `localStorage.setItem(${JSON.stringify(key)}, ${JSON.stringify(value)})`;

export async function ix9Seals(k: DocRoomsKit): Promise<void> {
  const { evaluate, send, check, settle, stable, goto } = k;
  await goto(PRIMER);
  const was = await evaluate<{ primer: string | null; table: string | null }>(
    `({ primer: localStorage.getItem(${JSON.stringify(PRIMER_STORE_KEY)}), table: localStorage.getItem(${JSON.stringify(TABLE_STORE_KEY)}) })`,
  );
  try {
    await evaluate(`${put(PRIMER_STORE_KEY, emitSeals([FIRST]))}; ${put(TABLE_STORE_KEY, TABLE)}`);
    await goto(PRIMER);
    const arrived = await settle(READ, (d) => d.bound, "primer-bound");
    const press = await evaluate<Press>(REACH);
    let after: Held | null = null;
    if (press?.hit) {
      await sendClick(send, press.x, press.y);
      after = await stable(READ, "primer-wiped", { departed: (d) => d.y < press.scrollY });
    }
    check(
      "IX9 the Primer draws the seal a returner's browser holds and Wipe the slate, pressed, takes it off and empties the Primer's own key while the Chart Table's stays as it was (Issue #1155 N1)",
      JSON.stringify(arrived.sealed) === JSON.stringify([FIRST]) &&
        press?.hit === true &&
        after !== null &&
        after.sealed.length === 0 &&
        after.primer === null &&
        after.table === TABLE,
      `arrived sealed ${JSON.stringify(arrived.sealed)}, press ${JSON.stringify(press)}, after ${JSON.stringify(after)}`,
    );
  } finally {
    await evaluate(`${put(PRIMER_STORE_KEY, was.primer)}; ${put(TABLE_STORE_KEY, was.table)}`);
  }
}

type Fold = {
  bound: boolean;
  rendered: string[];
  hash: string;
  y: number;
  felt: number;
  marks: number;
  frames: number;
};
type Aim = { x: number; y: number; hit: boolean } | null;

const ARMED: Payload<boolean> = `(() => {
  const w = (window.__ix10 = { felt: 0, marks: 0, frames: 0 });
  window.addEventListener("pointerdown", (e) => { if (e.target instanceof Element && e.target.closest(".primer .walk button, .primer .next a")) w.felt++; }, true);
  new MutationObserver((rs) => { w.marks += rs.length; }).observe(document.body, { subtree: true, childList: true, attributes: true, characterData: true });
  const tick = () => { w.frames++; requestAnimationFrame(tick); };
  requestAnimationFrame(tick);
  return true;
})()`;

const FOLD: Payload<Fold> = `(() => {
  const w = window.__ix10 || { felt: 0, marks: 0, frames: 0 };
  return {
    bound: !!document.querySelector(".primer[data-bound]"),
    rendered: [...document.querySelectorAll(".primer li.step")].filter((li) => li.getBoundingClientRect().height > 0).map((li) => li.id),
    hash: location.hash,
    y: scrollY, felt: w.felt, marks: w.marks, frames: w.frames,
  };
})()`;

const AIM = (css: string): Payload<Aim> => `(() => {
  const e = document.querySelector(${JSON.stringify(css)});
  if (!e) return null;
  e.scrollIntoView({ block: "center" });
  const b = e.getBoundingClientRect(), x = b.x + b.width / 2, y = b.y + b.height / 2;
  const top = document.elementFromPoint(x, y);
  return { x, y, hit: top === e || e.contains(top) };
})()`;

const still = (d: Fold, last: Fold): boolean =>
  d.marks === last.marks &&
  d.frames > last.frames &&
  d.y === last.y &&
  JSON.stringify(d.rendered) === JSON.stringify(last.rendered);

const same = (a: readonly unknown[], b: readonly unknown[]): boolean => JSON.stringify(a) === JSON.stringify(b);

export async function ix10Walks(k: DocRoomsKit): Promise<void> {
  const { evaluate, send, check, settle, stable, goto } = k;
  const rooms = primerPage().rooms;
  const prospect = rooms.find((r) => r.route === "/prospect/");
  const onward = rooms.find((r) => r.id === prospect?.next?.id);
  const [first, second] = rooms[0]?.lessons[0]?.steps ?? [];
  const last = prospect?.lessons.at(-1)?.steps.at(-1);
  const turnedTo = onward?.lessons[0]?.steps[0];
  if (
    first === undefined ||
    second === undefined ||
    prospect === undefined ||
    onward === undefined ||
    last === undefined ||
    turnedTo === undefined
  )
    throw new Error("IX10 walks the first room's first two steps and the Prospect's road to the room after it");
  const pressed = async (css: string, wanted: number): Promise<Fold | null> => {
    const aim = await evaluate(AIM(css));
    if (!aim?.hit) return null;
    await sendClick(send, aim.x, aim.y);
    return stable(FOLD, `primer-walk-${wanted}`, { departed: (d) => d.felt >= wanted, same: still });
  };
  await goto(PRIMER);
  await evaluate(put(PRIMER_STORE_KEY, null));
  await goto(PRIMER);
  const arrived = await settle(FOLD, (d) => d.bound, "primer-bound");
  await evaluate(ARMED);
  const skipped = await pressed(".primer .walk .walk-skip", 1);
  const backed = skipped === null ? null : await pressed(".primer .walk .walk-back", 2);
  await goto(`${PRIMER}#${last.id}`);
  const atEnd = await settle(FOLD, (d) => d.bound, "primer-bound-at-last-step");
  await evaluate(ARMED);
  const toEnd = await pressed(".primer .walk .walk-skip", 1);
  const turned = toEnd === null ? null : await pressed(".primer section.room:not(.folded) .room-body > .next a", 2);
  check(
    "IX10 the Primer walks one step at a time: a first visit renders the first room's first step alone; a real press on Skip renders the next step alone and one on Back the first again; on the Prospect's last step a real press on Skip shows the room's road, and one on the road renders the next room's first step alone (Issue #1392 D1)",
    same(arrived.rendered, [first.id]) &&
      skipped !== null &&
      same(skipped.rendered, [second.id]) &&
      backed !== null &&
      same(backed.rendered, [first.id]) &&
      same(atEnd.rendered, [last.id]) &&
      toEnd !== null &&
      same(toEnd.rendered, []) &&
      turned !== null &&
      same(turned.rendered, [turnedTo.id]) &&
      turned.hash === `#${onward.id}`,
    `arrived ${JSON.stringify(arrived)}; skipped ${JSON.stringify(skipped)}; backed ${JSON.stringify(backed)}; atEnd ${JSON.stringify(atEnd)}; toEnd ${JSON.stringify(toEnd)}; turned ${JSON.stringify(turned)}`,
  );
}

type Pressed = {
  bound: boolean;
  hash: string;
  open: string[];
  errors: number;
  head: number | null;
  inner: number;
};

const ARM_ERRORS: Payload<boolean> = `(() => {
  window.__ix11 = { errors: 0 };
  window.addEventListener("error", () => { window.__ix11.errors++; });
  return true;
})()`;

const PRESSED = (id: string): Payload<Pressed> => `(() => {
  const head = document.getElementById(${JSON.stringify(id)});
  return {
    bound: !!document.querySelector(".primer[data-bound]"),
    hash: location.hash,
    open: [...document.querySelectorAll(".primer section.room")].filter((r) => r.querySelector(".room-body").getBoundingClientRect().height > 0).map((r) => r.querySelector("h2[id]").id),
    errors: window.__ix11 ? window.__ix11.errors : -1,
    head: head ? head.getBoundingClientRect().top : null,
    inner: innerHeight,
  };
})()`;

const CHART_AIM = (id: string): Payload<Aim> => `(() => {
  const link = document.querySelector(${JSON.stringify(`.col-chart a[href="#${id}"]`)});
  const name = link && link.querySelector("text.name");
  if (!link || !name) return null;
  name.scrollIntoView({ block: "center" });
  const b = name.getBoundingClientRect(), x = b.x + b.width / 2, y = b.y + b.height / 2;
  return { x, y, hit: link.contains(document.elementFromPoint(x, y)) };
})()`;

type UnderHand = { on: boolean; area: number; x: number; y: number; hit: boolean } | null;

const HAND_AIM = (id: string): Payload<UnderHand> => `(() => {
  const link = document.querySelector(${JSON.stringify(`.col-chart a[href="#${id}"]`)});
  const name = link && link.querySelector("text.name");
  const hand = document.querySelector(".col-chart .col-next");
  if (!link || !name || !hand) return null;
  name.scrollIntoView({ block: "center" });
  const glyph = [...hand.querySelectorAll("text")].find((t) => t.getBoundingClientRect().width > 0);
  if (!glyph) return { on: hand.classList.contains("on"), area: 0, x: 0, y: 0, hit: false };
  const n = name.getBoundingClientRect(), g = glyph.getBoundingClientRect();
  const left = Math.max(n.left, g.left), top = Math.max(n.top, g.top);
  const w = Math.min(n.right, g.right) - left, h = Math.min(n.bottom, g.bottom) - top;
  const x = left + w / 2, y = top + h / 2;
  const area = w > 0 && h > 0 ? w * h : 0;
  return { on: hand.classList.contains("on"), area, x, y, hit: area > 0 && link.contains(document.elementFromPoint(x, y)) };
})()`;

const lands = (d: Pressed): boolean => d.head !== null && d.head >= 0 && d.head < d.inner;

export async function ix11ChartPress(k: DocRoomsKit): Promise<void> {
  const { evaluate, send, check, settle, stable, goto } = k;
  const rooms = primerPage().rooms;
  const lit = rooms[0];
  const target = rooms.find((r) => r.route === "/print-room/");
  if (lit === undefined) throw new Error("IX11 presses the room the Primer opens on, and the Primer teaches none");
  if (target === undefined) throw new Error("IX11 presses the Print Room, which the Primer no longer teaches");
  const id = target.id;
  await goto(PRIMER);
  await evaluate(put(PRIMER_STORE_KEY, null));
  await goto(PRIMER);
  const arrived = await settle(PRESSED(id), (d) => d.bound, "primer-bound");
  await evaluate(ARM_ERRORS);
  const under = await evaluate(HAND_AIM(lit.id));
  const before = await evaluate(PRESSED(lit.id));
  let landed: Pressed | null = null;
  if (under?.hit) {
    await sendClick(send, under.x, under.y);
    landed = await stable(PRESSED(lit.id), "primer-chart-pressed-under-hand", {
      departed: (d) => d.hash === `#${lit.id}`,
    });
  }
  const aim = await evaluate(CHART_AIM(id));
  let after: Pressed | null = null;
  if (aim?.hit) {
    await sendClick(send, aim.x, aim.y);
    after = await stable(PRESSED(id), "primer-chart-pressed", { departed: (d) => d.hash === `#${id}` });
  }
  check(
    "IX11 on a first visit, a real press on a room's name on the chart of lessons reaches that room's link, on the open room's name where the hand lies across it as on a room's past it, raises no error, opens that room alone and lands its head in the window from above it, the chart now standing under the room (Issue #1155 comment 7136681098, Q1; Issue #1257 comment 7144617260, F2)",
    same(arrived.open, [lit.id]) &&
      !arrived.open.includes(id) &&
      under?.on === true &&
      under.area > 0 &&
      under.hit &&
      before.head !== null &&
      before.head < 0 &&
      landed !== null &&
      same(landed.open, [lit.id]) &&
      landed.errors === 0 &&
      lands(landed) &&
      aim?.hit === true &&
      after !== null &&
      same(after.open, [id]) &&
      after.errors === 0 &&
      lands(after),
    `arrived ${JSON.stringify(arrived)}; under ${JSON.stringify(under)}; before ${JSON.stringify(before)}; landed ${JSON.stringify(landed)}; aim ${JSON.stringify(aim)}; after ${JSON.stringify(after)}`,
  );
}

type Head = {
  bound: boolean;
  fonts: boolean;
  ty: string;
  nav: [number, number];
  where: [number, number];
  trail: { x: number; y: number };
  bandFoot: number;
  stepTop: number;
  chartTop: number;
};

const HEAD: Payload<Head> = `(() => {
  const r = document.createRange();
  const ink = (el) => { r.selectNodeContents(el); const b = r.getBoundingClientRect(); return [+b.top.toFixed(1), +b.bottom.toFixed(1)]; };
  const head = document.querySelector("header.chrome");
  const t = head.querySelector(".trail").getBoundingClientRect();
  const step = [...document.querySelectorAll(".primer li.step")].find((li) => li.getBoundingClientRect().height > 0);
  return {
    bound: !!document.querySelector(".primer[data-bound]"),
    fonts: document.fonts.status === "loaded",
    ty: getComputedStyle(head).translate,
    nav: ink(head.querySelector("nav.rooms")),
    where: ink(head.querySelector(".where")),
    trail: { x: t.x + 12, y: t.y + t.height / 2 },
    bandFoot: +parseFloat(getComputedStyle(document.querySelector(".band"), "::after").top).toFixed(1),
    stepTop: step ? +step.getBoundingClientRect().top.toFixed(1) : -1,
    chartTop: +document.querySelector(".primer nav.col-head").getBoundingClientRect().top.toFixed(1),
  };
})()`;

// 2026-11-26: the chart's top in the ruled a3 still at 1280x800, measured by the plate reader on the stills (Issue #1392 comment 7193973389).
const A3_CHART_TOP = 593.8;

export async function ix12HeadAway(k: DocRoomsKit): Promise<void> {
  const { evaluate, send, check, stable, goto } = k;
  await goto(PRIMER);
  await evaluate(put(PRIMER_STORE_KEY, null));
  await goto(PRIMER);
  const rest = await stable(HEAD, "primer-head-at-rest", { departed: (d) => d.bound && d.fonts && d.ty !== "none" });
  await mouseMove(send, rest.trail.x, rest.trail.y);
  await mouseMove(send, rest.trail.x + 1, rest.trail.y);
  const home = await stable(HEAD, "primer-head-brought-back", { departed: (d) => d.ty !== rest.ty });
  check(
    "IX12 on the Primer at rest the head cluster stands tucked away, its nav's ink above the window and its thin line's ink inside the band; a real mouse brought to rest on the thin line brings the nav's ink into the window over the band's ground, past the thin line's foot, and the step under it does not move; the chart of lessons stands at the ruled a3 still's 593.8 px, a clear gap under the walk's row (Issue #1392 D3, ruling of 2026-11-26)",
    rest.nav[1] <= 0 &&
      rest.where[0] >= 0 &&
      rest.where[1] <= rest.bandFoot &&
      home.nav[0] >= 0 &&
      home.bandFoot >= home.where[1] &&
      home.stepTop === rest.stepTop &&
      rest.stepTop > 0 &&
      Math.abs(rest.chartTop - A3_CHART_TOP) <= 1 &&
      home.chartTop === rest.chartTop,
    `rest ${JSON.stringify(rest)}; home ${JSON.stringify(home)}`,
  );
}
