import { buttonPoint, readXform } from "../../support/home.ts";
import type { Cam } from "../../support/home.ts";
import type { Payload, Point, SuiteContext } from "../../types.ts";
import type { LandfallKit } from "./kit.ts";

type How = Awaited<ReturnType<typeof l5HowOpens>>;

export async function l5HowOpens({ evaluate, check, sleep, clickAt }: LandfallKit, settled2: Cam | null) {
  const howPt = await evaluate(buttonPoint('.lf-station[data-station="how"]'));
  if (howPt !== null) await clickAt(Math.round(howPt.x), Math.round(howPt.y));
  let how = null;
  for (let i = 0; i < 80; i++) {
    try {
      how = await evaluate<{ open: boolean; focused: boolean; scrollTop: number; max: number } | null>(`(() => {
        const card = document.getElementById("lf-card-how");
        const scroller = card ? card.querySelector(".lf-card-scroll") : null;
        if (!card || !scroller) return null;
        const cs = getComputedStyle(card);
        return { open: !card.hidden && cs.visibility !== "hidden" && Number(cs.opacity) > 0.95,
          focused: document.activeElement === scroller,
          scrollTop: scroller.scrollTop, max: scroller.scrollHeight - scroller.clientHeight };
      })()`);
      if (how !== null && how.open && how.focused && how.max > 0) break;
    } catch {}
    await sleep(75);
  }
  check(
    "L5 (arm 4) a real click opens the how panel and focus lands on its scroller, not the clicked pip",
    how !== null && how.open && how.focused && how.max > 0,
    JSON.stringify({ settled2: !!settled2, howPt, how }),
  );
  // The slip opens mid-flight (the open tween starts while the camera still eases to the station framing), so every scale-unchanged read below first waits for the flight to land or it blames the flight's own tail on the gesture.
  for (let i = 0; i < 40; i++) {
    const a = await evaluate(readXform);
    await sleep(250);
    if (a !== null && a === (await evaluate(readXform))) break;
  }
  return how;
}

export async function l5bArrowScrolls(
  { evaluate, check, sleep, pressKey, scrollY }: LandfallKit,
  how: How,
  y5: number,
): Promise<void> {
  await pressKey("ArrowDown", "ArrowDown", 40);
  await sleep(200);
  const arrowed = await evaluate<number | null>(
    `document.querySelector("#lf-card-how .lf-card-scroll")?.scrollTop ?? null`,
  );
  check(
    "L5b ArrowDown scrolls the prose at once, the page unmoved",
    how !== null && arrowed !== null && arrowed > how.scrollTop && (await scrollY()) === y5,
    JSON.stringify({ from: how?.scrollTop, arrowed }),
  );
}

export async function l2ProseScrolls(
  { evaluate, check, sleep, scrollY, centerOf, camScale, wheelAt }: LandfallKit,
  y5: number,
) {
  const proseBox = await centerOf("#lf-card-how .lf-card-scroll");
  const closeBox0 = await evaluate<number[] | null>(
    `(() => { const el = document.querySelector("#lf-card-how .lf-card-close"); if (!el) return null; const r = el.getBoundingClientRect(); return [r.x, r.y, r.width, r.height]; })()`,
  );
  const scale2a = await camScale();
  let prose = null;
  for (let i = 0; i < 30 && proseBox !== null; i++) {
    await wheelAt(proseBox, 240);
    await sleep(90);
    prose = await evaluate<{ top: number; max: number } | null>(
      `(() => { const s = document.querySelector("#lf-card-how .lf-card-scroll"); if (!s) return null; return { top: s.scrollTop, max: s.scrollHeight - s.clientHeight }; })()`,
    );
    if (prose === null || prose.top >= prose.max - 0.5) break;
  }
  const after2 = { scale: await camScale(), y: await scrollY() };
  check(
    "L2 (arm 1) wheel over the prose scrolls it to its end: no zoom step, no page scroll",
    prose !== null &&
      prose.top >= prose.max - 0.5 &&
      after2.y === y5 &&
      scale2a !== null &&
      after2.scale !== null &&
      Math.abs(after2.scale / scale2a - 1) < 0.005,
    JSON.stringify({ prose, scale2a, after2 }),
  );
  return closeBox0;
}

export async function l6HeadStays(
  { evaluate, check, scrollY }: LandfallKit,
  closeBox0: number[] | null,
  y5: number,
): Promise<void> {
  const closeBox1 = await evaluate<number[] | null>(
    `(() => { const el = document.querySelector("#lf-card-how .lf-card-close"); if (!el) return null; const r = el.getBoundingClientRect(); return [r.x, r.y, r.width, r.height]; })()`,
  );
  check(
    "L6 (arm 5) the head never scrolls away: the close button's box is unchanged after the prose reaches its end, overscroll contained",
    closeBox0 !== null &&
      closeBox1 !== null &&
      JSON.stringify(closeBox0) === JSON.stringify(closeBox1) &&
      (await scrollY()) === y5,
    JSON.stringify({ closeBox0, closeBox1 }),
  );
}

export async function l3HeadSwallows(
  { check, sleep, scrollY, centerOf, camScale, wheelAt }: LandfallKit,
  y5: number,
): Promise<void> {
  const headBox = await centerOf("#lf-card-how .lf-card-title");
  const scale3a = await camScale();
  await wheelAt(headBox, 120);
  await sleep(200);
  const after3 = { scale: await camScale(), y: await scrollY() };
  check(
    "L3 (arm 2) wheel over the panel's non-scrolling head is swallowed whole: no page scroll, no zoom step (the round-2 regression scrolled 120px a tick here)",
    headBox !== null &&
      after3.y === y5 &&
      scale3a !== null &&
      after3.scale !== null &&
      Math.abs(after3.scale / scale3a - 1) < 0.005,
    JSON.stringify({ scale3a, after3 }),
  );
}

export async function l7WideClear({ evaluate, check, shoot }: SuiteContext): Promise<void> {
  const clear6 = await evaluate<{ anchorX: number; cardLeft: number; innerWidth: number } | null>(`(() => {
    const btn = document.querySelector('.lf-station[data-station="how"]');
    const stage = document.getElementById("lf-stage");
    const sheet = document.getElementById("lf-sheet");
    const card = document.getElementById("lf-card-how");
    if (!btn || !stage || !sheet || !card) return null;
    const sr = stage.getBoundingClientRect();
    const m = new DOMMatrixReadOnly(getComputedStyle(sheet).transform);
    const cr = card.getBoundingClientRect();
    return { anchorX: sr.left + Number(btn.dataset.nx) * 1500 * m.a + m.e, cardLeft: cr.left, innerWidth: window.innerWidth };
  })()`);
  check(
    "L7 (arm 6, wide) after the how flight the pip's clamp-dominated anchor stays clear west of the open panel (clearance, never the 0.4 framing literal)",
    clear6 !== null && clear6.innerWidth === 1280 && clear6.anchorX < clear6.cardLeft,
    JSON.stringify({ clear6 }),
  );
  await shoot("landfall-how-panel.png");
}

export async function l4l8Enters({ check, measureEnters }: LandfallKit): Promise<void> {
  const desktop8 = await measureEnters();
  const enters = desktop8.boxes;
  const swallowed4 = desktop8.swallowed;
  check(
    "L4 (arm 3) wheel over an open station card is swallowed: no page scroll, no zoom step",
    swallowed4 !== null &&
      swallowed4.y === swallowed4.yA &&
      swallowed4.sA !== null &&
      swallowed4.scale !== null &&
      Math.abs(swallowed4.scale / swallowed4.sA - 1) < 0.005,
    JSON.stringify({ swallowed4 }),
  );
  check(
    "L8 every slip's Enter link is a 44px touch target, measured open (#460 ratification 2)",
    enters.length === 4 && enters.every((b) => b !== null && b.open && b.h >= 44 && b.w >= 44),
    JSON.stringify({ enters }),
  );
}

const SLIPS = ["explorer", "reading-room", "atlas", "gallery"] as const;

const OPEN = (id: string): Payload<{ open: boolean; focus: string | null; hasScroller: boolean }> =>
  `(() => { const c = document.getElementById("lf-card-${id}"); if (!c) return { open: false, focus: null, hasScroller: false }; const cs = getComputedStyle(c);
    return { open: !c.hidden && cs.visibility !== "hidden" && Number(cs.opacity) > 0.95, focus: document.activeElement === c ? "card" : document.activeElement?.className ?? null, hasScroller: !!c.querySelector(".lf-card-scroll") }; })()`;

async function openSlip(
  k: LandfallKit,
  id: string,
): Promise<{ open: boolean; focus: string | null; hasScroller: boolean }> {
  const { evaluate, clickAt, sleep } = k;
  const at = await evaluate(buttonPoint(`.lf-legend-btn[data-station="${id}"]`));
  if (!at) throw new Error(`L28: no legend press for ${id}`);
  await clickAt(Math.round(at.x), Math.round(at.y));
  let s = await evaluate(OPEN(id));
  for (let i = 0; i < 80 && !s.open; i++) {
    await sleep(75);
    s = await evaluate(OPEN(id));
  }
  for (let i = 0; i < 40; i++) {
    const a = await evaluate(readXform);
    await sleep(250);
    if (a !== null && a === (await evaluate(readXform))) break;
  }
  return s;
}

const BARE: Payload<Point | null> = `(() => {
  const s = document.getElementById("lf-stage").getBoundingClientRect();
  for (const fx of [0.15, 0.25, 0.35, 0.5]) for (const fy of [0.3, 0.5, 0.7]) {
    const x = s.x + s.width * fx, y = s.y + s.height * fy, e = document.elementFromPoint(x, y);
    if (e && e.closest("#lf-stage") && !e.closest("button, a, .lf-card, form, nav")) return { x: Math.round(x), y: Math.round(y) };
  }
  return null;
})()`;

async function tapKeeps(k: LandfallKit): Promise<{ kept: boolean; closed: boolean }> {
  const { evaluate, clickAt, sleep } = k;
  await openSlip(k, "gallery");
  const zoom = await evaluate(buttonPoint("#zoom-in"));
  if (!zoom) throw new Error("L28: no #zoom-in to press inside the stage");
  await clickAt(Math.round(zoom.x), Math.round(zoom.y));
  await sleep(600);
  const kept = (await evaluate(OPEN("gallery"))).open;
  const bare = await evaluate(BARE);
  if (bare) await clickAt(bare.x, bare.y);
  let closed = false;
  for (let i = 0; i < 20 && !closed; i++) {
    await sleep(75);
    closed = await evaluate<boolean>(`document.getElementById("lf-card-gallery").hidden`);
  }
  return { kept, closed };
}

export async function l28SlipGestures(k: LandfallKit): Promise<void> {
  const { check, sleep, pressKey, scrollY, centerOf, camScale, wheelAt } = k;
  const rows: string[] = [];
  let ok = true;
  try {
    for (const id of SLIPS) {
      const s = await openSlip(k, id);
      const head = await centerOf(`#lf-card-${id} .lf-card-title`);
      const [y0, s0] = [await scrollY(), await camScale()];
      await wheelAt(head, 120);
      await sleep(250);
      const [y1, s1] = [await scrollY(), await camScale()];
      const swallowed = !!head && y1 === y0 && s0 !== null && s1 !== null && Math.abs(s1 / s0 - 1) < 0.005;
      const focused = !s.hasScroller && s.focus === "card";
      ok &&= s.open && swallowed && focused;
      rows.push(`${id}: open ${s.open}, focus ${s.focus}, page ${y0} to ${y1}, scale ${s0} to ${s1}`);
      await pressKey("Escape", "Escape", 27);
      await sleep(500);
    }
    const tap = await tapKeeps(k);
    ok &&= tap.kept && tap.closed;
    rows.push(`a press inside the stage kept the slip ${tap.kept}, a tap on bare chart closed it ${tap.closed}`);
  } finally {
    await pressKey("Escape", "Escape", 27);
    await sleep(400);
  }
  check(
    "L28 every station slip swallows a wheel over its head, the page and the chart both unmoved, and takes focus on itself, having no scroller; a press on a control inside the stage leaves an open slip open, while a tap on bare chart sets it aside, the same run's control (#459)",
    ok,
    rows.join(" | "),
  );
}
