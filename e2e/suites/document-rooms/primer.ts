import { sendClick } from "../../support/input.ts";
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
  open: string[];
  presses: string[];
  inked: (string | undefined)[];
  y: number;
  felt: number;
  marks: number;
  frames: number;
};
type Aim = { x: number; y: number; hit: boolean } | null;

const ARMED: Payload<boolean> = `(() => {
  const w = (window.__ix10 = { felt: 0, marks: 0, frames: 0 });
  window.addEventListener("pointerdown", (e) => { if (e.target instanceof Element && e.target.closest(".primer .unfold, .primer .next a")) w.felt++; }, true);
  new MutationObserver((rs) => { w.marks += rs.length; }).observe(document.body, { subtree: true, childList: true, attributes: true, characterData: true });
  const tick = () => { w.frames++; requestAnimationFrame(tick); };
  requestAnimationFrame(tick);
  return true;
})()`;

const FOLD: Payload<Fold> = `(() => {
  const rooms = [...document.querySelectorAll(".primer section.room")].map((r) => {
    const body = r.querySelector(".room-body"), press = r.querySelector(".unfold");
    return { id: r.querySelector("h2[id]").id, shown: body.getBoundingClientRect().height > 0, press: !!press && !press.hidden && getComputedStyle(press).display !== "none" };
  });
  const w = window.__ix10 || { felt: 0, marks: 0, frames: 0 };
  return {
    bound: !!document.querySelector(".primer[data-bound]"),
    open: rooms.filter((r) => r.shown).map((r) => r.id),
    presses: rooms.filter((r) => r.press).map((r) => r.id),
    inked: [...document.querySelectorAll("#index .index > li.inked")].map((li) => li.dataset.sec),
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
  JSON.stringify([d.open, d.presses, d.inked]) === JSON.stringify([last.open, last.presses, last.inked]);

const same = (a: readonly unknown[], b: readonly unknown[]): boolean => JSON.stringify(a) === JSON.stringify(b);

export async function ix10Folds(k: DocRoomsKit): Promise<void> {
  const { evaluate, send, check, settle, stable, goto } = k;
  const rooms = primerPage().rooms.map((r) => r.id);
  const [first, second, third] = rooms;
  if (first === undefined || second === undefined || third === undefined)
    throw new Error(`IX10 reads three rooms, and the Primer carries ${rooms.length}`);
  const others = (open: string): string[] => rooms.filter((id) => id !== open);
  await goto(PRIMER);
  await evaluate(put(PRIMER_STORE_KEY, null));
  await goto(PRIMER);
  const arrived = await settle(FOLD, (d) => d.bound, "primer-bound");
  await evaluate(ARMED);
  const press = await evaluate(AIM(`section.room:has(> .room-head #${second}) .unfold`));
  let folded: Fold | null = null;
  if (press?.hit) {
    await sendClick(send, press.x, press.y);
    folded = await stable(FOLD, "primer-folded", { departed: (d) => d.felt >= 1, same: still });
  }
  const road = folded === null ? null : await evaluate(AIM(`#${second}-steps .next a`));
  let turned: Fold | null = null;
  if (road?.hit) {
    await sendClick(send, road.x, road.y);
    turned = await stable(FOLD, "primer-turned", { departed: (d) => d.felt >= 2, same: still });
  }
  check(
    "IX10 the Primer opens on its first room with every other folded under its press; a real press on the second room's press shows that room's steps, hides the first's and inks it in the index; a real press on its next road does the same for the third room (Issue #1155 ruling 5, Issue #1252)",
    same(arrived.open, [first]) &&
      same(arrived.presses, others(first)) &&
      press?.hit === true &&
      folded !== null &&
      same(folded.open, [second]) &&
      same(folded.presses, others(second)) &&
      same(folded.inked, [second]) &&
      road?.hit === true &&
      turned !== null &&
      same(turned.open, [third]) &&
      same(turned.presses, others(third)) &&
      same(turned.inked, [third]),
    `arrived ${JSON.stringify(arrived)}; press ${JSON.stringify(press)}; folded ${JSON.stringify(folded)}; road ${JSON.stringify(road)}; turned ${JSON.stringify(turned)}`,
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

export async function ix11ChartPress(k: DocRoomsKit): Promise<void> {
  const { evaluate, send, check, settle, stable, goto } = k;
  const rooms = primerPage().rooms;
  const target = rooms.find((r) => r.route === "/print-room/");
  if (target === undefined) throw new Error("IX11 presses the Print Room, which the Primer no longer teaches");
  const id = target.id;
  await goto(PRIMER);
  await evaluate(put(PRIMER_STORE_KEY, null));
  await goto(PRIMER);
  const arrived = await settle(PRESSED(id), (d) => d.bound, "primer-bound");
  await evaluate(ARM_ERRORS);
  const aim = await evaluate(CHART_AIM(id));
  let after: Pressed | null = null;
  if (aim?.hit) {
    await sendClick(send, aim.x, aim.y);
    after = await stable(PRESSED(id), "primer-chart-pressed", { departed: (d) => d.hash === `#${id}` });
  }
  check(
    "IX11 a real press on a room's name on the chart of lessons reaches that room's link, raises no error, opens that room alone and lands its head in the window (Issue #1155 comment 7136681098, Q1; Issue #1257)",
    same(arrived.open, [rooms[0]?.id]) &&
      !arrived.open.includes(id) &&
      aim?.hit === true &&
      after !== null &&
      same(after.open, [id]) &&
      after.errors === 0 &&
      after.head !== null &&
      after.head >= 0 &&
      after.head < after.inner,
    `arrived ${JSON.stringify(arrived)}; aim ${JSON.stringify(aim)}; after ${JSON.stringify(after)}`,
  );
}
