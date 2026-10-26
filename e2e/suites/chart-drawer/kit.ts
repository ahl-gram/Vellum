import { makeStage } from "../../support/home.ts";
import type { makeMouse } from "../../support/home.ts";
import { makeStable, STILL_ONLY, type Settle } from "../../support/settle.ts";
import type { Payload, Point, SuiteContext } from "../../types.ts";
// Imported and never restated: a key spelled twice is a clear that silently stops clearing the day the app's own key moves.
import { TABLE_STORE_KEY } from "../../../src/site/shared/table-store.ts";
import { CARRY, DRAWN, FOLDREST, READ, atRest } from "./reads.ts";
import type { Back, Card } from "./reads.ts";

type Mouse = Pick<ReturnType<typeof makeMouse>, "press" | "moveTo" | "release">;
export type DrawerKit = ReturnType<typeof drawerKit>;
export type DragKit = ReturnType<typeof dragKit>;
export type TableKit = ReturnType<typeof tableKit>;

type Box = [number, number, number, number] | null;
const box = (sel: string) =>
  `(() => { const e = document.querySelector(${JSON.stringify(sel)}); if (!e) return null; const b = e.getBoundingClientRect(); return [b.x, b.y, b.width, b.height].map((n) => +n.toFixed(2)); })()`;
const BOOTED: Payload<{ stage: Box; chart: Box; slip: Box; cam: [number, number, number] }> =
  `(() => { const s = window.__vellumZoomState(); return { stage: ${box(".stage")}, chart: ${box("#map > svg")}, slip: ${box(".slip")}, cam: [s.x, s.y, s.k] }; })()`;
const UNFURL: Payload<{ pinned: boolean; card: Box }> =
  `(() => ({ pinned: document.getElementById("place-card").classList.contains("pinned"), card: ${box("#place-card .pc-inner")} }))()`;
const DRAWER: Payload<{ open: boolean; drawer: Box }> =
  `(() => ({ open: document.getElementById("chart-drawer").classList.contains("open"), drawer: ${box("#chart-drawer")} }))()`;
type Slip = { open: boolean; folded: boolean; slipX: number; reserve: string; cam: [number, number, number] };
const SLIP: Payload<Slip> = `(() => { const s = document.querySelector(".slip"); const z = window.__vellumZoomState(); return { open: document.getElementById("chart-drawer").classList.contains("open"), folded: s.classList.contains("folded"), slipX: +s.getBoundingClientRect().x.toFixed(2), reserve: document.querySelector(".stage").style.getPropertyValue("--reserve-right"), cam: [z.x, z.y, z.k] }; })()`;

export function drawerKit(ctx: SuiteContext & { settle: Settle }) {
  const { evaluate, send, sleep, PORT } = ctx;
  const stable = makeStable(ctx.settle);
  // A REAL press and release at the handle's own coordinates, never element.click(): a synthetic click dispatches straight at the node and ignores pointer-events, so it files a handle no reader could reach. The inset box is pointer-events: none, and that is exactly the defect this drives.
  const { clickAt } = makeStage(ctx);
  const clickEar = async () => {
    const r = await evaluate<Point | null>(
      `(() => { const e = document.querySelector("#map .region-inset .dog-ear"); if (!e) return null; const b = e.getBoundingClientRect(); return { x: Math.round(b.x + b.width * 0.72), y: Math.round(b.y + b.height * 0.28) }; })()`,
    );
    if (r) await clickAt(r.x, r.y);
    return r;
  };
  const forget = async () => {
    try {
      await evaluate(`localStorage.removeItem(${JSON.stringify(TABLE_STORE_KEY)})`);
    } catch {}
  };
  const go = async (hash: string) => {
    await forget();
    await send("Page.navigate", { url: "about:blank" });
    await send("Page.navigate", { url: `http://127.0.0.1:${PORT}/explorer/#${hash}` });
    for (let i = 0; i < 200; i++) {
      await sleep(150);
      if (await evaluate<boolean>(`!!document.querySelector("#map svg") && !!document.getElementById("chart-drawer")`))
        break;
    }
    await stable(BOOTED, `the Explorer booted at #${hash}`, { animated: "#map > svg" });
  };
  // A card is pinned by a REAL press on its hit target, and at a NONZERO index, because a filing that always names place 0
  // passes every shape check (Issue #428's own hard-coded-index trap, and PB1b's).
  const pinCard = async (at: number) => {
    const r = await evaluate<Point | null>(
      `(() => { const h = document.querySelector('.place-overlay .place-hit[data-idx="${at}"]'); if (!h) return null; const b = h.getBoundingClientRect(); return { x: Math.round(b.x + b.width / 2), y: Math.round(b.y + b.height / 2) }; })()`,
    );
    const before = await evaluate(UNFURL);
    if (r) await clickAt(r.x, r.y);
    await stable(UNFURL, `the card pinned at place ${at}`, {
      animated: "#place-card .pc-inner",
      departed: (d) => (before.pinned ? JSON.stringify(d.card) !== JSON.stringify(before.card) : d.pinned),
    });
    return r;
  };
  const pressCard = async (d: Card) => {
    const shut = !(await evaluate(DRAWER)).open;
    if (d.press) await clickAt(d.press.box.x, d.press.box.y);
    if (shut) await stable(DRAWER, "the drawer after the card's press", { animated: "#chart-drawer" });
  };
  return { ...ctx, stable, clickAt, clickEar, forget, go, pinCard, pressCard };
}

export function dragKit(k: DrawerKit & Mouse) {
  const { evaluate, settle, stable, press, moveTo, release } = k;
  const earPoint = () =>
    evaluate<Point | null>(
      `(() => { const e = document.querySelector("#map .region-inset .dog-ear"); if (!e) return null; const b = e.getBoundingClientRect(); return { x: Math.round(b.x + b.width * 0.72), y: Math.round(b.y + b.height * 0.28) }; })()`,
    );
  // The band's own centre: the drawer's seat is its height from the foot of the viewport (bandOf in src/site/explorer/table-drag.ts), so a release here is inside it at any viewport height.
  const bandPoint = () => evaluate<Point>(`({ x: 640, y: window.innerHeight - 120 })`);
  const carry = async (to: Point) => {
    const from = await earPoint();
    if (!from) throw new Error("no dog-ear to carry from");
    await press(from.x, from.y);
    await moveTo(from, to);
    const mid = await stable(CARRY, "the carry held over its target", { departed: STILL_ONLY.carry }).catch(
      async (err: unknown) => {
        await release(to.x, to.y);
        throw err;
      },
    );
    return { from, to, mid };
  };
  /** Polls to rest while remembering whether the class was ever seen with its animation running: the settle is 340ms and the poll is 50ms, so a settle that plays is seen and a settle that never plays is not. */
  const restSeeing = async (label: string, flag: "landingRuns" | "joltRuns") => {
    let saw = false;
    const d = await settle(
      CARRY,
      (x, last) => {
        if (x[flag] > 0) saw = true;
        return atRest(x, last);
      },
      label,
    );
    return { ...d, saw };
  };
  const shutAndFold = async (label: string) => {
    const before = await evaluate(SLIP);
    await evaluate(`document.getElementById("chart-drawer-shut").click()`);
    const shut = await stable(SLIP, `${label}: the shut`, {
      departed: (d) => !d.open && (d.folded === before.folded || d.reserve !== before.reserve),
    });
    const pressed = await evaluate<boolean>(
      `(() => { const s = document.querySelector(".slip"); if (s.classList.contains("folded")) return false; document.querySelector(".slip-fold").click(); return true; })()`,
    );
    // The fold's own transition leaves getAnimations() when it ends and the slip's ink-in stays there finished (measured 2026-10-25), so rest is every entry finished and the edge still across two reads.
    await settle(
      FOLDREST,
      (d, last) => d.folded && !d.open && d.anims.every((s) => s === "finished") && !!last && d.slipX === last.slipX,
      label,
    );
    if (pressed) await stable(SLIP, `${label}: the fold's refit`, { departed: (d) => d.reserve !== shut.reserve });
  };
  return { ...k, earPoint, bandPoint, carry, restSeeing, shutAndFold };
}

export function tableKit(kd: DragKit) {
  const { evaluate, sleep, stable, clickAt } = kd;
  const STORE: Payload<string | null> =
    `(() => { try { return localStorage.getItem(${JSON.stringify(TABLE_STORE_KEY)}); } catch { return "THREW"; } })()`;
  // Two shapes on purpose (handbook/specs/settle-doctrine.md clause 4). Where arriving is a PRECONDITION the wait throws;
  // where arriving is the CHECK's own claim it keeps reading and hands back its last read, and the caller asserts
  // on that, so a press that navigated nowhere reds by naming the page it is still standing on.
  const reachedExplorer = async () => {
    let last = null;
    for (let i = 0; i < 200; i++) {
      await sleep(150);
      last = await evaluate<{ href: string; svg: boolean; drawer: boolean }>(
        `(() => ({ href: location.href, svg: !!document.querySelector("#map svg"), drawer: !!document.getElementById("chart-drawer") }))()`,
      );
      if (last.svg && last.drawer) return { ...last, reached: true };
    }
    return { ...(last ?? { href: null, svg: false, drawer: false }), reached: false };
  };
  const atExplorer = async () => {
    const at = await reachedExplorer();
    if (!at.reached) throw new Error(`the Explorer never booted; still at ${at.href}`);
    return at;
  };
  const openDrawer = async () => {
    // Wiring, not a gesture claim: CD2 and CD14 own whether the tab answers a real pointer. Here it is the door to the road.
    await evaluate(
      `(() => { const t = document.getElementById("chart-drawer-tab"); if (t && getComputedStyle(t).display !== "none") t.click(); })()`,
    );
    await stable(DRAWER, "the drawer opened by its tab", { animated: "#chart-drawer" });
  };
  // A measurement poll, not a readiness wait (handbook/specs/settle-doctrine.md clause 4), and deliberately NOT keyed on the number the check is about (clause 6): it reads until the count stops moving and hands back its LAST read, which the caller asserts on. The first version of CD37 and CD38 put `cuttings === 2` in the settle instead, and the mutations that were supposed to prove them killed the predicate, so the checks' own booleans were never evaluated at all (the cold review on PR #635).
  const restedAtExplorer = async (): Promise<Back> => {
    let last: Back | null = null;
    let same = 0;
    for (let i = 0; i < DRAWN; i++) {
      const d = await evaluate<Back>(
        `(() => ({ ...${READ}, marker: window.__cd634 || null, navType: (performance.getEntriesByType("navigation")[0] || {}).type || null, stored: ${STORE} }))()`,
      );
      same = last && d.path === last.path && d.cuttings === last.cuttings ? same + 1 : 0;
      last = d;
      if (last.path === "/explorer/" && same >= 2) return last;
      await sleep(50);
    }
    return last!;
  };
  const pressById = async (id: string) => {
    const at = await evaluate<{ x: number; y: number; hit: boolean } | null>(
      `(() => { const e = document.getElementById(${JSON.stringify(id)}); if (!e) return null; e.scrollIntoView({ block: "center" }); const b = e.getBoundingClientRect(); if (b.width < 1) return null; const c = { x: Math.round(b.x + b.width / 2), y: Math.round(b.y + b.height / 2) }; return { ...c, hit: document.elementFromPoint(c.x, c.y) === e || e.contains(document.elementFromPoint(c.x, c.y)) }; })()`,
    );
    if (!at) throw new Error(`${id} has no box to press`);
    await clickAt(at.x, at.y);
    return at;
  };
  return { ...kd, STORE, reachedExplorer, atExplorer, openDrawer, restedAtExplorer, pressById };
}

type Keys = Pick<SuiteContext, "evaluate" | "send" | "sleep">;
const key = async (send: SuiteContext["send"], modifiers = 0): Promise<void> => {
  await send("Input.dispatchKeyEvent", {
    type: "keyDown",
    key: "Tab",
    code: "Tab",
    windowsVirtualKeyCode: 9,
    modifiers,
  });
  await send("Input.dispatchKeyEvent", { type: "keyUp", key: "Tab", code: "Tab", windowsVirtualKeyCode: 9, modifiers });
};

// A keyboard's focus, so :focus-visible holds: a Tab from the element before it, or out and back with Shift; the answer is a premise the caller reads, never a throw.
export async function tabInto({ evaluate, send, sleep }: Keys, selector: string, from?: string): Promise<boolean> {
  const sel = JSON.stringify(selector);
  await evaluate<boolean>(
    `(() => { const e = document.querySelector(${JSON.stringify(from ?? selector)}); if (e) e.focus({ preventScroll: true }); return !!e; })()`,
  );
  await key(send);
  if (from === undefined) await key(send, 8);
  for (let i = 0; i < 20; i++) {
    if (
      await evaluate<boolean>(
        `(() => { const e = document.querySelector(${sel}); return !!e && document.activeElement === e && e.matches(":focus-visible"); })()`,
      )
    )
      return true;
    await sleep(50);
  }
  return false;
}

export const park = (send: SuiteContext["send"]): Promise<unknown> =>
  send("Input.dispatchMouseEvent", { type: "mouseMoved", x: 1, y: 700 });
