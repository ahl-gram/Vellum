import type { makeSettle } from "../../support/settle.ts";
import type { Payload, Point, SuiteContext } from "../../types.ts";
import { HOLD_GRACE_MS } from "../../../src/site/living-chart/place-card-hold.ts";
import { NARROW_SEED } from "./reads.ts";

type Settle = ReturnType<typeof makeSettle>;
type HoldKit = SuiteContext & { settle: Settle };
type Mark = Point & { idx: number; name: string };
type Card = { shown: boolean; name: string | null; pinned: boolean; rest: boolean; left: number; top: number; right: number; bottom: number; link: Point | null };

// Issue #750 measured at Alex's floor of 1024 (ruling of 2026-10-04): it is where the defects are worst, 5 of 26 centre presses on this seed opening a neighbour against 3 at 1280.
const DESK = { width: 1024, height: 768 };
const MARKS: Payload<Mark[]> = `[...document.querySelectorAll(".place-overlay .place-hit")].map((h) => { const b = h.getBoundingClientRect(); return { idx: Number(h.dataset.idx), name: (h.getAttribute("aria-label") || "").split(", ")[0], x: b.x + b.width / 2, y: b.y + b.height / 2 }; })`;
const CARD: Payload<Card> = `(() => { const c = document.getElementById("place-card"); if (!c || c.hidden) return { shown: false, name: null, pinned: false, rest: false, left: 0, top: 0, right: 0, bottom: 0, link: null }; const r = c.getBoundingClientRect(); const i = c.querySelector(".pc-inner"); const a = i.getAnimations(); const l = c.querySelector(".pc-prospect"); const lr = l ? l.getBoundingClientRect() : null;
  return { shown: true, name: (c.querySelector(".pc-name") || {}).textContent, pinned: c.classList.contains("pinned"), rest: a.length > 0 && a.every((x) => x.playState === "finished"), left: r.left, top: r.top, right: r.right, bottom: r.bottom, link: lr ? { x: lr.x + lr.width / 2, y: lr.y + lr.height / 2 } : null }; })()`;
const CATCH: Payload<boolean> = `(() => { window.__p750 = null; window.__p750catch = (e) => { const a = e.target && e.target.closest && e.target.closest("a.pc-prospect"); if (a) { e.preventDefault(); window.__p750 = new URLSearchParams(new URL(a.getAttribute("href"), location.href).hash.slice(1)).get("i"); } }; document.addEventListener("click", window.__p750catch, true); return true; })()`;
const CAUGHT: Payload<string | null> = `(() => { document.removeEventListener("click", window.__p750catch, true); return window.__p750; })()`;
// Wiring, not the gesture under test: a real CDP Escape key wedged headless Brave on 2026-10-04 (Issue #750's measurements), so the reset dispatches the keydown the overlay listens for.
const RESET: Payload<boolean> = `(() => { if (document.activeElement && document.activeElement.blur) document.activeElement.blur(); document.dispatchEvent(new KeyboardEvent("keydown", { key: "Escape", bubbles: true })); return document.getElementById("place-card").hidden; })()`;

export function holdKit(ctx: HoldKit) {
  const { evaluate, send, sleep, settle, waitReady, setTouch, PORT } = ctx;
  const move = (p: Point) => send("Input.dispatchMouseEvent", { type: "mouseMoved", x: p.x, y: p.y, buttons: 0 });
  const press = async (p: Point, clickCount = 1) => {
    await send("Input.dispatchMouseEvent", { type: "mousePressed", x: p.x, y: p.y, button: "left", buttons: 1, clickCount });
    await send("Input.dispatchMouseEvent", { type: "mouseReleased", x: p.x, y: p.y, button: "left", buttons: 0, clickCount });
  };
  const tap = async (p: Point) => {
    await send("Input.dispatchTouchEvent", { type: "touchStart", touchPoints: [{ x: p.x, y: p.y, id: 1 }] });
    await send("Input.dispatchTouchEvent", { type: "touchEnd", touchPoints: [] });
  };
  const card = () => evaluate(CARD);
  const atRest = (label: string) => settle(CARD, (d, last) => d.shown && d.rest && !!last && last.top === d.top && last.left === d.left, label);
  const reset = async () => {
    await move({ x: 2, y: 2 });
    if (!(await evaluate(RESET))) throw new Error("the card did not close on reset");
  };
  const boot = async (touch: boolean) => {
    await send("Emulation.setDeviceMetricsOverride", { ...DESK, deviceScaleFactor: 1, mobile: touch });
    await setTouch(touch);
    await send("Page.navigate", { url: "about:blank" });
    await send("Page.navigate", { url: `http://127.0.0.1:${PORT}/explorer/#seed=${NARROW_SEED}&style=antique&legend=1&arms=0&beasts=0` });
    if (!(await waitReady())) throw new Error("the explorer never drew at 1024");
    await settle<string>(`document.fonts ? document.fonts.status : "loaded"`, (s) => s !== "loading", "fonts at 1024");
    return evaluate(MARKS);
  };
  // Straight to the target at a steady pace, every position read off the clock so the pace is the one asked for.
  const travel = async (from: Point, to: Point, pxPerMs: number) => {
    const len = Math.hypot(to.x - from.x, to.y - from.y), t0 = Date.now();
    for (;;) {
      const f = Math.min(1, ((Date.now() - t0) * pxPerMs) / len);
      await move({ x: from.x + (to.x - from.x) * f, y: from.y + (to.y - from.y) * f });
      if (f >= 1) return;
      await sleep(4);
    }
  };
  return { ...ctx, move, press, tap, card, atRest, reset, boot, travel };
}

type Kit = ReturnType<typeof holdKit>;

const crossesBox = (a: Point, b: Point, c: Point): boolean => {
  for (let i = 1; i < 100; i++) {
    const x = a.x + ((b.x - a.x) * i) / 100, y = a.y + ((b.y - a.y) * i) / 100;
    if (Math.abs(x - c.x) < 13 && Math.abs(y - c.y) < 13) return true;
  }
  return false;
};

async function reach(k: Kit, m: Mark, pinned: boolean, pace: number): Promise<{ took: string | null; arrived: string | null }> {
  await k.reset();
  await k.move(m);
  if (pinned) await k.press(m);
  const c0 = await k.atRest(`P28 the card for ${m.name}`);
  if (!c0.link) throw new Error(`P28 ${m.name}'s card has no prospect link`);
  await k.travel(m, c0.link, pace);
  const arrived = (await k.card()).name;
  await k.evaluate(CATCH);
  await k.press(c0.link);
  return { took: await k.evaluate(CAUGHT), arrived };
}

const gapOf = (m: Point, link: Point, c: Card): number => {
  let gap = 0;
  const len = Math.hypot(link.x - m.x, link.y - m.y);
  for (let i = 0; i < 200; i++) {
    const x = m.x + ((link.x - m.x) * (i + 0.5)) / 200, y = m.y + ((link.y - m.y) * (i + 0.5)) / 200;
    const inBox = Math.abs(x - m.x) < 13 && Math.abs(y - m.y) < 13, inCard = x >= c.left && x <= c.right && y >= c.top && y <= c.bottom;
    if (!inBox && !inCard) gap += len / 200;
  }
  return gap;
};

const outsideCrossing = (m: Mark, link: Point, c: Card, marks: Mark[]): boolean => {
  for (let i = 1; i < 100; i++) {
    const x = m.x + ((link.x - m.x) * i) / 100, y = m.y + ((link.y - m.y) * i) / 100;
    if (x >= c.left && x <= c.right && y >= c.top && y <= c.bottom) continue;
    if (marks.some((o) => o.idx !== m.idx && Math.abs(x - o.x) < 13 && Math.abs(y - o.y) < 13)) return true;
  }
  return false;
};

export async function p28Travel(k: Kit, marks: Mark[]): Promise<void> {
  const rows: string[] = [];
  let crossing = 0, widest = { m: marks[0]!, gap: -1 };
  for (const m of marks) {
    await k.reset();
    await k.move(m);
    const c = await k.atRest(`P28 probe ${m.name}`);
    if (!c.link || c.name !== m.name) continue;
    const link = c.link, gap = gapOf(m, link, c);
    if (gap > widest.gap && !outsideCrossing(m, link, c, marks)) widest = { m, gap };
    if (crossing === 6 || !marks.some((o) => o.idx !== m.idx && crossesBox(m, link, o))) continue;
    crossing++;
    for (const pinned of [false, true]) {
      const r = await reach(k, m, pinned, 1);
      if (r.took !== String(m.idx)) rows.push(`${m.name}${pinned ? " pinned" : ""}: arrived on ${r.arrived}, press took ${r.took}`);
    }
  }
  // The slow hand (0.1 px/ms) on the widest gap, on a path that crosses no town outside the card, is what a grace shorter than the measured bound fails.
  const s = await reach(k, widest.m, false, 0.1);
  if (s.took !== String(widest.m.idx)) rows.push(`${widest.m.name} at 0.1 px/ms over a ${widest.gap.toFixed(1)}px gap: arrived on ${s.arrived}, press took ${s.took}`);
  k.check("P28 a reader's pointer travels from a town to its card's button across other towns, hovered or pinned, and the button opens that town (#750)",
    crossing === 6 && widest.gap > 3 && rows.length === 0, JSON.stringify({ crossingPathsTried: crossing, slowWitness: widest.m.name, gapPx: +widest.gap.toFixed(1), failures: rows }));
}

export async function p29NearestTown(k: Kit, marks: Mark[]): Promise<void> {
  const wrong: string[] = [];
  for (const m of marks) {
    await k.reset();
    await k.move(m);
    await k.press(m);
    const c = await k.settle(CARD, (d) => d.shown, `P29 a press on ${m.name}`);
    if (c.name !== m.name || !c.pinned) wrong.push(`${m.name} -> ${c.name}${c.pinned ? "" : " (unpinned)"}`);
  }
  k.check("P29 a real press at every town's own centre opens and pins that town, never the neighbour whose box covers it (#632)",
    marks.length > 20 && wrong.length === 0, JSON.stringify({ towns: marks.length, wrong }));
}

export async function p31Keyboard(k: Kit, marks: Mark[]): Promise<void> {
  const m = marks[3]!;
  await k.reset();
  await k.evaluate(`document.querySelector('.place-overlay .place-hit[data-idx="${m.idx}"]').focus()`);
  await k.send("Input.dispatchKeyEvent", { type: "keyDown", key: "Enter", code: "Enter", text: "\r", unmodifiedText: "\r", windowsVirtualKeyCode: 13, nativeVirtualKeyCode: 13 });
  await k.send("Input.dispatchKeyEvent", { type: "keyUp", key: "Enter", code: "Enter", windowsVirtualKeyCode: 13, nativeVirtualKeyCode: 13 });
  await k.send("Input.dispatchKeyEvent", { type: "rawKeyDown", key: "Tab", code: "Tab", windowsVirtualKeyCode: 9, nativeVirtualKeyCode: 9 });
  await k.send("Input.dispatchKeyEvent", { type: "keyUp", key: "Tab", code: "Tab", windowsVirtualKeyCode: 9, nativeVirtualKeyCode: 9 });
  const at = await k.evaluate<{ active: string; card: string | null; pinned: boolean }>(`(() => { const a = document.activeElement; const c = document.getElementById("place-card"); return { active: a ? String(a.className) : "none", card: c.hidden ? null : (c.querySelector(".pc-name") || {}).textContent, pinned: c.classList.contains("pinned") }; })()`);
  k.check("P31 Enter on a town pins its card, and the next Tab lands on that card's own prospect link (#750 ruling 7)",
    at.active === "pc-prospect" && at.card === m.name && at.pinned, JSON.stringify({ town: m.name, ...at }));
}

const QUIET: Payload<{ card: string | null; active: string; quiet: number }> = `(() => { const c = document.getElementById("place-card"); if (!window.__p750mo) { window.__p750q = performance.now(); window.__p750mo = new MutationObserver(() => { window.__p750q = performance.now(); }); window.__p750mo.observe(c, { subtree: true, childList: true, characterData: true, attributes: true, attributeFilter: ["hidden"] }); }
  const a = document.activeElement; return { card: c.hidden ? null : (c.querySelector(".pc-name") || {}).textContent, active: a ? String(a.className) : "none", quiet: performance.now() - window.__p750q }; })()`;

export async function p31bFocusSurvivesRefill(k: Kit, marks: Mark[]): Promise<void> {
  const a = marks[2]!;
  await k.reset();
  await k.move(a);
  const c = await k.atRest(`P31b ${a.name}`);
  const link = c.link;
  if (!link) throw new Error("P31b no link");
  await k.travel(a, link, 1);
  await k.evaluate(CATCH);
  await k.press(link);
  await k.evaluate(CAUGHT);
  const clear = (b: Mark) => !(b.x > c.left - 14 && b.x < c.right + 14 && b.y > c.top - 14 && b.y < c.bottom + 14) && !outsideCrossing({ ...b, idx: -1 }, link, c, marks.filter((o) => o.idx !== b.idx));
  const b = marks.filter((o) => o.idx !== a.idx && clear(o)).sort((p, q) => Math.hypot(p.x - link.x, p.y - link.y) - Math.hypot(q.x - link.x, q.y - link.y))[0];
  if (!b) throw new Error("P31b no town with a clear path from the card");
  await k.evaluate(QUIET);
  await k.travel(link, b, 1);
  // At rest once nothing on the card has changed for longer than the grace, the only clock that can still change it.
  const after = await k.settle(QUIET, (d) => d.quiet > HOLD_GRACE_MS + 100, `P31b the card after leaving ${a.name}`);
  k.check("P31b with focus on a card's link, the card still switches to the town the pointer settles on, and the link keeps its focus (#750)",
    after.card === b.name && after.active === "pc-prospect", JSON.stringify({ from: a.name, to: b.name, card: after.card, active: after.active }));
}

export async function p32Dismiss(k: Kit, marks: Mark[]): Promise<void> {
  const rows: string[] = [];
  for (const m of marks.slice(0, 4)) {
    await k.reset();
    await k.move(m);
    await k.press(m);
    const c = await k.atRest(`P32 ${m.name}`);
    const prose = { x: (c.left + c.right) / 2, y: c.bottom - 6 };
    await k.move(prose);
    await k.press(prose);
    const kept = await k.card();
    if (!kept.shown || kept.name !== m.name) rows.push(`${m.name}: a press on the card's text closed it`);
    const open = await k.evaluate<Point | null>(`(() => { const v = document.getElementById("map-viewport").getBoundingClientRect(); const c = document.getElementById("place-card").getBoundingClientRect(); const hits = [...document.querySelectorAll(".place-overlay .place-hit")].map((h) => h.getBoundingClientRect());
      for (let gy = 0.1; gy < 0.95; gy += 0.08) for (let gx = 0.05; gx < 0.95; gx += 0.06) { const x = v.left + v.width * gx, y = v.top + v.height * gy; if (x > c.left - 20 && x < c.right + 20 && y > c.top - 20 && y < c.bottom + 20) continue; if (hits.some((r) => x > r.left - 20 && x < r.right + 20 && y > r.top - 20 && y < r.bottom + 20)) continue; const t = document.elementFromPoint(x, y); if (t && t.closest && t.closest("#map") && !t.closest(".place-hit") && !t.closest("#place-card")) return { x, y }; } return null; })()`);
    if (!open) { rows.push(`${m.name}: no open chart clear of the card and the towns`); continue; }
    await k.move(open);
    await k.press(open);
    if ((await k.card()).shown) rows.push(`${m.name}: a press on open chart left it up`);
  }
  k.check("P32 a press on a pinned card's text keeps it, and a press on open chart clear of it closes it (#750)", rows.length === 0, JSON.stringify(rows));
}

const TABLET = [0, 5, 8, 9, 11, 16, 17, 21, 23];

export async function p30Tablet(k: Kit): Promise<void> {
  const marks = (await k.boot(true)).filter((m) => TABLET.includes(m.idx));
  const rows: string[] = [];
  for (const m of marks) {
    await k.reset();
    await k.tap(m);
    const c = await k.atRest(`P30 a tap on ${m.name}`);
    if (c.name !== m.name || !c.pinned) { rows.push(`${m.name}: the tap opened ${c.name}${c.pinned ? "" : " unpinned"}`); continue; }
    // Two taps closer than d3's double-tap window zoom the chart, which moves every later mark.
    await k.sleep(650);
    await k.tap({ x: (c.left + c.right) / 2, y: c.bottom - 6 });
    await k.sleep(650);
    const kept = await k.card();
    if (!kept.shown || kept.name !== m.name) rows.push(`${m.name}: a tap on the card's text left ${kept.shown ? kept.name : "nothing"}`);
  }
  k.check("P30 on a tablet a tap opens and pins its own town, and a tap on the card's text keeps it (#750, #632)",
    marks.length === TABLET.length && rows.length === 0, JSON.stringify({ towns: marks.map((m) => m.name), failures: rows }));
}

export async function p9Grace({ evaluate, check }: SuiteContext, capIdx: number): Promise<void> {
  const p9 = await evaluate<{ shown: boolean; heldAtLeave: boolean; hiddenAfterMs: number | null }>(`(async () => {
    const c = document.getElementById("place-card"); const hit = document.querySelector('.place-hit[data-idx="${capIdx}"]');
    hit.dispatchEvent(new MouseEvent("mouseenter", { clientX: -100, clientY: -100 })); const shown = !c.hidden;
    const t0 = performance.now(); hit.dispatchEvent(new MouseEvent("mouseleave", { clientX: -100, clientY: -100 })); const heldAtLeave = !c.hidden;
    while (!c.hidden && performance.now() - t0 < 2000) await new Promise((r) => requestAnimationFrame(r));
    return { shown, heldAtLeave, hiddenAfterMs: c.hidden ? Math.round(performance.now() - t0) : null }; })()`, true);
  check("P9 unpinned: mouseenter shows, and mouseleave hides only once the grace has run (#750)",
    p9.shown && p9.heldAtLeave && p9.hiddenAfterMs !== null && p9.hiddenAfterMs >= HOLD_GRACE_MS, JSON.stringify({ ...p9, grace: HOLD_GRACE_MS }));
}
