import { buttonPoint, readXform } from "../home-support.ts";
import type { Cam } from "../home-support.ts";
import type { SuiteContext } from "../types.ts";
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

export async function l5bArrowScrolls({ evaluate, check, sleep, pressKey, scrollY }: LandfallKit, how: How, y5: number): Promise<void> {
  await pressKey("ArrowDown", "ArrowDown", 40);
  await sleep(200);
  const arrowed = await evaluate<number | null>(`document.querySelector("#lf-card-how .lf-card-scroll")?.scrollTop ?? null`);
  check(
    "L5b ArrowDown scrolls the prose at once, the page unmoved",
    how !== null && arrowed !== null && arrowed > how.scrollTop && (await scrollY()) === y5,
    JSON.stringify({ from: how?.scrollTop, arrowed }),
  );
}

export async function l2ProseScrolls({ evaluate, check, sleep, scrollY, centerOf, camScale, wheelAt }: LandfallKit, y5: number) {
  const proseBox = await centerOf("#lf-card-how .lf-card-scroll");
  const closeBox0 = await evaluate<number[] | null>(`(() => { const el = document.querySelector("#lf-card-how .lf-card-close"); if (!el) return null; const r = el.getBoundingClientRect(); return [r.x, r.y, r.width, r.height]; })()`);
  const scale2a = await camScale();
  let prose = null;
  for (let i = 0; i < 30 && proseBox !== null; i++) {
    await wheelAt(proseBox, 240);
    await sleep(90);
    prose = await evaluate<{ top: number; max: number } | null>(`(() => { const s = document.querySelector("#lf-card-how .lf-card-scroll"); if (!s) return null; return { top: s.scrollTop, max: s.scrollHeight - s.clientHeight }; })()`);
    if (prose === null || prose.top >= prose.max - 0.5) break;
  }
  const after2 = { scale: await camScale(), y: await scrollY() };
  check(
    "L2 (arm 1) wheel over the prose scrolls it to its end: no zoom step, no page scroll",
    prose !== null && prose.top >= prose.max - 0.5 && after2.y === y5
      && scale2a !== null && after2.scale !== null && Math.abs(after2.scale / scale2a - 1) < 0.005,
    JSON.stringify({ prose, scale2a, after2 }),
  );
  return closeBox0;
}

export async function l6HeadStays({ evaluate, check, scrollY }: LandfallKit, closeBox0: number[] | null, y5: number): Promise<void> {
  const closeBox1 = await evaluate<number[] | null>(`(() => { const el = document.querySelector("#lf-card-how .lf-card-close"); if (!el) return null; const r = el.getBoundingClientRect(); return [r.x, r.y, r.width, r.height]; })()`);
  check(
    "L6 (arm 5) the head never scrolls away: the close button's box is unchanged after the prose reaches its end, overscroll contained",
    closeBox0 !== null && closeBox1 !== null && JSON.stringify(closeBox0) === JSON.stringify(closeBox1) && (await scrollY()) === y5,
    JSON.stringify({ closeBox0, closeBox1 }),
  );
}

export async function l3HeadSwallows({ check, sleep, scrollY, centerOf, camScale, wheelAt }: LandfallKit, y5: number): Promise<void> {
  const headBox = await centerOf("#lf-card-how .lf-card-title");
  const scale3a = await camScale();
  await wheelAt(headBox, 120);
  await sleep(200);
  const after3 = { scale: await camScale(), y: await scrollY() };
  check(
    "L3 (arm 2) wheel over the panel's non-scrolling head is swallowed whole: no page scroll, no zoom step (the round-2 regression scrolled 120px a tick here)",
    headBox !== null && after3.y === y5 && scale3a !== null && after3.scale !== null && Math.abs(after3.scale / scale3a - 1) < 0.005,
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
  const desktop8 = await measureEnters("desktop");
  const enters = desktop8.boxes;
  const swallowed4 = desktop8.swallowed;
  check(
    "L4 (arm 3) wheel over an open station card is swallowed: no page scroll, no zoom step",
    swallowed4 !== null && swallowed4.y === swallowed4.yA
      && swallowed4.sA !== null && swallowed4.scale !== null && Math.abs(swallowed4.scale / swallowed4.sA - 1) < 0.005,
    JSON.stringify({ swallowed4 }),
  );
  check(
    "L8 every slip's Enter link is a 44px touch target, measured open (#460 ratification 2)",
    enters.length === 4 && enters.every((b) => b !== null && b.open && b.h >= 44 && b.w >= 44),
    JSON.stringify({ enters }),
  );
}

export async function l7bNarrowClear({ evaluate, check, sleep, pressKey, clickAt }: LandfallKit, settled9: Cam | null): Promise<void> {
  const howPt9 = await evaluate(buttonPoint('.lf-station[data-station="how"]'));
  if (howPt9 !== null) await clickAt(Math.round(howPt9.x), Math.round(howPt9.y));
  let narrow6 = null;
  for (let i = 0; i < 80; i++) {
    try {
      narrow6 = await evaluate<{ anchorY: number; sheetTop: number; innerWidth: number } | null>(`(() => {
        const card = document.getElementById("lf-card-how");
        const btn = document.querySelector('.lf-station[data-station="how"]');
        const stage = document.getElementById("lf-stage");
        const sheet = document.getElementById("lf-sheet");
        if (!card || !btn || !stage || !sheet) return null;
        const cs = getComputedStyle(card);
        if (card.hidden || cs.visibility === "hidden" || Number(cs.opacity) <= 0.95) return null;
        const sr = stage.getBoundingClientRect();
        const m = new DOMMatrixReadOnly(getComputedStyle(sheet).transform);
        const cr = card.getBoundingClientRect();
        return { anchorY: sr.top + Number(btn.dataset.ny) * 1157.931 * m.a + m.f, sheetTop: cr.top, innerWidth: window.innerWidth };
      })()`);
      if (narrow6 !== null) break;
    } catch {}
    await sleep(75);
  }
  await sleep(700);
  check(
    "L7b (arm 6, narrow) at 390 the flown-to anchor rides clear above the bottom sheet",
    narrow6 !== null && narrow6.innerWidth === 390 && narrow6.anchorY < narrow6.sheetTop,
    JSON.stringify({ settled9: !!settled9, narrow6 }),
  );
  await pressKey("Escape", "Escape", 27);
  await sleep(500);
}

export async function l8bNarrowTargets({ check, measureEnters }: LandfallKit): Promise<void> {
  const narrow8 = await measureEnters("narrow");
  check(
    "L8b at 390 the touch targets hold: every Enter link is still 44px under the narrow media rules",
    narrow8.boxes.length === 4 && narrow8.boxes.every((b) => b !== null && b.open && b.h >= 44 && b.w >= 44),
    JSON.stringify({ enters390: narrow8.boxes }),
  );
}
