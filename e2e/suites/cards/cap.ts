import type { Point, SuiteContext } from "../../types.ts";
import type { CardsKit } from "./kit.ts";
import { CAP_WINDOW, NARROW_SEED, OVER_BOX_TOLERANCE } from "./reads.ts";
import type { Swept } from "./reads.ts";

type Pinned = Awaited<ReturnType<typeof p20PinnedTakesPointer>>;

export async function p19CardsFit({ check, sweepAt }: CardsKit, narrowCount: number): Promise<void> {
  const verdict = (d: Swept, width: number) => {
    const missed = d.rows.filter((r) => !r.shown || r.got !== r.want);
    const worst = d.rows.filter((r) => r.shown).sort((a, b) => b.over - a.over)[0];
    return {
      ok: d.rows.length === narrowCount && missed.length === 0 && !!worst && worst.over <= OVER_BOX_TOLERANCE,
      detail: JSON.stringify({ width, box: `${d.boxW}x${d.boxH}`, places: d.rows.length, of: narrowCount, missed: missed.map((r) => r.want), worst }),
    };
  };
  const short = verdict(await sweepAt(), CAP_WINDOW.w);
  check(`P19 at ${CAP_WINDOW.w}x${CAP_WINDOW.h}, the window short enough under the 1024 floor for a card to meet its chart box, no place card is taller than the box it is clamped into (#633; Issue #762)`, short.ok, short.detail);
}

export async function p20PinnedTakesPointer({ evaluate, send, check, settle }: CardsKit) {
  // The unpinned arm reads a card that is SHOWN: a hidden one reports its host's pointer-events by inheritance and would pass whatever this rule said.
  const at = await evaluate<{ error: "no Kralgov" } | { error?: undefined; shownUnpinned: boolean; restPe: string | null; x: number; y: number }>(`(() => {
      const hit = [...document.querySelectorAll(".place-overlay .place-hit")].find((e) => (e.getAttribute("aria-label") || "").split(", ")[0] === "Kralgov");
      if (!hit) return { error: "no Kralgov" };
      hit.dispatchEvent(new MouseEvent("mouseenter", { bubbles: true }));
      const card = document.getElementById("place-card");
      const inner = card && card.querySelector(".pc-inner");
      const b = hit.getBoundingClientRect();
      return { shownUnpinned: !!card && !card.hidden && !card.classList.contains("pinned"),
        restPe: inner ? getComputedStyle(inner).pointerEvents : null,
        x: Math.round(b.x + b.width / 2), y: Math.round(b.y + b.height / 2) };
    })()`);
  if (at.error) throw new Error(`P20 ${at.error}`);
  await send("Input.dispatchMouseEvent", { type: "mouseMoved", x: at.x, y: at.y });
  await send("Input.dispatchMouseEvent", { type: "mousePressed", x: at.x, y: at.y, button: "left", clickCount: 1 });
  await send("Input.dispatchMouseEvent", { type: "mouseReleased", x: at.x, y: at.y, button: "left", clickCount: 1 });
  const open = await settle<{ name: string | undefined; pinned: boolean; scrolls: boolean; arrived: boolean; pe: string; over: number; top: number; bottom: number; left: number; right: number; w: number; h: number } | null>(
    `(() => { const c = document.getElementById("place-card"); if (!c || c.hidden) return null; const i = c.querySelector(".pc-inner"); const r = c.getBoundingClientRect(); const cs = getComputedStyle(i);
        return { name: (c.querySelector(".pc-name") || {}).textContent, pinned: c.classList.contains("pinned"), scrolls: c.classList.contains("pc-scrolls"),
          arrived: typeof i.getAnimations === "function" && i.getAnimations().every((a) => a.playState === "finished"),
          pe: cs.pointerEvents, over: +(i.scrollHeight - i.clientHeight).toFixed(2), top: +r.top.toFixed(2), bottom: +r.bottom.toFixed(2), left: +r.left.toFixed(2), right: +r.right.toFixed(2), w: +r.width.toFixed(2), h: +r.height.toFixed(2) }; })()`,
    (d, last) => d.name === "Kralgov" && d.pinned && d.arrived && !!last && last.name === "Kralgov" && d.h === last.h && d.pe === last.pe,
    `P20 Kralgov pinned at ${CAP_WINDOW.w}x${CAP_WINDOW.h}`,
  );
  check("P20 a SHOWN unpinned card does not take the pointer and a pinned scrolling one does, or the card takes it from its own mark (#633)",
    at.shownUnpinned === true && at.restPe === "none" && open.pe === "auto",
    JSON.stringify({ shownUnpinned: at.shownUnpinned, unpinned: at.restPe, pinned: open.pe }));
  check("P21 the capped card has a tail to reach, which is what the scroll, the tab stop and the wheel below are for (#633)",
    open.scrolls === true && open.over > 1, JSON.stringify({ scrolls: open.scrolls, hiddenTail: open.over }));
  return open;
}

export async function p26TailScrolls({ evaluate, send, check, sleep, wheel }: SuiteContext, open: Pinned): Promise<void> {
  const beforeWheel = await evaluate<{ scrollTop: number; k: number }>(`(() => { const i = document.querySelector("#place-card .pc-inner"); return { scrollTop: +i.scrollTop.toFixed(2), k: window.__vellumZoomState().k }; })()`);
  const onCard = { x: Math.round(open.left + (open.right - open.left) / 2), y: Math.round(open.top + open.h / 2) };
  const reaches = await evaluate<boolean>(`(() => { const e = document.elementFromPoint(${onCard.x}, ${onCard.y}); return !!e && document.getElementById("place-card").contains(e); })()`);
  await send("Input.dispatchMouseEvent", { type: "mouseMoved", x: onCard.x, y: onCard.y });
  await sleep(120);
  await wheel(onCard.x, onCard.y, 240);
  await sleep(600);
  const afterWheel = await evaluate<{ scrollTop: number; k: number }>(`(() => { const i = document.querySelector("#place-card .pc-inner"); return { scrollTop: +i.scrollTop.toFixed(2), k: window.__vellumZoomState().k }; })()`);
  check("P26 a pinned card that HAS a tail holds the wheel and scrolls it, and the camera under it stays put, the wheel aimed where the card itself takes the pointer (#633)",
    reaches && afterWheel.scrollTop > beforeWheel.scrollTop + 1 && afterWheel.k === beforeWheel.k,
    JSON.stringify({ reaches, before: beforeWheel, after: afterWheel }));
  await evaluate(`(() => { const i = document.querySelector("#place-card .pc-inner"); i.scrollTop = 0; })()`);
  await sleep(200);

  const kb = await evaluate<{ tabIndex: number; focused: boolean; scrollTop: number; scrolls: boolean; pinned: boolean }>(`(() => { const i = document.querySelector("#place-card .pc-inner"); i.focus(); return { tabIndex: i.tabIndex, focused: document.activeElement === i, scrollTop: +i.scrollTop.toFixed(2), scrolls: document.getElementById("place-card").classList.contains("pc-scrolls"), pinned: document.getElementById("place-card").classList.contains("pinned") }; })()`);
  // PageDown, not ArrowDown: measured 2026-09-20, an arrow key does not scroll a focused scroll container in this build while PageDown does, and the cold review measured all three leaving scrollTop at 0 before the tab stop existed.
  await send("Input.dispatchKeyEvent", { type: "rawKeyDown", windowsVirtualKeyCode: 34, nativeVirtualKeyCode: 34, code: "PageDown", key: "PageDown" });
  await send("Input.dispatchKeyEvent", { type: "keyUp", windowsVirtualKeyCode: 34, nativeVirtualKeyCode: 34, code: "PageDown", key: "PageDown" });
  await sleep(400);
  const kbAfter = await evaluate<number>(`+document.querySelector("#place-card .pc-inner").scrollTop.toFixed(2)`);
  check("P27 a reader with no pointer can reach the tail the cap hides: the card takes a tab stop and PageDown scrolls it (#633)",
    kb.tabIndex === 0 && kb.focused === true && kbAfter > kb.scrollTop + 1,
    JSON.stringify({ ...kb, afterPageDown: kbAfter }));
  await evaluate(`(() => { const i = document.querySelector("#place-card .pc-inner"); i.scrollTop = 0; })()`);
  await sleep(200);
}

export async function p23CapHolds({ evaluate, send, check, sleep, wheel, settle }: CardsKit, open: Pinned): Promise<void> {
  const bare = await evaluate<{ x: number; y: number; k: number }>(`(() => { const c = document.getElementById("place-card").getBoundingClientRect(); const v = document.getElementById("map-viewport").getBoundingClientRect(); return { x: Math.round(v.left + 20), y: Math.round(c.top > v.top + 48 ? v.top + 20 : v.bottom - 20), k: window.__vellumZoomState().k }; })()`);
  await send("Input.dispatchMouseEvent", { type: "mouseMoved", x: bare.x, y: bare.y });
  await sleep(120);
  await wheel(bare.x, bare.y, -240);
  const deep = await settle<{ k: number; w: number; h: number; boxH: number; over: number } | null>(
    `(() => { const c = document.getElementById("place-card"); if (!c || c.hidden) return null; const v = document.getElementById("map-viewport").getBoundingClientRect(); const r = c.getBoundingClientRect();
        return { k: window.__vellumZoomState().k, w: +r.width.toFixed(2), h: +r.height.toFixed(2), boxH: +v.height.toFixed(2), over: +(r.height - v.height).toFixed(2) }; })()`,
    (d, last) => d.k > 1.05 && !!last && d.k === last.k && d.h === last.h,
    "P23 the camera coming to rest above k=1",
  );
  // The card is a fixed 16rem, so its rendered width is the control that says which way the scales compose: unchanged means the counter-scale cancels the mount and the cap must be raw.
  check("P23 the cap still holds once the reader zooms, and the card's own width proves the scales cancel (#633)",
    deep.k > 1.05 && deep.w === open.w && deep.over <= OVER_BOX_TOLERANCE,
    JSON.stringify({ kBefore: bare.k, kAfter: deep.k, widthAtRest: open.w, widthDeep: deep.w, box: deep.boxH, card: deep.h, over: deep.over }));

  // P25: the scroll offset belongs to the CONTAINER, so a card switched to from a scrolled one opened at the old offset with its own name above the fold. Switched by focus, because a pinned card's body can cover the next mark and a click would never reach it.
  await evaluate(`(() => { const i = document.querySelector("#place-card .pc-inner"); i.scrollTop = i.scrollHeight; })()`);
  // The gesture goes in its OWN call: inside a polled expression the second poll clicks the same mark again and toggles the card shut, which is how the first version of this check timed out on a null read.
  await evaluate(`(() => { const h = [...document.querySelectorAll(".place-overlay .place-hit")].find((e) => (e.getAttribute("aria-label") || "").split(", ")[0] === "Skenitsa"); if (h) { h.focus(); h.click(); } })()`);
  const switched = await settle<{ name: string; scrollTop: number; nameBelowTop: number; h: number } | null>(
    `(() => { const c = document.getElementById("place-card"); if (!c || c.hidden) return null; const i = c.querySelector(".pc-inner"); const n = c.querySelector(".pc-name");
        const ir = i.getBoundingClientRect(), nr = n.getBoundingClientRect();
        return { name: n.textContent, scrollTop: +i.scrollTop.toFixed(2), nameBelowTop: +(nr.top - ir.top).toFixed(2), h: +c.getBoundingClientRect().height.toFixed(2) }; })()`,
    (d, last) => !!last && d.h === last.h && d.scrollTop === last.scrollTop,
    "P25 the card after a switch from a scrolled one",
  );
  check("P25 a card switched to from a scrolled one opens at its own top, with its name below the fold and not above it (#633)",
    switched.scrollTop === 0 && switched.nameBelowTop >= 0, JSON.stringify(switched));

  await evaluate(`document.dispatchEvent(new KeyboardEvent("keydown",{key:"Escape",bubbles:true}))`);
  await evaluate(`window.__vellumZoomTo({k:1,x:0,y:0})`);
}

export async function p24NothingToScroll({ evaluate, send, check, sleep, wheel, settle, waitReady, setNarrowViewport, PORT }: CardsKit): Promise<void> {
  await setNarrowViewport(1280, 800);
  await send("Page.navigate", { url: "about:blank" });
  await send("Page.navigate", { url: `http://127.0.0.1:${PORT}/explorer/#seed=${NARROW_SEED}&style=antique` });
  if (!(await waitReady())) throw new Error("P24 the explorer never drew at 1280x800");
  const at = await evaluate<Point>(`(() => { const h = [...document.querySelectorAll(".place-overlay .place-hit")].find((e) => (e.getAttribute("aria-label") || "").split(", ")[0] === "Kralgov"); const b = h.getBoundingClientRect(); return { x: Math.round(b.x + b.width / 2), y: Math.round(b.y + b.height / 2) }; })()`);
  await send("Input.dispatchMouseEvent", { type: "mouseMoved", x: at.x, y: at.y });
  await send("Input.dispatchMouseEvent", { type: "mousePressed", x: at.x, y: at.y, button: "left", clickCount: 1 });
  await send("Input.dispatchMouseEvent", { type: "mouseReleased", x: at.x, y: at.y, button: "left", clickCount: 1 });
  const card = await settle<{ name: string | undefined; pinned: boolean; scrolls: boolean; tail: number; pe: string; k: number; x: number; y: number; h: number } | null>(
    `(() => { const c = document.getElementById("place-card"); if (!c || c.hidden) return null; const i = c.querySelector(".pc-inner"); const r = c.getBoundingClientRect();
        return { name: (c.querySelector(".pc-name") || {}).textContent, pinned: c.classList.contains("pinned"), scrolls: c.classList.contains("pc-scrolls"),
          tail: +(i.scrollHeight - i.clientHeight).toFixed(2), pe: getComputedStyle(i).pointerEvents, k: window.__vellumZoomState().k,
          x: Math.round(r.left + r.width / 2), y: Math.round(r.top + r.height / 2), h: +r.height.toFixed(2) }; })()`,
    (d, last) => d.name === "Kralgov" && d.pinned && !!last && d.h === last.h,
    "P24 Kralgov pinned at 1280x800",
  );
  await send("Input.dispatchMouseEvent", { type: "mouseMoved", x: card.x, y: card.y });
  await sleep(120);
  await wheel(card.x, card.y, -240);
  await sleep(600);
  const after = await evaluate<number>(`window.__vellumZoomState().k`);
  check("P24 a pinned card with nothing to scroll does NOT swallow the camera under it (#633)",
    card.tail <= 1 && card.scrolls === false && card.pe === "none" && after > card.k + 0.05,
    JSON.stringify({ tail: card.tail, scrolls: card.scrolls, pointerEvents: card.pe, kBefore: card.k, kAfterWheelOverCard: after }));
  await evaluate(`document.dispatchEvent(new KeyboardEvent("keydown",{key:"Escape",bubbles:true}))`);
  await evaluate(`window.__vellumZoomTo({k:1,x:0,y:0})`);
}

export async function pRestore({ send, waitReady, clearMobile, PORT }: SuiteContext): Promise<void> {
  // settle-doctrine clause 14: the next suite starts on whatever page is current, and the runner's viewport reset is the ERROR path only.
  await clearMobile();
  await send("Page.navigate", { url: "about:blank" });
  await send("Page.navigate", { url: `http://127.0.0.1:${PORT}/explorer/` });
  if (!(await waitReady())) throw new Error("P restore the explorer never drew again");
}
